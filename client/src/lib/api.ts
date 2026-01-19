import type { Medication, MedicationLog, InsertMedication, InsertMedicationLog } from '@shared/schema';

const API_BASE = '/api';

// Medications
export async function getMedications(): Promise<Medication[]> {
  const res = await fetch(`${API_BASE}/medications`);
  if (!res.ok) throw new Error('Failed to fetch medications');
  const medications = await res.json();
  return medications.map((med: any) => ({
    ...med,
    createdAt: new Date(med.createdAt),
  }));
}

export async function createMedication(medication: InsertMedication): Promise<Medication> {
  const res = await fetch(`${API_BASE}/medications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medication),
  });
  if (!res.ok) throw new Error('Failed to create medication');
  return res.json();
}

export async function updateMedication(id: string, updates: Partial<InsertMedication>): Promise<Medication> {
  const res = await fetch(`${API_BASE}/medications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update medication');
  return res.json();
}

export async function deleteMedication(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/medications/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete medication');
}

export async function reorderMedications(medications: { id: string; order: number }[]): Promise<void> {
  const res = await fetch(`${API_BASE}/medications/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medications }),
  });
  if (!res.ok) throw new Error('Failed to reorder medications');
}

// Medication Logs
export async function getMedicationLogs(): Promise<MedicationLog[]> {
  const res = await fetch(`${API_BASE}/logs`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  const logs = await res.json();
  return logs.map((log: any) => ({
    ...log,
    timestamp: new Date(log.timestamp),
  }));
}

export async function createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog> {
  const res = await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error('Failed to create log');
  const data = await res.json();
  return {
    ...data,
    timestamp: new Date(data.timestamp),
  };
}

export async function deleteMedicationLog(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/logs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete log');
}
