import { useState, useMemo } from 'react';

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function calcAge(birth: Date, ref: Date) {
  let years = ref.getFullYear() - birth.getFullYear();
  let months = ref.getMonth() - birth.getMonth();
  let days = ref.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(ref.getFullYear(), ref.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

function daysBetween(a: Date, b: Date) {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / 86400000);
}

function getZodiac(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return '♒ Bảo Bình';
  if ((m === 2 && day >= 19) || (m === 3 && day <= 20)) return '♓ Song Ngư';
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return '♈ Bạch Dương';
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return '♉ Kim Ngưu';
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return '♊ Song Tử';
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return '♋ Cự Giải';
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return '♌ Sư Tử';
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return '♍ Xử Nữ';
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return '♎ Thiên Bình';
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return '♏ Bọ Cạp';
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return '♐ Nhân Mã';
  return '♑ Ma Kết';
}

const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

function getLunarYear(year: number) {
  return `${CAN[year % 10]} ${CHI[year % 12]}`;
}

export default function AgeCalculator() {
  const today = new Date().toISOString().split('T')[0];
  const [birthStr, setBirthStr] = useState('');
  const [refStr, setRefStr] = useState(today);

  const result = useMemo(() => {
    const birth = parseDate(birthStr);
    const ref = parseDate(refStr);
    if (!birth || !ref) return null;
    if (birth > ref) return null;

    const age = calcAge(birth, ref);
    const totalDays = daysBetween(birth, ref);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = age.years * 12 + age.months;

    // Next birthday
    const thisYearBday = new Date(ref.getFullYear(), birth.getMonth(), birth.getDate());
    let nextBday = thisYearBday > ref ? thisYearBday : new Date(ref.getFullYear() + 1, birth.getMonth(), birth.getDate());
    const daysToNext = daysBetween(ref, nextBday);

    const zodiac = getZodiac(birth);
    const lunarYear = getLunarYear(birth.getFullYear());

    return { age, totalDays, totalWeeks, totalMonths, daysToNext, nextBday, zodiac, lunarYear, birth };
  }, [birthStr, refStr]);

  const fmt = (d: Date) =>
    d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="glass-card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-2">Ngày sinh</label>
          <input
            type="date"
            value={birthStr}
            onChange={(e) => setBirthStr(e.target.value)}
            className="input-glass w-full"
            max={today}
            title="Ngày sinh"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-2">Tính đến ngày</label>
          <input
            type="date"
            value={refStr}
            className="input-glass w-full"
            title="Ngày tính"
          />
        </div>
      </div>

      {result && (
        <>
          {/* Main result */}
          <div className="glass-card text-center">
            <div className="text-5xl font-bold text-accent">{result.age.years}</div>
            <p className="text-lg text-[var(--text-secondary)]">
              tuổi, {result.age.months} tháng, {result.age.days} ngày
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ['Tổng ngày', result.totalDays.toLocaleString('vi-VN') + ' ngày'],
              ['Tổng tuần', result.totalWeeks.toLocaleString('vi-VN') + ' tuần'],
              ['Tổng tháng', result.totalMonths.toLocaleString('vi-VN') + ' tháng'],
              ['Sinh nhật kế tiếp', result.daysToNext === 0 ? '🎂 Hôm nay!' : `Còn ${result.daysToNext} ngày`],
              ['Cung hoàng đạo', result.zodiac],
              ['Năm âm lịch', result.lunarYear],
            ].map(([label, val]) => (
              <div key={label} className="glass-card text-center py-3">
                <div className="text-xs text-[var(--text-secondary)] mb-1">{label}</div>
                <div className="text-sm font-semibold">{val}</div>
              </div>
            ))}
          </div>

          {/* Birthday info */}
          <div className="glass-card text-sm space-y-2">
            <p>📅 Bạn sinh vào: <strong>{fmt(result.birth)}</strong></p>
            <p>🎂 Sinh nhật kế tiếp: <strong>{fmt(result.nextBday)}</strong></p>
          </div>
        </>
      )}

      {!result && birthStr && (
        <div className="glass-card text-sm text-[var(--text-secondary)] text-center">
          Ngày sinh phải trước ngày tính
        </div>
      )}
    </div>
  );
}
