import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TbStar, TbStarFilled, TbHome } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { categories, getToolsByCategory } from '../registry';

export default function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toolId } = useParams();
  const { sidebarOpen, favorites, toggleFavorite } = useStore();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => useStore.getState().setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-[280px] z-40 glass-sidebar overflow-y-auto scrollbar-thin transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-4 space-y-1">
          {/* Home */}
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${!toolId
                ? 'bg-accent/20 text-accent'
                : 'hover:bg-white/10'
              }`}
          >
            <TbHome size={18} />
            {t('app.home')}
          </button>

          {/* Categories */}
          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.id);
            return (
              <div key={cat.id} className="mt-4">
                <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-accent/70">
                  <cat.icon size={14} />
                  {t(`categories.${cat.id}`)}
                  <span className="flex-1 h-px bg-gradient-to-r from-accent/30 to-transparent ml-1" />
                </div>
                <div className="space-y-0.5">
                  {catTools.map((tool) => {
                    const isActive = toolId === tool.id;
                    const isFav = favorites.includes(tool.id);
                    return (
                      <div key={tool.id} className="flex items-center group">
                        <button
                          onClick={() => {
                            navigate(`/tool/${tool.id}`);
                            if (window.innerWidth < 768) {
                              useStore.getState().setSidebarOpen(false);
                            }
                          }}
                          className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors truncate ${isActive
                              ? 'bg-accent/20 text-accent font-medium'
                              : 'hover:bg-white/10'
                            }`}
                        >
                          <tool.icon size={16} className="shrink-0" />
                          <span className="truncate">
                            {t(`tools.${tool.id}.name`)}
                          </span>
                          {tool.isNew && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 animate-pulse" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleFavorite(tool.id)}
                          className={`p-1 rounded-lg transition-all ${isFav
                              ? 'text-yellow-400'
                              : 'text-transparent group-hover:text-[var(--text-secondary)] hover:text-yellow-400'
                            }`}
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isFav ? <TbStarFilled size={14} /> : <TbStar size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 mt-4 border-t border-white/10 space-y-3">
          <button
            onClick={() => {
              navigate('/request');
              if (window.innerWidth < 768) useStore.getState().setSidebarOpen(false);
            }}
            className="w-full px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-white/10 transition-colors text-left"
          >
            🔧 Request a Tool
          </button>
          <div className="text-center text-xs text-[var(--text-secondary)]">
            {t('app.madeBy')}
          </div>
        </div>
      </aside>
    </>
  );
}
