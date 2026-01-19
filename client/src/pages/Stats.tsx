import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar as CalendarIcon, Flame, Target, CheckCircle2, Circle } from 'lucide-react';
import { Calendar } from '@/components/Calendar';
import { CalendarFilter } from '@/components/CalendarFilter';
import { BottomNav } from '@/components/BottomNav';
import { useMedications, useMedicationLogs } from '@/lib/hooks';

export default function Stats() {
  const { medications } = useMedications();
  const { logs, getStreakDays } = useMedicationLogs();
  
  const [selectedMedicationIds, setSelectedMedicationIds] = useState<string[]>(() => 
    medications.map((m) => m.id)
  );

  useMemo(() => {
    const existingIds = new Set(medications.map((m) => m.id));
    const validSelectedIds = selectedMedicationIds.filter((id) => existingIds.has(id));
    
    const newMeds = medications.filter((m) => !selectedMedicationIds.includes(m.id));
    if (newMeds.length > 0 || validSelectedIds.length !== selectedMedicationIds.length) {
      setSelectedMedicationIds([...validSelectedIds, ...newMeds.map((m) => m.id)]);
    }
  }, [medications]);

  const maxStreak = medications.length > 0
    ? Math.max(...medications.map((med) => getStreakDays(med.id)))
    : 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const weeklyCompletionData = last7Days.map((date) => {
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayLogs = logs.filter(
      (log) => log.timestamp >= dayStart && log.timestamp <= dayEnd
    );

    let totalTarget = 0;
    let totalCompleted = 0;

    medications.forEach((med) => {
      const medLogs = dayLogs.filter((log) => log.medicationId === med.id);
      const daysInterval = med.daysInterval || 1;
      
      const daysSinceCreated = Math.floor((date.getTime() - med.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const shouldTakeToday = daysSinceCreated >= 0 && daysSinceCreated % daysInterval === 0;
      
      if (shouldTakeToday) {
        totalTarget += med.timesPerDay;
        totalCompleted += Math.min(medLogs.length, med.timesPerDay);
      }
    });

    const completionRate = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
    const isFullyCompleted = totalTarget > 0 && totalCompleted >= totalTarget;

    return {
      date,
      completionRate,
      isFullyCompleted,
      totalTarget,
      totalCompleted,
      label: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
      dayLabel: date.getDate().toString(),
    };
  });

  const avgCompletionRate = Math.round(
    weeklyCompletionData.reduce((sum, d) => sum + d.completionRate, 0) / 7
  );

  const perfectDays = weeklyCompletionData.filter((d) => d.isFullyCompleted).length;

  const todayIndex = 6;

  return (
    <div className="min-h-screen bg-background grain">
      <div className="safe-top" />

      <header className="px-5 pt-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm text-muted-foreground uppercase tracking-widest">药记</p>
          <h1 className="font-display text-2xl font-bold text-foreground mt-1">
            统计
          </h1>
        </motion.div>
      </header>

      <main className="px-5 pb-32 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl p-5 bg-neon-green/8 border border-neon-green/20 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <div className="w-10 h-10 rounded-2xl bg-neon-green/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-neon-green" />
              </div>
            </div>
            <div className="font-display text-5xl font-black text-neon-green tracking-tight">
              {avgCompletionRate}<span className="text-2xl">%</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-medium">周均完成率</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl p-5 bg-neon-orange/8 border border-neon-orange/20 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <div className="w-10 h-10 rounded-2xl bg-neon-orange/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-neon-orange" />
              </div>
            </div>
            <div className="font-display text-5xl font-black text-neon-orange tracking-tight">
              {maxStreak}<span className="text-2xl text-muted-foreground ml-1">天</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-medium">最长连续</div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-5 bg-neon-cyan/5 border border-neon-cyan/15"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-neon-cyan/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neon-cyan" />
              </div>
              <span className="text-base font-bold">近7日</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-neon-green" />
              <span className="text-neon-green font-bold">{perfectDays}</span>
              <span className="text-muted-foreground">天完成</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 mb-4">
            {weeklyCompletionData.map((day, index) => {
              const isToday = index === todayIndex;
              const heightPercent = day.completionRate;
              
              return (
                <div key={day.date.toISOString()} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-muted-foreground mb-1">
                    {day.completionRate}%
                  </div>
                  <div className="w-full h-20 bg-white/5 rounded-lg relative overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ delay: 0.4 + index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={`absolute bottom-0 left-0 right-0 rounded-lg ${
                        day.isFullyCompleted
                          ? 'bg-gradient-to-t from-neon-green to-emerald-400'
                          : day.completionRate >= 50
                            ? 'bg-gradient-to-t from-neon-orange/80 to-amber-400/80'
                            : 'bg-gradient-to-t from-muted-foreground/30 to-muted-foreground/50'
                      }`}
                    >
                      {day.isFullyCompleted && (
                        <div className="absolute inset-0 animate-shimmer" />
                      )}
                    </motion.div>
                  </div>
                  <div className={`flex flex-col items-center ${isToday ? 'text-neon-orange' : 'text-muted-foreground'}`}>
                    <span className={`text-xs ${isToday ? 'font-semibold' : ''}`}>{day.label}</span>
                    {day.isFullyCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-neon-green mt-0.5" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 opacity-30 mt-0.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-neon-green to-emerald-400" />
              <span>100% 完成</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-neon-orange/80 to-amber-400/80" />
              <span>部分完成</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded bg-muted-foreground/30" />
              <span>未完成</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="text-sm font-medium">日历视图</span>
          </div>
          <CalendarFilter
            medications={medications}
            selectedIds={selectedMedicationIds}
            onSelectionChange={setSelectedMedicationIds}
          />
          <Calendar 
            logs={logs} 
            medications={medications} 
            selectedMedicationIds={selectedMedicationIds}
          />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
