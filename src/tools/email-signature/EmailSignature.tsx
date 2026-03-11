import { useState, useRef } from 'react';
import CopyButton from '../../components/CopyButton';

interface SigData {
  fullName: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  facebook: string;
  linkedin: string;
  zalo: string;
}

const defaultData: SigData = {
  fullName: '',
  jobTitle: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  logoUrl: '',
  facebook: '',
  linkedin: '',
  zalo: '',
};

const templates = [
  { id: 'modern', name: '🎨 Modern' },
  { id: 'classic', name: '📋 Classic' },
  { id: 'minimal', name: '✨ Minimal' },
];

function buildHtml(d: SigData, template: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const socials: string[] = [];
  if (d.facebook) socials.push(`<a href="${esc(d.facebook)}" style="color:#1877F2;text-decoration:none;margin-right:8px;" target="_blank">Facebook</a>`);
  if (d.linkedin) socials.push(`<a href="${esc(d.linkedin)}" style="color:#0A66C2;text-decoration:none;margin-right:8px;" target="_blank">LinkedIn</a>`);
  if (d.zalo) socials.push(`<a href="${esc(d.zalo)}" style="color:#0068FF;text-decoration:none;margin-right:8px;" target="_blank">Zalo</a>`);

  const socialHtml = socials.length > 0 ? `<tr><td style="padding-top:6px;font-size:12px;">${socials.join('')}</td></tr>` : '';

  const logoCell = d.logoUrl
    ? `<td style="padding-right:16px;vertical-align:top;"><img src="${esc(d.logoUrl)}" alt="Logo" width="80" style="border-radius:${template === 'modern' ? '12' : '4'}px;" /></td>`
    : '';

  if (template === 'minimal') {
    return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;">
<tr><td style="padding-bottom:6px;"><strong style="font-size:15px;color:#111;">${esc(d.fullName)}</strong></td></tr>
${d.jobTitle ? `<tr><td style="font-size:12px;color:#666;">${esc(d.jobTitle)}${d.company ? ` · ${esc(d.company)}` : ''}</td></tr>` : ''}
<tr><td style="padding-top:4px;border-top:1px solid #eee;font-size:12px;color:#666;">
${d.phone ? `${esc(d.phone)} ` : ''}${d.email ? `| <a href="mailto:${esc(d.email)}" style="color:#0066cc;text-decoration:none;">${esc(d.email)}</a> ` : ''}${d.website ? `| <a href="${esc(d.website)}" style="color:#0066cc;text-decoration:none;">${esc(d.website)}</a>` : ''}
</td></tr>
${socialHtml}
</table>`;
  }

  const borderColor = template === 'modern' ? '#6366f1' : '#333';
  const nameColor = template === 'modern' ? '#6366f1' : '#111';
  const nameSize = template === 'modern' ? '16' : '15';

  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;">
<tr>
${logoCell}
<td style="border-left:3px solid ${borderColor};padding-left:14px;vertical-align:top;">
<table cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:2px;"><strong style="font-size:${nameSize}px;color:${nameColor};">${esc(d.fullName)}</strong></td></tr>
${d.jobTitle ? `<tr><td style="font-size:12px;color:#666;">${esc(d.jobTitle)}</td></tr>` : ''}
${d.company ? `<tr><td style="font-size:12px;color:#666;font-weight:600;">${esc(d.company)}</td></tr>` : ''}
<tr><td style="padding-top:6px;font-size:12px;">
${d.phone ? `📱 ${esc(d.phone)}<br/>` : ''}
${d.email ? `📧 <a href="mailto:${esc(d.email)}" style="color:#0066cc;text-decoration:none;">${esc(d.email)}</a><br/>` : ''}
${d.website ? `🌐 <a href="${esc(d.website)}" style="color:#0066cc;text-decoration:none;">${esc(d.website)}</a>` : ''}
</td></tr>
${socialHtml}
</table>
</td>
</tr>
</table>`;
}

export default function EmailSignature() {
  const [data, setData] = useState<SigData>(defaultData);
  const [template, setTemplate] = useState('modern');
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof SigData, val: string) => setData((p) => ({ ...p, [key]: val }));

  const html = buildHtml(data, template);

  const copyHtml = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fields: { key: keyof SigData; label: string; placeholder: string; type?: string }[] = [
    { key: 'fullName', label: 'Họ tên *', placeholder: 'Nguyễn Văn A' },
    { key: 'jobTitle', label: 'Chức vụ', placeholder: 'Frontend Developer' },
    { key: 'company', label: 'Công ty', placeholder: 'ABC Corp' },
    { key: 'phone', label: 'Điện thoại', placeholder: '0901234567' },
    { key: 'email', label: 'Email', placeholder: 'name@company.com', type: 'email' },
    { key: 'website', label: 'Website', placeholder: 'https://company.com' },
    { key: 'logoUrl', label: 'Logo URL', placeholder: 'https://...logo.png' },
  ];

  const socialFields: { key: keyof SigData; label: string; placeholder: string }[] = [
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
    { key: 'zalo', label: 'Zalo', placeholder: 'https://zalo.me/...' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card space-y-4">
          <h3 className="text-sm font-semibold">📝 Thông tin</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-[var(--text-secondary)]">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={data[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="input-glass w-full mt-1"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold pt-2">🔗 Mạng xã hội</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {socialFields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-[var(--text-secondary)]">{f.label}</label>
                <input
                  type="text"
                  value={data[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="input-glass w-full mt-1"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>

          {/* Template */}
          <h3 className="text-sm font-semibold pt-2">🎭 Mẫu chữ ký</h3>
          <div className="flex gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${template === t.id
                    ? 'bg-accent/20 text-accent border border-accent/40'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-4">
          <div className="glass-card">
            <h3 className="text-sm font-semibold mb-3">👁️ Xem trước</h3>
            <div
              ref={previewRef}
              className="bg-white rounded-xl p-6 min-h-[120px]"
              style={{ colorScheme: 'light' }}
              dangerouslySetInnerHTML={{ __html: data.fullName ? html : '<p style="color:#999;font-size:13px;">Nhập họ tên để xem trước...</p>' }}
            />
          </div>

          <div className="flex gap-2">
            <button onClick={copyHtml} disabled={!data.fullName} className="btn-primary flex-1 disabled:opacity-50">
              {copied ? '✅ Đã copy!' : '📋 Copy HTML'}
            </button>
            <CopyButton text={html} />
          </div>

          {/* HTML Source */}
          <details className="glass-card">
            <summary className="text-sm font-semibold cursor-pointer">🔧 Mã HTML</summary>
            <pre className="mt-3 text-xs bg-black/20 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-all max-h-[200px]">
              {html}
            </pre>
          </details>

          {/* Guide */}
          <div className="glass-card">
            <h3 className="text-sm font-semibold mb-2">Cách dùng</h3>
            <ol className="text-xs text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
              <li>Điền thông tin → chọn mẫu → nhấn "Copy HTML"</li>
              <li><strong>Gmail:</strong> Settings → Signature → dán (Ctrl+V)</li>
              <li><strong>Outlook:</strong> Settings → Mail → Compose → Signature → dán</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
