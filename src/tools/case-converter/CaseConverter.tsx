import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../../components/CopyButton';

const conversions = [
  {
    id: 'upper',
    label: 'CHỮ HOA',
    fn: (t: string) => t.toUpperCase(),
  },
  {
    id: 'lower',
    label: 'chữ thường',
    fn: (t: string) => t.toLowerCase(),
  },
  {
    id: 'title',
    label: 'Title Case',
    fn: (t: string) =>
      t.toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase()),
  },
  {
    id: 'sentence',
    label: 'Viết hoa đầu câu',
    fn: (t: string) =>
      t.toLowerCase().replace(/(^\s*|[.!?]\s+)(\S)/g, (_, p, c) => p + c.toUpperCase()),
  },
  {
    id: 'alternating',
    label: 'xEn Kẽ',
    fn: (t: string) =>
      t.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join(''),
  },
  {
    id: 'inverse',
    label: 'Đảo ngược HOA/thường',
    fn: (t: string) =>
      t.split('').map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
  },
];

export default function CaseConverter() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [active, setActive] = useState('');

  const apply = (id: string, fn: (t: string) => string) => {
    setOutput(fn(input));
    setActive(id);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold">Nhập văn bản</label>
          <button onClick={() => { setInput(''); setOutput(''); setActive(''); }} className="btn-secondary text-xs px-3 py-1">
            {t('common.clear')}
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); if (active) { const conv = conversions.find(c => c.id === active); if (conv) setOutput(conv.fn(e.target.value)); } }}
          className="textarea-glass w-full h-36"
          placeholder="Dán văn bản cần chuyển đổi..."
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
        {conversions.map((conv) => (
          <button
            key={conv.id}
            onClick={() => apply(conv.id, conv.fn)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active === conv.id
                ? 'bg-accent/20 text-accent ring-1 ring-accent/30'
                : 'glass-card hover:bg-white/10'
              }`}
          >
            {conv.label}
          </button>
        ))}
      </div>

      {/* Output */}
      {output && (
        <div className="glass-card">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold">Kết quả</label>
            <CopyButton text={output} />
          </div>
          <textarea
            value={output}
            readOnly
            className="textarea-glass w-full h-36"
            placeholder="Kết quả sẽ hiện ở đây..."
          />
        </div>
      )}
    </div>
  );
}
