import { useState, useMemo } from 'react';

interface Bank {
  name: string;
  shortName: string;
  bin: string;
  swift: string;
  code: string;
}

const BANKS: Bank[] = [
  { name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', shortName: 'Vietcombank', bin: '970436', swift: 'BFTVVNVX', code: 'VCB' },
  { name: 'Ngân hàng TMCP Công Thương Việt Nam', shortName: 'VietinBank', bin: '970415', swift: 'ICBVVNVX', code: 'CTG' },
  { name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV', bin: '970418', swift: 'BIDVVNVX', code: 'BIDV' },
  { name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn VN', shortName: 'Agribank', bin: '970405', swift: 'VBAAVNVX', code: 'AGR' },
  { name: 'Ngân hàng TMCP Kỹ Thương Việt Nam', shortName: 'Techcombank', bin: '970407', swift: 'VTCBVNVX', code: 'TCB' },
  { name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB', bin: '970416', swift: 'ASCBVNVX', code: 'ACB' },
  { name: 'Ngân hàng TMCP Quân Đội', shortName: 'MB Bank', bin: '970422', swift: 'MSCBVNVX', code: 'MBB' },
  { name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank', bin: '970432', swift: 'VPBKVNVX', code: 'VPB' },
  { name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank', bin: '970403', swift: 'SGTTVNVX', code: 'STB' },
  { name: 'Ngân hàng TMCP Phát triển TP.HCM', shortName: 'HDBank', bin: '970437', swift: 'HDBCVNVX', code: 'HDB' },
  { name: 'Ngân hàng TMCP Sài Gòn', shortName: 'SCB', bin: '970429', swift: 'SACLVNVX', code: 'SCB' },
  { name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank', bin: '970423', swift: 'TPBVVNVX', code: 'TPB' },
  { name: 'Ngân hàng TMCP Quốc Tế', shortName: 'VIB', bin: '970441', swift: 'VNIBVNVX', code: 'VIB' },
  { name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', shortName: 'SHB', bin: '970443', swift: 'SHBAVNVX', code: 'SHB' },
  { name: 'Ngân hàng TMCP Xuất Nhập Khẩu', shortName: 'Eximbank', bin: '970431', swift: 'EBVIVNVX', code: 'EIB' },
  { name: 'Ngân hàng TMCP Hàng Hải', shortName: 'MSB', bin: '970426', swift: 'MCOBVNVX', code: 'MSB' },
  { name: 'Ngân hàng TMCP Đông Nam Á', shortName: 'SeABank', bin: '970440', swift: 'SEAVVNVX', code: 'SSB' },
  { name: 'Ngân hàng TMCP Bưu Điện Liên Việt', shortName: 'LPBank', bin: '970449', swift: 'LVBKVNVX', code: 'LPB' },
  { name: 'Ngân hàng TMCP Bản Việt', shortName: 'BVBank', bin: '970438', swift: 'VCBCVNVX', code: 'BVB' },
  { name: 'Ngân hàng TMCP Phương Đông', shortName: 'OCB', bin: '970448', swift: 'ORCOVNVX', code: 'OCB' },
  { name: 'Ngân hàng TMCP An Bình', shortName: 'ABBank', bin: '970425', swift: 'ABBKVNVX', code: 'ABB' },
  { name: 'Ngân hàng TMCP Bắc Á', shortName: 'BacABank', bin: '970409', swift: 'NASCVNVX', code: 'BAB' },
  { name: 'Ngân hàng TMCP Kiên Long', shortName: 'KienlongBank', bin: '970452', swift: 'KLBKVNVX', code: 'KLB' },
  { name: 'Ngân hàng TMCP Nam Á', shortName: 'NamABank', bin: '970428', swift: 'NAMAVNVX', code: 'NAB' },
  { name: 'Ngân hàng TMCP Việt Á', shortName: 'VietABank', bin: '970427', swift: 'VNACVNVX', code: 'VAB' },
  { name: 'Ngân hàng TMCP Sài Gòn Công Thương', shortName: 'SaigonBank', bin: '970400', swift: 'SBITVNVX', code: 'SGB' },
  { name: 'Ngân hàng TMCP Quốc Dân', shortName: 'NCB', bin: '970419', swift: 'NVBAVNVX', code: 'NCB' },
  { name: 'Ngân hàng TMCP Đại Chúng', shortName: 'PVcomBank', bin: '970412', swift: 'WBVNVNVX', code: 'PVC' },
  { name: 'Ngân hàng TMCP Xăng Dầu Petrolimex', shortName: 'PGBank', bin: '970430', swift: 'PGBLVNVX', code: 'PGB' },
  { name: 'Ngân hàng TMCP Đông Á', shortName: 'DongABank', bin: '970406', swift: 'EABORVNVX', code: 'DOB' },
  { name: 'Ngân hàng TMCP Việt Nam Thương Tín', shortName: 'VietBank', bin: '970433', swift: 'VNTTVNVX', code: 'VBB' },
  { name: 'Ngân hàng Chính sách Xã hội', shortName: 'VBSP', bin: '999888', swift: '', code: 'VBSP' },
  { name: 'Ngân hàng Phát triển Việt Nam', shortName: 'VDB', bin: '999889', swift: '', code: 'VDB' },
  { name: 'Ngân hàng TNHH MTV CIMB Việt Nam', shortName: 'CIMB', bin: '422589', swift: 'CIBBVNVN', code: 'CIMB' },
  { name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', shortName: 'Shinhan Bank', bin: '970424', swift: 'SHBKVNVX', code: 'SHIN' },
  { name: 'Ngân hàng TNHH MTV Woori Việt Nam', shortName: 'Woori Bank', bin: '970457', swift: 'HVBKVNVX', code: 'WOR' },
  { name: 'Ngân hàng TNHH MTV UOB Việt Nam', shortName: 'UOB', bin: '970458', swift: 'ULOOVNVX', code: 'UOB' },
  { name: 'Ngân hàng TNHH MTV HSBC Việt Nam', shortName: 'HSBC', bin: '458761', swift: 'HSBCVNVX', code: 'HSBC' },
  { name: 'Ngân hàng TNHH MTV Standard Chartered VN', shortName: 'Standard Chartered', bin: '970410', swift: 'SCBLVNVX', code: 'SC' },
  { name: 'Ngân hàng Liên doanh Việt - Nga', shortName: 'VRB', bin: '970421', swift: 'VABORVNX', code: 'VRB' },
  { name: 'TMCP Lộc Phát Việt Nam', shortName: 'LPBank (cũ LienVietPostBank)', bin: '970449', swift: 'LVBKVNVX', code: 'LPB' },
  { name: 'Ngân hàng Số CAKE by VPBank', shortName: 'CAKE', bin: '546034', swift: '', code: 'CAKE' },
  { name: 'Ngân hàng Số Ubank by VPBank', shortName: 'Ubank', bin: '546035', swift: '', code: 'UBK' },
  { name: 'Ví MoMo', shortName: 'MoMo', bin: '', swift: '', code: 'MOMO' },
  { name: 'Ví ZaloPay', shortName: 'ZaloPay', bin: '', swift: '', code: 'ZALO' },
  { name: 'Ví VNPay', shortName: 'VNPay', bin: '', swift: '', code: 'VNPAY' },
];

// Remove duplicate LPBank entry
const BANKS_UNIQUE = BANKS.filter((b, i, arr) =>
  i === arr.findIndex(x => x.shortName === b.shortName)
);

export default function BankInfo() {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return BANKS_UNIQUE;
    const q = search.toLowerCase();
    return BANKS_UNIQUE.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.bin.includes(q) ||
        b.swift.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q)
    );
  }, [search]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="glass-card">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-glass w-full text-base"
          placeholder="Tìm ngân hàng: tên, viết tắt, BIN, SWIFT..."
        />
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Hiển thị {filtered.length} / {BANKS_UNIQUE.length} ngân hàng & ví điện tử
        </p>
      </div>

      {/* Bank list */}
      <div className="space-y-3">
        {filtered.map((b) => (
          <div key={b.shortName} className="glass-card hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-bold text-sm">{b.shortName}</h3>
                <p className="text-xs text-[var(--text-secondary)] break-words">{b.name}</p>
              </div>
              <span className="text-xs font-mono text-accent shrink-0">{b.code}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {b.bin && (
                <button
                  onClick={() => copy(b.bin, `bin-${b.shortName}`)}
                  className="btn-secondary text-xs py-1.5 font-mono text-left"
                >
                  BIN: {b.bin} {copied === `bin-${b.shortName}` ? '✓' : '📋'}
                </button>
              )}
              {b.swift && (
                <button
                  onClick={() => copy(b.swift, `swift-${b.shortName}`)}
                  className="btn-secondary text-xs py-1.5 font-mono text-left"
                >
                  SWIFT: {b.swift} {copied === `swift-${b.shortName}` ? '✓' : '📋'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card text-center text-sm text-[var(--text-secondary)]">
          Không tìm thấy ngân hàng nào phù hợp
        </div>
      )}

      {/* Note */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-2">Ghi chú</h3>
        <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
          <li>BIN (Bank Identification Number): 6 số đầu trên thẻ ngân hàng</li>
          <li>SWIFT: mã định danh quốc tế khi chuyển tiền quốc tế</li>
          <li>Nhấn vào BIN hoặc SWIFT để sao chép</li>
        </ul>
      </div>
    </div>
  );
}
