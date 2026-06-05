import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API endpoint for AI-powered mead recipe generation
  app.post("/api/mead/generate-recipe", async (req, res) => {
    const {
      style,
      sweetness,
      honeyType,
      targetABV,
      batchSize, // in gallons
      additionalIngredients, // e.g. fruit, spices, oak
    } = req.body;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(403).json({
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your Secrets.",
        });
      }

      // Lazy initialization of GoogleGenAI to ensure startup success
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are a world-class award-winning Master Meadmaker (Mazer). Generate a fully detailed artisan mead recipe based on the following configurations:
Style of Mead: ${style} (e.g. Traditional, Melomel, Metheglin, Cyser, Pyment, Acerglyn, etc.)
Sweetness Level: ${sweetness}
Honey Type: ${honeyType}
Target ABV: ${targetABV}%
Batch Size: ${batchSize} gallons
User Additions: ${additionalIngredients || "None specifically provided. Use your expertise to recommend complementary fruits, spices, or oak if appropriate for the selected style."}

Provide professional, actionable guidelines, precise measurements, and a staggered nutrient addition (SNA) plan suitable for mead yeast. Ensure the recipe has a specific, creative, and craft-inspiring name (do not name it just 'Orange Blossom Melomel' - give it an artisan name like 'Sunset Blossom Melomel' or 'Cinnamon Sunrise Metheglin').`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a master mead maker (Mazer). Follow the user's specific mead creation settings and return a structured artisan recipe strictly matching the specified JSON schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipeName: {
                type: Type.STRING,
                description: "An evocative, artisan, craft-sounding name for the mead.",
              },
              style: {
                type: Type.STRING,
                description: "The style of mead generated.",
              },
              difficulty: {
                type: Type.STRING,
                description: "Brewing difficulty level (Easy, Medium, Hard).",
              },
              targetABV: {
                type: Type.NUMBER,
                description: "Expected alcohol by volume percentage.",
              },
              estimatedOG: {
                type: Type.NUMBER,
                description: "Estimated Original Gravity (e.g., 1.102).",
              },
              estimatedFG: {
                type: Type.NUMBER,
                description: "Estimated Final Gravity (e.g., 1.002).",
              },
              yeastRecommendation: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Yeast strain name (e.g., Lalvin D47)." },
                  description: { type: Type.STRING, description: "Why this yeast is perfect for this specific profile." },
                  tempRange: { type: Type.STRING, description: "Optimal fermentation temperature range." },
                  alcoholTolerance: { type: Type.STRING, description: "Alcohol tolerance level." },
                },
                required: ["name", "description", "tempRange", "alcoholTolerance"],
              },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING, description: "Ingredient name (e.g., Orange Blossom Honey)." },
                    amount: { type: Type.STRING, description: "Amount (e.g., 3.5 lbs)." },
                    purpose: { type: Type.STRING, description: "Role in the batch (e.g., primary fermentable, spice flavor)." },
                  },
                  required: ["item", "amount", "purpose"],
                },
              },
              nutrientSchedule: {
                type: Type.STRING,
                description: "Guidance on staggered nutrient additions (such as Fermaid O/K or DAP schedule).",
              },
              stepByStepInstructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Chronological, clear steps from sanitizing and mixing the must to primary, nutrient schedule, racking, and bottling.",
              },
              brewingTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Mazer secrets: tips on racking, degassing, temperature maintenance, oak additions, aging times, etc.",
              },
              flavorProfile: {
                type: Type.OBJECT,
                properties: {
                  sweetness: { type: Type.STRING, description: "Tasting sweetness feedback (Dry, Semi-sweet, etc.)." },
                  body: { type: Type.STRING, description: "Expected mouthfeel (Light, Medium, Full-bodied)." },
                  aroma: { type: Type.STRING, description: "Primary aroma descriptors." },
                  tastingNotes: { type: Type.STRING, description: "Expected flavor tasting notes." },
                },
                required: ["sweetness", "body", "aroma", "tastingNotes"],
              },
            },
            required: [
              "recipeName",
              "style",
              "difficulty",
              "targetABV",
              "estimatedOG",
              "estimatedFG",
              "yeastRecommendation",
              "ingredients",
              "nutrientSchedule",
              "stepByStepInstructions",
              "brewingTips",
              "flavorProfile",
            ],
          },
        },
      });

      const responseText = response.text || "{}";
      const recipeData = JSON.parse(responseText.trim());

      res.json(recipeData);
    } catch (error: any) {
      console.error("AI Recipe Generation failed:", error);
      res.status(500).json({
        error: "Failed to generate AI mead recipe.",
        details: error.message || error,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
