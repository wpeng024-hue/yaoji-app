import { useState, useEffect, useCallback } from 'react';

export type MedicationIcon = 'pill' | 'capsule' | 'syringe' | 'droplet' | 'heart' | 'sun' | 'moon' | 'leaf' | 'zap' | 'shield' | 'activity' | 'thermometer';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timesPerDay: number;
  daysInterval: number;
  color: 'cyan' | 'magenta' | 'green' | 'orange' | 'purple' | 'blue';
  icon: MedicationIcon;
  createdAt: Date;
  order: number;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  timestamp: Date;
  isManual: boolean;
}

const STORAGE_KEYS = {
  MEDICATIONS: 'yaoji_medications',
  LOGS: 'yaoji_logs',
};

const generateDemoLogs = (medications: Medication[]): MedicationLog[] => {
  const logs: MedicationLog[] = [];
  const now = new Date();
  
  medications.forEach((med) => {
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      
      const shouldLog = Math.random() > 0.15;
      if (!shouldLog && dayOffset > 0) continue;
      
      const timesToLog = dayOffset === 0 
        ? Math.floor(Math.random() * (med.timesPerDay + 1))
        : Math.random() > 0.3 ? med.timesPerDay : Math.floor(Math.random() * med.timesPerDay) + 1;
      
      for (let i = 0; i < timesToLog; i++) {
        const logDate = new Date(date);
        const baseHour = med.timesPerDay === 1 ? 8 : med.timesPerDay === 2 ? (i === 0 ? 8 : 20) : 8 + (i * Math.floor(12 / med.timesPerDay));
        logDate.setHours(baseHour + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        
        if (logDate <= now) {
          logs.push({
            id: `demo-${med.id}-${dayOffset}-${i}`,
            medicationId: med.id,
            timestamp: logDate,
            isManual: Math.random() > 0.8,
          });
        }
      }
    }
  });
  
  return logs;
};

const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: '1',
    name: '维生素D',
    dosage: '1000IU',
    timesPerDay: 1,
    daysInterval: 1,
    color: 'orange',
    icon: 'sun',
    createdAt: new Date(),
    order: 0,
  },
  {
    id: '2',
    name: '益生菌',
    dosage: '1粒',
    timesPerDay: 2,
    daysInterval: 1,
    color: 'cyan',
    icon: 'shield',
    createdAt: new Date(),
    order: 1,
  },
  {
    id: '3',
    name: 'Omega-3',
    dosage: '1000mg',
    timesPerDay: 1,
    daysInterval: 1,
    color: 'blue',
    icon: 'droplet',
    createdAt: new Date(),
    order: 2,
  },
  {
    id: '4',
    name: '布洛芬',
    dosage: '200mg',
    timesPerDay: 3,
    daysInterval: 1,
    color: 'magenta',
    icon: 'pill',
    createdAt: new Date(),
    order: 3,
  },
  {
    id: '5',
    name: '阿司匹林',
    dosage: '100mg',
    timesPerDay: 1,
    daysInterval: 1,
    color: 'green',
    icon: 'heart',
    createdAt: new Date(),
    order: 4,
  },
];

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (key === STORAGE_KEYS.LOGS) {
        return parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })) as T;
      }
      if (key === STORAGE_KEYS.MEDICATIONS) {
        return parsed.map((med: any, index: number) => ({
          ...med,
          createdAt: new Date(med.createdAt),
          order: med.order ?? index,
          daysInterval: med.daysInterval ?? 1,
        })) as T;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>(() => {
    const stored = loadFromStorage<Medication[]>(STORAGE_KEYS.MEDICATIONS, []);
    if (stored.length === 0) {
      saveToStorage(STORAGE_KEYS.MEDICATIONS, DEFAULT_MEDICATIONS);
      return DEFAULT_MEDICATIONS;
    }
    return stored.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MEDICATIONS, medications);
  }, [medications]);

  const addMedication = useCallback((medication: Omit<Medication, 'id' | 'createdAt' | 'order'>) => {
    const newMed: Medication = {
      ...medication,
      id: Date.now().toString(),
      createdAt: new Date(),
      order: medications.length,
    };
    setMedications((prev) => [...prev, newMed]);
    return newMed;
  }, [medications.length]);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updates } : med))
    );
  }, []);

  const deleteMedication = useCallback((id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  }, []);

  const reorderMedications = useCallback((newOrder: Medication[]) => {
    const reordered = newOrder.map((med, index) => ({ ...med, order: index }));
    setMedications(reordered);
  }, []);

  return {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    reorderMedications,
  };
}

export function useMedicationLogs() {
  const [logs, setLogs] = useState<MedicationLog[]>(() => {
    const stored = loadFromStorage<MedicationLog[]>(STORAGE_KEYS.LOGS, []);
    if (stored.length === 0) {
      const demoLogs = generateDemoLogs(DEFAULT_MEDICATIONS);
      saveToStorage(STORAGE_KEYS.LOGS, demoLogs);
      return demoLogs;
    }
    return stored;
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LOGS, logs);
  }, [logs]);

  const addLog = useCallback((medicationId: string, timestamp?: Date) => {
    const newLog: MedicationLog = {
      id: Date.now().toString(),
      medicationId,
      timestamp: timestamp || new Date(),
      isManual: !!timestamp,
    };
    setLogs((prev) => [...prev, newLog]);
    return newLog;
  }, []);

  const deleteLog = useCallback((id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  const getLogsForDate = useCallback(
    (date: Date) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return logs.filter(
        (log) => log.timestamp >= startOfDay && log.timestamp <= endOfDay
      );
    },
    [logs]
  );

  const getLogsForMedication = useCallback(
    (medicationId: string) => {
      return logs.filter((log) => log.medicationId === medicationId);
    },
    [logs]
  );

  const getTodayLogsForMedication = useCallback(
    (medicationId: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return logs.filter(
        (log) =>
          log.medicationId === medicationId &&
          log.timestamp >= today &&
          log.timestamp < tomorrow
      );
    },
    [logs]
  );

  const getStreakDays = useCallback(
    (medicationId: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let streak = 0;
      let currentDate = new Date(today);

      while (true) {
        const dayStart = new Date(currentDate);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        const hasLog = logs.some(
          (log) =>
            log.medicationId === medicationId &&
            log.timestamp >= dayStart &&
            log.timestamp <= dayEnd
        );

        if (!hasLog) break;
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      return streak;
    },
    [logs]
  );

  return {
    logs,
    addLog,
    deleteLog,
    getLogsForDate,
    getLogsForMedication,
    getTodayLogsForMedication,
    getStreakDays,
  };
}
