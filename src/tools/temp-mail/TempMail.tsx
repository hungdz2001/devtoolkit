import { useState, useEffect, useCallback, useRef } from 'react';
import CopyButton from '../../components/CopyButton';

const BASE = 'https://tmail.mmocommunity.io.vn/api/v1';
const API_KEY = '9a8083a29957581fdc2949c8895c36c5';

interface MailMessage {
  id: number;
  from_email: string;
  from_name: string;
  subject: string;
  preview: string;
  is_read: boolean;
  received_at: string;
}

interface MailDetail {
  id: number;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  body_text: string;
  body_html: string;
  received_at: string;
}

interface EmailData {
  email: string;
  token: string;
  expires_at: string;
}

async function api<T>(path: string, apiKey: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'X-API-Key': apiKey, ...(opts?.headers || {}) },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('API key không hợp lệ');
    if (res.status === 429) throw new Error('Vượt giới hạn request, chờ 1 phút');
    throw new Error(`Lỗi ${res.status}`);
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi API');
  return data.data as T;
}

export default function TempMail() {
  const [error, setError] = useState('');

  // Email state
  const [email, setEmail] = useState<EmailData | null>(null);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [openMsg, setOpenMsg] = useState<MailDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Domains
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [customAddr, setCustomAddr] = useState('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch domains on mount
  const fetchDomains = useCallback(async () => {
    try {
      const data = await api<Array<{ domain: string }>>('/domains', API_KEY);
      const d = data.map((x) => x.domain);
      setDomains(d);
      if (d.length > 0) setSelectedDomain(d[0]);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Create email
  const createEmail = async () => {
    setCreating(true);
    setError('');
    setOpenMsg(null);
    setMessages([]);
    try {
      const params = new URLSearchParams();
      if (selectedDomain) params.set('domain', selectedDomain);
      if (customAddr.trim()) params.set('address', customAddr.trim());

      const data = await api<EmailData>('/email/create', API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      setEmail(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Tạo email thất bại');
    } finally {
      setCreating(false);
    }
  };

  // Fetch inbox
  const fetchInbox = useCallback(async () => {
    if (!email) return;
    try {
      const data = await api<{ messages: MailMessage[] }>(
        `/email/inbox?token=${encodeURIComponent(email.token)}`,
        API_KEY
      );
      setMessages(data.messages || []);
    } catch {
      // silent
    }
  }, [email]);

  // Auto-refresh inbox every 10s
  useEffect(() => {
    if (!email) return;
    fetchInbox();
    pollRef.current = setInterval(fetchInbox, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [email]);

  // Read message
  const readMsg = async (msgId: number) => {
    if (!email) return;
    setError('');
    try {
      const data = await api<MailDetail>(
        `/email/read?token=${encodeURIComponent(email.token)}&message_id=${msgId}`,
        API_KEY
      );
      setOpenMsg(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không đọc được thư');
    }
  };

  // Delete message
  const deleteMsg = async (msgId: number) => {
    if (!email) return;
    try {
      await api(`/email/message?token=${encodeURIComponent(email.token)}&message_id=${msgId}`, API_KEY, {
        method: 'DELETE',
      });
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      if (openMsg?.id === msgId) setOpenMsg(null);
    } catch {
      // silent
    }
  };

  // Delete entire email
  const deleteEmail = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await api(`/email?token=${encodeURIComponent(email.token)}`, API_KEY, { method: 'DELETE' });
    } catch {
      // silent
    }
    setEmail(null);
    setMessages([]);
    setOpenMsg(null);
    setLoading(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
  };

  const cleanPreview = (text: string) => {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/\{[^}]*\}/g, '')
      .replace(/#\w+[^{]*\{[^}]*\}/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  };

  return (
    <div className="space-y-6">
      {/* Create email */}
      {!email && (
        <div className="glass-card space-y-3">
          <label className="text-sm font-semibold block">Tạo email tạm</label>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[120px]">
              <label className="text-xs text-[var(--text-secondary)]">Tên email (tuỳ chọn)</label>
              <input
                type="text"
                value={customAddr}
                onChange={(e) => setCustomAddr(e.target.value)}
                className="input-glass w-full mt-1 font-mono"
                placeholder="ngẫu nhiên"
              />
            </div>
            {domains.length > 0 && (
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Domain</label>
                <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="input-glass mt-1" title="Chọn domain">
                  {domains.map((d) => <option key={d} value={d}>@{d}</option>)}
                </select>
              </div>
            )}
            <button onClick={createEmail} disabled={creating} className="btn-primary px-6 disabled:opacity-50">
              {creating ? '...' : '📧 Tạo mail'}
            </button>
          </div>
        </div>
      )}

      {/* Active email */}
      {email && (
        <div className="glass-card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">📧</span>
              <span className="font-mono font-bold text-accent text-sm truncate">{email.email}</span>
              <CopyButton text={email.email} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Hết hạn: {email.expires_at}</span>
              <button onClick={deleteEmail} disabled={loading} className="btn-secondary text-xs text-red-400 px-3 py-1">
                Xoá
              </button>
              <button onClick={createEmail} disabled={creating} className="btn-secondary text-xs px-3 py-1">
                Tạo mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card bg-red-500/10 border-red-500/20 text-sm text-red-400">{error}</div>
      )}

      {/* Inbox */}
      {email && (
        <div className="glass-card space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">📥 Hộp thư ({messages.length})</label>
            <button onClick={fetchInbox} className="text-xs text-accent hover:underline">🔄 Làm mới</button>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm">Chưa có thư nào</p>
              <p className="text-xs mt-1">Tự động kiểm tra mỗi 10 giây...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`group p-3 rounded-xl cursor-pointer transition-all hover:bg-white/10 ${!msg.is_read ? 'bg-accent/5 border-l-3 border-accent' : 'bg-white/5'
                    }`}
                  onClick={() => readMsg(msg.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm">{msg.from_name?.[0]?.toUpperCase() || '✉'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${!msg.is_read ? 'font-bold' : 'font-medium'}`}>
                          {msg.from_name || msg.from_email}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] shrink-0">{timeAgo(msg.received_at)}</span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${!msg.is_read ? 'font-semibold' : ''}`}>
                        {msg.subject || '(Không có tiêu đề)'}
                      </p>
                      {cleanPreview(msg.preview) && (
                        <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                          {cleanPreview(msg.preview)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMsg(msg.id); }}
                      className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
                      title="Xoá"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Read message */}
      {openMsg && (
        <div className="glass-card space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm">{openMsg.subject || '(Không có tiêu đề)'}</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Từ: {openMsg.from_name} &lt;{openMsg.from_email}&gt;
              </p>
              <p className="text-xs text-[var(--text-secondary)]">{openMsg.received_at}</p>
            </div>
            <button onClick={() => setOpenMsg(null)} className="btn-secondary text-xs px-3 py-1">Đóng</button>
          </div>

          {openMsg.body_html ? (
            <iframe
              title="email-content"
              srcDoc={openMsg.body_html}
              sandbox="allow-same-origin"
              className="w-full min-h-[300px] bg-white rounded-xl border-0"
              style={{ colorScheme: 'light' }}
            />
          ) : (
            <div className="bg-black/10 rounded-xl p-4 text-sm whitespace-pre-wrap">
              {openMsg.body_text}
            </div>
          )}
        </div>
      )}

      {/* Guide */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-2">Hướng dẫn sử dụng</h3>
        <ol className="text-xs text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
          <li>Nhập tên email tuỳ ý hoặc để trống để tạo ngẫu nhiên</li>
          <li>Nhấn "Tạo mail" → copy địa chỉ email tạm</li>
          <li>Dùng email này để đăng ký dịch vụ, nhận mã xác thực...</li>
          <li>Hộp thư tự động kiểm tra mỗi 10 giây</li>
          <li>Nhấn vào thư để đọc nội dung chi tiết</li>
        </ol>
        <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg text-xs text-yellow-300">
          ⚠️ Email tạm có thời hạn. Không dùng cho tài khoản quan trọng.
        </div>
      </div>
    </div>
  );
}
