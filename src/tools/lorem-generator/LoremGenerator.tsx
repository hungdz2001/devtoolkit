import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../../components/CopyButton';
import { useStore } from '../../store';

/* ───────── Lorem Ipsum Logic (giữ nguyên) ───────── */

const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');

const VI_WORDS = 'công việc hôm nay thật tuyệt vời chúng ta cùng nhau hoàn thành dự án này một cách tốt nhất có thể với sự nhiệt tình và cống hiến hết mình cho mục tiêu chung của đội ngũ phát triển trong thời gian tới sẽ có nhiều thay đổi tích cực giúp nâng cao hiệu quả làm việc và cải thiện năng suất đáng kể cho toàn bộ nhân viên văn phòng'.split(' ');

function generateWords(count: number, vietnamese: boolean): string {
  const pool = vietnamese ? VI_WORDS : LOREM_WORDS;
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]).join(' ');
}

function generateSentences(count: number, vietnamese: boolean): string {
  return Array.from({ length: count }, () => {
    const words = generateWords(8 + Math.floor(Math.random() * 12), vietnamese);
    return words.charAt(0).toUpperCase() + words.slice(1) + '.';
  }).join(' ');
}

function generateParagraphs(count: number, vietnamese: boolean): string {
  return Array.from({ length: count }, () =>
    generateSentences(3 + Math.floor(Math.random() * 4), vietnamese)
  ).join('\n\n');
}

/* ───────── AI Writer Constants ───────── */

const TEMPLATES = [
  { label: 'Viết email xin nghỉ phép', prompt: 'Viết một email xin nghỉ phép gửi quản lý trực tiếp. Lý do: việc cá nhân. Thời gian nghỉ: 1 ngày.' },
  { label: 'Soạn thư cảm ơn khách hàng', prompt: 'Viết thư cảm ơn khách hàng đã mua sản phẩm/sử dụng dịch vụ của công ty, mong tiếp tục hợp tác.' },
  { label: 'Viết báo cáo công việc tuần', prompt: 'Viết báo cáo công việc tuần bao gồm: công việc đã hoàn thành, đang thực hiện, kế hoạch tuần sau, khó khăn gặp phải.' },
  { label: 'Soạn thông báo nội bộ công ty', prompt: 'Viết thông báo nội bộ gửi toàn thể nhân viên về việc thay đổi lịch làm việc / chính sách mới của công ty.' },
  { label: 'Viết mô tả sản phẩm/dịch vụ', prompt: 'Viết mô tả ngắn gọn, hấp dẫn cho một sản phẩm/dịch vụ để đăng lên website hoặc fanpage.' },
  { label: 'Soạn tin chúc mừng đồng nghiệp', prompt: 'Viết tin nhắn chúc mừng đồng nghiệp nhân dịp sinh nhật / thăng chức / đạt thành tích.' },
  { label: 'Viết nội dung quảng cáo Facebook', prompt: 'Viết bài đăng quảng cáo trên Facebook cho sản phẩm/dịch vụ, có call-to-action, ngắn gọn thu hút.' },
  { label: 'Soạn email giới thiệu sản phẩm', prompt: 'Viết email giới thiệu sản phẩm/dịch vụ mới gửi cho khách hàng tiềm năng, nêu bật lợi ích và ưu đãi.' },
  { label: 'Viết đề xuất dự án', prompt: 'Viết đề xuất dự án ngắn gọn gồm: mục tiêu, phạm vi, lợi ích, timeline dự kiến, nguồn lực cần thiết.' },
  { label: 'Soạn biên bản họp', prompt: 'Viết biên bản cuộc họp gồm: thời gian, thành phần tham dự, nội dung thảo luận, kết luận và phân công công việc.' },
];

const TONES = [
  { id: 'formal', vi: 'Trang trọng', en: 'Formal' },
  { id: 'friendly', vi: 'Thân thiện', en: 'Friendly' },
  { id: 'professional', vi: 'Chuyên nghiệp', en: 'Professional' },
  { id: 'creative', vi: 'Sáng tạo', en: 'Creative' },
  { id: 'concise', vi: 'Ngắn gọn', en: 'Concise' },
];

const LENGTHS = [
  { id: 'short', vi: 'Ngắn (~50 từ)', en: 'Short (~50 words)', tokens: 200 },
  { id: 'medium', vi: 'Vừa (~150 từ)', en: 'Medium (~150 words)', tokens: 500 },
  { id: 'long', vi: 'Dài (~400 từ)', en: 'Long (~400 words)', tokens: 1200 },
];

type Mode = 'paragraphs' | 'sentences' | 'words';
type Tab = 'lorem' | 'ai';

/* ───────── Gemini API Call ───────── */

