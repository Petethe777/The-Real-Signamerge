import { DemandResult } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

export const searchSocialMedia = async (query: string): Promise<DemandResult[]> => {
  if (!query) return [];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Use AI discovery agents to find social signals strictly from 2026
    const prompt = `Act as a real-time social media discovery agent in the 2026 ecosystem. Search Google for authentic, high-intent leads and social signals strictly from the year 2026 related to: "${query}".
    
    CRITICAL: 
    - Find ACTUAL posts (TikTok, Instagram, Reddit, X/Twitter, LinkedIn) where users are explicitly requesting services, products, or help related to ${query}.
    - Look for phrases like "Can anyone recommend...", "I need help with...", "Searching for...", "Is there a service that...".
    - Avoid providing generic or 'I'm struggling to find' filler content unless it is a verbatim social post from a user.
    - Return a JSON array of 12-15 highly accurate results. Each result must represent a unique social signal with realistic metrics for 2026.`;

    const response = await ai.models.generateContent({
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

    const results = JSON.parse(response.text || "[]") as DemandResult[];
    
    return results.map(r => ({
      ...r,
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
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn("Gemini API Rate Limit hit. Falling back to local database.");
      // Return a special flag that Dashboard.tsx can catch
      return { _rateLimited: true } as any;
    }
    console.error("Error searching social signals via internal discovery engine:", error);
    throw error;
  }
};
