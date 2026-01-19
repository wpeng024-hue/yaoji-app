import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Trophy } from 'lucide-react';

interface CelebrationEffectProps {
  show: boolean;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 24;
const CONFETTI_COLORS = [
  'bg-neon-cyan',
  'bg-neon-magenta', 
  'bg-neon-green',
  'bg-neon-orange',
  'bg-neon-purple',
  'bg-neon-yellow',
];

export function CelebrationEffect({ show, onComplete }: CelebrationEffectProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1.1, 1.2] }}
            transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-green/30 to-neon-cyan/30 flex items-center justify-center backdrop-blur-xl border border-white/20"
              >
                <Trophy className="w-16 h-16 text-neon-green" />
              </motion.div>

              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 6) * 80,
                    y: Math.sin((i * Math.PI * 2) / 6) * 80,
                  }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  {i % 2 === 0 ? (
                    <Star className="w-6 h-6 text-neon-yellow fill-neon-yellow" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-neon-cyan" />
                  )}
                </motion.div>
              ))}

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 3], opacity: [0, 0.5, 0] }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute inset-0 rounded-full border-4 border-neon-green"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2.5, 4], opacity: [0, 0.3, 0] }}
                transition={{ delay: 0.4, duration: 0.9 }}
                className="absolute inset-0 rounded-full border-2 border-neon-cyan"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: [0, 1, 1, 0], y: [50, 0, 0, -20] }}
            transition={{ duration: 2, times: [0, 0.15, 0.75, 1] }}
            className="absolute inset-x-0 top-1/2 mt-24 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-gradient-green mb-2">
              太棒了!
            </h2>
            <p className="text-neon-cyan text-lg">今日目标全部完成</p>
          </motion.div>

          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                left: '50%',
                top: '40%',
                scale: 0,
                opacity: 1,
              }}
              animate={{ 
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                scale: [0, 1, 1, 0.5],
                opacity: [1, 1, 1, 0],
                rotate: [0, 180, 360, 540],
              }}
              transition={{ 
                duration: 2,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              style={{ 
                width: particle.size,
                height: particle.size,
              }}
              className={`absolute ${particle.color} rounded-full`}
            />
          ))}

          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`streak-${i}`}
              initial={{ 
                left: '50%',
                top: '40%',
                scaleY: 0,
                opacity: 0,
              }}
              animate={{ 
                left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 45}%`,
                top: `${40 + Math.sin((i * Math.PI * 2) / 8) * 35}%`,
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 0.6,
                delay: 0.1 + i * 0.03,
              }}
              style={{
                rotate: (i * 360) / 8 + 90,
              }}
              className="absolute w-1 h-16 bg-gradient-to-t from-neon-green via-neon-cyan to-transparent rounded-full origin-bottom"
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
