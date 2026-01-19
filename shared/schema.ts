import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  timesPerDay: integer("times_per_day").notNull().default(1),
  daysInterval: integer("days_interval").notNull().default(1),
  color: text("color").notNull().default('cyan'),
  icon: text("icon").notNull().default('pill'),
  order: integer("order").notNull().default(0),
  reminderEnabled: boolean("reminder_enabled").notNull().default(false),
  reminderTimes: text("reminder_times").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const medicationLogs = pgTable("medication_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").notNull().references(() => medications.id, { onDelete: 'cascade' }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isManual: boolean("is_manual").notNull().default(false),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
});

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
