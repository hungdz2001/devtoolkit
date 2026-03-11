import { useTranslation } from 'react-i18next';
import { TbCopy, TbCheck } from 'react-icons/tb';
import { useClipboard } from '../hooks/useClipboard';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const { t } = useTranslation();
  const { copied, copy } = useClipboard();

  return (
    <button
      onClick={() => copy(text)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${copied
          ? 'bg-green-500/20 text-green-400'
          : 'glass hover:bg-white/10'
        } ${className}`}
      title={copied ? t('common.copied') : t('common.copy')}
    >
      {copied ? <TbCheck size={16} /> : <TbCopy size={16} />}
      <span>{copied ? t('common.copied') : t('common.copy')}</span>
    </button>
  );
}
