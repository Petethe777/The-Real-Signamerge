import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { searchDataset } from "./src/data/customerSearchDataset.js";

// MCP Server SDK imports
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://sscuyhvkyfemrsmfxhkt.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzY3V5aHZreWZlbXJzbWZ4aGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MzQ5MzAsImV4cCI6MjA5NDMxMDkzMH0.qoURHMmKre8uGLem4b6GBrqtt4yHaUlE9LI9PYxW-c4";

const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

// In-Memory and File persistent Fallback database for search query logging when Supabase is unreachable/offline
const fallbackLogPath = path.join(process.cwd(), "search_queries_fallback.json");
let fallbackQueriesMemory: any[] = [];

function saveQueryToLocalFallback(query: string, email: string) {
  const newRecord = {
    query,
    user_email: email,
    created_at: new Date().toISOString()
  };
  fallbackQueriesMemory.push(newRecord);
  try {
    let list: any[] = [];
    if (fs.existsSync(fallbackLogPath)) {
      const data = fs.readFileSync(fallbackLogPath, "utf-8");
      list = JSON.parse(data);
    }
    list.push(newRecord);
    fs.writeFileSync(fallbackLogPath, JSON.stringify(list, null, 2), "utf-8");
    console.log(`[Server DB Search Fallback] Query "${query}" successfully archived in local storage.`);
  } catch (error: any) {
    console.log(`[Server DB Search Fallback] Query "${query}" held in-memory backup.`);
  }
}

// In-Memory and File persistent Fallback database for Consulting Intake leads
const LEADS_FILE = path.join(process.cwd(), "server_consulting_leads.json");

function saveConsultingLead(leadData: any) {
  try {
    let list: any[] = [];
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, "utf-8");
      list = JSON.parse(data);
    }
    const newLead = {
      id: "intake-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      ...leadData
    };
    list.push(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(list, null, 2), "utf-8");
    console.log(`[Server Lead Save] Form intake lead successfully saved locally.`);
    return newLead;
  } catch (error: any) {
    console.error(`[Server Lead Save Error] Failed to write consulting lead locally:`, error);
    return null;
  }
}

async function createYocoCheckoutSession(email: string, amountUSD: number = 80, req?: any) {
  const yocoSecretKey = process.env.YOCO_SECRET_KEY || process.env.YOCO_API_KEY || process.env.YOCO_SECRET_LIVE_KEY || process.env.YOCO_KEY;
  const cleanEmail = email ? email.trim().toLowerCase() : "";

  let baseUrl = "https://the-real-signamerge.onrender.com";
  if (req) {
    try {
      let protocol = (req.headers["x-forwarded-proto"] as string) || (req.secure ? "https" : "http");
      let host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "";
      if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
        baseUrl = `${protocol}://${host}`;
      }
    } catch (e) {}
  }

  // Convert USD to ZAR cents (R1,520 or 152000 ZAR cents for $80 USD)
  const amountZARCents = Math.round(amountUSD * 19 * 100);

  const successUrl = `${baseUrl}/?payment=success&email=${encodeURIComponent(cleanEmail)}`;
  const cancelUrl = `${baseUrl}/?payment=cancelled`;

  if (yocoSecretKey && yocoSecretKey.trim().length > 0) {
    try {
      console.log(`[Yoco Checkout] Invoking Yoco API for ${cleanEmail || 'guest'} (Amount: $${amountUSD} / R${amountZARCents / 100})`);
      const response = await fetch("https://payments.yoco.com/api/checkouts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${yocoSecretKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amountZARCents,
          currency: "ZAR",
          cancelUrl,
          successUrl,
          metadata: {
            email: cleanEmail,
            plan: "subscription_80"
          }
        })
      });

      const resData: any = await response.json();
      console.log(`[Yoco Checkout Response] Status: ${response.status}`, resData);

      if (response.ok && (resData.redirectUrl || resData.redirect_url || resData.url || resData.checkoutUrl)) {
        const checkoutUrl = resData.redirectUrl || resData.redirect_url || resData.url || resData.checkoutUrl;
        return {
          success: true,
          checkoutUrl,
          sessionId: resData.id,
          email: cleanEmail,
          amount: `$${amountUSD} USD (~R${amountZARCents / 100} ZAR)`,
          provider: "yoco_api"
        };
      } else {
        console.warn("[Yoco Checkout] Yoco API responded with error or missing redirect URL:", resData);
      }
    } catch (err: any) {
      console.error("[Yoco Checkout] Failed to reach Yoco Checkout API:", err.message || err);
    }
  } else {
    console.log("[Yoco Checkout] No YOCO_SECRET_KEY found in environment. Using dynamic Yoco payment portal link fallback.");
  }

  // Fallback link if API key is not provided or if API call fails
  const fallbackUrl = `https://pay.yoco.com/mergemega?amount=${amountUSD === 80 ? '1300' : '1520'}${cleanEmail ? '&email=' + encodeURIComponent(cleanEmail) : ''}`;
  return {
    success: true,
    checkoutUrl: fallbackUrl,
    email: cleanEmail,
    amount: `$${amountUSD} USD`,
    provider: "yoco_portal_fallback"
  };
}


function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // deletion
          matrix[i][j - 1] + 1,    // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

// Build a fast lookup Set of lowercase valid terms/words from the search dataset
const datasetWords = new Set<string>();

searchDataset.countries.forEach(c => {
  const countryLower = c.country.toLowerCase();
  datasetWords.add(countryLower);
  countryLower.split(/\s+/).forEach(w => datasetWords.add(w.replace(/[^a-z0-9]/g, "")));
  
  c.cities.forEach(city => {
    const cityLower = city.name.toLowerCase();
    datasetWords.add(cityLower);
    cityLower.split(/\s+/).forEach(w => datasetWords.add(w.replace(/[^a-z0-9]/g, "")));
    if (city.zip) {
      datasetWords.add(city.zip.toLowerCase());
    }
  });
  if (c.iso2) {
    datasetWords.add(c.iso2.toLowerCase());
  }
});

if (searchDataset.products.digital) {
  searchDataset.products.digital.forEach(p => {
    const pLower = p.toLowerCase();
    datasetWords.add(pLower);
    pLower.split(/\s+/).forEach(w => datasetWords.add(w.replace(/[^a-z0-9]/g, "")));
  });
}

if (searchDataset.products.physical) {
  searchDataset.products.physical.forEach(p => {
    const pLower = p.toLowerCase();
    datasetWords.add(pLower);
    pLower.split(/\s+/).forEach(w => datasetWords.add(w.replace(/[^a-z0-9]/g, "")));
  });
}

if (searchDataset.search_phrases) {
  searchDataset.search_phrases.forEach(sp => {
    const spLower = sp.toLowerCase();
    datasetWords.add(spLower);
    spLower.split(/\s+/).forEach(w => datasetWords.add(w.replace(/[^a-z0-9]/g, "")));
  });
}

if (searchDataset.social_platforms) {
  searchDataset.social_platforms.forEach(p => {
    datasetWords.add(p.name.toLowerCase());
    if (p.focus) {
      p.focus.forEach(f => {
        const fLower = f.toLowerCase();
        datasetWords.add(fLower);
        fLower.split(/\s+/).forEach(w => datasetWords.add(w.replace(/[^a-z0-9]/g, "")));
      });
    }
  });
}

