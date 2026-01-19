import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ArrowRight } from 'lucide-react';
import { MedicationIconComponent } from './MedicationIcon';
import type { Medication, MedicationLog } from '@shared/schema';

interface DayDetailModalProps {
  date: Date | null;
  logs: MedicationLog[];
  medications: Medication[];
  isOpen: boolean;
  onClose: () => void;
}

const colorClasses: Record<Medication['color'], { bg: string; text: string; border: string }> = {
  cyan: { bg: 'bg-neon-cyan/10', text: 'text-neon-cyan', border: 'border-neon-cyan/30' },
  magenta: { bg: 'bg-neon-magenta/10', text: 'text-neon-magenta', border: 'border-neon-magenta/30' },
  green: { bg: 'bg-neon-green/10', text: 'text-neon-green', border: 'border-neon-green/30' },
  orange: { bg: 'bg-neon-orange/10', text: 'text-neon-orange', border: 'border-neon-orange/30' },
  purple: { bg: 'bg-neon-purple/10', text: 'text-neon-purple', border: 'border-neon-purple/30' },
  blue: { bg: 'bg-neon-blue/10', text: 'text-neon-blue', border: 'border-neon-blue/30' },
};

function formatInterval(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes}分钟`;
  } else if (minutes === 0) {
    return `${hours}小时`;
  } else {
    return `${hours}小时${minutes}分`;
  }
}

export function DayDetailModal({
  date,
  logs,
  medications,
  isOpen,
  onClose,
}: DayDetailModalProps) {
  const groupedData = useMemo(() => {
    if (!date) return [];

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayLogs = logs.filter(
      (log) => log.timestamp >= dayStart && log.timestamp <= dayEnd
    );

    const medicationMap = new Map<string, { medication: Medication; logs: MedicationLog[] }>();

    medications.forEach((med) => {
      medicationMap.set(med.id, { medication: med, logs: [] });
    });

    dayLogs.forEach((log) => {
      const entry = medicationMap.get(log.medicationId);
      if (entry) {
        entry.logs.push(log);
      }
    });

    return Array.from(medicationMap.values())
      .filter((entry) => entry.logs.length > 0)
      .map((entry) => ({
        ...entry,
        logs: entry.logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
      }))
      .sort((a, b) => {
        const aFirst = a.logs[0]?.timestamp.getTime() || 0;
        const bFirst = b.logs[0]?.timestamp.getTime() || 0;
        return aFirst - bFirst;
      });
  }, [date, logs, medications]);

  const dateString = date
    ? date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : '';

  const isToday = date
    ? new Date().toDateString() === date.toDateString()
    : false;

  return (
    <AnimatePresence>
      {isOpen && date && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 max-h-[75vh] z-50 glass-card rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-muted/50 rounded-full mx-auto mt-3" />
            
            <div className="p-5 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-neon-orange">
                    {isToday ? '今天' : dateString}
                  </h2>
                  {isToday && (
                    <p className="text-sm text-muted-foreground">{dateString}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center"
                  data-testid="button-close-day-detail"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-5 pb-8 overflow-y-auto max-h-[60vh] scrollbar-hide safe-bottom">
              {groupedData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>这一天没有服药记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedData.map(({ medication, logs: medLogs }) => {
                    const colors = colorClasses[medication.color];
                    const intervals: number[] = [];
                    
                    for (let i = 1; i < medLogs.length; i++) {
                      intervals.push(
                        medLogs[i].timestamp.getTime() - medLogs[i - 1].timestamp.getTime()
                      );
                    }

                    return (
                      <motion.div
                        key={medication.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass rounded-2xl p-4 border ${colors.border}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                            <MedicationIconComponent
                              icon={medication.icon}
                              className={colors.text}
                              size={20}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${colors.text}`}>
                              {medication.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {medication.dosage} · 共{medLogs.length}次
                            </p>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {medLogs.length}/{medication.timesPerDay}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {medLogs.map((log, index) => (
                            <div key={log.id}>
                              <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30">
                                <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center text-xs font-bold ${colors.text}`}>
                                  {index + 1}
                                </div>
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono text-sm">
                                  {log.timestamp.toLocaleTimeString('zh-CN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {log.isManual && (
                                  <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted/50">
                                    补记
                                  </span>
                                )}
                              </div>
                              
                              {index < medLogs.length - 1 && intervals[index] && (
                                <div className="flex items-center justify-center py-1.5 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/20">
                                    <ArrowRight className="w-3 h-3" />
                                    <span>间隔 {formatInterval(intervals[index])}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {intervals.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">平均服药间隔</span>
                              <span className={`font-medium ${colors.text}`}>
                                {formatInterval(
                                  intervals.reduce((a, b) => a + b, 0) / intervals.length
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
