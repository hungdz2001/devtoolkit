import { useState } from 'react';

interface Person {
  id: number;
  name: string;
  extra: number; // extra amount this person ordered
}

const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN');

export default function SplitBill() {
  const [total, setTotal] = useState(500000);
  const [tipPercent, setTipPercent] = useState(0);
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: 'Người 1', extra: 0 },
    { id: 2, name: 'Người 2', extra: 0 },
  ]);

  const tip = total * tipPercent / 100;
  const totalWithTip = total + tip;
  const totalExtra = people.reduce((s, p) => s + p.extra, 0);
  const sharedBase = totalWithTip - totalExtra;
  const perPersonBase = people.length > 0 ? sharedBase / people.length : 0;

  const addPerson = () => {
    const id = Math.max(0, ...people.map((p) => p.id)) + 1;
    setPeople([...people, { id, name: `Người ${id}`, extra: 0 }]);
  };

  const removePerson = (id: number) => {
    if (people.length <= 1) return;
    setPeople(people.filter((p) => p.id !== id));
  };

  const updatePerson = (id: number, field: keyof Person, value: string | number) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <div className="space-y-6">
      {/* Bill input */}
      <div className="glass-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Tổng bill (VNĐ)</label>
            <input
              type="text"
              value={total.toLocaleString('vi-VN')}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/\D/g, ''));
                if (!isNaN(v)) setTotal(v);
              }}
              className="input-glass w-full mt-1 text-xl font-mono"
              title="Tổng bill"
            />
            <div className="flex gap-1 mt-2 flex-wrap">
              {[100, 200, 300, 500, 1000].map((k) => (
                <button key={k} onClick={() => setTotal(k * 1000)} className="px-2 py-1 text-xs rounded bg-white/5 hover:bg-accent/20 hover:text-accent transition-colors">
                  {k}k
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Tip (%)</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                min={0}
                max={100}
                value={tipPercent}
                onChange={(e) => setTipPercent(Math.max(0, Number(e.target.value)))}
                className="input-glass w-20"
                title="Tip %"
              />
              <div className="flex gap-1">
                {[0, 5, 10, 15].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipPercent(t)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${tipPercent === t ? 'bg-accent/20 text-accent' : 'bg-white/5'
                      }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>
            {tip > 0 && (
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Tip: {fmt(tip)}đ → Tổng: {fmt(totalWithTip)}đ
              </p>
            )}
          </div>
        </div>
      </div>

      {/* People list */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">{people.length} người</h3>
          <button onClick={addPerson} className="btn-primary text-xs px-3 py-1.5">
            + Thêm người
          </button>
        </div>
        <div className="space-y-3">
          {people.map((person) => {
            const owes = perPersonBase + person.extra;
            return (
              <div key={person.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <input
                  type="text"
                  value={person.name}
                  onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                  className="input-glass flex-1 text-sm"
                  maxLength={30}
                  title="Tên người"
                />
                <div className="text-xs text-[var(--text-secondary)] whitespace-nowrap">Gọi thêm:</div>
                <input
                  type="text"
                  value={person.extra === 0 ? '' : person.extra.toLocaleString('vi-VN')}
                  onChange={(e) => {
                    const v = Number(e.target.value.replace(/\D/g, ''));
                    updatePerson(person.id, 'extra', isNaN(v) ? 0 : v);
                  }}
                  className="input-glass w-24 text-sm font-mono"
                  placeholder="0"
                />
                <div className="text-sm font-bold text-accent whitespace-nowrap min-w-[90px] text-right">
                  {fmt(owes)}đ
                </div>
                <button
                  onClick={() => removePerson(person.id)}
                  className="w-7 h-7 rounded-full bg-white/10 text-xs hover:bg-red-500/30 transition-colors"
                  disabled={people.length <= 1}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3">Tóm tắt</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Tổng bill</span>
            <span className="font-mono">{fmt(total)}đ</span>
          </div>
          {tip > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Tip ({tipPercent}%)</span>
              <span className="font-mono">{fmt(tip)}đ</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-white/10 pt-2">
            <span>Tổng cộng</span>
            <span className="font-mono text-accent">{fmt(totalWithTip)}đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Phần chung / người</span>
            <span className="font-mono">{fmt(perPersonBase)}đ</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
          {people.map((p) => (
            <div key={p.id} className="flex justify-between text-sm">
              <span>{p.name}</span>
              <span className="font-mono font-semibold">{fmt(perPersonBase + p.extra)}đ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
