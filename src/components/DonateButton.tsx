import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const PAYMENT_METHODS = [
  {
    id: 'vietinbank',
    name: 'Vietinbank',
    color: 'from-blue-600 to-blue-800',
    info: 'Trần Chấn Hưng\n108870420516',
    qrUrl: 'https://img.vietqr.io/image/ICB-108870420516-compact.png?amount=0&addInfo=donate%20devtoolkit',
  },
  {
    id: 'momo',
    name: 'MoMo',
    color: 'from-pink-500 to-pink-700',
    info: 'Trần Chấn Hưng',
    qrUrl: 'https://momosv3.apimienphi.com/api/QRCode?phone=0336784804&amount=0&note=donate%20devtoolkit',
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    color: 'from-blue-400 to-blue-600',
    info: 'Trần Chấn Hưng',
    qrUrl: '',
  },
];

export default function DonateButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(PAYMENT_METHODS[0].id);

  const method = PAYMENT_METHODS.find((m) => m.id === selected)!;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-accent text-white font-semibold shadow-lg hover:scale-105 transition-transform text-sm"
      >
        ☕ Donate
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h2 className="text-xl font-bold gradient-text">Support Me ☕</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {t('app.title')} is free. Your support keeps it alive!
                </p>
              </div>

              {/* Method tabs */}
              <div className="flex gap-2 justify-center">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selected === m.id ? 'bg-accent/20 text-accent' : 'bg-white/5 text-[var(--text-secondary)]'
                      }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {/* QR */}
              <div className="flex flex-col items-center">
                {method.qrUrl ? (
                  <div className="bg-white rounded-2xl p-3">
                    <img
                      src={method.qrUrl}
                      alt={`${method.name} QR`}
                      className="w-48 h-48 object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-secondary)] text-sm">
                    QR Coming Soon
                  </div>
                )}
                <p className="text-xs text-[var(--text-secondary)] mt-3 text-center whitespace-pre-line">
                  {method.info}
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
