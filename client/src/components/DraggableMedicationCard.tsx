import { useState } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { Check, Plus, Clock, GripVertical, Bell, AlertTriangle } from 'lucide-react';
import { MedicationIconComponent } from './MedicationIcon';
import type { Medication, MedicationLog } from '@shared/schema';

interface DraggableMedicationCardProps {
  medication: Medication;
  todayLogs: MedicationLog[];
  onQuickLog: () => void;
  onCardClick: () => void;
  isDragging: boolean;
}

const colorClasses = {
  cyan: {
    border: 'border-l-neon-cyan',
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    iconBg: 'bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/10',
    iconShadow: 'shadow-[0_8px_24px_rgba(0,245,255,0.2)]',
    button: 'bg-gradient-to-br from-neon-cyan to-cyan-500 text-background',
    buttonShadow: 'shadow-[0_4px_20px_rgba(0,245,255,0.35)]',
    progress: 'bg-gradient-to-r from-neon-cyan to-cyan-400',
  },
  magenta: {
    border: 'border-l-neon-magenta',
    text: 'text-neon-magenta',
    bg: 'bg-neon-magenta/10',
    iconBg: 'bg-gradient-to-br from-neon-magenta/30 to-neon-magenta/10',
    iconShadow: 'shadow-[0_8px_24px_rgba(255,50,180,0.2)]',
    button: 'bg-gradient-to-br from-neon-magenta to-pink-500 text-white',
    buttonShadow: 'shadow-[0_4px_20px_rgba(255,50,180,0.35)]',
    progress: 'bg-gradient-to-r from-neon-magenta to-pink-400',
  },
  green: {
    border: 'border-l-neon-green',
    text: 'text-neon-green',
    bg: 'bg-neon-green/10',
    iconBg: 'bg-gradient-to-br from-neon-green/30 to-neon-green/10',
    iconShadow: 'shadow-[0_8px_24px_rgba(50,255,130,0.2)]',
    button: 'bg-gradient-to-br from-neon-green to-emerald-500 text-background',
    buttonShadow: 'shadow-[0_4px_20px_rgba(50,255,130,0.35)]',
    progress: 'bg-gradient-to-r from-neon-green to-emerald-400',
  },
  orange: {
    border: 'border-l-neon-orange',
    text: 'text-neon-orange',
    bg: 'bg-neon-orange/10',
    iconBg: 'bg-gradient-to-br from-neon-orange/30 to-neon-orange/10',
    iconShadow: 'shadow-[0_8px_24px_rgba(255,140,50,0.2)]',
    button: 'bg-gradient-to-br from-neon-orange to-amber-500 text-background',
    buttonShadow: 'shadow-[0_4px_20px_rgba(255,140,50,0.35)]',
    progress: 'bg-gradient-to-r from-neon-orange to-amber-400',
  },
  purple: {
    border: 'border-l-neon-purple',
    text: 'text-neon-purple',
    bg: 'bg-neon-purple/10',
    iconBg: 'bg-gradient-to-br from-neon-purple/30 to-neon-purple/10',
    iconShadow: 'shadow-[0_8px_24px_rgba(180,100,255,0.2)]',
    button: 'bg-gradient-to-br from-neon-purple to-violet-500 text-white',
    buttonShadow: 'shadow-[0_4px_20px_rgba(180,100,255,0.35)]',
    progress: 'bg-gradient-to-r from-neon-purple to-violet-400',
  },
  blue: {
    border: 'border-l-neon-blue',
    text: 'text-neon-blue',
    bg: 'bg-neon-blue/10',
    iconBg: 'bg-gradient-to-br from-neon-blue/30 to-neon-blue/10',
    iconShadow: 'shadow-[0_8px_24px_rgba(80,160,255,0.2)]',
    button: 'bg-gradient-to-br from-neon-blue to-blue-500 text-white',
    buttonShadow: 'shadow-[0_4px_20px_rgba(80,160,255,0.35)]',
    progress: 'bg-gradient-to-r from-neon-blue to-blue-400',
  },
  yellow: {
    border: 'border-l-neon-yellow',
    text: 'text-neon-yellow',
    bg: 'bg-neon-yellow/10',
    iconBg: 'bg-gradient-to-br from-neon-yellow/30 to-neon-yellow/10',
    iconShadow: 'shadow-[0_8px_24px_rgba(255,230,50,0.2)]',
    button: 'bg-gradient-to-br from-neon-yellow to-yellow-500 text-background',
    buttonShadow: 'shadow-[0_4px_20px_rgba(255,230,50,0.35)]',
    progress: 'bg-gradient-to-r from-neon-yellow to-yellow-400',
  },
  red: {
    border: 'border-l-neon-red',
    text: 'text-neon-red',
    bg: 'bg-neon-red/10',
    iconBg: 'bg-gradient-to-br from-neon-red/30 to-neon-red/10',
    iconShadow: 'shadow-[0_8px_24px_rgba(255,80,80,0.2)]',
    button: 'bg-gradient-to-br from-neon-red to-red-500 text-white',
    buttonShadow: 'shadow-[0_4px_20px_rgba(255,80,80,0.35)]',
    progress: 'bg-gradient-to-r from-neon-red to-red-400',
  },
};

