import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for GenAI
  app.post("/api/generateLessonPlan", async (req, res) => {
    try {
      console.log("Checking API Keys...");
      console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length);
      console.log("Gemini_API_Key length:", process.env.Gemini_API_Key?.length);
      let apiKey = process.env.Gemini_API_Key || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (apiKey === "AI Studio Free Tier" && process.env.Gemini_API_Key) {
        apiKey = process.env.Gemini_API_Key;
      }
      if (apiKey === "AI Studio Free Tier" && process.env.VITE_GEMINI_API_KEY) {
        apiKey = process.env.VITE_GEMINI_API_KEY;
      }
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "AI Studio Free Tier") {
        return res.status(500).json({ error: "No valid API key provided. Please add it in AI Studio settings." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const { promptText, isJson } = req.body;

      if (!promptText) {
        return res.status(400).json({ error: "promptText is required" });
      }

      let response;
      let retries = 8;
      let delay = 1000;
      let modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
      let currentModelIndex = 0;
      
      const config: any = {};
      if (isJson) {
        config.responseMimeType = "application/json";
      }

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: modelsToTry[currentModelIndex],
            contents: [promptText],
            config: config
          });
          break; // success
        } catch (error: any) {
          retries--;
          const errorMessage = error.message || "";
          console.error(`Model API error with ${modelsToTry[currentModelIndex]} (${errorMessage})`);
          if ((errorMessage.includes("UNAVAILABLE") || errorMessage.includes("high demand") || errorMessage.includes("503") || errorMessage.includes("429") || errorMessage.includes("Quota")) && retries > 0) {
            console.log(`Retrying... (${retries} retries left)`);
            currentModelIndex = (currentModelIndex + 1) % modelsToTry.length;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 1.25; 
          } else {
            throw error;
          }
        }
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error generating content:", error);
      let errorMessage = error.message || "Failed to generate content";
      if (errorMessage.includes("UNAVAILABLE") || errorMessage.includes("high demand") || errorMessage.includes("503")) {
        errorMessage = "ប្រព័ន្ធ AI កំពុងមានអ្នកប្រើប្រាស់ច្រើន (High Demand)។ សូមរង់ចាំបន្តិច រួចព្យាយាមម្ដងទៀត។";
      }
      res.status(500).json({ error: errorMessage });
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
