import type { Express } from "express";
import { importParkrunEvents } from "../../scripts/import-parkrun";
import { isAuthenticated } from "../replitAuth";

export function registerImportRoutes(app: Express) {
  // Import parkrun events (admin only for now)
  app.post('/api/admin/import/parkrun', isAuthenticated, async (req: any, res) => {
    try {
      // For now, allow any authenticated user to import
      // In production, you'd want proper admin role checking
      // Import parkrun events requested
      
      const result = await importParkrunEvents();
      
      res.json({
        success: true,
        message: 'Parkrun events imported successfully',
        result
      });
    } catch (error: any) {
      console.error("Error importing parkrun events:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to import parkrun events",
        error: error.message 
      });
    }
  });
}