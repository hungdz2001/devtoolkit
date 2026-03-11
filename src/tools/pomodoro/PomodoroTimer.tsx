import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type Phase = 'focus' | 'break' | 'longBreak';

const DEFAULTS = { focus: 25, break: 5, longBreak: 15, sessionsBeforeLong: 4 };

export default function PomodoroTimer() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULTS);
  const [phase, setPhase] = useState<Phase>('focus');
  const [timeLeft, setTimeLeft] = useState(DEFAULTS.focus * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const totalTime = settings[phase] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const notify = useCallback((title: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { icon: '/favicon.ico' });
    }
  }, []);

  const nextPhase = useCallback(() => {
    if (phase === 'focus') {
      const next = (sessions + 1) % settings.sessionsBeforeLong === 0 ? 'longBreak' : 'break';
      setSessions((s) => s + 1);
      setPhase(next);
      setTimeLeft(settings[next] * 60);
      notify(next === 'longBreak' ? '🎉 Long break time!' : '☕ Break time!');
    } else {
      setPhase('focus');
      setTimeLeft(settings.focus * 60);
      notify('💪 Focus time!');
    }
  }, [phase, sessions, settings, notify]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            nextPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, nextPhase]);

  const reset = () => {
    setRunning(false);
    setTimeLeft(settings[phase] * 60);
  };

  const switchPhase = (p: Phase) => {
    setRunning(false);
    setPhase(p);
    setTimeLeft(settings[p] * 60);
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const phaseColors: Record<Phase, string> = {
    focus: 'from-accent to-cyan-400',
    break: 'from-green-400 to-emerald-500',
    longBreak: 'from-pink-400 to-purple-500',
  };

  return (
    <div className="space-y-6">
      {/* Phase selector */}
      <div className="glass-card">
        <div className="flex gap-2 justify-center">
          {(['focus', 'break', 'longBreak'] as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => switchPhase(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${phase === p ? 'bg-accent/20 text-accent' : 'text-[var(--text-secondary)] hover:bg-white/5'
                }`}
            >
              {p === 'focus' ? 'Focus' : p === 'break' ? 'Break' : 'Long Break'}
            </button>
          ))}
        </div>
      </div>

      {/* Timer circle */}
      <div className="glass-card flex flex-col items-center py-10">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none" stroke="currentColor"
              className="text-white/5" strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none" strokeWidth="4" strokeLinecap="round"
              className={`bg-gradient-to-r ${phaseColors[phase]}`}
              stroke="url(#grad)"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold tracking-wider">{formatTime(timeLeft)}</span>
            <span className="text-sm text-[var(--text-secondary)] mt-1 capitalize">{phase === 'longBreak' ? 'Long Break' : phase}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-8">
          <button onClick={() => setRunning(!running)} className="btn-primary px-8 py-3 text-lg">
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <button onClick={reset} className="btn-secondary px-6 py-3">
            ↺ Reset
          </button>
          <button onClick={nextPhase} className="btn-secondary px-6 py-3">
            ⏭ Skip
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card">
        <div className="flex gap-6 justify-center text-center">
          <div>
            <div className="text-2xl font-bold text-accent">{sessions}</div>
            <div className="text-xs text-[var(--text-secondary)]">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">{sessions * settings.focus}</div>
            <div className="text-xs text-[var(--text-secondary)]">Focus (min)</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="glass-card space-y-3">
        <h3 className="text-sm font-semibold">Settings (minutes)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'focus', label: 'Focus' },
            { key: 'break', label: 'Break' },
            { key: 'longBreak', label: 'Long Break' },
            { key: 'sessionsBeforeLong', label: 'Sessions' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-[var(--text-secondary)]">{label}</label>
              <input
                type="number"
                min={1}
                max={120}
                value={settings[key as keyof typeof settings]}
                onChange={(e) => {
                  const v = Math.max(1, Number(e.target.value));
                  setSettings((s) => ({ ...s, [key]: v }));
                }}
                className="input-glass w-full mt-1"
                title={label}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
