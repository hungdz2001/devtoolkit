import { useState, useRef, useCallback } from 'react';
import CopyButton from '../../components/CopyButton';

export default function QrScanner() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const decode = useCallback((file: File) => {
    setError('');
    setResult('');

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (PNG, JPG, ...)');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      // Use BarcodeDetector API (supported in Chrome, Edge, Opera)
      if ('BarcodeDetector' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        detector
          .detect(canvas)
          .then((barcodes: Array<{ rawValue: string }>) => {
            if (barcodes.length > 0) {
              setResult(barcodes[0].rawValue);
            } else {
              setError('Không tìm thấy mã QR trong ảnh. Thử ảnh rõ hơn hoặc crop vùng QR.');
            }
          })
          .catch(() => {
            setError('Không thể quét mã QR. Trình duyệt không hỗ trợ hoặc ảnh không đọc được.');
          });
      } else {
        setError(
          'Trình duyệt của bạn chưa hỗ trợ quét QR nội bộ. Vui lòng dùng Chrome/Edge phiên bản mới nhất.'
        );
      }

      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError('Không thể đọc file ảnh');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decode(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) decode(file);
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) decode(file);
          break;
        }
      }
    },
    [decode]
  );

  const isUrl = result.startsWith('http://') || result.startsWith('https://');

  return (
    <div className="space-y-6" onPaste={handlePaste}>
      {/* Drop zone */}
      <div
        className={`glass-card border-2 border-dashed transition-colors cursor-pointer text-center py-12 ${dragging ? 'border-accent bg-accent/5' : 'border-white/10'
          }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-3">📷</div>
        <p className="text-sm font-medium">Kéo thả ảnh chứa mã QR vào đây</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          hoặc nhấn để chọn file • Ctrl+V để dán từ clipboard
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          title="Chọn ảnh QR"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Preview */}
      {preview && (
        <div className="glass-card">
          <label className="text-sm font-semibold block mb-2">Ảnh đã chọn</label>
          <img
            src={preview}
            alt="QR preview"
            className="max-h-48 rounded-lg mx-auto"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card bg-red-500/10 border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-card space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Kết quả giải mã</label>
            <CopyButton text={result} />
          </div>
          <div className="bg-black/10 rounded-xl p-4 text-sm font-mono break-all">
            {isUrl ? (
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline hover:no-underline"
              >
                {result}
              </a>
            ) : (
              result
            )}
          </div>
          {isUrl && (
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block text-sm text-center"
            >
              Mở link →
            </a>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-2">Mẹo</h3>
        <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
          <li>Hỗ trợ PNG, JPG, WebP, GIF</li>
          <li>Ảnh càng rõ nét, QR càng dễ quét</li>
          <li>Có thể chụp màn hình rồi Ctrl+V dán trực tiếp</li>
          <li>Yêu cầu Chrome/Edge phiên bản 83+ để quét chính xác</li>
        </ul>
      </div>
    </div>
  );
}
