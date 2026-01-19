import { motion } from 'framer-motion';
import { Home, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';

export function BottomNav() {
  const [location, setLocation] = useLocation();

  const tabs = [
    { path: '/', icon: Home, label: '主页' },
    { path: '/stats', icon: BarChart3, label: '统计' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/98 to-transparent pointer-events-none" style={{ height: '140%', top: '-40%' }} />
      <div className="relative mx-4 mb-4 safe-bottom">
        <div className="glass-elevated rounded-2xl p-1.5 flex items-center justify-around border border-white/5">
          {tabs.map((tab) => {
            const isActive = location === tab.path;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.path}
                onClick={() => setLocation(tab.path)}
                className="relative flex-1 py-3 flex flex-col items-center gap-1.5 rounded-xl"
                whileTap={{ scale: 0.95 }}
                data-testid={`nav-${tab.label}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-gradient-to-br from-neon-orange/15 to-neon-orange/5 rounded-xl border border-neon-orange/20"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-all duration-200 ${
                    isActive ? 'text-neon-orange drop-shadow-[0_0_8px_rgba(255,140,50,0.5)]' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-xs font-medium relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-neon-orange' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
