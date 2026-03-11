import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LoanCalculator() {
  const { t } = useTranslation();
  const [principal, setPrincipal] = useState(500000000); // 500M VND default
  const [rate, setRate] = useState(8); // 8% per year
  const [years, setYears] = useState(20);

  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;

  const monthlyPayment = useMemo(() => {
    if (monthlyRate === 0) return principal / totalMonths;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }, [principal, monthlyRate, totalMonths]);

  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - principal;

  const chartData = useMemo(() => {
    const data: { month: number; principal: number; interest: number; balance: number }[] = [];
    let balance = principal;
    for (let m = 1; m <= totalMonths; m++) {
      const interestPart = balance * monthlyRate;
      const principalPart = monthlyPayment - interestPart;
      balance -= principalPart;
      if (m % 12 === 0 || m === 1) {
        data.push({
          month: m,
          principal: Math.round(principalPart),
          interest: Math.round(interestPart),
          balance: Math.max(0, Math.round(balance)),
        });
      }
    }
    return data;
  }, [principal, monthlyRate, totalMonths, monthlyPayment]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="glass-card grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-secondary)]">Khoản vay (VND)</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="input-glass font-mono"
            step={10000000}
            title="Khoản vay"
          />
          <input type="range" min={10000000} max={10000000000} step={10000000} value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full accent-accent" title="Khoản vay" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-secondary)]">Lãi suất (%/năm): {rate}%</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="input-glass font-mono"
            step={0.1}
            min={0}
            max={30}
            title="Lãi suất"
          />
          <input type="range" min={0} max={30} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-accent" title="Lãi suất" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-secondary)]">Thời gian (năm): {years}</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="input-glass font-mono"
            min={1}
            max={40}
            title="Thời gian vay"
          />
          <input type="range" min={1} max={40} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-accent" title="Thời gian vay" />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Trả hàng tháng</p>
          <p className="text-xl font-bold text-accent">{fmt(monthlyPayment)}</p>
        </div>
        <div className="glass-card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Tổng trả</p>
          <p className="text-xl font-bold">{fmt(totalPayment)}</p>
        </div>
        <div className="glass-card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Tổng lãi</p>
          <p className="text-xl font-bold text-red-400">{fmt(totalInterest)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-4">Biểu đồ dư nợ</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.3)" />
            <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 12, fontSize: 12 }}
              formatter={(value: number) => fmt(value)}
            />
            <Area type="monotone" dataKey="balance" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.3} name="Dư nợ" />
            <Area type="monotone" dataKey="interest" stroke="#EC4899" fill="#EC4899" fillOpacity={0.2} name="Lãi" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
