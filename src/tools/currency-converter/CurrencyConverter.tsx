import { useState, useEffect, useCallback } from 'react';

const POPULAR_CURRENCIES = ['VND', 'USD', 'EUR', 'JPY', 'KRW', 'THB', 'CNY', 'GBP', 'SGD', 'AUD', 'TWD', 'HKD'];

const CURRENCY_NAMES: Record<string, string> = {
  VND: '🇻🇳 Đồng Việt Nam',
  USD: '🇺🇸 Đô la Mỹ',
  EUR: '🇪🇺 Euro',
  JPY: '🇯🇵 Yên Nhật',
  KRW: '🇰🇷 Won Hàn Quốc',
  THB: '🇹🇭 Baht Thái',
  CNY: '🇨🇳 Nhân dân tệ',
  GBP: '🇬🇧 Bảng Anh',
  SGD: '🇸🇬 Đô la Singapore',
  AUD: '🇦🇺 Đô la Úc',
  TWD: '🇹🇼 Đô la Đài Loan',
  HKD: '🇭🇰 Đô la Hồng Kông',
};

interface RateData {
  rates: Record<string, number>;
  timestamp: number;
}

const CACHE_KEY = 'currency_rates';
const CACHE_TTL = 3600000; // 1 hour

async function fetchRates(base: string): Promise<Record<string, number> | null> {
  // Check cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: RateData = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_TTL) {
        return data.rates;
      }
    }
  } catch { /* ignore */ }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const rates = data.rates as Record<string, number>;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }));
    return rates;
  } catch {
    return null;
  }
}

export default function CurrencyConverter() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('VND');
  const [amount, setAmount] = useState(100);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');

  const loadRates = useCallback(async (base: string) => {
    setLoading(true);
    const r = await fetchRates(base);
    if (r) {
      setRates(r);
      setLastUpdate(new Date().toLocaleTimeString('vi-VN'));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadRates(from); }, [from, loadRates]);

  const converted = rates && rates[to] ? amount * rates[to] : 0;
  const rate = rates?.[to] || 0;

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (rate) setAmount(Math.round(converted * 100) / 100);
  };

  const formatNumber = (n: number) => {
    if (n >= 1000) return n.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
    return n.toLocaleString('vi-VN', { maximumFractionDigits: 4 });
  };

  return (
    <div className="space-y-6">
      {/* Converter */}
      <div className="glass-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* From */}
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Từ</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="input-glass w-full mt-1" title="Tiền tệ nguồn">
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c} value={c}>{c} — {CURRENCY_NAMES[c]}</option>
              ))}
            </select>
            <input
              type="text"
              value={amount.toLocaleString('vi-VN')}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/[^\d.]/g, ''));
                if (!isNaN(v)) setAmount(v);
              }}
              className="input-glass w-full mt-2 text-xl font-mono"
              title="Số tiền"
            />
          </div>

          {/* Swap */}
          <button onClick={swap} className="btn-primary self-center text-lg px-4 py-3 hidden md:block">
            ⇄
          </button>
          <button onClick={swap} className="btn-primary text-lg py-2 md:hidden">
            ⇄ Đổi chiều
          </button>

          {/* To */}
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Sang</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="input-glass w-full mt-1" title="Tiền tệ đích">
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c} value={c}>{c} — {CURRENCY_NAMES[c]}</option>
              ))}
            </select>
            <div className="input-glass w-full mt-2 text-xl font-mono bg-accent/5 text-accent py-2 px-3">
              {loading ? '...' : formatNumber(converted)}
            </div>
          </div>
        </div>

        {/* Rate info */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>1 {from} = {formatNumber(rate)} {to}</span>
          {lastUpdate && <span>Cập nhật: {lastUpdate}</span>}
        </div>
      </div>

      {/* Quick rates table */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3">Tỷ giá từ {from}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {POPULAR_CURRENCIES.filter((c) => c !== from).map((c) => (
            <button
              key={c}
              onClick={() => setTo(c)}
              className={`flex items-center justify-between p-3 rounded-xl text-sm transition-all ${to === c ? 'bg-accent/15 text-accent' : 'bg-white/5 hover:bg-white/10'
                }`}
            >
              <span className="font-medium">{c}</span>
              <span className="font-mono text-xs">
                {rates?.[c] ? formatNumber(rates[c]) : '—'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
