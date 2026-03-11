import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import FileDropZone from '../../components/FileDropZone';
import { useFileUpload } from '../../hooks/useFileUpload';

interface CompressedResult {
  original: File;
  compressed: Blob;
  originalSize: number;
  compressedSize: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ImageCompressor() {
  const { t } = useTranslation();
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [results, setResults] = useState<CompressedResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const { isDragging, handleDrop, handleDragOver, handleDragLeave, handleSelect } = useFileUpload('image/*');

  const compress = useCallback(
    async (files: FileList | File[]) => {
      setProcessing(true);
      const newResults: CompressedResult[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        try {
          const compressed = await imageCompression(file, {
            maxSizeMB: 10,
            maxWidthOrHeight: maxWidth,
            initialQuality: quality / 100,
            useWebWorker: true,
          });
          newResults.push({
            original: file,
            compressed,
            originalSize: file.size,
            compressedSize: compressed.size,
          });
        } catch (err) {
          console.error('Compression failed for', file.name, err);
        }
      }

      setResults((prev) => [...prev, ...newResults]);
      setProcessing(false);
    },
    [quality, maxWidth]
  );

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleDrop(e);
    compress(e.dataTransfer.files);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = () => {
      if (input.files?.length) compress(input.files);
    };
    input.click();
  };

  const downloadResult = (result: CompressedResult) => {
    const url = URL.createObjectURL(result.compressed);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${result.original.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="glass-card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Quality: {quality}%</label>
          <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-accent" title="Quality" />
        </div>
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Max Width: {maxWidth}px</label>
          <input type="range" min={320} max={4096} step={64} value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full accent-accent" title="Max width" />
        </div>
      </div>

      {/* Drop zone */}
      <FileDropZone
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleFileSelect}
        isDragging={isDragging}
      />

      {processing && (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Compressing...</span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Results ({results.length})</h3>
            <button onClick={() => setResults([])} className="btn-secondary text-sm">
              {t('common.clear')}
            </button>
          </div>
          {results.map((r, i) => {
            const saved = ((1 - r.compressedSize / r.originalSize) * 100).toFixed(1);
            return (
              <div key={i} className="glass-card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.original.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {formatSize(r.originalSize)} → {formatSize(r.compressedSize)}
                    <span className="text-green-400 ml-2">(-{saved}%)</span>
                  </p>
                </div>
                <button onClick={() => downloadResult(r)} className="btn-primary text-sm">
                  {t('common.download')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
