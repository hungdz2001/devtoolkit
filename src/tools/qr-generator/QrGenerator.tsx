import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';

type QrType = 'text' | 'url' | 'wifi';

export default function QrGenerator() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [type, setType] = useState<QrType>('text');
  const [text, setText] = useState('https://tranchanhung.dev');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  // WiFi fields
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  const getData = () => {
    if (type === 'wifi') {
      return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
    }
    return text;
  };

  useEffect(() => {
    const data = getData();
    if (!data.trim() || !canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, data, {
      width: 300,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: 'M',
    }).catch(() => { });
  }, [text, type, ssid, password, encryption, fgColor, bgColor]);

  const download = (format: 'png' | 'svg') => {
    const data = getData();
    if (!data.trim()) return;

    if (format === 'png') {
      QRCode.toDataURL(data, {
        width: 600,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
      }).then((url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.png';
        a.click();
      });
    } else {
      QRCode.toString(data, {
        type: 'svg',
        margin: 2,
        color: { dark: fgColor, light: bgColor },
      }).then((svg) => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.svg';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex rounded-xl overflow-hidden glass">
            {(['text', 'url', 'wifi'] as QrType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors capitalize ${type === t ? 'bg-accent text-white' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>

          {type === 'wifi' ? (
            <div className="glass-card space-y-3">
              <input value={ssid} onChange={(e) => setSsid(e.target.value)} className="input-glass" placeholder="WiFi Name (SSID)" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="input-glass" placeholder="Password" type="password" />
              <select value={encryption} onChange={(e) => setEncryption(e.target.value as any)} className="input-glass" title="Encryption type">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="textarea-glass w-full"
              placeholder={type === 'url' ? 'https://example.com' : 'Enter text...'}
            />
          )}

          <div className="glass-card grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-secondary)]">Foreground</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" title="Foreground color" />
                <span className="font-mono text-xs">{fgColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)]">Background</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" title="Background color" />
                <span className="font-mono text-xs">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="glass-card flex flex-col items-center gap-4">
          <canvas ref={canvasRef} className="rounded-xl" />
          <div className="flex gap-2">
            <button onClick={() => download('png')} className="btn-primary text-sm">
              {t('common.download')} PNG
            </button>
            <button onClick={() => download('svg')} className="btn-secondary text-sm">
              {t('common.download')} SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
