import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../../components/CopyButton';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function generatePassword(length: number, options: Record<string, boolean>): string {
  let charset = '';
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.numbers) charset += CHARSETS.numbers;
  if (options.symbols) charset += CHARSETS.symbols;
  if (!charset) charset = CHARSETS.lowercase;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (x) => charset[x % charset.length]).join('');
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'text-red-400' };
  if (score <= 4) return { score, label: 'Medium', color: 'text-yellow-400' };
  return { score, label: 'Strong', color: 'text-green-400' };
}

export default function PasswordGenerator() {
  const { t } = useTranslation();
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState(() => generatePassword(16, { uppercase: true, lowercase: true, numbers: true, symbols: true }));
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    const pw = generatePassword(length, options);
    setPassword(pw);
    setHistory((prev) => [pw, ...prev].slice(0, 10));
  }, [length, options]);

  const strength = getStrength(password);

  const toggleOption = (key: string) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div className="space-y-6">
      {/* Generated password */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-xl p-3 bg-black/20 rounded-xl break-all select-all">
            {password}
          </code>
          <CopyButton text={password} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${strength.score <= 2 ? 'bg-red-400' : strength.score <= 4 ? 'bg-yellow-400' : 'bg-green-400'
                }`}
              style={{ width: `${(strength.score / 6) * 100}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${strength.color}`}>{strength.label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card space-y-4">
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Length: {length}</label>
          <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-accent" title="Password length" />
        </div>

        <div className="flex flex-wrap gap-3">
          {Object.entries(options).map(([key, val]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={val} onChange={() => toggleOption(key)} className="accent-accent w-4 h-4" />
              <span className="text-sm capitalize">{key}</span>
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                {CHARSETS[key as keyof typeof CHARSETS]?.slice(0, 8)}...
              </span>
            </label>
          ))}
        </div>

        <button onClick={generate} className="btn-primary w-full">
          {t('common.generate')} Password
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass-card">
          <h3 className="text-sm font-semibold mb-3">History</h3>
          <div className="space-y-2 max-h-48 overflow-auto">
            {history.map((pw, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <code className="flex-1 font-mono text-xs truncate bg-white/5 px-2 py-1 rounded">
                  {pw}
                </code>
                <CopyButton text={pw} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