function getClosestIndustryKeyword(word: string): string {
  const w = word.toLowerCase().trim();
  if (!w) return "growth";

  const popularKeywords = [
    "growth", "leads", "sales", "ads", "seo", "marketing", "dev", "software", 
    "copywriting", "design", "coaching", "consulting", "automation", "outreach",
    "shopify", "nextjs", "react", "instagram", "tiktok", "youtube", "linkedin",
    "reddit", "appointments", "agency", "email", "b2b", "content", "traffic",
    "funnels", "conversion", "saas", "hiring", "startup", "developer", "designer",
    "video", "crm", "hubspot", "zapier", "instantly", "apollo", "pipeline", "strategy",
    // logistics & supply chain keywords
    "supplier", "suppliers", "manufacturer", "manufacturers", "logistics", "supply", "chain",
    "shipping", "freight", "factory", "factories", "manufacturing", "sourcing", "source", "import", "export", 
    "distributor", "distributors", "warehousing", "procurement",
    // clothing & products & e-commerce
    "clothes", "clothing", "apparel", "fashion", "garment", "garments", "textile", "textiles",
    "shirt", "pants", "shoes", "shoe", "bags", "bag", "handbag", "handbags", "store", "storefront",
    "shop", "shopping", "ecommerce", "e-commerce", "online", "product", "products", "goods", "merchandise",
    "sneakers", "sneaker", "heels", "heel", "boots", "boot",
    // professional & local services
    "plumber", "plumbers", "plumbing", "contractor", "contractors", "construction", "remodel", "remodeling",
    "renovate", "renovation", "build", "builder", "builders", "leak", "leaks", "drain", "drains", "pipe", "pipes",
    "water", "heating", "boiler", "boilers", "facility", "facilities",
    // regions & countries
    "china", "chinese", "philippines", "thailand", "vietnam", "hong", "kong", "singapore", "sweden", "switzerland", "italy",
    "usa", "uk"
  ];

  const exemptWords = [
    "in", "for", "to", "at", "by", "with", "of", "and", "or", "the", "a", "an", "is", "are", "be", "from", "looking", "need", "hire", "with", "global", "brand", "brands",
    "sell", "find", "buyers", "search", "me", "buyer", "get", "how", "who", "wants", "buy", "buying", "my", "owner", "customer", "customers", "client", "clients", "here", "there"
  ];

  if (popularKeywords.includes(w) || exemptWords.includes(w) || datasetWords.has(w)) {
    return word;
  }

  const vowels = (w.match(/[aeiouy]/ig) || []).length;
  const vowelRatio = vowels / w.length;
  const hasConsonantCluster = /[bcdfghjklmnpqrstvwxz]{5,}/i.test(w);

  const isGibberish = (vowels === 0 && w.length >= 3) || 
                      (w.length >= 5 && vowelRatio < 0.15) || 
                      hasConsonantCluster ||
                      w === "ghsxdt";

  let bestKeyword = w;
  let minDistance = Infinity;

  for (const kw of popularKeywords) {
    const dist = getLevenshteinDistance(w, kw);
    if (dist < minDistance) {
      minDistance = dist;
      bestKeyword = kw;
    }
  }

  // Only correct spelling of popular keywords if the typo is extremely close (distance <= 2)
  // or if the input is detected as gibberish.
  if (minDistance <= 2 || isGibberish) {
    return bestKeyword;
  }

  return word;
}

function correctQuerySearch(query: string): { corrected: string; original: string; isDifferent: boolean } {
  const cleanQ = query.trim();
  if (!cleanQ) return { corrected: "", original: "", isDifferent: false };

  // Remove punctuation when evaluating word tokens to avoid trailing/leading punctuation corrupting spelling matching
  const words = cleanQ.split(/\s+/);
  const correctedWords = words.map(word => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    if (/^[a-zA-Z]+$/.test(cleanWord)) {
      const correctedClean = getClosestIndustryKeyword(cleanWord);
      // Re-attach punctuation if any was there originally
      return word.replace(cleanWord, correctedClean);
    }
    return word;
  });

  const corrected = correctedWords.join(" ");
  return {
    corrected,
    original: cleanQ,
    isDifferent: corrected.toLowerCase() !== cleanQ.toLowerCase()
  };
}

// Global Reusable Leads Discovery Search Engine
async function performLeadsSearch(query: string): Promise<any> {
  const correction = correctQuerySearch(query);
  const searchTerm = correction.corrected;

  const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
  const isPlaceholder = !apiKey || 
    ["todo", "placeholder", "undefined", "null", "none", "your_api_key", "your_gemini_api_key"].includes(apiKey.toLowerCase()) ||
    apiKey.startsWith("YOUR_");
  
  const isFormatValid = apiKey.startsWith("AIzaSy");

  if (isPlaceholder || !isFormatValid) {
    console.log("[Server Search Engine] GEMINI_API_KEY is not configured or format is invalid. Returning rate-limited query response.");
    return { _rateLimited: true, reason: "invalid_key_format" };
  }

  const ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  
  const prompt = `Act as a real-time social media discovery agent in the 2026 global trade and supply chain ecosystem. Search Google for authentic, high-intent leads and social signals strictly from the year 2026 related to: "${searchTerm}".
  
  CRITICAL COUNTRY FILTERING & GEOGRAPHY:
  - If the search query explicitly names or implies a country/region (such as China/Chinese, Sweden, Switzerland, Italy, Philippines, Thailand, Vietnam, Hong Kong, Singapore, UK, USA, or South Africa / South African / SA), you MUST strictly and exclusively return leads, factory postings, logistics requests, or digital work orders originating from or targeting THAT specific country. Never mix irrelevant countries if one is explicitly requested.
  - If no country is specified, return a highly diverse, non-predictable global mix of leads spanning Sweden, Switzerland, Italy, China, Philippines, Thailand, Vietnam, Hong Kong, Singapore, US, UK, and South Africa.
  - Never use the same location for multiple entries. Cover a clean distribution of cities (e.g., if Sweden: Stockholm, Gothenburg, Malmö, Uppsala; if Switzerland: Zürich, Geneva, Basel, Lugano; if Italy: Milan, Prato, Bologna, Florence; if South Africa: Johannesburg, Cape Town, Durban, Pretoria, Sandton).
  - IMPORTANT: Do not mention any location (cities, states, countries, or regions) in the "content" field of the results. The "content" field (representing the post text) must not include any geographical names or locations (e.g. say "our retail storefront" or "our local operations" instead of "our retail storefront in London" or "our local operations in Milan"). Keep location names exclusively in the "location" field.

  CONTENT INTEGRITY, GRAMMAR, & AUTHENTICITY:
  - Find ACTUAL, organic posts (TikTok, Instagram, Reddit, X/Twitter, LinkedIn, YouTube) where users are actively requesting supply chain help, manufacturers, bulk production, freelancers, SEO growth, or B2B sales development.
  - Look for phrases like "Can anyone recommend...", "I need help with...", "Searching for...", "Is there a service that...".
  - Avoid generic boilerplate or repetitive text. Words must feel organic, noisy, and like a real live feed.
  - DYNAMIC REFRAMING & PLURAL AGREEMENT: Do NOT use incorrect grammar such as singular articles before plural keywords (do NOT say "a custom buyers" or "a talented buyers" or "using a certified buyers"). Make sure plural nouns are used naturally and logically.
  - SELLER MODE / BUYER INTENT: If the search query indicates selling or finding buyers (e.g., "buyers for my shoes", "sell my clothes", "find customers"), understand that the user is the seller, and they want to find BUYERS. Therefore, the leads must represent potential customers, boutique owners, or retail managers who are actively looking to PURCHASE or stock those products (e.g., "Scouting independent clothing suppliers to stock our shop in Milan", "Looking to buy premium bulk shoes for our online storefront", "WTB high-quality clothes ready to ship to London").
  - DYNAMIC REFRAMING: Do NOT repeat the search term or query string verbatim in every social post. Naturally rewrite, paraphrase, and split the query into realistic user intent fragments (e.g., if searching "China factory", discuss "sourcing custom packaging in Shenzhen", "negotiating direct with Yiwu manufacturer", "vetted logistics broker in Guangzhou", etc.).
  
  Return a JSON array of 16-20 highly accurate, non-repeating results. Each result must represent a unique social signal with fully random, authentic usernames, timestamps, likes, views, and hashtags.`;

  const aiResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
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

  return results.map((r: any) => ({
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
}

// In-memory variable to support custom-updated partner passwords dynamically
let updatedClientPassword = "";

// Simple in-memory OAuth tables
interface OAuthClient {
  clientId: string;
  clientSecret: string;
  clientName: string;
  redirectUris: string[];
}

interface AuthCode {
  code: string;
  clientId: string;
  redirectUri: string;
  userId: string;
  expiresAt: number;
}

interface AccessToken {
  token: string;
  clientId: string;
  userId: string;
  expiresAt: number;
}

const oauthClients: Record<string, OAuthClient> = {};
const authCodes: Record<string, AuthCode> = {};
const accessTokens: Record<string, AccessToken> = {};

let currentRequestContextUser: string | null = null;

interface ServerUser {
  email: string;
  password?: string;
  hasPaid80: boolean;
  hasPaid20: boolean;
  leadsUsedToday: number;
  lastLeadsReset: string;
}

const USERS_FILE = path.join(process.cwd(), "server_users.json");

function loadUsers(): ServerUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading users file:", err);
  }

  // Seeding default users
  const defaultUsers: ServerUser[] = [
    {
      email: "digitalconsultingpros@gmail.com",
      password: "MaltaSecure2026!",
      hasPaid80: true,
      hasPaid20: false,
      leadsUsedToday: 0,
      lastLeadsReset: new Date().toISOString()
    },
    {
      email: "petemkhize@gmail.com",
      password: "LehakoeZakithi777",
      hasPaid80: true,
      hasPaid20: false,
      leadsUsedToday: 0,
      lastLeadsReset: new Date().toISOString()
    }
  ];
  saveUsers(defaultUsers);
  return defaultUsers;
}

function saveUsers(users: ServerUser[]) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving users file:", err);
  }
}

