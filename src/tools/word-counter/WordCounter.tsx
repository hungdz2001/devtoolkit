import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../../components/CopyButton';

function analyze(text: string) {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const speakingTime = Math.max(1, Math.ceil(words / 130));
  return { chars, charsNoSpace, words, sentences, paragraphs, lines, readingTime, speakingTime };
}

export default function WordCounter() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const stats = analyze(text);

  const statItems = [
    { label: 'Từ', labelEn: 'Words', value: stats.words },
    { label: 'Ký tự', labelEn: 'Characters', value: stats.chars },
    { label: 'Không dấu cách', labelEn: 'No spaces', value: stats.charsNoSpace },
    { label: 'Câu', labelEn: 'Sentences', value: stats.sentences },
    { label: 'Đoạn văn', labelEn: 'Paragraphs', value: stats.paragraphs },
    { label: 'Dòng', labelEn: 'Lines', value: stats.lines },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statItems.map((s) => (
          <div key={s.label} className="glass-card text-center py-4">
            <div className="text-2xl font-bold text-accent">{s.value.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reading time */}
      <div className="flex gap-4 justify-center text-sm text-[var(--text-secondary)]">
        <span>📖 Đọc: ~{stats.readingTime} phút</span>
        <span>🎤 Nói: ~{stats.speakingTime} phút</span>
      </div>

      {/* Textarea */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold">Nhập hoặc dán văn bản</label>
          <div className="flex gap-2">
            <CopyButton text={text} />
            <button onClick={() => setText('')} className="btn-secondary text-xs px-3 py-1">
              {t('common.clear')}
            </button>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="textarea-glass w-full h-64 font-sans text-sm leading-relaxed"
          placeholder="Dán văn bản vào đây để đếm từ, ký tự, câu..."
        />
      </div>
    </div>
  );
}
