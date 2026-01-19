import { useEffect, useCallback, useRef } from 'react';
import type { Medication } from '@shared/schema';

type NotificationPermission = 'default' | 'granted' | 'denied';

const REMINDER_TIMES: Record<string, { hour: number; minute: number; label: string }> = {
  '08:00': { hour: 8, minute: 0, label: '早' },
  '12:00': { hour: 12, minute: 0, label: '午' },
  '20:00': { hour: 20, minute: 0, label: '晚' },
};

const PERMISSION_KEY = 'yaoji_notification_asked';

export function useNotifications(medications: Medication[]) {
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastNotifiedRef = useRef<Set<string>>(new Set());
  const permissionAskedRef = useRef(localStorage.getItem(PERMISSION_KEY) === 'true');

  const getPermission = useCallback((): NotificationPermission => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission as NotificationPermission;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (permissionAskedRef.current) {
      return false;
    }

    if (Notification.permission !== 'denied') {
      localStorage.setItem(PERMISSION_KEY, 'true');
      permissionAskedRef.current = true;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if (getPermission() !== 'granted') return;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `yaoji-${Date.now()}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 10000);
  }, [getPermission]);

  const scheduleReminders = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();

    if (getPermission() !== 'granted') return;

    const medicationsWithReminders = medications.filter(
      m => m.reminderEnabled && m.reminderTimes && m.reminderTimes.length > 0
    );

    if (medicationsWithReminders.length === 0) return;

    const now = new Date();
    const today = now.toDateString();

    medicationsWithReminders.forEach(medication => {
      const times = medication.reminderTimes || [];
      times.forEach(time => {
        const reminderConfig = REMINDER_TIMES[time];
        if (!reminderConfig) return;

        const notifyKey = `${medication.id}-${time}-${today}`;
        
        if (lastNotifiedRef.current.has(notifyKey)) return;

        const reminderDate = new Date();
        reminderDate.setHours(reminderConfig.hour, reminderConfig.minute, 0, 0);

        const delay = reminderDate.getTime() - now.getTime();

        if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
          const timeout = setTimeout(() => {
            showNotification(
              `${reminderConfig.label}间用药提醒`,
              `该吃 ${medication.name} 啦~ (${medication.dosage})`
            );
            lastNotifiedRef.current.add(notifyKey);
          }, delay);

          timeoutsRef.current.set(notifyKey, timeout);
        }
      });
    });
  }, [medications, getPermission, showNotification]);

  useEffect(() => {
    scheduleReminders();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleReminders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [scheduleReminders]);

  useEffect(() => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const delay = midnight.getTime() - Date.now();

    const timeout = setTimeout(() => {
      lastNotifiedRef.current.clear();
      scheduleReminders();
    }, delay);

    return () => clearTimeout(timeout);
  }, [scheduleReminders]);

  return {
    getPermission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
  };
}
