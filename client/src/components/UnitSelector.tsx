import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const UNITS = [
  { value: '片', category: 'solid' },
  { value: '颗', category: 'solid' },
  { value: '袋', category: 'solid' },
  { value: 'ml', category: 'liquid' },
];

interface UnitSelectorProps {
  value: string;
  onChange: (unit: string) => void;
}

export function UnitSelector({ value, onChange }: UnitSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollTo = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 100;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current && value) {
      const index = UNITS.findIndex((u) => u.value === value);
      if (index >= 0) {
        const buttonWidth = 48;
        const gap = 8;
        scrollRef.current.scrollTo({
          left: Math.max(0, index * (buttonWidth + gap) - 50),
          behavior: 'smooth',
        });
      }
    }
  }, []);

  return (
    <div className="relative">
      {showLeftArrow && (
        <button
          onClick={() => scrollTo('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background/90 flex items-center justify-center shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {UNITS.map((unit) => (
          <motion.button
            key={unit.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(unit.value)}
            className={`
              flex-shrink-0 min-w-[44px] h-10 px-3 rounded-lg text-sm font-medium
              transition-all scroll-snap-align-center
              ${value === unit.value
                ? 'bg-neon-orange text-background'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }
            `}
            data-testid={`button-unit-${unit.value}`}
          >
            {unit.value}
          </motion.button>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scrollTo('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background/90 flex items-center justify-center shadow-md"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
