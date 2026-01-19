import { db } from "../db";
import { 
  type Medication, 
  type InsertMedication, 
  type MedicationLog, 
  type InsertMedicationLog,
  medications,
  medicationLogs
} from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Medications
  getMedications(): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, updates: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: string): Promise<void>;
  reorderMedications(medicationOrders: { id: string; order: number }[]): Promise<void>;

  // Medication Logs
  getMedicationLogs(): Promise<MedicationLog[]>;
  getMedicationLog(id: string): Promise<MedicationLog | undefined>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  deleteMedicationLog(id: string): Promise<void>;
  getLogsByDateRange(startDate: Date, endDate: Date): Promise<MedicationLog[]>;
  getLogsByMedication(medicationId: string): Promise<MedicationLog[]>;
}

export class DatabaseStorage implements IStorage {
  // Medications
  async getMedications(): Promise<Medication[]> {
    return db.select().from(medications).orderBy(medications.order);
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    const result = await db.select().from(medications).where(eq(medications.id, id)).limit(1);
    return result[0];
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const result = await db.insert(medications).values(medication).returning();
    return result[0];
  }

  async updateMedication(id: string, updates: Partial<InsertMedication>): Promise<Medication | undefined> {
    const result = await db
      .update(medications)
      .set(updates)
      .where(eq(medications.id, id))
      .returning();
    return result[0];
  }

  async deleteMedication(id: string): Promise<void> {
    await db.delete(medications).where(eq(medications.id, id));
  }

  async reorderMedications(medicationOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of medicationOrders) {
      await db.update(medications).set({ order }).where(eq(medications.id, id));
    }
  }

  // Medication Logs
  async getMedicationLogs(): Promise<MedicationLog[]> {
    return db.select().from(medicationLogs).orderBy(desc(medicationLogs.timestamp));
  }

  async getMedicationLog(id: string): Promise<MedicationLog | undefined> {
    const result = await db.select().from(medicationLogs).where(eq(medicationLogs.id, id)).limit(1);
    return result[0];
  }

  async createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog> {
    const result = await db.insert(medicationLogs).values(log).returning();
    return result[0];
  }

  async deleteMedicationLog(id: string): Promise<void> {
    await db.delete(medicationLogs).where(eq(medicationLogs.id, id));
  }

  async getLogsByDateRange(startDate: Date, endDate: Date): Promise<MedicationLog[]> {
    return db
      .select()
      .from(medicationLogs)
      .where(
        and(
          gte(medicationLogs.timestamp, startDate),
          lte(medicationLogs.timestamp, endDate)
        )
      )
      .orderBy(desc(medicationLogs.timestamp));
  }

  async getLogsByMedication(medicationId: string): Promise<MedicationLog[]> {
    return db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.medicationId, medicationId))
      .orderBy(desc(medicationLogs.timestamp));
  }
}

export const storage = new DatabaseStorage();
