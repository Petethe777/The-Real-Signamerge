import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: "Discovery Engine v4" });
  });

  // Real-time keyword fetching using the Gemini API safely on server-side to hide keys in prod deployment
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.json([]);
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("[Server] GEMINI_API_KEY is not defined in the environment. Falling back to cached state.");
        return res.json({ _rateLimited: true });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Act as a real-time social media discovery agent in the 2026 ecosystem. Search Google for authentic, high-intent leads and social signals strictly from the year 2026 related to: "${query}".
      
      CRITICAL: 
      - Find ACTUAL posts (TikTok, Instagram, Reddit, X/Twitter, LinkedIn) where users are explicitly requesting services, products, or help related to ${query}.
      - Look for phrases like "Can anyone recommend...", "I need help with...", "Searching for...", "Is there a service that...".
      - Avoid providing generic or 'I'm struggling to find' filler content unless it is a verbatim social post from a user.
      - Return a JSON array of 12-15 highly accurate results. Each result must represent a unique social signal with realistic metrics for 2026.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                platform: { 
                  type: Type.STRING,
                  description: "One of: Instagram, TikTok, Twitter, LinkedIn, Reddit, YouTube"
                },
                content: { type: Type.STRING },
                views: { type: Type.STRING },
                likes: { type: Type.STRING },
                hashtags: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                location: { type: Type.STRING },
                contactStatus: { 
                  type: Type.STRING,
                  description: "One of: Verified Lead, Hot Prospect"
                },
                time: { type: Type.STRING },
                sourceUrl: { type: Type.STRING }
              },
              required: ["platform", "content", "sourceUrl"]
            }
          }
        },
      });

      const text = aiResponse.text || "[]";
      let results = JSON.parse(text);
      if (!Array.isArray(results)) {
        results = [];
      }

      const formatted = results.map((r: any) => ({
        id: r.id || `google-${Math.random().toString(36).substring(2, 11)}`,
        platform: r.platform || 'Reddit',
        content: r.content || 'No content found',
        views: r.views || 'Verified',
        likes: r.likes || 'Signal',
        hashtags: r.hashtags || [],
        location: r.location || 'Global',
        contactStatus: r.contactStatus || 'Verified Lead',
        time: r.time || '2026',
        sourceUrl: r.sourceUrl || '#'
      }));

      return res.json(formatted);
    } catch (error: any) {
      console.error("[Server] Error during crawl search:", error);
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        return res.json({ _rateLimited: true });
      }
      return res.status(500).json({ error: "Discovery agent search failed" });
    }
  });

  // Vite integration
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
    console.log(`[Server] Core engine running on http://localhost:${PORT}`);
  });
}

startServer();
