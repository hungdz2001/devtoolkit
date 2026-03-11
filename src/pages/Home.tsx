import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbArrowRight } from 'react-icons/tb';
import { categories, getToolsByCategory, tools } from '../registry';
import { useStore } from '../store';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addRecent, favorites, recentTools } = useStore();

  const handleToolClick = (toolId: string) => {
    addRecent(toolId);
    navigate(`/tool/${toolId}`);
  };

  // Show favorite tools first, then recent
  const favTools = tools.filter((tool) => favorites.includes(tool.id));
  const recentToolsList = recentTools
    .map((id) => tools.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="gradient-text">{t('home.hero')}</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
          {t('home.heroSub')}
        </p>
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="glass rounded-xl px-5 py-3 flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">{tools.length}</span>
            <span className="text-sm text-[var(--text-secondary)]">{t('home.stats.tools')}</span>
          </div>
          <div className="glass rounded-xl px-5 py-3 flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">{categories.length}</span>
            <span className="text-sm text-[var(--text-secondary)]">{t('home.stats.categories')}</span>
          </div>
          <div className="glass rounded-xl px-5 py-3 flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">100%</span>
            <span className="text-sm text-[var(--text-secondary)]">{t('home.stats.free')}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Favorites */}
      {favTools.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ⭐ {t('app.favorites')}
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {favTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
            ))}
          </motion.div>
        </section>
      )}

      {/* Recent */}
      {recentToolsList.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">{t('app.recent')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentToolsList.map(
              (tool) =>
                tool && (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onClick={() => handleToolClick(tool.id)}
                  />
                )
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.map((cat) => {
        const catTools = getToolsByCategory(cat.id);
        return (
          <section key={cat.id}>
            <div className="category-header">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/15">
                  <cat.icon size={22} className="text-accent" />
                </div>
                <h2 className="text-xl font-bold">{t(`categories.${cat.id}`)}</h2>
              </div>
              <span className="text-xs font-medium text-[var(--text-secondary)] bg-accent/10 px-2.5 py-1 rounded-full">
                {catTools.length} {t('home.toolCount')}
              </span>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {catTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onClick={() => handleToolClick(tool.id)}
                />
              ))}
            </motion.div>
          </section>
        );
      })}
    </div>
  );
}

function ToolCard({
  tool,
  onClick,
}: {
  tool: { id: string; icon: React.ComponentType<{ size?: number; className?: string }>; isNew?: boolean };
  onClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <motion.div variants={item}>
      <button
        onClick={onClick}
        className="w-full glass-card text-left group cursor-pointer relative overflow-visible"
      >
        {tool.isNew && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-accent to-accent-cyan text-white rounded-full shadow-lg shadow-accent/25 animate-pulse z-10">
            {t('common.new')}
          </span>
        )}
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-accent/15 mb-3">
            <tool.icon size={22} className="text-accent" />
          </div>
          <TbArrowRight
            size={18}
            className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
          />
        </div>
        <h3 className="font-semibold text-sm mb-1">{t(`tools.${tool.id}.name`)}</h3>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
          {t(`tools.${tool.id}.desc`)}
        </p>
      </button>
    </motion.div>
  );
}