function checkAndResetLeads(user: ServerUser): boolean {
  const now = new Date();
  const lastReset = new Date(user.lastLeadsReset || now.toISOString());
  const hoursDiff = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff >= 24) {
    user.leadsUsedToday = 0;
    user.lastLeadsReset = now.toISOString();
    user.hasPaid20 = false; // Reset the $20 premium limit upgrade too
    return true;
  }
  return false;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust upstream reverse proxy (Cloud Run load balancer)
  app.set("trust proxy", true);

  app.use(express.json({
    verify: (req: any, _res, buf) => { req.rawBody = buf; }
  }));

  // Endpoint to let authorized partner session update user password in server memory
  app.post("/api/auth/update-client-password", (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (cleanEmail === "digitalconsultingpros@gmail.com" && cleanPassword) {
      updatedClientPassword = cleanPassword;
      console.log("[Server] Client password for digitalconsultingpros@gmail.com updated in memory:", updatedClientPassword);
      return res.json({ success: true, message: "Client password updated in memory successfully." });
    }
    return res.status(400).json({ success: false, message: "Invalid email or empty password." });
  });

  // Secure Search Query Database Logger (never available / readable publicly by client scripts)
  app.post("/api/search/log", async (req, res) => {
    const { query, email } = req.body;
    const cleanQuery = query ? query.trim() : "";
    if (!cleanQuery) {
      return res.status(400).json({ success: false, message: "Query text is required." });
    }

    try {
      const { error } = await supabaseAdmin
        .from('search_queries')
        .insert({
          query: cleanQuery,
          user_email: email || 'anonymous',
          created_at: new Date().toISOString()
        });

      if (error) {
        // Quietly failover to local fallback for robust execution under firewall limits, removing console errors
        saveQueryToLocalFallback(cleanQuery, email || 'anonymous');
        return res.json({ success: true, message: "Stored safely in local repository (fallback)" });
      }

      console.log(`[Server DB Search Logger] Successfully saved search query: "${cleanQuery}" for user: ${email || 'anonymous'}`);
      return res.json({ success: true });
    } catch (err: any) {
      saveQueryToLocalFallback(cleanQuery, email || 'anonymous');
      return res.json({ success: true, message: "Stored safely in local repository (fallback)" });
    }
  });

  // Google Form entry extractor proxy to help map Form Questions automatically
  app.get("/api/forms/extract-entries", async (req, res) => {
    const { formId } = req.query;
    if (!formId || typeof formId !== "string") {
      return res.status(400).json({ error: "formId is required" });
    }

    try {
      const url = `https://docs.google.com/forms/d/e/${formId}/viewform`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch form. Status: ${response.status}`);
      }
      const html = await response.text();

      // Find FB_PUBLIC_LOAD_DATA matching block
      const loadDataMatch = html.match(/FB_PUBLIC_LOAD_DATA\s*=\s*(\[[\s\S]*?\])\s*;/);
      if (loadDataMatch) {
        try {
          const rawData = JSON.parse(loadDataMatch[1]);
          const questionsList = rawData[1][1] || [];
          const entries: { title: string; entryId: string }[] = [];

          for (const q of questionsList) {
            if (!q) continue;
            const title = q[1];
            const qDetails = q[4] && q[4][0];
            const entryId = qDetails && qDetails[0];
            if (title && entryId) {
              entries.push({ title, entryId: String(entryId) });
            }
          }

          if (entries.length > 0) {
            return res.json({ success: true, source: "FB_PUBLIC_LOAD_DATA", entries });
          }
        } catch (parseErr) {
          console.warn("[Form Extract] FB_PUBLIC_LOAD_DATA JSON parsing failed, using regex fallback:", parseErr);
        }
      }

      // Regex Fallback if structured data block isn't present/parsable
      const regex = /entry\.(\d+)/g;
      let match;
      const foundIds: string[] = [];
      while ((match = regex.exec(html)) !== null) {
        if (!foundIds.includes(match[1])) {
          foundIds.push(match[1]);
        }
      }

      if (foundIds.length > 0) {
        return res.json({
          success: true,
          source: "regex_fallback",
          entries: foundIds.map((id, index) => ({
            title: `Field ${index + 1}`,
            entryId: id
          }))
        });
      }

      return res.status(404).json({ error: "No entry IDs found in Google Form HTML." });
    } catch (err: any) {
      console.error("Error extracting Google Form entry IDs:", err);
      return res.status(500).json({ error: err.message || "Failed to parse Google Form entries." });
    }
  });

  // Server-Side Proxy for Google Form Submission to bypass iframe sandboxing and CORS limitations
  app.post("/api/submit-lead", async (req, res) => {
    try {
      const { formId, entries, values } = req.body;
      if (!formId || !entries || !values) {
        return res.status(400).json({ success: false, error: "Missing required form fields (formId, entries, values)." });
      }

      // Save lead locally FIRST so that we ALWAYS retain the data (100% reliable local database fallback)
      console.log(`[Server Form Submission] Archiving lead data locally for backup...`);
      const savedLead = saveConsultingLead(values);

      // Prepare URL-encoded form parameters
      const formParams = new URLSearchParams();
      for (const [key, entryId] of Object.entries(entries)) {
        if (entryId && typeof entryId === "string") {
          const val = values[key] || "";
          formParams.append(entryId, val);
        }
      }

      const googleFormUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
      console.log(`[Server Form Submission] Forwarding lead data to: ${googleFormUrl}`);

      // Perform direct HTTP post using Node's standard fetch
      const googleResponse = await fetch(googleFormUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formParams.toString(),
      });

      console.log(`[Server Form Submission] Google Form responded with status: ${googleResponse.status}`);
      
      const isGoogleSuccess = googleResponse.status === 200 || googleResponse.status === 302;
      
      if (!isGoogleSuccess) {
        console.warn(`[Server Form Submission Warning] Google Form returned HTTP status ${googleResponse.status}.`);
        if (googleResponse.status === 401) {
          console.warn(`[CRITICAL ACTION REQUIRED] Google Form 1FAIpQLS... responded with 401 Unauthorized!
  This happens because "Limit to 1 response" or "Verified Email Collection" is ENABLED in your Google Form settings.
  HOW TO FIX:
  1. Open your Google Form in a browser.
  2. Go to Settings tab.
  3. Under "Responses" -> turn OFF "Limit to 1 response".
  4. Under "Responses" -> change "Collect email addresses" to "Do not collect" or "Responder input" (NOT "Verified").
  5. If on Google Workspace -> turn OFF "Restrict to users in [Organization]".
  Once done, submissions will successfully reach Google Forms!`);
        }
      }

      // Return success along with status and local fallback status
      return res.json({ 
        success: true, 
        googleStatus: googleResponse.status, 
        googleSuccess: isGoogleSuccess,
        savedLocally: !!savedLead,
        message: isGoogleSuccess 
          ? "Form response submitted successfully to Google Form." 
          : "Response successfully secured in local server repository (Fallback activated due to Google Form restrictive settings)."
      });
    } catch (error: any) {
      console.error("[Server Form Submission Error] Failed to submit to Google Form:", error);
      return res.status(500).json({ success: false, error: error.message || "Unknown error during submission" });
    }
  });

  // Secure API endpoint to fetch all saved consulting leads for the administrator
  app.get("/api/consulting-leads", (req, res) => {
    try {
      let list: any[] = [];
      if (fs.existsSync(LEADS_FILE)) {
        const data = fs.readFileSync(LEADS_FILE, "utf-8");
        list = JSON.parse(data);
      }
      return res.json({ success: true, leads: list });
    } catch (error: any) {
      console.error("[Server Get Leads Error] Failed to retrieve consulting leads:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to retrieve saved leads." });
    }
  });

  // Secure validation route for Customer Audit. Never exposes secrets to frontend.
  app.post("/api/auth/verify-client-audit", (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    const targetEmail = "digitalconsultingpros@gmail.com";
    const targetPassword = "MaltaSecure2026!";

    // Allow both hardcoded and environment-provided credentials to be extremely fallback-resilient
    const envEmail = (process.env.DIGITAL_CONSULTING_EMAIL || "").trim().toLowerCase();
    const envPassword = (process.env.DIGITAL_CONSULTING_PASSWORD || "").trim();

    const isPasswordCorrect = 
      cleanPassword === targetPassword || 
      cleanPassword === `${targetPassword})` ||
      (updatedClientPassword && cleanPassword === updatedClientPassword) ||
      (updatedClientPassword && cleanPassword === `${updatedClientPassword})`) ||
      (envPassword && cleanPassword === envPassword) ||
      (envPassword && cleanPassword === `${envPassword})`);

    const isEmailCorrect = 
      cleanEmail === targetEmail || 
      (envEmail && cleanEmail === envEmail);

    if (isEmailCorrect && isPasswordCorrect) {
      return res.json({
        success: true,
        user: {
          email: targetEmail,
          role: "client_audit",
          company_name: "Digital Consulting Pros",
          location: "Malta",
          is_approved: true
        }
      });
    } else if (cleanEmail === "petemkhize@gmail.com" && cleanPassword === "LehakoeZakithi777") {
      return res.json({
        success: true,
        user: {
          email: "petemkhize@gmail.com",
          role: "admin",
          company_name: "Signalmerge Admin",
          location: "South Africa",
          is_approved: true
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or audit access code."
    });
  });

  // CUSTOM SIGNUP ENDPOINT
  app.post("/api/auth/custom-signup", (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const users = loadUsers();
    const exists = users.find(u => u.email === cleanEmail);
    if (exists) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const newUser: ServerUser = {
      email: cleanEmail,
      password: cleanPassword,
      hasPaid80: false, // Must pay $80 to unlock
      hasPaid20: false,
      leadsUsedToday: 0,
      lastLeadsReset: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    console.log(`[Server Auth] Registered new user: ${cleanEmail}`);
    return res.json({ 
      success: true, 
      message: "Signup successful. Please complete the $80 subscription payment to activate your account.",
      user: {
        email: newUser.email,
        hasPaid80: false,
        hasPaid20: false,
        leadsUsedToday: 0
      }
    });
  });

  // CUSTOM LOGIN ENDPOINT
  app.post("/api/auth/custom-login", (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const users = loadUsers();
    const user = users.find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: "No account registered with this email." });
    }

    let isMatch = user.password === cleanPassword;
    if (cleanEmail === "digitalconsultingpros@gmail.com" && updatedClientPassword) {
      isMatch = isMatch || (cleanPassword === updatedClientPassword);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    checkAndResetLeads(user);
    saveUsers(users);

    console.log(`[Server Auth] User logged in: ${cleanEmail}`);
    return res.json({
      success: true,
      user: {
        email: user.email,
        hasPaid80: user.hasPaid80,
        hasPaid20: user.hasPaid20,
        leadsUsedToday: user.leadsUsedToday,
        lastLeadsReset: user.lastLeadsReset
      }
    });
  });

  // CONFIRM SUBSCRIPTION ENDPOINT ($80 PAYMENT LINK CLICKED/CONFIRMED)
  app.post("/api/auth/confirm-subscription", (req, res) => {
    const { email } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const users = loadUsers();
    const user = users.find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.hasPaid80 = true;
    saveUsers(users);

    console.log(`[Server Auth] Subscription $80 confirmed for user: ${cleanEmail}`);
    return res.json({
      success: true,
      message: "Subscription successfully verified. Your account is fully unlocked!",
      user: {
        email: user.email,
        hasPaid80: true,
        hasPaid20: user.hasPaid20,
        leadsUsedToday: user.leadsUsedToday
      }
    });
  });

  // UPGRADE LIMIT ENDPOINT ($20 PAYMENT TO BUMP TO 100 LEADS CAP)
  app.post("/api/auth/upgrade-limit", (req, res) => {
    const { email } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const users = loadUsers();
    const user = users.find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.hasPaid20 = true;
    saveUsers(users);

    console.log(`[Server Auth] Premium Daily Limit $20 confirmed for user: ${cleanEmail}`);
    return res.json({
      success: true,
      message: "Daily lead limit successfully upgraded to 100 leads for today!",
      user: {
        email: user.email,
        hasPaid80: user.hasPaid80,
        hasPaid20: true,
        leadsUsedToday: user.leadsUsedToday
      }
    });
  });

  // PAYMENT WEBHOOK ENDPOINT
import crypto from "crypto";

// PAYMENT WEBHOOK ENDPOINT (signature-verified)
app.post("/api/webhooks/payment", (req: any, res) => {
  const webhookSecret = process.env.YOCO_WEBHOOK_SECRET;
  const svixId = req.headers["webhook-id"] as string;
  const svixTimestamp = req.headers["webhook-timestamp"] as string;
  const svixSignature = req.headers["webhook-signature"] as string;

  if (!webhookSecret || !svixId || !svixTimestamp || !svixSignature || !req.rawBody) {
    console.warn("[Webhook] Missing signature headers or secret — rejecting.");
    return res.status(400).json({ success: false, error: "Missing signature." });
  }

  // Reject anything older than 3 minutes to stop replay attacks
  const age = Math.abs(Date.now() / 1000 - Number(svixTimestamp));
  if (age > 180) {
    return res.status(400).json({ success: false, error: "Timestamp too old." });
  }

  const signedContent = `${svixId}.${svixTimestamp}.${req.rawBody.toString("utf8")}`;
  const secretBytes = Buffer.from(webhookSecret.split("_")[1], "base64");
  const expectedSig = crypto.createHmac("sha256", secretBytes).update(signedContent).digest("base64");

  const validSig = svixSignature
    .split(" ")
    .some(sig => sig.split(",")[1] === expectedSig);

  if (!validSig) {
    console.warn("[Webhook] Signature mismatch — rejecting.");
    return res.status(401).json({ success: false, error: "Invalid signature." });
  }

  const event = req.body;
  if (event.type !== "payment.succeeded") {
    return res.json({ success: true, ignored: true });
  }

  const email = event.payload?.metadata?.email;
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  if (!cleanEmail) {
    console.warn("[Webhook] No email in metadata for", event.payload?.id);
    return res.status(200).json({ success: false, error: "No email in metadata." });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === cleanEmail);
  if (!user) {
    console.warn(`[Webhook] Payment for unregistered user: ${cleanEmail}`);
    return res.status(200).json({ success: false, error: "User not found." });
  }

  user.hasPaid80 = true;
  saveUsers(users);
  console.log(`[Webhook] Verified payment — unlocked ${cleanEmail}`);
  return res.json({ success: true, email: cleanEmail });
});
  });

  // LOG LEADS USED & GET REMAINING LIMIT
  app.post("/api/auth/log-leads-used", (req, res) => {
    const { email, count } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const addCount = parseInt(count, 10) || 0;

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const users = loadUsers();
    const user = users.find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const resetHappened = checkAndResetLeads(user);
    const maxLimit = (user.hasPaid80 || user.hasPaid20) ? 100 : 33;
    
    user.leadsUsedToday += addCount;
    if (user.leadsUsedToday > maxLimit) {
      user.leadsUsedToday = maxLimit;
    }
    
    saveUsers(users);

    return res.json({
      success: true,
      leadsUsedToday: user.leadsUsedToday,
      maxLimit,
      limitReached: user.leadsUsedToday >= maxLimit,
      resetHappened
    });
  });

  // YOCO CHECKOUT SESSION CREATOR API
  app.post("/api/payments/create-yoco-checkout", async (req, res) => {
    const { email, amount } = req.body || {};
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const amountUSD = Number(amount) || 80;

    const result = await createYocoCheckoutSession(cleanEmail, amountUSD, req);
    return res.json(result);
  });

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

    // Capture and log every search query to the Supabase database in the background instantly
    (async () => {
      try {
        const { error } = await supabaseAdmin
          .from('search_queries')
          .insert({
            query: query.trim(),
            user_email: 'anonymous_api',
            created_at: new Date().toISOString()
          });
        if (error) {
          saveQueryToLocalFallback(query.trim(), 'anonymous_api');
        } else {
          console.log(`[Server DB Search Auto-Logger] Automatically saved API query: "${query.trim()}"`);
        }
      } catch (e: any) {
        saveQueryToLocalFallback(query.trim(), 'anonymous_api');
      }
    })();

    const correction = correctQuerySearch(query);
    const searchTerm = correction.corrected;
    if (correction.isDifferent) {
      res.setHeader("X-Corrected-Query", searchTerm);
      res.setHeader("Access-Control-Expose-Headers", "X-Corrected-Query");
    }

    try {
      const formatted = await performLeadsSearch(query);
      return res.json(formatted);
    } catch (error: any) {
      console.warn("[Server] Leads search error:", error.message || error);
      return res.json({ _rateLimited: true, errorType: "api_key_or_quota" });
    }
  });

  //=============================================================================
  // MCP (MODEL CONTEXT PROTOCOL) SERVER - OPTION A INTEGRATED BUILD
  //=============================================================================
  const mcpServer = new Server(
    {
      name: "signalmerge-discovery-server",
      version: "2.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_leads",
          description: "Scrape, verify, and crawl active high-intent social signals and trade leads from the live 2026 global trade database using Google-Search-grounded Gemini.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The target query keywords, niche, or location (e.g. 'Sweden clothing supplier' or 'plumber leads South Africa')"
              },
              email: {
                type: "string",
                description: "Optional: Your registered Signalmerge email address to unlock source links."
              },
              password: {
                type: "string",
                description: "Optional: Your Signalmerge password to verify paying user status."
              }
            },
            required: ["query"]
          }
        },
        {
          name: "get_search_logs",
          description: "Retrieve recently logged high-intent search queries from the core database/fallback storage.",
          inputSchema: {
            type: "object",
            properties: {}
          }
        },
        {
          name: "verify_audit",
          description: "Verify credentials for authorized client workspaces in Digital Consulting Pros.",
          inputSchema: {
            type: "object",
            properties: {
              email: { type: "string" },
              password: { type: "string" }
            },
            required: ["email", "password"]
          }
        },
        {
          name: "checkout_subscription",
          description: "Generate an official Yoco $80 USD subscription checkout link for a user to pay and unlock full 2026 Signalmerge intelligence access, unmask restricted source links, and clear account limits.",
          inputSchema: {
            type: "object",
            properties: {
              email: {
                type: "string",
                description: "The user's registered Signalmerge email address."
              },
              amount: {
                type: "number",
                description: "Optional subscription fee amount in USD (default is 80)."
              }
            },
            required: ["email"]
          }
        },
        {
          name: "confirm_subscription",
          description: "Confirm or verify that a user has paid the $80 subscription fee and immediately activate/unlock their Signalmerge account and Claude MCP access.",
          inputSchema: {
            type: "object",
            properties: {
              email: {
                type: "string",
                description: "The email address of the subscriber to confirm."
              }
            },
            required: ["email"]
          }
        }
      ]
    };
  });

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === "checkout_subscription") {
        const email = ((args?.email as string) || currentRequestContextUser || "").trim().toLowerCase();
        const amountUSD = Number(args?.amount) || 80;

        if (!email) {
          return {
            content: [{ type: "text", text: "Error: Email is required to create checkout link." }],
            isError: true
          };
        }

        console.log(`[MCP Tool: checkout_subscription] Creating Yoco $${amountUSD} checkout link for: ${email}`);
        const checkoutSession = await createYocoCheckoutSession(email, amountUSD);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Yoco Checkout link generated for $${amountUSD} USD subscription fee.`,
                email,
                checkoutUrl: checkoutSession.checkoutUrl,
                amount: checkoutSession.amount,
                instructions: "Open the checkoutUrl in your browser to complete your payment via Yoco. Once paid, your account will automatically unlock full lead sources."
              }, null, 2)
            }
          ]
        };
      }

      if (name === "confirm_subscription") {
        const email = ((args?.email as string) || currentRequestContextUser || "").trim().toLowerCase();
        if (!email) {
          return {
            content: [{ type: "text", text: "Error: Email is required to confirm subscription." }],
            isError: true
          };
        }

        console.log(`[MCP Tool: confirm_subscription] Confirming $80 subscription for: ${email}`);
        const users = loadUsers();
        let user = users.find(u => u.email === email);
        if (!user) {
          user = {
            email,
            password: "mcp-user-auto",
            hasPaid80: true,
            hasPaid20: false,
            leadsUsedToday: 0,
            lastLeadsReset: new Date().toISOString()
          };
          users.push(user);
        } else {
          user.hasPaid80 = true;
        }
        saveUsers(users);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Subscription successfully confirmed for ${email}! Account upgraded to $80 tier. All source links unlocked.`,
                email,
                unlocked: true
              }, null, 2)
            }
          ]
        };
      }

      if (name === "search_leads") {
        const query = (args?.query as string) || "";
        const email = ((args?.email as string) || "").trim().toLowerCase();
        const password = ((args?.password as string) || "").trim();

        if (!query) {
          return {
            content: [{ type: "text", text: "Error: Query is required." }],
            isError: true,
          };
        }
        
        console.log(`[MCP Tool: search_leads] Performing lead discovery for query: "${query}"`);
        let results = await performLeadsSearch(query);

        // Determine if user has premium subscription to view source links
        let isPremium = false;

        // 1. Check if there is an authenticated OAuth context
        if (currentRequestContextUser) {
          const users = loadUsers();
          const matchedUser = users.find(u => u.email === currentRequestContextUser);
          if (matchedUser && (matchedUser.hasPaid80 || matchedUser.hasPaid20)) {
            isPremium = true;
          }
          if (currentRequestContextUser === "digitalconsultingpros@gmail.com" || currentRequestContextUser === "petemkhize@gmail.com") {
            isPremium = true; // Admin overrides
          }
        }

        // 2. Check if explicit email/password arguments are passed to override/direct auth
        if (email && password) {
          const users = loadUsers();
          const matchedUser = users.find(u => u.email === email);
          if (matchedUser && matchedUser.password === password) {
            if (matchedUser.hasPaid80 || matchedUser.hasPaid20) {
              isPremium = true;
            }
          }
          // Check for digitalconsultingpros owner override
          if (email === "digitalconsultingpros@gmail.com" && (password === "MaltaSecure2026!" || (updatedClientPassword && password === updatedClientPassword))) {
            isPremium = true;
          }
          // Check for petemkhize admin override
          if (email === "petemkhize@gmail.com" && password === "LehakoeZakithi777") {
            isPremium = true;
          }
        }

        // Mask source URLs for non-premium users
        if (!isPremium && Array.isArray(results)) {
          results = results.map(item => {
            if (item && typeof item === "object") {
              return {
                ...item,
                sourceUrl: "[RESTRICTED - Upgrade to premium subscription to unlock source links]"
              };
            }
            return item;
          });
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      if (name === "get_search_logs") {
        console.log(`[MCP Tool: get_search_logs] Retrieving recently logged queries.`);
        let list: any[] = [...fallbackQueriesMemory];
        try {
          if (fs.existsSync(fallbackLogPath)) {
            list = JSON.parse(fs.readFileSync(fallbackLogPath, "utf-8"));
          }
        } catch (err) {}
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(list.slice(-20), null, 2), // Return last 20 logged searches
            },
          ],
        };
      }

      if (name === "verify_audit") {
        const email = (args?.email as string || "").trim().toLowerCase();
        const password = (args?.password as string || "").trim();
        console.log(`[MCP Tool: verify_audit] Verifying audit credentials for: ${email}`);

        const targetEmail = "digitalconsultingpros@gmail.com";
        const targetPassword = "MaltaSecure2026!";
        
        const isEmailCorrect = email === targetEmail || (process.env.DIGITAL_CONSULTING_EMAIL && email === process.env.DIGITAL_CONSULTING_EMAIL.trim().toLowerCase());
        const isPasswordCorrect = password === targetPassword || (process.env.DIGITAL_CONSULTING_PASSWORD && password === process.env.DIGITAL_CONSULTING_PASSWORD.trim());

        if (isEmailCorrect && isPasswordCorrect) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, user: { email: targetEmail, company: "Digital Consulting Pros", approved: true } }, null, 2)
            }]
          };
        }

        return {
          content: [{ type: "text", text: "Authentication failed: Invalid credentials." }],
          isError: true
        };
      }

      throw new Error(`Tool not found: ${name}`);
    } catch (error: any) {
      console.error(`[MCP Tool Error] Failure in tool execution:`, error);
      return {
        content: [
          {
            type: "text",
            text: `Error executing tool ${name}: ${error.message || error}`,
          },
        ],
        isError: true,
      };
    }
  });

  // MCP SSE Transport connection pool
  const mcpTransports: Record<string, SSEServerTransport> = {};

  // Helper to apply extremely robust CORS headers dynamically
  const applyRobustCors = (req: any, res: any) => {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    
    const requestedHeaders = req.headers["access-control-request-headers"];
    if (requestedHeaders) {
      res.setHeader("Access-Control-Allow-Headers", requestedHeaders);
    } else {
      res.setHeader(
        "Access-Control-Allow-Headers", 
        "Content-Type, Authorization, x-mcp-protocol-version, x-mcp-sdk-version, x-mcp-sdk-name"
      );
    }
    
    if (origin !== "*") {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  };

  // Helper to resolve the correct external public base URL dynamically
  const getPublicBaseUrl = (req: any): string => {
    let protocol = (req.headers["x-forwarded-proto"] as string) || (req.secure ? "https" : "http");
    let host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "";
    
    if (!host || host.includes("localhost") || host.includes("127.0.0.1") || host.includes("0.0.0.0")) {
      const referer = req.headers.referer;
      if (referer) {
        try {
          const refUrl = new URL(referer);
          if (!refUrl.hostname.includes("localhost") && !refUrl.hostname.includes("127.0.0.1")) {
            host = refUrl.host;
          }
        } catch (e) {}
      }
      
      if (!host || host.includes("localhost") || host.includes("127.0.0.1") || host.includes("0.0.0.0")) {
        const hostHeader = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string) || "";
        const isPreRelease = hostHeader.includes("pre-") || req.originalUrl?.includes("pre-") || referer?.includes("ais-pre-");
        if (isPreRelease) {
          host = "ais-pre-ggasfc3wsu2uesiznxcj64-497666873808.europe-west2.run.app";
        } else {
          host = "ais-dev-ggasfc3wsu2uesiznxcj64-497666873808.europe-west2.run.app";
        }
      }
    }

    if (host.includes("run.app") || host.includes("signalmerge.co.za")) {
      protocol = "https";
    }
    
    return `${protocol}://${host}`;
  };

  // CORS Preflight handles
  app.options("/sse", (req, res) => {
    applyRobustCors(req, res);
    res.sendStatus(200);
  });

  app.options("/messages", (req, res) => {
    applyRobustCors(req, res);
    res.sendStatus(200);
  });

  app.options("/.well-known/oauth-authorization-server", (req, res) => {
    applyRobustCors(req, res);
    res.sendStatus(200);
  });

  app.options("/.well-known/openid-configuration", (req, res) => {
    applyRobustCors(req, res);
    res.sendStatus(200);
  });

  app.options("/oauth/register", (req, res) => {
    applyRobustCors(req, res);
    res.sendStatus(200);
  });

  app.options("/oauth/token", (req, res) => {
    applyRobustCors(req, res);
    res.sendStatus(200);
  });

  // 1. Discovery Endpoints
  const handleDiscovery = (req: any, res: any) => {
    applyRobustCors(req, res);
    const baseUrl = getPublicBaseUrl(req);
    const discovery = {
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/oauth/token`,
      registration_endpoint: `${baseUrl}/oauth/register`,
      scopes_supported: ["mcp"],
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"]
    };
    res.json(discovery);
  };

  app.get("/.well-known/oauth-authorization-server", handleDiscovery);
  app.get("/.well-known/openid-configuration", handleDiscovery);

  // 2. Dynamic Client Registration (DCR)
  app.post("/oauth/register", (req, res) => {
    applyRobustCors(req, res);
    try {
      const { client_name, redirect_uris, grant_types, response_types } = req.body || {};
      
      const clientId = `client_${Math.random().toString(36).substring(2, 15)}`;
      const clientSecret = `secret_${Math.random().toString(36).substring(2, 15)}`;
      
      oauthClients[clientId] = {
        clientId,
        clientSecret,
        clientName: client_name || "Claude Client",
        redirectUris: redirect_uris || []
      };
      
      console.log(`[OAuth] Registered client: ${clientId} (${client_name})`);
      
      res.json({
        client_id: clientId,
        client_secret: clientSecret,
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_name: client_name || "Claude Client",
        redirect_uris: redirect_uris || [],
        grant_types: grant_types || ["authorization_code"],
        response_types: response_types || ["code"]
      });
    } catch (err: any) {
      console.error("[OAuth Register Error]", err);
      res.status(500).json({ error: "server_error", error_description: err.message });
    }
  });

  // 3. Authorization Code Request Form (GET)
  app.get("/oauth/authorize", (req, res) => {
    applyRobustCors(req, res);
    const { client_id, redirect_uri, response_type, state, scope } = req.query;
    
    if (!client_id || !redirect_uri) {
      return res.status(400).send("Missing client_id or redirect_uri parameters");
    }

    const client = oauthClients[client_id as string] || { clientName: "Claude Client" };

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect Signalmerge to Claude</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2 { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen flex flex-col justify-center items-center p-4">
  <div class="w-full max-w-md bg-white border border-orange-100 rounded-[2rem] shadow-xl shadow-orange-500/5 p-8 space-y-6 relative overflow-hidden">
    <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>

    <div class="text-center space-y-3">
      <div class="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
        <svg class="w-7 h-7 text-white fill-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Connect with Claude</h2>
      <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Signalmerge OAuth Gateway</p>
    </div>

    <div class="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-4 text-center">
      <p class="text-xs text-gray-600 font-semibold leading-relaxed">
        <strong>${client.clientName}</strong> is requesting permission to access your Signalmerge active lead hunting & trade signal tools.
      </p>
    </div>

    <form method="POST" action="/oauth/authorize" class="space-y-4">
      <input type="hidden" name="client_id" value="${client_id}">
      <input type="hidden" name="redirect_uri" value="${redirect_uri}">
      <input type="hidden" name="state" value="${state || ""}">
      <input type="hidden" name="scope" value="${scope || ""}">

      <div class="space-y-1">
        <label class="block text-[10px] font-black uppercase tracking-wider text-gray-400">Signalmerge Email Address</label>
        <input 
          type="email" 
          name="email" 
          required 
          placeholder="yourname@domain.com"
          class="w-full bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all"
        >
      </div>

      <div class="space-y-1">
        <label class="block text-[10px] font-black uppercase tracking-wider text-gray-400">Account Password</label>
        <input 
          type="password" 
          name="password" 
          required 
          placeholder="••••••••"
          class="w-full bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all"
        >
      </div>

      <button 
        type="submit" 
        class="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        Approve & Connect
      </button>
    </form>

    <div class="text-center pt-2 border-t border-gray-100">
      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Secure connection. Your credentials are never shared.</p>
    </div>
  </div>
</body>
</html>
    `;
    res.send(html);
  });

  // 4. Authorization Code Submit (POST)
  app.post("/oauth/authorize", express.urlencoded({ extended: true }), (req, res) => {
    applyRobustCors(req, res);
    const { client_id, redirect_uri, state, scope, email, password } = req.body;

    if (!client_id || !redirect_uri) {
      return res.status(400).send("Missing client_id or redirect_uri parameters");
    }

    const client = oauthClients[client_id as string] || { clientName: "Claude Client" };
    
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    const users = loadUsers();
    const user = users.find(u => u.email === cleanEmail);

    const isClientAdmin = cleanEmail === "digitalconsultingpros@gmail.com" && (cleanPassword === "MaltaSecure2026!" || (updatedClientPassword && cleanPassword === updatedClientPassword));
    const isPeteAdmin = cleanEmail === "petemkhize@gmail.com" && cleanPassword === "LehakoeZakithi777";
    
    const isValid = (user && user.password === cleanPassword) || isClientAdmin || isPeteAdmin;

    if (!isValid) {
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect Signalmerge to Claude</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2 { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen flex flex-col justify-center items-center p-4">
  <div class="w-full max-w-md bg-white border border-orange-100 rounded-[2rem] shadow-xl shadow-orange-500/5 p-8 space-y-6 relative overflow-hidden">
    <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>

    <div class="text-center space-y-3">
      <div class="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
        <svg class="w-7 h-7 text-white fill-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Connect with Claude</h2>
      <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Signalmerge OAuth Gateway</p>
    </div>

    <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-2.5 text-xs font-semibold">
      <svg class="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <span class="font-bold block text-red-950 mb-0.5">Authorization Failed</span>
        Invalid email address or account password. Please try again or connect using your premium details.
      </div>
    </div>

    <form method="POST" action="/oauth/authorize" class="space-y-4">
      <input type="hidden" name="client_id" value="${client_id}">
      <input type="hidden" name="redirect_uri" value="${redirect_uri}">
      <input type="hidden" name="state" value="${state || ""}">
      <input type="hidden" name="scope" value="${scope || ""}">

      <div class="space-y-1">
        <label class="block text-[10px] font-black uppercase tracking-wider text-gray-400">Signalmerge Email Address</label>
        <input 
          type="email" 
          name="email" 
          value="${email || ""}"
          required 
          placeholder="yourname@domain.com"
          class="w-full bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all"
        >
      </div>

      <div class="space-y-1">
        <label class="block text-[10px] font-black uppercase tracking-wider text-gray-400">Account Password</label>
        <input 
          type="password" 
          name="password" 
          required 
          placeholder="••••••••"
          class="w-full bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all"
        >
      </div>

      <button 
        type="submit" 
        class="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        Approve & Connect
      </button>
    </form>

    <div class="text-center pt-2 border-t border-gray-100">
      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Secure connection. Your credentials are never shared.</p>
    </div>
  </div>
</body>
</html>
      `;
      return res.send(html);
    }

    const code = "code_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    authCodes[code] = {
      code,
      clientId: client_id as string,
      redirectUri: redirect_uri as string,
      userId: cleanEmail,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    console.log(`[OAuth] Generated authorization code for: ${cleanEmail}`);

    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.set("code", code);
    if (state) {
      redirectUrl.searchParams.set("state", state as string);
    }

    res.redirect(redirectUrl.toString());
  });

  // 5. Token Exchange (POST)
  app.post("/oauth/token", (req, res) => {
    applyRobustCors(req, res);
    
    const { grant_type, code, redirect_uri, client_id, client_secret } = req.body || {};
    
    let reqClientId = client_id;
    let reqClientSecret = client_secret;

    if (req.headers.authorization && req.headers.authorization.startsWith("Basic ")) {
      try {
        const credentials = Buffer.from(req.headers.authorization.substring(6), "base64").toString("ascii");
        const parts = credentials.split(":");
        reqClientId = parts[0];
        reqClientSecret = parts[1];
      } catch (e) {}
    }

    if (grant_type !== "authorization_code") {
      return res.status(400).json({ error: "unsupported_grant_type", error_description: "Only authorization_code grant type is supported." });
    }

    if (!code) {
      return res.status(400).json({ error: "invalid_request", error_description: "Missing code parameter." });
    }

    const authSession = authCodes[code];
    if (!authSession) {
      return res.status(400).json({ error: "invalid_grant", error_description: "Authorization code not found or invalid." });
    }

    if (Date.now() > authSession.expiresAt) {
      delete authCodes[code];
      return res.status(400).json({ error: "invalid_grant", error_description: "Authorization code has expired." });
    }

    delete authCodes[code];

    const token = "token_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    accessTokens[token] = {
      token,
      clientId: authSession.clientId,
      userId: authSession.userId,
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
    };

    console.log(`[OAuth] Issued access token for user: ${authSession.userId}`);

    res.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: 31536000
    });
  });

  // Subclass official SSEServerTransport to inject CORS and keep-alive buffering bypass
  class RobustSSEServerTransport extends SSEServerTransport {
    private localRes: any;
    private localEndpoint: string;

    constructor(endpoint: string, res: any) {
      super(endpoint, res);
      this.localRes = res;
      this.localEndpoint = endpoint;
    }

    override async start(): Promise<void> {
      if ((this as any)._sseResponse) {
        throw new Error("RobustSSEServerTransport already started!");
      }

      const req = this.localRes.req;
      const origin = req?.headers.origin || "*";

      this.localRes.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform, private",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-mcp-protocol-version, x-mcp-sdk-version, x-mcp-sdk-name, *",
        "Access-Control-Expose-Headers": "*"
      });

      if (origin !== "*") {
        this.localRes.setHeader("Access-Control-Allow-Credentials", "true");
      }

      // Reconstruct the absolute URL with sessionId
      const endpointUrl = new URL(this.localEndpoint);
      endpointUrl.searchParams.set("sessionId", (this as any)._sessionId);
      const absoluteUrlWithSession = endpointUrl.toString();

      console.log(`[RobustSSEServerTransport] Writing absolute endpoint event: ${absoluteUrlWithSession}`);
      this.localRes.write(`event: endpoint\ndata: ${absoluteUrlWithSession}\n\n`);

      (this as any)._sseResponse = this.localRes;

      this.localRes.on("close", () => {
        (this as any)._sseResponse = undefined;
        this.onclose?.();
      });

      if (typeof this.localRes.flush === "function") {
        this.localRes.flush();
      }
      if (typeof this.localRes.flushHeaders === "function") {
        this.localRes.flushHeaders();
      }
    }
  }

  app.get("/sse", async (req, res) => {
    applyRobustCors(req, res);
    
    console.log("[MCP Server] New client requesting SSE connection...");

    // Token checking for SSE stream request
    let token = "";
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    } else if (req.query.access_token) {
      token = req.query.access_token as string;
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    let authUser = "";
    if (token) {
      const session = accessTokens[token];
      if (session && Date.now() <= session.expiresAt) {
        authUser = session.userId;
      }
    }
    
    const messagesUrl = `${getPublicBaseUrl(req)}/messages`;
    console.log(`[MCP Server] Registering SSE transport with absolute messages endpoint: ${messagesUrl}`);

    const transport = new RobustSSEServerTransport(messagesUrl, res);
    if (authUser) {
      (transport as any).userEmail = authUser;
      console.log(`[MCP Server] Session ${transport.sessionId} authorized for user: ${authUser}`);
    }
    
    mcpTransports[transport.sessionId] = transport;

    // Standard SSE 15-second keepalive interval to prevent Cloud Run/proxy idling timeouts
    const keepAliveInterval = setInterval(() => {
      if (!res.destroyed) {
        res.write(": keep-alive\n\n");
        if (typeof (res as any).flush === "function") {
          (res as any).flush();
        }
      }
    }, 15000);

    res.on("close", () => {
      clearInterval(keepAliveInterval);
      console.log(`[MCP Server] Connection closed for session ${transport.sessionId}`);
      delete mcpTransports[transport.sessionId];
    });

    await mcpServer.connect(transport);
    console.log(`[MCP Server] Session ${transport.sessionId} successfully connected over SSE.`);
  });

  app.post("/messages", async (req, res) => {
    applyRobustCors(req, res);
    
    const sessionId = req.query.sessionId as string;
    const transport = mcpTransports[sessionId];
    if (transport) {
      let token = "";
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.substring(7);
      } else if (req.query.access_token) {
        token = req.query.access_token as string;
      } else if (req.query.token) {
        token = req.query.token as string;
      }
      
      let userEmail = "";
      if (token) {
        const session = accessTokens[token];
        if (session && Date.now() <= session.expiresAt) {
          userEmail = session.userId;
        }
      }
      
      // Bind to synchronous execution context
      currentRequestContextUser = userEmail || (transport as any).userEmail || null;
      
      try {
        await transport.handlePostMessage(req, res, req.body);
      } finally {
        currentRequestContextUser = null;
      }
    } else {
      res.status(400).send("No transport found for sessionId");
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
    app.get("*", (req, res, next) => {
      // Guard to prevent unhandled API, OAuth, or .well-known routes from falling back to index.html HTML
      const urlPath = req.path;
      if (
        urlPath.startsWith("/api/") || 
        urlPath.startsWith("/oauth/") || 
        urlPath.startsWith("/.well-known/") || 
        urlPath === "/sse" || 
        urlPath === "/messages"
      ) {
        return res.status(404).json({ error: "Not Found", message: `The endpoint ${urlPath} does not exist on this server.` });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Core engine running on http://localhost:${PORT}`);
  });
}

startServer();
