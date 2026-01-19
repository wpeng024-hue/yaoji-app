import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

const ITEM_HEIGHT = 40;

export function NumberPicker({ value, onChange, min = 1, max = 10, label }: NumberPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    if (scrollRef.current && !isScrolling) {
      const index = value - min;
      scrollRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  }, [value, min, isScrolling]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollTop = scrollRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const newValue = Math.min(Math.max(min + index, min), max);
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };

  const handleScrollEnd = () => {
    setIsScrolling(false);
    if (scrollRef.current) {
      const scrollTop = scrollRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      scrollRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-2">{label}</span>
      <div className="relative w-16 h-[120px] overflow-hidden rounded-xl bg-muted/30">
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 border-y border-neon-orange/30 bg-neon-orange/10 z-0 pointer-events-none" />
        
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
          onScroll={handleScroll}
          onTouchStart={() => setIsScrolling(true)}
          onTouchEnd={handleScrollEnd}
          onMouseDown={() => setIsScrolling(true)}
          onMouseUp={handleScrollEnd}
          onMouseLeave={handleScrollEnd}
          style={{ scrollSnapType: 'y mandatory' }}
        >
          <div style={{ height: ITEM_HEIGHT }} />
          {numbers.map((num) => (
            <motion.div
              key={num}
              className={`
                h-10 flex items-center justify-center font-display text-xl
                snap-center cursor-pointer
                ${num === value ? 'text-neon-orange font-bold' : 'text-muted-foreground'}
              `}
              style={{ scrollSnapAlign: 'center' }}
              onClick={() => onChange(num)}
              animate={{
                scale: num === value ? 1.1 : 1,
                opacity: num === value ? 1 : 0.5,
              }}
              transition={{ duration: 0.15 }}
            >
              {num}
            </motion.div>
          ))}
          <div style={{ height: ITEM_HEIGHT }} />
        </div>
      </div>
    </div>
  );
}
