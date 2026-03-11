import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

interface ToolLayoutProps {
  toolId: string;
  icon: IconType;
  children: ReactNode;
}

export default function ToolLayout({ toolId, icon: Icon, children }: ToolLayoutProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-accent/20">
          <Icon size={28} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(`tools.${toolId}.name`)}</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {t(`tools.${toolId}.desc`)}
          </p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}
