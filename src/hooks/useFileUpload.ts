import { useCallback, useState, DragEvent } from 'react';

export function useFileUpload(accept?: string) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) input.accept = accept;
    input.onchange = () => {
      if (input.files?.[0]) setFile(input.files[0]);
    };
    input.click();
  }, [accept]);

  const reset = useCallback(() => setFile(null), []);

  return {
    file,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleSelect,
    reset,
  };
}
