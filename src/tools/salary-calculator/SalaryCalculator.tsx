import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mức lương tối thiểu vùng 2024 (Nghị định 74/2024)
const MIN_WAGES = [4960000, 4410000, 3860000, 3450000];
// BHXH capped at 20x minimum wage vùng I
const SOCIAL_INSURANCE_CAP = 20 * 46800000 / 12; // ~36,000,000 based on base salary

// Thực tế: mức đóng BHXH tối đa = 20 x lương cơ sở (2,340,000 x 20 = 46,800,000)
const BASE_SALARY = 2340000;
const MAX_SOCIAL_BASE = 20 * BASE_SALARY; // 46,800,000

const EMPLOYEE_RATES = { bhxh: 0.08, bhyt: 0.015, bhtn: 0.01 }; // 10.5% total
const PERSONAL_DEDUCTION = 11000000;
const DEPENDENT_DEDUCTION = 4400000;

// Biểu thuế TNCN lũy tiến 7 bậc
const TAX_BRACKETS = [
  { limit: 5000000, rate: 0.05 },
  { limit: 10000000, rate: 0.10 },
  { limit: 18000000, rate: 0.15 },
  { limit: 32000000, rate: 0.20 },
  { limit: 52000000, rate: 0.25 },
  { limit: 80000000, rate: 0.30 },
  { limit: Infinity, rate: 0.35 },
];

function calcTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let remaining = taxableIncome;
  let prevLimit = 0;
  for (const bracket of TAX_BRACKETS) {
    const bracketSize = bracket.limit - prevLimit;
    const taxable = Math.min(remaining, bracketSize);
    tax += taxable * bracket.rate;
    remaining -= taxable;
    prevLimit = bracket.limit;
    if (remaining <= 0) break;
  }
  return tax;
}

function grossToNet(gross: number, dependents: number, region: number) {
  const socialBase = Math.min(gross, MAX_SOCIAL_BASE);
  const bhxh = socialBase * EMPLOYEE_RATES.bhxh;
  const bhyt = socialBase * EMPLOYEE_RATES.bhyt;
  const bhtn = Math.min(gross, 20 * MIN_WAGES[region]) * EMPLOYEE_RATES.bhtn;
  const totalInsurance = bhxh + bhyt + bhtn;

  const beforeTax = gross - totalInsurance;
  const deductions = PERSONAL_DEDUCTION + dependents * DEPENDENT_DEDUCTION;
  const taxableIncome = Math.max(0, beforeTax - deductions);
  const tax = calcTax(taxableIncome);
  const net = gross - totalInsurance - tax;

  return { net, bhxh, bhyt, bhtn, totalInsurance, taxableIncome, tax, deductions, beforeTax };
}

function netToGross(targetNet: number, dependents: number, region: number) {
  // Binary search
  let lo = targetNet;
  let hi = targetNet * 2;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const result = grossToNet(mid, dependents, region);
    if (Math.abs(result.net - targetNet) < 1) return { gross: mid, ...result };
    if (result.net < targetNet) lo = mid;
    else hi = mid;
  }
  const gross = (lo + hi) / 2;
  return { gross, ...grossToNet(gross, dependents, region) };
}

const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN');

