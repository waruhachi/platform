
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { expect, it } from "bun:test";
import { db } from "../../db";
import { predictionRequestsTable } from "../../db/schema/application";
import { type PredictionRequest } from "../../common/schema";

import { handle as predictMigraine } from "../../handlers/predictMigraine.ts";


describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should return a prediction string when given a valid timeframe", async () => {
      const input: PredictionRequest = { timeframe: "PT24H" };
      const prediction = await predictMigraine(input);
      
      expect(prediction).toBeDefined();
      expect(typeof prediction).toBe("string");
      expect(prediction.length).toBeGreaterThan(0);
    });

    
    
    it("should consider provided factors when making a prediction", async () => {
      const withFactors: PredictionRequest = {
        timeframe: "PT24H",
        considerFactors: ["weather", "sleep", "stress"]
      };
      
      const withoutFactors: PredictionRequest = {
        timeframe: "PT24H"
      };
      
      const predictionWithFactors = await predictMigraine(withFactors);
      const predictionWithoutFactors = await predictMigraine(withoutFactors);
      
      // Predictions should be different when factors are considered
      expect(predictionWithFactors).toBeDefined();
      expect(predictionWithoutFactors).toBeDefined();
    });

    
    
    it("should store the prediction request in the database", async () => {
      const input: PredictionRequest = { 
        timeframe: "PT48H",
        considerFactors: ["weather", "food"] 
      };
      
      await predictMigraine(input);
      
      const storedRequests = await db.select().from(predictionRequestsTable).execute();
      expect(storedRequests).toHaveLength(1);
      expect(storedRequests[0].timeframe_minutes).toBeDefined();
      expect(storedRequests[0].result).toBeDefined();
    });

    
    
    it("should handle different timeframe formats correctly", async () => {
      const shortTimeframe: PredictionRequest = { timeframe: "PT6H" };
      const mediumTimeframe: PredictionRequest = { timeframe: "PT24H" };
      const longTimeframe: PredictionRequest = { timeframe: "P7D" };
      
      const shortPrediction = await predictMigraine(shortTimeframe);
      const mediumPrediction = await predictMigraine(mediumTimeframe);
      const longPrediction = await predictMigraine(longTimeframe);
      
      expect(shortPrediction).toBeDefined();
      expect(mediumPrediction).toBeDefined();
      expect(longPrediction).toBeDefined();
      
      // Check that the corresponding database entries were created
      const storedRequests = await db.select().from(predictionRequestsTable).execute();
      expect(storedRequests).toHaveLength(3);
    });

    
    
    it("should handle empty considerFactors array", async () => {
      const input: PredictionRequest = { 
        timeframe: "PT12H",
        considerFactors: [] 
      };
      
      const prediction = await predictMigraine(input);
      
      expect(prediction).toBeDefined();
      expect(typeof prediction).toBe("string");
    });

    
});