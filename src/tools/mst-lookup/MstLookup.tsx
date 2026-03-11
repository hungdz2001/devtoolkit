import { useState } from 'react';

interface CompanyInfo {
  name: string;
  address: string;
  representative: string;
  status: string;
  mst: string;
}

export default function MstLookup() {
  const [mst, setMst] = useState('');
  const [result, setResult] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    const cleaned = mst.replace(/[^0-9-]/g, '').trim();
    if (!cleaned || cleaned.length < 10) {
      setError('Mã số thuế phải có ít nhất 10 chữ số');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Use public API endpoint
      const res = await fetch(`https://api.vietqr.io/v2/business/${cleaned}`);
      if (!res.ok) throw new Error('not_found');
      const data = await res.json();

      if (data.code === '00' && data.data) {
        setResult({
          name: data.data.name || 'Không có thông tin',
          address: data.data.address || 'Không có thông tin',
          representative: data.data.representative || 'Không có thông tin',
          status: data.data.status || 'Không rõ',
          mst: cleaned,
        });
      } else {
        throw new Error('not_found');
      }
    } catch {
      setError('Không tìm thấy thông tin. Thử tra trên masothue.com');
    } finally {
      setLoading(false);
    }
  };

  const openMasothue = () => {
    const cleaned = mst.replace(/[^0-9-]/g, '').trim();
    window.open(`https://masothue.com/${cleaned}`, '_blank', 'noopener');
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="glass-card">
        <label className="text-sm font-semibold block mb-3">Nhập mã số thuế (MST)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={mst}
            onChange={(e) => setMst(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            className="input-glass flex-1 text-lg font-mono"
            placeholder="VD: 0316422037"
            maxLength={20}
          />
          <button onClick={lookup} disabled={loading} className="btn-primary px-6 disabled:opacity-50">
            {loading ? '...' : 'Tra cứu'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          MST gồm 10 hoặc 13 chữ số (có thể có dấu gạch ngang)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card bg-red-500/10 border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={openMasothue} className="text-sm text-accent underline mt-2 hover:no-underline">
            → Tra trên masothue.com
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent text-lg">
              🏢
            </div>
            <div>
              <h3 className="font-bold text-lg">{result.name}</h3>
              <span className="text-xs font-mono text-[var(--text-secondary)]">MST: {result.mst}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {[
              ['📍 Địa chỉ', result.address],
              ['👤 Người đại diện', result.representative],
              ['📋 Trạng thái', result.status],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-3">
                <span className="text-[var(--text-secondary)] whitespace-nowrap min-w-[140px]">{label}</span>
                <span className="font-medium">{val}</span>
              </div>
            ))}
          </div>

          <button onClick={openMasothue} className="btn-secondary text-sm w-full">
            Xem chi tiết trên masothue.com →
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-2">Mẹo</h3>
        <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
          <li>MST doanh nghiệp: 10 số (VD: 0316422037)</li>
          <li>MST chi nhánh: 13 số hoặc 10-3 (VD: 0316422037-001)</li>
          <li>Dữ liệu lấy từ nguồn công khai, chỉ mang tính tham khảo</li>
        </ul>
      </div>
    </div>
  );
}