async function callGemini(apiKey: string, prompt: string, tone: string, maxTokens: number): Promise<string> {
  const systemInstruction = `Bạn là trợ lý viết văn bản tiếng Việt chuyên nghiệp cho nhân viên văn phòng. Phong cách viết: ${tone}. Chỉ trả về nội dung văn bản, không giải thích thêm.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    if (res.status === 400 || res.status === 403)
      throw new Error('API key không hợp lệ hoặc chưa kích hoạt. Kiểm tra lại tại aistudio.google.com/apikey');
    if (res.status === 429)
      throw new Error('Đã vượt giới hạn request. Vui lòng chờ 1 phút rồi thử lại.');
    throw new Error(err?.error?.message || `Lỗi API (${res.status})`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Không nhận được phản hồi từ AI');
  return text;
}

/* ───────── Component ───────── */

export default function LoremGenerator() {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const { geminiKey, setGeminiKey } = useStore();

  // Tab state
  const [tab, setTab] = useState<Tab>('ai');

  // Lorem states
  const [mode, setMode] = useState<Mode>('paragraphs');
  const [count, setCount] = useState(3);
  const [vietnamese, setVietnamese] = useState(false);
  const [loremOutput, setLoremOutput] = useState('');

  // AI states
  const [keyInput, setKeyInput] = useState(geminiKey);
  const [showKeyInput, setShowKeyInput] = useState(!geminiKey);
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [aiOutput, setAiOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lorem generate
  const generateLorem = () => {
    switch (mode) {
      case 'paragraphs': setLoremOutput(generateParagraphs(count, vietnamese)); break;
      case 'sentences': setLoremOutput(generateSentences(count, vietnamese)); break;
      case 'words': setLoremOutput(generateWords(count, vietnamese)); break;
    }
  };

  // Save API key
  const saveKey = () => {
    const k = keyInput.trim();
    if (!k) return;
    setGeminiKey(k);
    setShowKeyInput(false);
  };

  // Apply template
  const applyTemplate = (tmplPrompt: string) => {
    setPrompt(tmplPrompt);
  };

  // Generate with AI
  const generateAI = async () => {
    if (!geminiKey) { setShowKeyInput(true); return; }
    if (!prompt.trim()) { setError('Vui lòng nhập nội dung cần viết'); return; }

    setLoading(true);
    setError('');
    setAiOutput('');

    const toneName = TONES.find((t) => t.id === tone)?.[isVi ? 'vi' : 'en'] || tone;
    const lengthCfg = LENGTHS.find((l) => l.id === length) || LENGTHS[1];

    try {
      const result = await callGemini(geminiKey, prompt, toneName, lengthCfg.tokens);
      setAiOutput(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {([['ai', '✨ AI Writer'], ['lorem', '📝 Lorem Ipsum']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id
                ? 'bg-accent/20 text-accent shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: AI Writer ══════════ */}
      {tab === 'ai' && (
        <>
          {/* API Key Section */}
          {showKeyInput ? (
            <div className="glass-card space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔑</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Gemini API Key</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Lấy API key miễn phí tại{' '}
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-accent underline">
                      aistudio.google.com/apikey
                    </a>
                    {' '}— Miễn phí 15 request/phút, 1 triệu token/ngày.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveKey()}
                  className="input-glass flex-1 font-mono text-sm"
                  placeholder="AIza..."
                />
                <button onClick={saveKey} className="btn-primary px-5">
                  Lưu
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                🔒 API key chỉ lưu trên trình duyệt của bạn, không gửi đi đâu ngoài Google AI.
              </p>
            </div>
          ) : (
            <div className="glass-card flex items-center justify-between py-2 px-4">
              <span className="text-xs text-[var(--text-secondary)]">
                🔑 Gemini API Key: ••••{geminiKey.slice(-4)}
              </span>
              <button
                onClick={() => { setShowKeyInput(true); setKeyInput(geminiKey); }}
                className="text-xs text-accent hover:underline"
              >
                Đổi key
              </button>
            </div>
          )}

          {/* Templates */}
          <div className="glass-card">
            <label className="text-sm font-semibold block mb-3">📋 Mẫu có sẵn</label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  onClick={() => applyTemplate(tmpl.prompt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${prompt === tmpl.prompt
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)]'
                    }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt + Options */}
          <div className="glass-card space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2">Nhập yêu cầu</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="textarea-glass w-full"
                rows={4}
                placeholder="VD: Viết email xin nghỉ phép ngày thứ 6 tuần này vì lý do gia đình..."
              />
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs text-[var(--text-secondary)] block mb-1">Phong cách</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="input-glass"
                  title="Phong cách"
                >
                  {TONES.map((t) => (
                    <option key={t.id} value={t.id}>{isVi ? t.vi : t.en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--text-secondary)] block mb-1">Độ dài</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="input-glass"
                  title="Độ dài"
                >
                  {LENGTHS.map((l) => (
                    <option key={l.id} value={l.id}>{isVi ? l.vi : l.en}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateAI}
                disabled={loading || !prompt.trim()}
                className="btn-primary px-6 disabled:opacity-50"
              >
                {loading ? '⏳ Đang viết...' : '✨ Tạo với AI'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="glass-card bg-red-500/10 border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* AI Output */}
          {aiOutput && (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Kết quả</label>
                <CopyButton text={aiOutput} />
              </div>
              <div className="bg-black/10 rounded-xl p-4 text-sm leading-relaxed max-h-[500px] overflow-auto whitespace-pre-wrap">
                {aiOutput}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════ TAB: Lorem Ipsum ══════════ */}
      {tab === 'lorem' && (
        <>
          <div className="glass-card space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Loại</label>
                <div className="flex gap-1 mt-1">
                  {([['paragraphs', 'Đoạn văn'], ['sentences', 'Câu'], ['words', 'Từ']] as const).map(([m, label]) => (
                    <button
                      key={m}
                      onClick={() => setMode(m as Mode)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${mode === m ? 'bg-accent/20 text-accent' : 'bg-white/5 text-[var(--text-secondary)]'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-secondary)]">Số lượng</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                  className="input-glass w-20 block mt-1"
                  title="Số lượng"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vietnamese}
                  onChange={(e) => setVietnamese(e.target.checked)}
                  className="accent-accent w-4 h-4"
                />
                <span className="text-sm">Tiếng Việt mẫu</span>
              </label>

              <button onClick={generateLorem} className="btn-primary">
                {t('common.generate')}
              </button>
            </div>
          </div>

          {loremOutput && (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Kết quả</label>
                <CopyButton text={loremOutput} />
              </div>
              <div className="bg-black/10 rounded-xl p-4 text-sm leading-relaxed max-h-96 overflow-auto whitespace-pre-wrap">
                {loremOutput}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
