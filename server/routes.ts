import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicationSchema, insertMedicationLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Medications
  app.get("/api/medications", async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const data = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(data);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create medication" });
      }
    }
  });

  app.patch("/api/medications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const medication = await storage.updateMedication(id, updates);
      
      if (!medication) {
        res.status(404).json({ error: "Medication not found" });
        return;
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ error: "Failed to update medication" });
    }
  });

  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMedication(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete medication" });
    }
  });

  app.post("/api/medications/reorder", async (req, res) => {
    try {
      const { medications } = req.body;
      await storage.reorderMedications(medications);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder medications" });
    }
  });

  // Medication Logs
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getMedicationLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.post("/api/logs", async (req, res) => {
    try {
      const body = {
        ...req.body,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : undefined,
      };
      const data = insertMedicationLogSchema.parse(body);
      const log = await storage.createMedicationLog(data);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create log" });
      }
    }
  });

  app.delete("/api/logs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMedicationLog(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete log" });
    }
  });

  return httpServer;
}
