import { useState, useMemo } from 'react';
import { TbArrowsExchange } from 'react-icons/tb';

interface UnitGroup {
  label: string;
  emoji: string;
  units: { id: string; name: string; factor: number }[];
}

const GROUPS: UnitGroup[] = [
  {
    label: 'Chiều dài',
    emoji: '📏',
    units: [
      { id: 'mm', name: 'Milimét (mm)', factor: 0.001 },
      { id: 'cm', name: 'Centimét (cm)', factor: 0.01 },
      { id: 'm', name: 'Mét (m)', factor: 1 },
      { id: 'km', name: 'Kilômét (km)', factor: 1000 },
      { id: 'inch', name: 'Inch (in)', factor: 0.0254 },
      { id: 'ft', name: 'Feet (ft)', factor: 0.3048 },
      { id: 'yard', name: 'Yard (yd)', factor: 0.9144 },
      { id: 'mile', name: 'Mile (mi)', factor: 1609.344 },
    ],
  },
  {
    label: 'Khối lượng',
    emoji: '⚖️',
    units: [
      { id: 'mg', name: 'Miligam (mg)', factor: 0.000001 },
      { id: 'g', name: 'Gam (g)', factor: 0.001 },
      { id: 'kg', name: 'Kilôgam (kg)', factor: 1 },
      { id: 'tan', name: 'Tấn (t)', factor: 1000 },
      { id: 'oz', name: 'Ounce (oz)', factor: 0.0283495 },
      { id: 'lb', name: 'Pound (lb)', factor: 0.453592 },
      { id: 'luong', name: 'Lượng (chỉ vàng)', factor: 0.0375 },
    ],
  },
  {
    label: 'Diện tích',
    emoji: '📐',
    units: [
      { id: 'm2', name: 'Mét vuông (m²)', factor: 1 },
      { id: 'km2', name: 'Kilômét vuông (km²)', factor: 1e6 },
      { id: 'ha', name: 'Héc-ta (ha)', factor: 10000 },
      { id: 'ft2', name: 'Feet vuông (ft²)', factor: 0.092903 },
      { id: 'acre', name: 'Mẫu Anh (acre)', factor: 4046.86 },
      { id: 'sao', name: 'Sào (Bắc Bộ)', factor: 360 },
      { id: 'cong', name: 'Công (Nam Bộ)', factor: 1000 },
    ],
  },
  {
    label: 'Thể tích',
    emoji: '🧪',
    units: [
      { id: 'ml', name: 'Mililít (ml)', factor: 0.001 },
      { id: 'l', name: 'Lít (L)', factor: 1 },
      { id: 'm3', name: 'Mét khối (m³)', factor: 1000 },
      { id: 'galUS', name: 'Gallon Mỹ', factor: 3.78541 },
      { id: 'floz', name: 'Fluid ounce (US)', factor: 0.0295735 },
      { id: 'cup', name: 'Cup (US)', factor: 0.236588 },
    ],
  },
  {
    label: 'Nhiệt độ',
    emoji: '🌡️',
    units: [
      { id: 'C', name: '°C (Celsius)', factor: 0 },
      { id: 'F', name: '°F (Fahrenheit)', factor: 0 },
      { id: 'K', name: 'K (Kelvin)', factor: 0 },
    ],
  },
  {
    label: 'Tốc độ',
    emoji: '🚀',
    units: [
      { id: 'ms', name: 'm/s', factor: 1 },
      { id: 'kmh', name: 'km/h', factor: 1 / 3.6 },
      { id: 'mph', name: 'mph', factor: 0.44704 },
      { id: 'knot', name: 'Hải lý/h (knot)', factor: 0.514444 },
    ],
  },
  {
    label: 'Dữ liệu',
    emoji: '💾',
    units: [
      { id: 'B', name: 'Byte (B)', factor: 1 },
      { id: 'KB', name: 'Kilobyte (KB)', factor: 1024 },
      { id: 'MB', name: 'Megabyte (MB)', factor: 1048576 },
      { id: 'GB', name: 'Gigabyte (GB)', factor: 1073741824 },
      { id: 'TB', name: 'Terabyte (TB)', factor: 1099511627776 },
    ],
  },
];

