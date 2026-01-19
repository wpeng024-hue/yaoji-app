import { motion } from 'framer-motion';
import { Check, Plus, Clock } from 'lucide-react';
import { MedicationIconComponent } from './MedicationIcon';
import type { Medication, MedicationLog } from '@shared/schema';

interface MedicationCardProps {
  medication: Medication;
  todayLogs: MedicationLog[];
  onQuickLog: () => void;
  onCardClick: () => void;
  index: number;
}

const colorClasses = {
  cyan: {
    border: 'border-l-4 border-l-neon-cyan',
    text: 'text-neon-cyan',
    glow: 'text-glow-cyan',
    bg: 'bg-neon-cyan/10',
    iconBg: 'bg-neon-cyan/20',
    button: 'bg-neon-cyan hover:bg-neon-cyan/90 text-background',
    progress: 'bg-neon-cyan',
  },
  magenta: {
    border: 'border-l-4 border-l-neon-magenta',
    text: 'text-neon-magenta',
    glow: '',
    bg: 'bg-neon-magenta/10',
    iconBg: 'bg-neon-magenta/20',
    button: 'bg-neon-magenta hover:bg-neon-magenta/90 text-white',
    progress: 'bg-neon-magenta',
  },
  green: {
    border: 'border-l-4 border-l-neon-green',
    text: 'text-neon-green',
    glow: 'text-glow-green',
    bg: 'bg-neon-green/10',
    iconBg: 'bg-neon-green/20',
    button: 'bg-neon-green hover:bg-neon-green/90 text-background',
    progress: 'bg-neon-green',
  },
  orange: {
    border: 'border-l-4 border-l-neon-orange',
    text: 'text-neon-orange',
    glow: '',
    bg: 'bg-neon-orange/10',
    iconBg: 'bg-neon-orange/20',
    button: 'bg-neon-orange hover:bg-neon-orange/90 text-background',
    progress: 'bg-neon-orange',
  },
  purple: {
    border: 'border-l-4 border-l-neon-purple',
    text: 'text-neon-purple',
    glow: '',
    bg: 'bg-neon-purple/10',
    iconBg: 'bg-neon-purple/20',
    button: 'bg-neon-purple hover:bg-neon-purple/90 text-white',
    progress: 'bg-neon-purple',
  },
  blue: {
    border: 'border-l-4 border-l-neon-blue',
    text: 'text-neon-blue',
    glow: '',
    bg: 'bg-neon-blue/10',
    iconBg: 'bg-neon-blue/20',
    button: 'bg-neon-blue hover:bg-neon-blue/90 text-white',
    progress: 'bg-neon-blue',
  },
};

export function MedicationCard({
  medication,
  todayLogs,
  onQuickLog,
  onCardClick,
  index,
}: MedicationCardProps) {
  const colors = colorClasses[medication.color];
  const takenToday = todayLogs.length;
  const target = medication.timesPerDay;
  const isComplete = takenToday >= target;
  const progress = Math.min((takenToday / target) * 100, 100);

  const lastLog = todayLogs.length > 0 
    ? todayLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="w-full"
    >
      <div
        onClick={onCardClick}
        className={`
          glass-card rounded-2xl p-5 cursor-pointer
          ${colors.border} border-y border-r border-border
          relative overflow-hidden
          active:scale-[0.98] transition-all duration-200
          hover:bg-card/80
        `}
        data-testid={`card-medication-${medication.id}`}
      >
        <div className="absolute top-0 left-1 right-0 h-1 bg-muted/30 rounded-tr-2xl overflow-hidden">
          <motion.div
            className={`h-full ${colors.progress}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
              <MedicationIconComponent icon={medication.icon} className={colors.text} size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg ${colors.text} truncate`}>
                {medication.name}
              </h3>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span>{medication.dosage}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>每日{medication.timesPerDay}次</span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  ${isComplete ? 'bg-neon-green/20 text-neon-green' : `${colors.bg} ${colors.text}`}
                `}>
                  {isComplete ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      已完成
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5" />
                      {takenToday}/{target}
                    </>
                  )}
                </div>
                
                {lastLog && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {lastLog.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickLog();
            }}
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              ${colors.button}
              shadow-lg transition-all flex-shrink-0
              active:shadow-md
            `}
            data-testid={`button-quick-log-${medication.id}`}
          >
            {isComplete ? (
              <Check className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function Sun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m6.34 17.66-1.41 1.41"/>
      <path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  );
}
