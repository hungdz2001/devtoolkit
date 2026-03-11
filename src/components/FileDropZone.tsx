import { DragEvent, ReactNode } from 'react';
import { TbUpload } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';

interface FileDropZoneProps {
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onClick: () => void;
  isDragging: boolean;
  children?: ReactNode;
  className?: string;
}

export default function FileDropZone({
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  isDragging,
  children,
  className = '',
}: FileDropZoneProps) {
  const { t } = useTranslation();

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${isDragging
          ? 'border-accent bg-accent/10 scale-[1.02]'
          : 'border-white/20 hover:border-accent/50 hover:bg-white/5'
        } ${className}`}
      role="button"
      tabIndex={0}
    >
      <TbUpload
        size={32}
        className={`transition-colors ${isDragging ? 'text-accent' : 'text-white/40'}`}
      />
      <p className="text-sm text-center text-[var(--text-secondary)]">
        {children || t('common.dragDrop')}
      </p>
    </div>
  );
}
