import { useState, useMemo } from 'react';

/* ═══════════════ Lunar Calendar Conversion ═══════════════
   Algorithm based on Ho Ngoc Duc's Vietnamese lunar calendar.
   Handles years 1900–2100.
*/

const PI = Math.PI;

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd: number): [number, number, number] {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor(146097 * b / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  else deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Jd1 + C1 - deltat;
}

function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - PI * 2 * Math.floor(L / (PI * 2));
  return Math.floor((L / PI) * 6);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = newMoon(k);
  const sunLong = sunLongitude(nm + 0.5 - timeZone / 24);
  if (sunLong >= 9) nm = newMoon(k - 1);
  return Math.floor(nm + 0.5);
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = sunLongitude(newMoon(k + i) + 0.5 - timeZone / 24);
  do {
    last = arc;
    i++;
    arc = sunLongitude(newMoon(k + i) + 0.5 - timeZone / 24);
  } while (arc !== last && i < 14);
  return i - 1;
}

interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
}

function solarToLunar(dd: number, mm: number, yy: number, timeZone: number): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = Math.floor(newMoon(k) + 0.5);
  if (monthStart > dayNumber) monthStart = Math.floor(newMoon(k - 1) + 0.5);

  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;

  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap };
}

function lunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number, lunarLeap: boolean, timeZone: number): [number, number, number] {
  let a11: number, b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }

  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapM = leapOff - 2;
    if (leapM < 0) leapM += 12;
    if (lunarLeap && lunarMonth !== leapM) {
      return [0, 0, 0];
    } else if (lunarLeap || (off >= leapOff)) {
      off += 1;
    }
  }

  const monthStart = Math.floor(newMoon(k + off) + 0.5);
  return jdToDate(monthStart + lunarDay - 1);
}

/* ══════════ Can Chi ══════════ */

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const CHI_EMOJI = ['🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐎', '🐐', '🐒', '🐓', '🐕', '🐷'];

function canChiYear(year: number) {
  const can = CAN[(year + 6) % 10];
  const chiIdx = (year + 8) % 12;
  return { text: `${can} ${CHI[chiIdx]}`, emoji: CHI_EMOJI[chiIdx] };
}

function canChiDay(jd: number) {
  const can = CAN[(jd + 9) % 10];
  const chi = CHI[(jd + 1) % 12];
  return `${can} ${chi}`;
}

/* ══════════ Ngày tốt / xấu ══════════ */
const GOOD_DAYS = ['Giáp Tý', 'Ất Sửu', 'Bính Dần', 'Đinh Mão', 'Mậu Thìn', 'Kỷ Tỵ',
  'Canh Ngọ', 'Tân Mùi', 'Nhâm Thân', 'Quý Dậu', 'Giáp Tuất', 'Ất Hợi',
  'Bính Tý', 'Đinh Sửu', 'Mậu Dần', 'Kỷ Mão', 'Canh Thìn', 'Tân Tỵ',
  'Nhâm Ngọ', 'Quý Mùi', 'Giáp Thân', 'Ất Dậu', 'Bính Tuất', 'Đinh Hợi'];
const BAD_CHI = ['Thìn', 'Tuất', 'Sửu', 'Mùi'];

function dayQuality(canChi: string): { label: string; color: string } {
  if (GOOD_DAYS.includes(canChi)) return { label: 'Ngày Hoàng Đạo (tốt)', color: '#22c55e' };
  const chi = canChi.split(' ')[1];
  if (BAD_CHI.includes(chi)) return { label: 'Ngày Hắc Đạo (xấu)', color: '#ef4444' };
  return { label: 'Ngày bình thường', color: '#eab308' };
}

/* ══════════ Component ══════════ */

type ConvertMode = 'solar-to-lunar' | 'lunar-to-solar';

