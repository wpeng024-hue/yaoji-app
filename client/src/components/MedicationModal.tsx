import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Clock, Check, History, Trash2 } from 'lucide-react';
import { MedicationIconComponent } from './MedicationIcon';
import type { Medication, MedicationLog } from '@shared/schema';

interface MedicationModalProps {
  medication: Medication;
  todayLogs: MedicationLog[];
  streakDays: number;
  isOpen: boolean;
  onClose: () => void;
  onQuickLog: () => void;
  onManualLog: (time: Date) => void;
  onDeleteLog: (logId: string) => void;
}

const colorClasses = {
  cyan: {
    text: 'text-neon-cyan',
    glow: 'text-glow-cyan',
    bg: 'bg-neon-cyan/10',
    iconBg: 'bg-neon-cyan/20',
    button: 'bg-neon-cyan hover:bg-neon-cyan/90 text-background',
    border: 'border-neon-cyan/30',
  },
  magenta: {
    text: 'text-neon-magenta',
    glow: '',
    bg: 'bg-neon-magenta/10',
    iconBg: 'bg-neon-magenta/20',
    button: 'bg-neon-magenta hover:bg-neon-magenta/90 text-white',
    border: 'border-neon-magenta/30',
  },
  green: {
    text: 'text-neon-green',
    glow: 'text-glow-green',
    bg: 'bg-neon-green/10',
    iconBg: 'bg-neon-green/20',
    button: 'bg-neon-green hover:bg-neon-green/90 text-background',
    border: 'border-neon-green/30',
  },
  orange: {
    text: 'text-neon-orange',
    glow: '',
    bg: 'bg-neon-orange/10',
    iconBg: 'bg-neon-orange/20',
    button: 'bg-neon-orange hover:bg-neon-orange/90 text-background',
    border: 'border-neon-orange/30',
  },
  purple: {
    text: 'text-neon-purple',
    glow: '',
    bg: 'bg-neon-purple/10',
    iconBg: 'bg-neon-purple/20',
    button: 'bg-neon-purple hover:bg-neon-purple/90 text-white',
    border: 'border-neon-purple/30',
  },
  blue: {
    text: 'text-neon-blue',
    glow: '',
    bg: 'bg-neon-blue/10',
    iconBg: 'bg-neon-blue/20',
    button: 'bg-neon-blue hover:bg-neon-blue/90 text-white',
    border: 'border-neon-blue/30',
  },
};

export function MedicationModal({
  medication,
  todayLogs,
  streakDays,
  isOpen,
  onClose,
  onQuickLog,
  onManualLog,
  onDeleteLog,
}: MedicationModalProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());

  const colors = colorClasses[medication.color];
  const takenToday = todayLogs.length;
  const target = medication.timesPerDay;
  const isComplete = takenToday >= target;

  const handleManualLog = () => {
    const now = new Date();
    now.setHours(selectedHour, selectedMinute, 0, 0);
    onManualLog(now);
    setShowTimePicker(false);
  };

  const sortedLogs = [...todayLogs].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] bottom-auto max-h-[80vh] z-50 glass-card rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${colors.bg} to-transparent`} />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center z-10"
                data-testid="button-close-modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative p-6 pt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${colors.iconBg} flex items-center justify-center`}>
                    <MedicationIconComponent icon={medication.icon} className={colors.text} size={32} />
                  </div>
                  <div>
                    <h2 className={`font-display text-2xl font-bold ${colors.text}`}>
                      {medication.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {medication.dosage} · 每日{medication.timesPerDay}次
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className={`glass rounded-xl p-4 border ${colors.border}`}>
                    <div className="text-xs text-muted-foreground mb-1">今日进度</div>
                    <div className={`font-display text-2xl font-bold ${colors.text}`}>
                      {takenToday}/{target}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isComplete ? '已完成 ✓' : `还差${target - takenToday}次`}
                    </div>
                  </div>
                  <div className={`glass rounded-xl p-4 border ${colors.border}`}>
                    <div className="text-xs text-muted-foreground mb-1">连续服用</div>
                    <div className={`font-display text-2xl font-bold ${colors.text}`}>
                      {streakDays}
                    </div>
                    <div className="text-xs text-muted-foreground">天</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onQuickLog}
                    className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 ${colors.button}`}
                    data-testid="button-modal-quick-log"
                  >
                    {isComplete ? (
                      <>
                        <Check className="w-5 h-5" />
                        再记一次
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        立即记录
                      </>
                    )}
                  </motion.button>

                  {!showTimePicker ? (
                    <button
                      onClick={() => setShowTimePicker(true)}
                      className="w-full py-3 rounded-xl border border-border text-muted-foreground flex items-center justify-center gap-2 hover:bg-muted/30 transition-colors"
                      data-testid="button-show-time-picker"
                    >
                      <Clock className="w-4 h-4" />
                      补记录（选择时间）
                    </button>
                  ) : (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="glass rounded-xl p-4 border border-border"
                    >
                      <div className="text-sm text-muted-foreground mb-3">选择服药时间</div>
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={selectedHour}
                            onChange={(e) => setSelectedHour(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-16 h-14 bg-muted/50 rounded-xl text-center font-display text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                            data-testid="input-hour"
                          />
                          <span className="text-xs text-muted-foreground mt-1">时</span>
                        </div>
                        <span className="font-display text-2xl text-muted-foreground">:</span>
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={selectedMinute}
                            onChange={(e) => setSelectedMinute(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-16 h-14 bg-muted/50 rounded-xl text-center font-display text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                            data-testid="input-minute"
                          />
                          <span className="text-xs text-muted-foreground mt-1">分</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowTimePicker(false)}
                          className="flex-1 py-2 rounded-lg border border-border text-muted-foreground"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleManualLog}
                          className={`flex-1 py-2 rounded-lg ${colors.button}`}
                          data-testid="button-confirm-manual-log"
                        >
                          确认
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {sortedLogs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <History className="w-4 h-4" />
                      今日记录
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                      {sortedLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>
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
                          <button
                            onClick={() => onDeleteLog(log.id)}
                            className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                            data-testid={`button-delete-log-${log.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
