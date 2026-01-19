import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Pill, Archive, X, Sparkles, Check } from 'lucide-react';
import { DraggableMedicationCard } from '@/components/DraggableMedicationCard';
import { MedicationModal } from '@/components/MedicationModal';
import { MedicationSettings } from '@/components/MedicationSettings';
import { CelebrationEffect } from '@/components/CelebrationEffect';
import { BottomNav } from '@/components/BottomNav';
import { useMedications, useMedicationLogs } from '@/lib/hooks';
import { useNotifications } from '@/hooks/useNotifications';
import type { Medication } from '@shared/schema';

function CircularProgress({ progress, isComplete }: { progress: number; isComplete: boolean }) {
  const radius = 85;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 170 170">
        <circle
          className="fill-none stroke-muted/30"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx="85"
          cy="85"
        />
        <motion.circle
          className={`fill-none ${isComplete ? 'stroke-neon-green' : 'stroke-neon-cyan'}`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="85"
          cy="85"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            strokeDasharray: circumference,
            filter: isComplete 
              ? 'drop-shadow(0 0 12px rgba(50, 255, 130, 0.6))' 
              : 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.4))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-center"
        >
          {isComplete ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Check className="w-16 h-16 text-neon-green" strokeWidth={3} />
            </motion.div>
          ) : (
            <>
              <span className="text-6xl font-display font-black text-foreground tracking-tighter">
                {progress}
              </span>
              <span className="text-2xl font-display font-bold text-neon-cyan ml-0.5">%</span>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function Home() {
  const { medications, addMedication, updateMedication, deleteMedication, reorderMedications } = useMedications();
  const { addLog, deleteLog, getTodayLogsForMedication, getStreakDays } = useMedicationLogs();
  const { requestPermission, isSupported } = useNotifications(medications);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompleteRef = useRef(false);

  useEffect(() => {
    const hasReminders = medications.some(m => m.reminderEnabled);
    if (hasReminders && isSupported && !localStorage.getItem('yaoji_notification_asked')) {
      requestPermission();
    }
  }, [medications, requestPermission, isSupported]);

  const handleQuickLog = useCallback(
    (medicationId: string) => {
      addLog(medicationId);
    },
    [addLog]
  );

  const handleManualLog = useCallback(
    (medicationId: string, time: Date) => {
      addLog(medicationId, time);
    },
    [addLog]
  );

  const now = new Date();
  const greeting = now.getHours() < 12 ? '早上好' : now.getHours() < 18 ? '下午好' : '晚上好';

  const totalTarget = medications.reduce((sum, med) => sum + med.timesPerDay, 0);
  const totalTaken = medications.reduce(
    (sum, med) => sum + Math.min(getTodayLogsForMedication(med.id).length, med.timesPerDay),
    0
  );
  const overallProgress = totalTarget > 0 ? Math.round((totalTaken / totalTarget) * 100) : 0;
  const isComplete = totalTarget > 0 && totalTaken >= totalTarget;

  useEffect(() => {
    if (isComplete && !prevCompleteRef.current && totalTarget > 0) {
      setShowCelebration(true);
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete, totalTarget]);

  return (
    <div className="h-screen bg-background grain overflow-y-auto overscroll-none">
      <div className="safe-top" />
      
      <header className="px-5 pt-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start justify-between"
        >
          <div>
            <motion.p 
              className="text-sm text-muted-foreground uppercase tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
            </motion.p>
            <motion.h1 
              className="font-display text-2xl font-bold text-foreground mt-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {greeting}
            </motion.h1>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
            onClick={() => setShowLibrary(true)}
            className="w-11 h-11 rounded-2xl glass-elevated flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            data-testid="button-open-library"
          >
            <Archive className="w-5 h-5 text-neon-cyan" />
          </motion.button>
        </motion.div>

        {medications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-6"
          >
            <CircularProgress progress={overallProgress} isComplete={isComplete} />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center"
            >
              {isComplete ? (
                <span className="flex items-center gap-2 text-neon-green font-medium text-lg">
                  <Sparkles className="w-5 h-5" />
                  今日目标已完成
                </span>
              ) : (
                <span className="text-muted-foreground">
                  已完成 <span className="text-neon-cyan font-bold">{totalTaken}</span> / {totalTarget} 次用药
                </span>
              )}
            </motion.p>
          </motion.div>
        )}
      </header>

      <main className="px-5 pb-32">
        {medications.length > 0 ? (
          <Reorder.Group
            axis="y"
            values={medications}
            onReorder={reorderMedications}
            className="space-y-4"
          >
            {medications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
              >
                <DraggableMedicationCard
                  medication={medication}
                  todayLogs={getTodayLogsForMedication(medication.id)}
                  onQuickLog={() => handleQuickLog(medication.id)}
                  onCardClick={() => setSelectedMedication(medication)}
                  isDragging={draggingId === medication.id}
                />
              </motion.div>
            ))}
          </Reorder.Group>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <motion.div 
              className="w-28 h-28 rounded-[2rem] bg-neon-cyan/10 border border-neon-cyan/20 mx-auto mb-8 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                boxShadow: '0 12px 40px rgba(0, 245, 255, 0.15)',
              }}
            >
              <Pill className="w-14 h-14 text-neon-cyan" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">开始追踪</h3>
            <p className="text-muted-foreground text-base mb-8 max-w-[240px] mx-auto">
              添加你的第一个药物，开始健康管理之旅
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLibrary(true)}
              className="px-8 py-4 rounded-2xl bg-neon-cyan text-background font-bold text-base"
              style={{
                boxShadow: '0 8px 32px rgba(0, 245, 255, 0.35)',
              }}
              data-testid="button-add-first-medication"
            >
              添加药物
            </motion.button>
          </motion.div>
        )}

        {medications.length > 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-muted-foreground/60 mt-8"
          >
            长按拖动调整顺序
          </motion.p>
        )}
      </main>

      <BottomNav />

      <AnimatePresence>
        {showLibrary && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
              onClick={() => setShowLibrary(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed inset-4 top-12 bottom-20 z-50 glass-elevated rounded-3xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neon-orange/30 to-neon-orange/10 flex items-center justify-center">
                    <Archive className="w-5 h-5 text-neon-orange" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-gradient-orange">药物库</h2>
                    <p className="text-xs text-muted-foreground">{medications.length} 种药物</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLibrary(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  data-testid="button-close-library"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                <MedicationSettings
                  medications={medications}
                  onAdd={addMedication}
                  onUpdate={updateMedication}
                  onDelete={deleteMedication}
                  startInAddMode={medications.length === 0}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedMedication && (
        <MedicationModal
          medication={selectedMedication}
          todayLogs={getTodayLogsForMedication(selectedMedication.id)}
          streakDays={getStreakDays(selectedMedication.id)}
          isOpen={true}
          onClose={() => setSelectedMedication(null)}
          onQuickLog={() => handleQuickLog(selectedMedication.id)}
          onManualLog={(time) => handleManualLog(selectedMedication.id, time)}
          onDeleteLog={deleteLog}
        />
      )}

      <CelebrationEffect 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
    </div>
  );
}
