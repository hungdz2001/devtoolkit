import { useState, useRef, useCallback, useEffect } from 'react';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e',
  '#a855f7', '#6366f1',
];

export default function RandomPicker() {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Parse input
  const parseItems = () => {
    const parsed = input
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsed.length < 2) return;
    setItems(parsed);
    setWinner(null);
  };

  // Draw wheel
  const drawWheel = useCallback(
    (rot: number) => {
      const canvas = canvasRef.current;
      if (!canvas || items.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 8;
      const sliceAngle = (2 * Math.PI) / items.length;

      ctx.clearRect(0, 0, size, size);

      items.forEach((item, i) => {
        const start = rot + i * sliceAngle;
        const end = start + sliceAngle;

        // Slice
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.closePath();
        ctx.fillStyle = PRESET_COLORS[i % PRESET_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.min(14, 160 / items.length)}px Inter, sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        const label = item.length > 12 ? item.slice(0, 11) + '…' : item;
        ctx.fillText(label, r - 16, 5);
        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pointer (top)
      ctx.beginPath();
      ctx.moveTo(cx - 12, 4);
      ctx.lineTo(cx + 12, 4);
      ctx.lineTo(cx, 28);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [items]
  );

  useEffect(() => {
    drawWheel(rotation);
  }, [items, rotation, drawWheel]);

  const spin = () => {
    if (items.length < 2 || spinning) return;
    setSpinning(true);
    setWinner(null);

    const totalSpin = 360 * 5 + Math.random() * 360; // 5+ full rotations
    const duration = 4000;
    const startRot = rotation;
    const endRot = startRot + (totalSpin * Math.PI) / 180;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const currentRot = startRot + (endRot - startRot) * ease;

      setRotation(currentRot);
      drawWheel(currentRot);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        // Pointer is at the top of the canvas = -π/2 in canvas coords
        // Slice i spans [currentRot + i*sliceAngle, currentRot + (i+1)*sliceAngle)
        const sliceAngle = (2 * Math.PI) / items.length;
        const pointerAngle = -Math.PI / 2;
        const diff =
          ((pointerAngle - currentRot) % (2 * Math.PI) + 2 * Math.PI) %
          (2 * Math.PI);
        const winnerIdx = Math.floor(diff / sliceAngle) % items.length;
        setWinner(items[winnerIdx]);
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
  };

  const removeWinner = () => {
    if (!winner) return;
    const newItems = items.filter((_, i) => i !== items.indexOf(winner));
    setItems(newItems);
    setWinner(null);
    if (newItems.length < 2) {
      setInput(newItems.join('\n'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="glass-card">
        <label className="text-sm font-semibold block mb-2">
          Danh sách (mỗi dòng hoặc phân cách bằng dấu phẩy)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea-glass w-full"
          rows={4}
          placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C&#10;..."
        />
        <div className="flex gap-2 mt-3">
          <button onClick={parseItems} className="btn-primary px-6">
            Tạo vòng quay ({input.split(/[\n,]/).filter((s) => s.trim()).length} mục)
          </button>
        </div>
      </div>

      {/* Wheel */}
      {items.length >= 2 && (
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={360}
            height={360}
            className="rounded-full"
            style={{ maxWidth: '100%' }}
          />
          <button
            onClick={spin}
            disabled={spinning}
            className="btn-primary px-10 py-3 text-lg disabled:opacity-50"
          >
            {spinning ? '🎰 Đang quay...' : '🎯 QUAY!'}
          </button>
        </div>
      )}

      {/* Result */}
      {winner && !spinning && (
        <div className="glass-card text-center space-y-3">
          <div className="text-3xl">🎉</div>
          <div className="text-2xl font-bold text-accent">{winner}</div>
          <p className="text-sm text-[var(--text-secondary)]">đã được chọn!</p>
          <div className="flex gap-2 justify-center">
            <button onClick={spin} className="btn-secondary text-sm">
              Quay lại
            </button>
            <button onClick={removeWinner} className="btn-secondary text-sm text-red-400">
              Loại & quay tiếp
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-2">Gợi ý sử dụng</h3>
        <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
          <li>Bốc thăm team building, chia nhóm, chọn người trình bày</li>
          <li>Chọn quán ăn trưa, hoạt động cuối tuần</li>
          <li>"Loại & quay tiếp" để chọn nhiều người theo thứ tự</li>
        </ul>
      </div>
    </div>
  );
}
