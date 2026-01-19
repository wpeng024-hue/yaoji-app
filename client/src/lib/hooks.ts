import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { InsertMedication, InsertMedicationLog, Medication } from '@shared/schema';

export function useMedications() {
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: api.getMedications,
  });

  const createMutation = useMutation({
    mutationFn: api.createMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertMedication> }) =>
      api.updateMedication(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (meds: Medication[]) => {
      const orders = meds.map((med, index) => ({ id: med.id, order: index }));
      return api.reorderMedications(orders);
    },
    onMutate: async (newMedications) => {
      await queryClient.cancelQueries({ queryKey: ['medications'] });
      const previousMeds = queryClient.getQueryData(['medications']);
      queryClient.setQueryData(['medications'], newMedications);
      return { previousMeds };
    },
    onError: (err, newMeds, context) => {
      queryClient.setQueryData(['medications'], context?.previousMeds);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  return {
    medications,
    isLoading,
    addMedication: createMutation.mutateAsync,
    updateMedication: (id: string, updates: Partial<InsertMedication>) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteMedication: deleteMutation.mutateAsync,
    reorderMedications: reorderMutation.mutate,
  };
}

export function useMedicationLogs() {
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: api.getMedicationLogs,
  });

  const createMutation = useMutation({
    mutationFn: api.createMedicationLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMedicationLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  const getTodayLogsForMedication = (medicationId: string) => {
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
  };

  const getStreakDays = (medicationId: string) => {
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
  };

  const addLog = async (medicationId: string, timestamp?: Date) => {
    const logData: InsertMedicationLog = {
      medicationId,
      timestamp: timestamp || new Date(),
      isManual: !!timestamp,
    };
    await createMutation.mutateAsync(logData);
  };

  return {
    logs,
    addLog,
    deleteLog: deleteMutation.mutateAsync,
    getTodayLogsForMedication,
    getStreakDays,
  };
}
