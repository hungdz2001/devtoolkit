import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TbSearch, TbSun, TbMoon, TbLanguage, TbMenu2 } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { useStore } from '../store';
import { tools } from '../registry';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, setSidebarOpen, sidebarOpen } =
    useStore();
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(
        tools.map((tool) => ({
          ...tool,
          name: t(`tools.${tool.id}.name`),
          desc: t(`tools.${tool.id}.desc`),
        })),
        { keys: ['name', 'desc', 'id'], threshold: 0.3 }
      ),
    [t]
  );

  const results = query.trim() ? fuse.search(query).slice(0, 6) : [];

  const handleSelect = (toolId: string) => {
    setQuery('');
    setShowSearch(false);
    navigate(`/tool/${toolId}`);
  };

  const toggleLang = () => {
    const newLang = language === 'vi' ? 'en' : 'vi';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-navbar flex items-center px-4 gap-3">
      {/* Menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        aria-label="Toggle sidebar"
      >
        <TbMenu2 size={22} />
      </button>

      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="font-bold text-lg gradient-text hidden sm:block"
      >
        DevToolkit
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md mx-auto">
        <div className="relative">
          <TbSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            placeholder={t('app.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm glass focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <AnimatePresence>
          {showSearch && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden shadow-glass-lg z-50"
            >
              {results.map(({ item }) => (
                <button
                  key={item.id}
                  onMouseDown={() => handleSelect(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  <item.icon size={20} className="text-accent shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{t(`tools.${item.id}.name`)}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {t(`tools.${item.id}.desc`)}
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLang}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1 text-sm"
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          <TbLanguage size={20} />
          <span className="hidden sm:inline uppercase font-medium">{language}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <TbSun size={20} /> : <TbMoon size={20} />}
        </button>
      </div>
    </nav>
  );
}