function convertTemp(val: number, from: string, to: string): number {
  // Convert to Celsius first
  let c = val;
  if (from === 'F') c = (val - 32) * (5 / 9);
  else if (from === 'K') c = val - 273.15;
  // Convert from Celsius to target
  if (to === 'C') return c;
  if (to === 'F') return c * (9 / 5) + 32;
  return c + 273.15; // K
}

export default function UnitConverter() {
  const [groupIdx, setGroupIdx] = useState(0);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [value, setValue] = useState('1');

  const group = GROUPS[groupIdx];
  const isTemp = group.label === 'Nhiệt độ';

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return '';
    const from = group.units[fromIdx];
    const to = group.units[toIdx];
    if (!from || !to) return '';

    let r: number;
    if (isTemp) {
      r = convertTemp(v, from.id, to.id);
    } else {
      r = (v * from.factor) / to.factor;
    }
    // Smart formatting
    if (Math.abs(r) >= 1e12 || (Math.abs(r) < 0.0001 && r !== 0)) {
      return r.toExponential(6);
    }
    return r.toLocaleString('en-US', { maximumFractionDigits: 8 });
  }, [value, groupIdx, fromIdx, toIdx, group, isTemp]);

  const swap = () => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
  };

  const handleGroupChange = (idx: number) => {
    setGroupIdx(idx);
    setFromIdx(0);
    setToIdx(1);
    setValue('1');
  };

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g, i) => (
          <button
            key={g.label}
            onClick={() => handleGroupChange(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${i === groupIdx
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'glass-card hover:bg-white/5'
              }`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="glass-card space-y-4">
        {/* From */}
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">Từ</label>
          <select
            value={fromIdx}
            onChange={(e) => setFromIdx(+e.target.value)}
            className="input-glass w-full mb-2"
            title="Đơn vị nguồn"
          >
            {group.units.map((u, i) => (
              <option key={u.id} value={i}>{u.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-glass w-full text-2xl font-mono text-center"
            placeholder="Nhập giá trị"
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button onClick={swap} className="btn-secondary p-2 rounded-full" title="Đổi chiều">
            <TbArrowsExchange size={20} />
          </button>
        </div>

        {/* To */}
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">Sang</label>
          <select
            value={toIdx}
            onChange={(e) => setToIdx(+e.target.value)}
            className="input-glass w-full mb-2"
            title="Đơn vị đích"
          >
            {group.units.map((u, i) => (
              <option key={u.id} value={i}>{u.name}</option>
            ))}
          </select>
          <div className="input-glass w-full text-2xl font-mono text-center bg-white/5 py-3">
            {result || '—'}
          </div>
        </div>
      </div>

      {/* Quick ref for current group */}
      {value && !isNaN(parseFloat(value)) && (
        <div className="glass-card">
          <h3 className="text-sm font-semibold mb-3">Bảng quy đổi nhanh</h3>
          <div className="space-y-1 text-xs">
            {group.units.map((u, i) => {
              if (i === fromIdx) return null;
              const v = parseFloat(value);
              const from = group.units[fromIdx];
              let r: number;
              if (isTemp) {
                r = convertTemp(v, from.id, u.id);
              } else {
                r = (v * from.factor) / u.factor;
              }
              const display =
                Math.abs(r) >= 1e12 || (Math.abs(r) < 0.0001 && r !== 0)
                  ? r.toExponential(4)
                  : r.toLocaleString('en-US', { maximumFractionDigits: 6 });
              return (
                <div key={u.id} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                  <span className="text-[var(--text-secondary)]">{u.name}</span>
                  <span className="font-mono font-medium">{display}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
