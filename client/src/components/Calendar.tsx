import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayDetailModal } from './DayDetailModal';
import type { Medication, MedicationLog } from '@shared/schema';

interface CalendarProps {
  logs: MedicationLog[];
  medications: Medication[];
  selectedMedicationIds: string[];
}

const dotColors: Record<Medication['color'], string> = {
  cyan: 'bg-neon-cyan',
  magenta: 'bg-neon-magenta',
  green: 'bg-neon-green',
  orange: 'bg-neon-orange',
  purple: 'bg-neon-purple',
  blue: 'bg-neon-blue',
};

export function Calendar({ logs, medications, selectedMedicationIds }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const filteredMedications = medications.filter((m) => selectedMedicationIds.includes(m.id));
  const filteredLogs = logs.filter((log) => selectedMedicationIds.includes(log.medicationId));

  const { days, monthName, year } = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startPadding = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const monthName = currentDate.toLocaleDateString('zh-CN', { month: 'long' });
    const year = currentDate.getFullYear();

    return { days, monthName, year };
  }, [currentDate]);

  const getDayStats = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayLogs = filteredLogs.filter(
      (log) => log.timestamp >= dayStart && log.timestamp <= dayEnd
    );

    const medicationsWithLogs = new Map<string, number>();
    dayLogs.forEach((log) => {
      const count = medicationsWithLogs.get(log.medicationId) || 0;
      medicationsWithLogs.set(log.medicationId, count + 1);
    });

    const allCompleted = filteredMedications.every((med) => {
      const count = medicationsWithLogs.get(med.id) || 0;
      return count >= med.timesPerDay;
    });

    const medicationColors = filteredMedications
      .filter((med) => medicationsWithLogs.has(med.id))
      .map((med) => med.color);

    return {
      logCount: dayLogs.length,
      allCompleted: allCompleted && filteredMedications.length > 0,
      hasLogs: dayLogs.length > 0,
      medicationColors,
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    if (!isFuture(date)) {
      setSelectedDay(date);
    }
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <>
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            data-testid="button-prev-month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-display text-lg font-semibold">
            {year}年 {monthName}
          </h3>
          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            data-testid="button-next-month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const stats = getDayStats(day);
            const today = isToday(day);
            const future = isFuture(day);

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: future ? 1 : 1.1 }}
                whileTap={{ scale: future ? 1 : 0.95 }}
                onClick={() => handleDayClick(day)}
                disabled={future}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center relative
                  transition-colors
                  ${today ? 'ring-2 ring-neon-orange ring-offset-2 ring-offset-background' : ''}
                  ${future ? 'opacity-30 cursor-default' : 'cursor-pointer hover:bg-muted/50'}
                  ${stats.allCompleted ? 'bg-neon-green/20' : stats.hasLogs ? 'bg-neon-orange/10' : 'bg-muted/30'}
                `}
                data-testid={`calendar-day-${day.getDate()}`}
              >
                <span
                  className={`text-sm font-medium ${
                    today ? 'text-neon-orange' : stats.hasLogs ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {day.getDate()}
                </span>
                {stats.hasLogs && !future && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {stats.medicationColors.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`}
                      />
                    ))}
                    {stats.medicationColors.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neon-green/20" />
            <span>全部完成</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neon-orange/10" />
            <span>部分完成</span>
          </div>
        </div>
      </div>

      <DayDetailModal
        date={selectedDay}
        logs={logs}
        medications={medications}
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
      />
    </>
  );
}
