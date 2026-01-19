import { useState, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface ArcSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

export function ArcSelector({ value, onChange, min = 1, max = 10, label }: ArcSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const lastTapRef = useRef<number>(0);

  const range = max - min;
  const arcRadius = 80;
  const arcStartAngle = -150;
  const arcEndAngle = -30;
  const totalArcAngle = arcEndAngle - arcStartAngle;

  const valueToAngle = (val: number) => {
    const normalized = (val - min) / range;
    return arcStartAngle + normalized * totalArcAngle;
  };

  const angleToValue = (angle: number) => {
    let normalizedAngle = angle;
    if (normalizedAngle < arcStartAngle) normalizedAngle = arcStartAngle;
    if (normalizedAngle > arcEndAngle) normalizedAngle = arcEndAngle;
    
    const normalized = (normalizedAngle - arcStartAngle) / totalArcAngle;
    return Math.round(min + normalized * range);
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setIsEditing(true);
      setInputValue(value.toString());
      return;
    }
    lastTapRef.current = now;

    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [value]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height - 10;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const newValue = angleToValue(angle);
    if (newValue !== value) {
      onChange(newValue);
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.15 }
      });
    }
  }, [isDragging, value, onChange, controls]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleInputBlur = () => {
    const num = parseInt(inputValue);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const currentAngle = valueToAngle(value);
  const indicatorX = Math.cos((currentAngle * Math.PI) / 180) * arcRadius;
  const indicatorY = Math.sin((currentAngle * Math.PI) / 180) * arcRadius;

  const arcPath = `M ${Math.cos((arcStartAngle * Math.PI) / 180) * arcRadius} ${Math.sin((arcStartAngle * Math.PI) / 180) * arcRadius} A ${arcRadius} ${arcRadius} 0 0 1 ${Math.cos((arcEndAngle * Math.PI) / 180) * arcRadius} ${Math.sin((arcEndAngle * Math.PI) / 180) * arcRadius}`;

  const tickMarks = Array.from({ length: max - min + 1 }, (_, i) => {
    const val = min + i;
    const angle = valueToAngle(val);
    const innerR = arcRadius - 8;
    const outerR = arcRadius + 8;
    const x1 = Math.cos((angle * Math.PI) / 180) * innerR;
    const y1 = Math.sin((angle * Math.PI) / 180) * innerR;
    const x2 = Math.cos((angle * Math.PI) / 180) * outerR;
    const y2 = Math.sin((angle * Math.PI) / 180) * outerR;
    const labelR = arcRadius + 22;
    const labelX = Math.cos((angle * Math.PI) / 180) * labelR;
    const labelY = Math.sin((angle * Math.PI) / 180) * labelR;
    
    return { val, x1, y1, x2, y2, labelX, labelY, isActive: val === value };
  });

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-2">{label}</span>
      <div
        ref={containerRef}
        className="relative w-48 h-28 cursor-pointer touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <svg
          viewBox="-120 -100 240 120"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--neon-orange)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--neon-orange)" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(0, 10)">
            <path
              d={arcPath}
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity={isDragging ? 1 : 0.6}
              className="transition-opacity duration-200"
            />

            {tickMarks.map(({ val, x1, y1, x2, y2, labelX, labelY, isActive }) => (
              <g key={val}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? 'var(--neon-orange)' : 'var(--muted-foreground)'}
                  strokeWidth={isActive ? 2 : 1}
                  opacity={isActive ? 1 : 0.4}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isActive ? 'var(--neon-orange)' : 'var(--muted-foreground)'}
                  fontSize="10"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  opacity={isActive ? 1 : 0.5}
                >
                  {val}
                </text>
              </g>
            ))}

            <motion.g
              animate={controls}
              filter={isDragging ? 'url(#glow)' : undefined}
            >
              <circle
                cx={indicatorX}
                cy={indicatorY}
                r="14"
                fill="var(--neon-orange)"
                className="drop-shadow-lg"
              />
              <text
                x={indicatorX}
                y={indicatorY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--background)"
                fontSize="12"
                fontWeight="bold"
              >
                {value}
              </text>
            </motion.g>
          </g>
        </svg>

        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
            <input
              type="number"
              min={min}
              max={max}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              autoFocus
              className="w-16 h-12 text-center text-2xl font-bold bg-muted/50 rounded-lg border-2 border-neon-orange focus:outline-none text-neon-orange"
            />
          </div>
        )}
      </div>
      
      {isDragging && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs text-muted-foreground mt-1"
        >
          滑动选择
        </motion.div>
      )}
    </div>
  );
}