export function DraggableMedicationCard({
  medication,
  todayLogs,
  onQuickLog,
  onCardClick,
  isDragging,
}: DraggableMedicationCardProps) {
  const colors = colorClasses[medication.color as keyof typeof colorClasses] || colorClasses.cyan;
  const takenToday = todayLogs.length;
  const target = medication.timesPerDay;
  const isComplete = takenToday >= target;
  const isOverdose = takenToday > target;
  const progress = Math.min((takenToday / target) * 100, 100);
  const dragControls = useDragControls();
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const lastLog = todayLogs.length > 0 
    ? todayLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    : null;

  return (
    <Reorder.Item
      value={medication}
      id={medication.id}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
        zIndex: 50,
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 400,
      }}
      className="w-full touch-none"
    >
      <div
        className={`
          rounded-3xl p-4 relative overflow-hidden
          transition-all duration-300
          ${isComplete ? 'bg-neon-green/8' : `${colors.bg}`}
          border ${isComplete ? 'border-neon-green/20' : 'border-white/10'}
          ${isDragging ? 'ring-2 ring-neon-cyan/50 scale-[1.02]' : ''}
          ${isLongPressing ? 'scale-[1.01]' : ''}
        `}
        data-testid={`card-medication-${medication.id}`}
      >
        <div className="flex items-center gap-4">
          <div
            onPointerDown={(e) => {
              setIsLongPressing(true);
              dragControls.start(e);
            }}
            onPointerUp={() => setIsLongPressing(false)}
            onPointerCancel={() => setIsLongPressing(false)}
            className="flex items-center justify-center cursor-grab active:cursor-grabbing touch-none opacity-30 hover:opacity-60 transition-opacity"
            data-testid={`drag-handle-${medication.id}`}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <div 
            className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
            onClick={onCardClick}
          >
            <motion.div 
              className={`w-16 h-16 rounded-2xl ${isComplete ? 'bg-neon-green/20' : colors.iconBg} flex items-center justify-center flex-shrink-0 relative ${isComplete ? 'shadow-[0_8px_24px_rgba(50,255,130,0.25)]' : colors.iconShadow}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MedicationIconComponent icon={medication.icon} className={colors.text} size={28} />
              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-neon-green rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-background" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-xl ${isComplete ? 'text-neon-green' : colors.text} truncate`}>
                  {medication.name}
                </h3>
                {medication.reminderEnabled && (
                  <Bell className="w-4 h-4 text-neon-cyan flex-shrink-0 opacity-60" />
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-sm text-muted-foreground font-medium">{medication.dosage}</span>
                <span className={`text-sm font-bold ${isComplete ? 'text-neon-green' : colors.text}`}>
                  {takenToday}/{target}
                </span>
                {isOverdose && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-neon-orange/20 text-neon-orange">
                    <AlertTriangle className="w-3 h-3" />
                    过量
                  </span>
                )}
                {lastLog && (
                  <span className="text-xs text-muted-foreground/50">
                    {lastLog.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative flex-shrink-0">
            {showBurst && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${colors.button}`}
                    initial={{ 
                      x: 28, 
                      y: 28, 
                      scale: 0, 
                      opacity: 1 
                    }}
                    animate={{ 
                      x: 28 + Math.cos((i * Math.PI * 2) / 8) * 40,
                      y: 28 + Math.sin((i * Math.PI * 2) / 8) * 40,
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                ))}
                <motion.div
                  className={`absolute inset-0 rounded-2xl ${colors.button}`}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowBurst(true);
                setTimeout(() => setShowBurst(false), 500);
                onQuickLog();
              }}
              className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                ${colors.button} ${colors.buttonShadow}
                transition-all relative z-10
              `}
              data-testid={`button-quick-log-${medication.id}`}
            >
              <motion.div
                key={takenToday}
                initial={{ scale: 0.5, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {isComplete ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
