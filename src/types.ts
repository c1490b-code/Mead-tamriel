/**
 * Shared Type Definitions for Mead Brewing Companion
 */

export interface YeastProfile {
  name: string;
  brand: string;
  alcoholTolerance: number; // e.g. 14, 18
  nitrogenRequirement: "Low" | "Medium" | "High";
  tempRangeMinF: number;
  tempRangeMaxF: number;
  tempRangeMinC: number;
  tempRangeMaxC: number;
  description: string;
  styles: string[];
}

export interface GravityReading {
  id: string;
  date: string; // YYYY-MM-DD
  gravity: number; // e.g., 1.085
  temperature?: number; // measured temperature
  tempUnit?: "F" | "C";
  correctedGravity: number; // calculated if temperature correction applied
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: "addition" | "rack" | "gravity" | "bottle" | "taste" | "other";
  description: string;
  notes?: string;
}

export interface BrewLog {
  id: string;
  batchName: string;
  style: string; // Traditional, Melomel, Metheglin, Cyser, Pyment, Acerglyn, Bochet, etc.
  honeyType: string;
  yeastName: string;
  batchSize: number; // in gallons
  batchSizeUnit: "gal" | "L";
  originalGravity: number;
  finalGravity: number;
  dateStarted: string;
  status: "Fermenting" | "Racked/Aging" | "Bottled" | "Completed" | "Stalled";
  notes?: string;
  gravityReadings: GravityReading[];
  timelineEvents: TimelineEvent[];
}

export interface AiRecipe {
  recipeName: string;
  style: string;
  difficulty: "Easy" | "Medium" | "Hard";
  targetABV: number;
  estimatedOG: number;
  estimatedFG: number;
  yeastRecommendation: {
    name: string;
    description: string;
    tempRange: string;
    alcoholTolerance: string;
  };
  ingredients: {
    item: string;
    amount: string;
    purpose: string;
  }[];
  nutrientSchedule: string;
  stepByStepInstructions: string[];
  brewingTips: string[];
  flavorProfile: {
    sweetness: string;
    body: string;
    aroma: string;
    tastingNotes: string;
  };
}
