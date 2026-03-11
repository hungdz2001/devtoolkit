import { useState } from 'react';

const BMI_CATEGORIES = [
  { label: 'Gầy (độ III)', range: '< 16.0', color: '#3b82f6', min: 0, max: 16 },
  { label: 'Gầy (độ II)', range: '16.0 – 16.9', color: '#60a5fa', min: 16, max: 17 },
  { label: 'Gầy (độ I)', range: '17.0 – 18.4', color: '#93c5fd', min: 17, max: 18.5 },
  { label: 'Bình thường', range: '18.5 – 22.9', color: '#22c55e', min: 18.5, max: 23 },
  { label: 'Thừa cân', range: '23.0 – 24.9', color: '#eab308', min: 23, max: 25 },
  { label: 'Béo phì (độ I)', range: '25.0 – 29.9', color: '#f97316', min: 25, max: 30 },
  { label: 'Béo phì (độ II)', range: '≥ 30.0', color: '#ef4444', min: 30, max: 50 },
];

export default function BmiCalculator() {
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(60);

  const bmi = weight / ((height / 100) ** 2);
  const category = BMI_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];

  // ideal weight range for BMI 18.5-23 (Asia-Pacific)
  const hm = height / 100;
  const idealMin = (18.5 * hm * hm).toFixed(1);
  const idealMax = (23 * hm * hm).toFixed(1);

  // gauge position 0-100%
  const gaugePos = Math.min(100, Math.max(0, ((bmi - 12) / (38 - 12)) * 100));

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="glass-card grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold block mb-2">Chiều cao (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Math.max(50, Math.min(250, +e.target.value || 0)))}
            className="input-glass w-full text-2xl text-center font-mono"
            title="Chiều cao"
          />
          <input
            type="range"
            min={100}
            max={220}
            value={height}
            onChange={(e) => setHeight(+e.target.value)}
            className="w-full mt-2 accent-[var(--accent)]"
            title="Chiều cao"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-2">Cân nặng (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Math.max(10, Math.min(300, +e.target.value || 0)))}
            className="input-glass w-full text-2xl text-center font-mono"
            title="Cân nặng"
          />
          <input
            type="range"
            min={30}
            max={150}
            value={weight}
            onChange={(e) => setWeight(+e.target.value)}
            className="w-full mt-2 accent-[var(--accent)]"
            title="Cân nặng"
          />
        </div>
      </div>

      {/* Result */}
      <div className="glass-card text-center space-y-4">
        <div>
          <span className="text-6xl font-bold font-mono" style={{ color: category.color }}>
            {bmi.toFixed(1)}
          </span>
          <p className="text-lg font-semibold mt-2" style={{ color: category.color }}>
            {category.label}
          </p>
        </div>

        {/* Gauge */}
        <div className="relative h-4 rounded-full overflow-hidden flex">
          {BMI_CATEGORIES.map((c) => (
            <div
              key={c.label}
              className="h-full"
              style={{
                backgroundColor: c.color,
                flex: `${c.max - c.min}`,
              }}
            />
          ))}
          <div
            className="absolute top-[-4px] w-1 h-6 bg-white rounded shadow-lg transition-all duration-300"
            style={{ left: `${gaugePos}%` }}
          />
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          Cân nặng lý tưởng cho {height}cm: <strong>{idealMin} – {idealMax} kg</strong>
          <br />
          <span className="text-xs">(Tiêu chuẩn WHO châu Á – Thái Bình Dương)</span>
        </p>
      </div>

      {/* Reference table */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3">Phân loại BMI (WHO Asia-Pacific)</h3>
        <div className="space-y-1">
          {BMI_CATEGORIES.map((c) => (
            <div
              key={c.label}
              className={`flex items-center justify-between text-xs px-3 py-1.5 rounded ${category.label === c.label ? 'bg-white/10 font-bold' : ''
                }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                {c.label}
              </span>
              <span className="font-mono">{c.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