export default function SalaryCalculator() {
  const [mode, setMode] = useState<'gross-to-net' | 'net-to-gross'>('gross-to-net');
  const [amount, setAmount] = useState(15000000);
  const [dependents, setDependents] = useState(0);
  const [region, setRegion] = useState(0);

  const result = useMemo(() => {
    if (mode === 'gross-to-net') {
      return { gross: amount, ...grossToNet(amount, dependents, region) };
    }
    return netToGross(amount, dependents, region);
  }, [mode, amount, dependents, region]);

  // Chart data for different gross values
  const chartData = useMemo(() => {
    return [5, 10, 15, 20, 25, 30, 40, 50, 70, 100].map((m) => {
      const g = m * 1000000;
      const r = grossToNet(g, dependents, region);
      return {
        gross: `${m}tr`,
        'Lương NET': Math.round(r.net / 1000000 * 10) / 10,
        'Bảo hiểm': Math.round(r.totalInsurance / 1000000 * 10) / 10,
        'Thuế TNCN': Math.round(r.tax / 1000000 * 10) / 10,
      };
    });
  }, [dependents, region]);

  return (
    <div className="space-y-6">
      {/* Mode toggle + inputs */}
      <div className="glass-card space-y-4">
        <div className="flex gap-2">
          {(['gross-to-net', 'net-to-gross'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 ${mode === m ? 'bg-accent/20 text-accent' : 'text-[var(--text-secondary)] hover:bg-white/5'
                }`}
            >
              {m === 'gross-to-net' ? 'GROSS → NET' : 'NET → GROSS'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              {mode === 'gross-to-net' ? 'Lương GROSS (VNĐ)' : 'Lương NET mong muốn (VNĐ)'}
            </label>
            <input
              type="text"
              value={amount.toLocaleString('vi-VN')}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/\D/g, ''));
                if (!isNaN(v)) setAmount(v);
              }}
              className="input-glass w-full mt-1 font-mono"
              title="Mức lương"
            />
            {/* Quick presets */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {[10, 15, 20, 25, 30, 50].map((m) => (
                <button
                  key={m}
                  onClick={() => setAmount(m * 1000000)}
                  className="px-2 py-1 text-xs rounded bg-white/5 hover:bg-accent/20 hover:text-accent transition-colors"
                >
                  {m}tr
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Số người phụ thuộc</label>
            <input
              type="number"
              min={0}
              max={10}
              value={dependents}
              onChange={(e) => setDependents(Math.max(0, Number(e.target.value)))}
              className="input-glass w-full mt-1"
              title="Số người phụ thuộc"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Vùng lương</label>
            <select
              value={region}
              onChange={(e) => setRegion(Number(e.target.value))}
              className="input-glass w-full mt-1"
              title="Vùng lương"
            >
              <option value={0}>Vùng 1 — {fmt(MIN_WAGES[0])}đ</option>
              <option value={1}>Vùng 2 — {fmt(MIN_WAGES[1])}đ</option>
              <option value={2}>Vùng 3 — {fmt(MIN_WAGES[2])}đ</option>
              <option value={3}>Vùng 4 — {fmt(MIN_WAGES[3])}đ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card text-center">
          <div className="text-xs text-[var(--text-secondary)]">Lương GROSS</div>
          <div className="text-lg font-bold text-accent mt-1">{fmt(result.gross)}đ</div>
        </div>
        <div className="glass-card text-center">
          <div className="text-xs text-[var(--text-secondary)]">Bảo hiểm (10.5%)</div>
          <div className="text-lg font-bold text-red-400 mt-1">-{fmt(result.totalInsurance)}đ</div>
        </div>
        <div className="glass-card text-center">
          <div className="text-xs text-[var(--text-secondary)]">Thuế TNCN</div>
          <div className="text-lg font-bold text-orange-400 mt-1">-{fmt(result.tax)}đ</div>
        </div>
        <div className="glass-card text-center border-accent/30">
          <div className="text-xs text-[var(--text-secondary)]">Lương NET thực nhận</div>
          <div className="text-lg font-bold text-green-400 mt-1">{fmt(result.net)}đ</div>
        </div>
      </div>

      {/* Detail breakdown */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3">Chi tiết khấu trừ</h3>
        <div className="space-y-2 text-sm">
          {[
            ['BHXH (8%)', result.bhxh],
            ['BHYT (1.5%)', result.bhyt],
            ['BHTN (1%)', result.bhtn],
            ['Tổng bảo hiểm', result.totalInsurance],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between">
              <span className="text-[var(--text-secondary)]">{label as string}</span>
              <span className="font-mono">-{fmt(val as number)}đ</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-2"></div>
          {[
            ['Thu nhập trước thuế', result.beforeTax],
            ['Giảm trừ bản thân', PERSONAL_DEDUCTION],
            [`Giảm trừ ${dependents} người phụ thuộc`, dependents * DEPENDENT_DEDUCTION],
            ['Thu nhập chịu thuế', result.taxableIncome],
            ['Thuế TNCN', result.tax],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between">
              <span className="text-[var(--text-secondary)]">{label as string}</span>
              <span className="font-mono">{fmt(val as number)}đ</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3">So sánh theo mức lương (triệu VNĐ)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="gross" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip
                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 12, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="Lương NET" stackId="1" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
              <Area type="monotone" dataKey="Bảo hiểm" stackId="1" stroke="#f87171" fill="#f87171" fillOpacity={0.3} />
              <Area type="monotone" dataKey="Thuế TNCN" stackId="1" stroke="#fb923c" fill="#fb923c" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tax brackets reference */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3">Biểu thuế TNCN lũy tiến 7 bậc</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--text-secondary)] text-xs">
                <th className="text-left py-2">Bậc</th>
                <th className="text-left py-2">Thu nhập chịu thuế / tháng</th>
                <th className="text-right py-2">Thuế suất</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1', '≤ 5 triệu', '5%'],
                ['2', '5 – 10 triệu', '10%'],
                ['3', '10 – 18 triệu', '15%'],
                ['4', '18 – 32 triệu', '20%'],
                ['5', '32 – 52 triệu', '25%'],
                ['6', '52 – 80 triệu', '30%'],
                ['7', '> 80 triệu', '35%'],
              ].map(([bac, range, rate]) => (
                <tr key={bac} className="border-t border-white/5">
                  <td className="py-2">{bac}</td>
                  <td className="py-2">{range}</td>
                  <td className="py-2 text-right font-mono">{rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