export default function LunarCalendar() {
  const TZ = 7; // Vietnam GMT+7
  const today = new Date();
  const [mode, setMode] = useState<ConvertMode>('solar-to-lunar');

  // Solar → Lunar
  const [solarDate, setSolarDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  // Lunar → Solar
  const [lunarD, setLunarD] = useState(1);
  const [lunarM, setLunarM] = useState(1);
  const [lunarY, setLunarY] = useState(today.getFullYear());
  const [lunarLeap, setLunarLeap] = useState(false);

  const solarResult = useMemo(() => {
    if (mode !== 'solar-to-lunar' || !solarDate) return null;
    const [yy, mm, dd] = solarDate.split('-').map(Number);
    if (!yy || !mm || !dd) return null;
    const lunar = solarToLunar(dd, mm, yy, TZ);
    const jd = jdFromDate(dd, mm, yy);
    const cc = canChiDay(jd);
    const yearCC = canChiYear(lunar.year);
    const quality = dayQuality(cc);
    return { lunar, cc, yearCC, quality, jd };
  }, [solarDate, mode]);

  const lunarResult = useMemo(() => {
    if (mode !== 'lunar-to-solar') return null;
    const [dd, mm, yy] = lunarToSolar(lunarD, lunarM, lunarY, lunarLeap, TZ);
    if (!dd) return null;
    return { day: dd, month: mm, year: yy };
  }, [lunarD, lunarM, lunarY, lunarLeap, mode]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {([['solar-to-lunar', '☀️ Dương → Âm'], ['lunar-to-solar', '🌙 Âm → Dương']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMode(id as ConvertMode)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === id ? 'bg-accent/20 text-accent shadow-sm' : 'text-[var(--text-secondary)] hover:bg-white/5'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ═══ Solar → Lunar ═══ */}
      {mode === 'solar-to-lunar' && (
        <>
          <div className="glass-card">
            <label className="text-sm font-semibold block mb-2">Chọn ngày dương lịch</label>
            <input
              type="date"
              value={solarDate}
              onChange={(e) => setSolarDate(e.target.value)}
              className="input-glass w-full"
              min="1900-01-01"
              max="2100-12-31"
              title="Ngày dương lịch"
            />
          </div>

          {solarResult && (
            <>
              {/* Main result */}
              <div className="glass-card text-center space-y-3">
                <div className="text-5xl">{solarResult.yearCC.emoji}</div>
                <div className="text-3xl font-bold text-accent">
                  {solarResult.lunar.day}/{solarResult.lunar.month}
                  {solarResult.lunar.leap ? ' (nhuận)' : ''} Âm lịch
                </div>
                <p className="text-lg text-[var(--text-secondary)]">
                  Năm {solarResult.yearCC.text} ({solarResult.lunar.year})
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="glass-card text-center py-3">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Can Chi ngày</div>
                  <div className="text-sm font-semibold">{solarResult.cc}</div>
                </div>
                <div className="glass-card text-center py-3">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Can Chi năm</div>
                  <div className="text-sm font-semibold">{solarResult.yearCC.text}</div>
                </div>
                <div className="glass-card text-center py-3 col-span-2 sm:col-span-1">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Ngày tốt/xấu</div>
                  <div className="text-sm font-bold" style={{ color: solarResult.quality.color }}>
                    {solarResult.quality.label}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ Lunar → Solar ═══ */}
      {mode === 'lunar-to-solar' && (
        <>
          <div className="glass-card">
            <label className="text-sm font-semibold block mb-3">Nhập ngày âm lịch</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Ngày</label>
                <input type="number" min={1} max={30} value={lunarD}
                  onChange={(e) => setLunarD(Math.max(1, Math.min(30, +e.target.value || 1)))}
                  className="input-glass w-full mt-1" title="Ngày âm" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Tháng</label>
                <input type="number" min={1} max={12} value={lunarM}
                  onChange={(e) => setLunarM(Math.max(1, Math.min(12, +e.target.value || 1)))}
                  className="input-glass w-full mt-1" title="Tháng âm" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Năm</label>
                <input type="number" min={1900} max={2100} value={lunarY}
                  onChange={(e) => setLunarY(+e.target.value || today.getFullYear())}
                  className="input-glass w-full mt-1" title="Năm âm" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={lunarLeap} onChange={(e) => setLunarLeap(e.target.checked)}
                    className="accent-accent w-4 h-4" />
                  <span className="text-sm">Tháng nhuận</span>
                </label>
              </div>
            </div>
          </div>

          {lunarResult && (
            <div className="glass-card text-center space-y-2">
              <div className="text-3xl font-bold text-accent">
                {String(lunarResult.day).padStart(2, '0')}/{String(lunarResult.month).padStart(2, '0')}/{lunarResult.year}
              </div>
              <p className="text-sm text-[var(--text-secondary)]">Ngày dương lịch tương ứng</p>
            </div>
          )}

          {lunarResult === null && mode === 'lunar-to-solar' && (
            <div className="glass-card text-sm text-[var(--text-secondary)] text-center">
              Ngày âm lịch không hợp lệ
            </div>
          )}
        </>
      )}

      {/* Reference */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-2">Ghi chú</h3>
        <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
          <li>Lịch âm tính theo múi giờ Việt Nam (GMT+7)</li>
          <li>Ngày Hoàng Đạo: tốt cho khai trương, cưới hỏi, động thổ</li>
          <li>Ngày Hắc Đạo: nên tránh việc lớn</li>
          <li>Hỗ trợ năm 1900 – 2100</li>
        </ul>
      </div>
    </div>
  );
}
