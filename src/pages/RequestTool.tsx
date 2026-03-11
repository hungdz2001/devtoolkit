import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export default function RequestTool() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setStatus('sending');

    const message = `🔧 *Tool Request*\n\n*Tool:* ${name}\n*Description:* ${description}\n*Email:* ${email || 'N/A'}\n*Time:* ${new Date().toISOString()}`;

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to send');
      setStatus('success');
      setName('');
      setDescription('');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="glass-card space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text">🔧 Request a Tool</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Have an idea for a useful tool? Let me know!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Tool Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-glass w-full"
              placeholder="e.g. Color Palette Generator"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-glass w-full h-32"
              placeholder="Describe what the tool should do..."
              required
              maxLength={1000}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass w-full"
              placeholder="your@email.com"
              maxLength={100}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending' || !name.trim() || !description.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? 'Sending...' : 'Submit Request'}
          </button>
        </form>

        {status === 'success' && (
          <div className="text-center p-4 rounded-xl bg-green-500/10 text-green-400 text-sm">
            ✓ Request sent successfully! Thank you for your suggestion.
          </div>
        )}
        {status === 'error' && (
          <div className="text-center p-4 rounded-xl bg-red-500/10 text-red-400 text-sm">
            ✗ Failed to send. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
}
