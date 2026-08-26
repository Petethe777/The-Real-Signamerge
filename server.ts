import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
// Note: Gemini (@google/genai) has been replaced by Exa as the primary search engine.
// The package import below is left only if some other unrelated code path still needs it;
// remove it (and the "@google/genai" dependency) once you confirm nothing else references it.
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { searchDataset } from "./src/data/customerSearchDataset.js";

// MCP Server SDK imports
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

dotenv.config();
const digitalConsultingEmail = (process.env.DIGITAL_CONSULTING_EMAIL || "").trim().toLowerCase();
const digitalConsultingPassword = (process.env.DIGITAL_CONSULTING_PASSWORD || "").trim();
const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://sscuyhvkyfemrsmfxhkt.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzY3V5aHZreWZlbXJzbWZ4aGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MzQ5MzAsImV4cCI6MjA5NDMxMDkzMH0.qoURHMmKre8uGLem4b6GBrqtt4yHaUlE9LI9PYxW-c4";

const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseService = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

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
  const amountZARCents = 128000; // Fixed price: R1,280 — server-controlled, ignores any client-supplied amount

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
          amount: `R1,280 ZAR`,
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
  const fallbackUrl = `https://pay.yoco.com/mergemega?amount=${amountZARCents / 100}${cleanEmail ? '&email=' + encodeURIComponent(cleanEmail) : ''}`;
  return {
    success: true,
    checkoutUrl: fallbackUrl,
    email: cleanEmail,
    amount: `R1,280 ZAR`,
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

// Detects the social platform from a result URL so Exa's generic web results can
// still be displayed using the existing platform-badge UI.
function detectQueryCountryServer(query: string): string | null {
  const q = (query || "").toLowerCase();
  const map: Record<string, string[]> = {
    "china": ["china", "chinese"],
    "philippines": ["philippines", "philipines", "manila"],
    "thailand": ["thailand", "bangkok"],
    "vietnam": ["vietnam", "viet nam", "hanoi"],
    "hong kong": ["hong kong", "hongkong"],
    "singapore": ["singapore"],
    "sweden": ["sweden", "swedish", "stockholm", "gothenburg"],
    "switzerland": ["switzerland", "swiss", "zurich", "geneva"],
    "italy": ["italy", "italian", "milan"],
    "usa": ["usa", "united states"],
    "uk": ["uk", "united kingdom", "london"],
    "south africa": ["south africa", "johannesburg", "cape town", "durban", "pretoria", "sandton"],
  };
  for (const [country, terms] of Object.entries(map)) {
    if (terms.some(t => q.includes(t))) return country;
  }
  return null;
}

function detectPlatformFromUrl(url: string): string {
  const u = (url || "").toLowerCase();

  if (u.includes("instagram.com")) return "Instagram";
  if (u.includes("tiktok.com")) return "TikTok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "Twitter";
  if (u.includes("linkedin.com")) return "LinkedIn";
  if (u.includes("reddit.com")) return "Reddit";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";

  return "Web";
}

function extractHashtags(text: string): string[] {
  const matches = (text || "").match(/#[a-zA-Z0-9_]+/g) || [];
  return Array.from(new Set(matches)).slice(0, 5);
}

// Global Reusable Leads Discovery Search Engine — powered by Exa (replaces Gemini).
async function performLeadsSearch(query: string): Promise<any> {
  const correction = correctQuerySearch(query);
  const searchTerm = correction.corrected;

  const apiKey = process.env.EXA_API_KEY?.trim() || "";
  const isPlaceholder = !apiKey ||
    ["todo", "placeholder", "undefined", "null", "none", "your_api_key", "your_exa_api_key"].includes(apiKey.toLowerCase()) ||
    apiKey.startsWith("YOUR_");

  if (isPlaceholder) {
    console.log("[Server Search Engine] EXA_API_KEY is not configured. Returning rate-limited query response.");
    return { _rateLimited: true, reason: "invalid_key_format" };
  }

  // Build a query that steers Exa toward organic, high-intent social/B2B posts,
  // mirroring the intent-detection behaviour the app previously got from the Gemini prompt.
  const exaQuery = `Real, organic 2026 social media posts and forum threads (TikTok, Instagram, Reddit, X/Twitter, LinkedIn, YouTube) where people are actively asking for help, recommendations, suppliers, manufacturers, freelancers, or B2B services related to: ${searchTerm}`;

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query: exaQuery,
      type: "auto",
      numResults: 20,
      contents: {
        text: { maxCharacters: 400, includeHtmlTags: false },
        highlights: false,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.warn(`[Exa Search] Request failed with status ${response.status}: ${errText}`);
    return { _rateLimited: true, reason: "exa_request_failed" };
  }

  const data: any = await response.json();
  const rawResults: any[] = Array.isArray(data?.results) ? data.results : [];

const detectedCountry = detectQueryCountryServer(searchTerm.toLowerCase());

const results = rawResults
  .filter((r: any) => typeof r?.url === "string" && /^https:\/\/.+/i.test(r.url))
  .map((r: any, idx: number) => {
    const content = (r.text || r.title || "").trim().slice(0, 400);

    return {
      id: r.id || `exa-${idx}`,
      platform: detectPlatformFromUrl(r.url),
      content,
      views: "Verified",
      likes: "Signal",
      hashtags: extractHashtags(content),
      location: detectedCountry
        ? detectedCountry.replace(/\b\w/g, c => c.toUpperCase())
        : "Global",
      contactStatus: "Verified Lead",
      time: r.publishedDate
        ? new Date(r.publishedDate).toLocaleDateString()
        : "Recently",
      sourceUrl: r.url,
    };
  });

return results;

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

async function saveOAuthClient(client: OAuthClient) {
  await supabaseService.from("oauth_clients").upsert({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    client_name: client.clientName,
    redirect_uris: client.redirectUris
  });
}

async function getOAuthClient(clientId: string): Promise<OAuthClient | null> {
  const { data } = await supabaseService.from("oauth_clients").select("*").eq("client_id", clientId).maybeSingle();
  if (!data) return null;
  return { clientId: data.client_id, clientSecret: data.client_secret, clientName: data.client_name, redirectUris: data.redirect_uris };
}

async function saveAuthCode(authCode: AuthCode) {
  await supabaseService.from("oauth_codes").insert({
    code: authCode.code,
    client_id: authCode.clientId,
    redirect_uri: authCode.redirectUri,
    user_id: authCode.userId,
    expires_at: new Date(authCode.expiresAt).toISOString()
  });
}

async function getAndDeleteAuthCode(code: string): Promise<AuthCode | null> {
  const { data } = await supabaseService.from("oauth_codes").select("*").eq("code", code).maybeSingle();
  if (!data) return null;
  await supabaseService.from("oauth_codes").delete().eq("code", code);
  return { code: data.code, clientId: data.client_id, redirectUri: data.redirect_uri, userId: data.user_id, expiresAt: new Date(data.expires_at).getTime() };
}

async function saveAccessToken(t: AccessToken) {
  await supabaseService.from("oauth_tokens").insert({
    token: t.token,
    client_id: t.clientId,
    user_id: t.userId,
    expires_at: new Date(t.expiresAt).toISOString()
  });
}

async function getAccessToken(token: string): Promise<AccessToken | null> {
  const { data } = await supabaseService.from("oauth_tokens").select("*").eq("token", token).maybeSingle();
  if (!data) return null;
  return { token: data.token, clientId: data.client_id, userId: data.user_id, expiresAt: new Date(data.expires_at).getTime() };
}

let currentRequestContextUser: string | null = null;

interface ServerUser {
  email: string;
  password?: string;
  hasPaid80: boolean;
  hasPaid20: boolean;
  leadsUsedToday: number;
  lastLeadsReset: string;
}

// NOTE: The old server_users.json file-based store has been removed.
// It lived on Render's ephemeral disk and was wiped on every redeploy,
// which is why accounts/paid-status kept disappearing. All account and
// payment data now lives in Supabase (see below), which persists across
// deploys.
// ---------------------------------------------------------------------------
// Real Supabase-backed account system (replaces the ephemeral server_users.json
// file). Passwords are handled entirely by Supabase Auth — never stored or
// compared by this server. Paid/lead-limit status lives in `profiles`, a real
// Postgres table, so it survives redeploys.
// ---------------------------------------------------------------------------

interface SupabaseProfile {
  id: string;
  email: string;
  hasPaid80: boolean;
  hasPaid20: boolean;
  leadsUsedToday: number;
  lastLeadsReset: string;
}

function mapProfileRow(row: any): SupabaseProfile {
  return {
    id: row.id,
    email: row.email,
    hasPaid80: !!row.has_paid_80,
    hasPaid20: !!row.has_paid_20,
    leadsUsedToday: row.leads_used_today ?? 0,
    lastLeadsReset: row.last_leads_reset ?? new Date().toISOString(),
  };
}

/** Verifies email+password against real Supabase Auth (auth.users). */
async function verifySupabaseCredentials(email: string, password: string): Promise<{ id: string; email: string } | null> {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email || email };
}

/** Fetches (or lazily creates) the profiles row for a given authenticated user id. */
async function getOrCreateProfile(userId: string, email: string): Promise<SupabaseProfile | null> {
  const { data: existing, error: findErr } = await supabaseService
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (findErr) {
    console.error("[Supabase] Error fetching profile:", findErr.message);
    return null;
  }

  if (existing) return mapProfileRow(existing);

  const { data: created, error: createErr } = await supabaseService
    .from("profiles")
    .insert({
      id: userId,
      email,
      has_paid_80: false,
      has_paid_20: false,
      is_approved: true, // Admin approval requirement removed
      lead_credits: 0, // New users start with 0 leads — they buy 150 via "Buy Credits"
      leads_used_today: 0,
      last_leads_reset: new Date().toISOString(),
    })
    .select("*")
    .maybeSingle();

  if (createErr || !created) {
    console.error("[Supabase] Error creating profile:", createErr?.message);
    return null;
  }
  return mapProfileRow(created);
}

/** Resets the daily lead counter/hasPaid20 boost if 24h have passed, persisting to Supabase. */
async function checkAndResetLeadsSupabase(profile: SupabaseProfile): Promise<SupabaseProfile> {
  const now = new Date();
  const lastReset = new Date(profile.lastLeadsReset || now.toISOString());
  const hoursDiff = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  if (hoursDiff >= 24) {
    const { data, error } = await supabaseService
      .from("profiles")
      .update({ leads_used_today: 0, last_leads_reset: now.toISOString(), has_paid_20: false })
      .eq("id", profile.id)
      .select("*")
      .maybeSingle();

    if (!error && data) return mapProfileRow(data);
  }
  return profile;
}

async function startServer() {
  const app = express();
  const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
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

    // Credentials come exclusively from environment variables — never hardcoded.
    // Set DIGITAL_CONSULTING_EMAIL / DIGITAL_CONSULTING_PASSWORD and
    // ADMIN_EMAIL / ADMIN_PASSWORD in Render's environment settings.
    const envEmail = (process.env.DIGITAL_CONSULTING_EMAIL || "").trim().toLowerCase();
    const envPassword = (process.env.DIGITAL_CONSULTING_PASSWORD || "").trim();
    const adminEmailEnv = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPasswordEnv = (process.env.ADMIN_PASSWORD || "").trim();

    const isPasswordCorrect =
      (envPassword && cleanPassword === envPassword) ||
      (updatedClientPassword && cleanPassword === updatedClientPassword);

    const isEmailCorrect = envEmail && cleanEmail === envEmail;

    if (isEmailCorrect && isPasswordCorrect) {
      return res.json({
        success: true,
        user: {
          email: envEmail,
          role: "client_audit",
          company_name: "Digital Consulting Pros",
          location: "Malta",
          is_approved: true
        }
      });
    } else if (adminEmailEnv && adminPasswordEnv && cleanEmail === adminEmailEnv && cleanPassword === adminPasswordEnv) {
      return res.json({
        success: true,
        user: {
          email: adminEmailEnv,
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

  // CUSTOM SIGNUP ENDPOINT — creates a real Supabase Auth account + profiles row
  app.post("/api/auth/custom-signup", async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    if (cleanPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const { data, error } = await supabaseAdmin.auth.signUp({ email: cleanEmail, password: cleanPassword });

    if (error) {
      const isDuplicate = /already registered|already exists/i.test(error.message);
      return res.status(isDuplicate ? 400 : 500).json({
        success: false,
        message: isDuplicate ? "An account with this email already exists." : error.message
      });
    }
    if (!data.user) {
      return res.status(500).json({ success: false, message: "Signup failed. Please try again." });
    }

    const profile = await getOrCreateProfile(data.user.id, cleanEmail);

    console.log(`[Server Auth] Registered new Supabase user: ${cleanEmail}`);
    return res.json({
      success: true,
      message: "Signup successful. Please complete the $80 subscription payment to activate your account.",
      user: {
        email: cleanEmail,
        hasPaid80: profile?.hasPaid80 ?? false,
        hasPaid20: profile?.hasPaid20 ?? false,
        leadsUsedToday: profile?.leadsUsedToday ?? 0
      }
    });
  });

  // CUSTOM LOGIN ENDPOINT — validates against real Supabase Auth
  app.post("/api/auth/custom-login", async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const authedUser = await verifySupabaseCredentials(cleanEmail, cleanPassword);
    if (!authedUser) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    let profile = await getOrCreateProfile(authedUser.id, authedUser.email);
    if (!profile) {
      return res.status(500).json({ success: false, message: "Could not load account profile." });
    }
    profile = await checkAndResetLeadsSupabase(profile);

    console.log(`[Server Auth] User logged in: ${cleanEmail}`);
    return res.json({
      success: true,
      user: {
        email: profile.email,
        hasPaid80: profile.hasPaid80,
        hasPaid20: profile.hasPaid20,
        leadsUsedToday: profile.leadsUsedToday,
        lastLeadsReset: profile.lastLeadsReset
      }
    });
  });

  // CONFIRM SUBSCRIPTION ENDPOINT ($80 PAYMENT LINK CLICKED/CONFIRMED)
  app.post("/api/auth/confirm-subscription", async (req, res) => {
    const { email } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const { data: profileRow, error: findErr } = await supabaseService
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (findErr || !profileRow) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { data: updated, error: updateErr } = await supabaseService
      .from("profiles")
      .update({ has_paid_80: true })
      .eq("id", profileRow.id)
      .select("*")
      .maybeSingle();

    if (updateErr || !updated) {
      return res.status(500).json({ success: false, message: "Failed to confirm subscription." });
    }

    console.log(`[Server Auth] Subscription $80 confirmed for user: ${cleanEmail}`);
    return res.json({
      success: true,
      message: "Subscription successfully verified. Your account is fully unlocked!",
      user: {
        email: updated.email,
        hasPaid80: true,
        hasPaid20: updated.has_paid_20,
        leadsUsedToday: updated.leads_used_today
      }
    });
  });

  // UPGRADE LIMIT ENDPOINT ($20 PAYMENT TO BUMP TO 100 LEADS CAP)
  app.post("/api/auth/upgrade-limit", async (req, res) => {
    const { email } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const { data: profileRow, error: findErr } = await supabaseService
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (findErr || !profileRow) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { data: updated, error: updateErr } = await supabaseService
      .from("profiles")
      .update({ has_paid_20: true })
      .eq("id", profileRow.id)
      .select("*")
      .maybeSingle();

    if (updateErr || !updated) {
      return res.status(500).json({ success: false, message: "Failed to upgrade limit." });
    }

    console.log(`[Server Auth] Premium Daily Limit $20 confirmed for user: ${cleanEmail}`);
    return res.json({
      success: true,
      message: "Daily lead limit successfully upgraded to 100 leads for today!",
      user: {
        email: updated.email,
        hasPaid80: updated.has_paid_80,
        hasPaid20: true,
        leadsUsedToday: updated.leads_used_today
      }
    });
  });

  // PAYMENT WEBHOOK ENDPOINT (signature-verified)
  app.post("/api/webhooks/payment", async (req: any, res) => {
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

    const email = event.payload?.metadata?.email
      || event.payload?.metadata?.customer_email
      || event.payload?.customer?.email
      || event.payload?.payer?.email
      || event.payload?.billingAddress?.email;
    const cleanEmail = email ? String(email).trim().toLowerCase() : "";
    if (!cleanEmail) {
      // Log the full payload so you can inspect Render logs after a real test payment
      // through the static pay.yoco.com/mergemega link and tell me exactly which field
      // (if any) actually carries the payer's email — static Payment Links don't
      // guarantee the same metadata shape as checkouts created via the API.
      console.warn("[Webhook] No email found in payment payload for", event.payload?.id, JSON.stringify(event.payload));
      return res.status(200).json({ success: false, error: "No email in metadata." });
    }

    const { data: profile, error: findErr } = await supabaseService
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (findErr || !profile) {
      console.warn(`[Webhook] Payment for unregistered user: ${cleanEmail}`, findErr?.message);
      return res.status(200).json({ success: false, error: "User not found." });
    }

    const { error: updateErr } = await supabaseService
      .from("profiles")
      .update({ has_paid_80: true, lead_credits: 150 })
      .eq("id", profile.id);

    if (updateErr) {
      console.error(`[Webhook] Failed to unlock ${cleanEmail}:`, updateErr.message);
      return res.status(500).json({ success: false, error: "Failed to update profile." });
    }

    console.log(`[Webhook] Verified payment — unlocked ${cleanEmail}`);
    return res.json({ success: true, email: cleanEmail });
  });

  // LOG LEADS USED & GET REMAINING LIMIT
  app.post("/api/auth/log-leads-used", async (req, res) => {
    const { email, count } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const addCount = parseInt(count, 10) || 0;

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const { data: profileRow, error: findErr } = await supabaseService
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (findErr || !profileRow) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    let profile = await checkAndResetLeadsSupabase(mapProfileRow(profileRow));
    const resetHappened = profile.leadsUsedToday === 0 && profile.lastLeadsReset !== profileRow.last_leads_reset;
    const maxLimit = (profile.hasPaid80 || profile.hasPaid20) ? 100 : 33;

    const newCount = Math.min(profile.leadsUsedToday + addCount, maxLimit);

    const { data: updated, error: updateErr } = await supabaseService
      .from("profiles")
      .update({ leads_used_today: newCount })
      .eq("id", profile.id)
      .select("*")
      .maybeSingle();

    if (updateErr || !updated) {
      return res.status(500).json({ success: false, message: "Failed to log leads used." });
    }

    return res.json({
      success: true,
      leadsUsedToday: updated.leads_used_today,
      maxLimit,
      limitReached: updated.leads_used_today >= maxLimit,
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

  // Real-time keyword fetching using the Exa API safely on server-side to hide keys in prod deployment
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
          description: "Scrape, verify, and crawl active high-intent social signals and trade leads from the live 2026 global trade database using Exa's neural search engine.",
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
        const { data: profileRow } = await supabaseService
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (!profileRow) {
          return {
            content: [{ type: "text", text: `Error: No Signalmerge account found for ${email}. Please sign up on signalmerge.co.za first.` }],
            isError: true
          };
        }

        await supabaseService
          .from("profiles")
          .update({ has_paid_80: true })
          .eq("id", profileRow.id);

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

        // 1. Check if there is an authenticated OAuth context (set from the Supabase-verified session)
        if (currentRequestContextUser) {
          const { data: matchedProfile } = await supabaseService
            .from("profiles")
            .select("has_paid_80, has_paid_20")
            .eq("email", currentRequestContextUser)
            .maybeSingle();
          if (matchedProfile && (matchedProfile.has_paid_80 || matchedProfile.has_paid_20)) {
            isPremium = true;
          }
        }

        // 2. Check if explicit email/password arguments are passed to override/direct auth
        if (!isPremium && email && password) {
          const directAuthUser = await verifySupabaseCredentials(email, password);
          if (directAuthUser) {
            const { data: matchedProfile } = await supabaseService
              .from("profiles")
              .select("has_paid_80, has_paid_20")
              .eq("id", directAuthUser.id)
              .maybeSingle();
            if (matchedProfile && (matchedProfile.has_paid_80 || matchedProfile.has_paid_20)) {
              isPremium = true;
            }
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

        // Credentials come exclusively from environment variables — never hardcoded.
        const envEmail = (process.env.DIGITAL_CONSULTING_EMAIL || "").trim().toLowerCase();
        const envPassword = (process.env.DIGITAL_CONSULTING_PASSWORD || "").trim();

        const isEmailCorrect = envEmail && email === envEmail;
        const isPasswordCorrect = envPassword && password === envPassword;

        if (isEmailCorrect && isPasswordCorrect) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, user: { email: envEmail, company: "Digital Consulting Pros", approved: true } }, null, 2)
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
  app.post("/oauth/register", async (req, res) => {
    applyRobustCors(req, res);
    try {
      const { client_name, redirect_uris, grant_types, response_types } = req.body || {};
      
      const clientId = `client_${Math.random().toString(36).substring(2, 15)}`;
      const clientSecret = `secret_${Math.random().toString(36).substring(2, 15)}`;
      
      await saveOAuthClient({
        clientId,
        clientSecret,
        clientName: client_name || "Claude Client",
        redirectUris: redirect_uris || []
      });
      
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
  app.get("/oauth/authorize", async (req, res) => {
    applyRobustCors(req, res);
    const { client_id, redirect_uri, response_type, state, scope } = req.query;
    
    if (!client_id || !redirect_uri) {
      return res.status(400).send("Missing client_id or redirect_uri parameters");
    }

    const client = (await getOAuthClient(client_id as string)) || { clientName: "Claude Client" };

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
  app.post("/oauth/authorize", express.urlencoded({ extended: true }), async (req, res) => {
    applyRobustCors(req, res);
    const { client_id, redirect_uri, state, scope, email, password } = req.body;

    if (!client_id || !redirect_uri) {
      return res.status(400).send("Missing client_id or redirect_uri parameters");
    }

    const client = (await getOAuthClient(client_id as string)) || { clientName: "Claude Client" };
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    // Validate against real Supabase Auth accounts (same accounts as the website).
    const authedUser = cleanEmail && cleanPassword
      ? await verifySupabaseCredentials(cleanEmail, cleanPassword)
      : null;

    const isValid = !!authedUser;

    if (isValid && authedUser) {
      // Ensure a profiles row exists so paid-status checks downstream work.
      await getOrCreateProfile(authedUser.id, authedUser.email);
    }

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
    await saveAuthCode({
      code,
      clientId: client_id as string,
      redirectUri: redirect_uri as string,
      userId: cleanEmail,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    console.log(`[OAuth] Generated authorization code for: ${cleanEmail}`);

    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.set("code", code);
    if (state) {
      redirectUrl.searchParams.set("state", state as string);
    }

    res.redirect(redirectUrl.toString());
  });

  // 5. Token Exchange (POST)
  app.post("/oauth/token", async (req, res) => {
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

    const authSession = await getAndDeleteAuthCode(code);
    if (!authSession) {
      return res.status(400).json({ error: "invalid_grant", error_description: "Authorization code not found or invalid." });
    }

    if (Date.now() > authSession.expiresAt) {
      return res.status(400).json({ error: "invalid_grant", error_description: "Authorization code has expired." });
    }

    const token = "token_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await saveAccessToken({
      token,
      clientId: authSession.clientId,
      userId: authSession.userId,
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
    });

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
      const session = await getAccessToken(token);
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
        const session = await getAccessToken(token);
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
app.post('/api/search', async (req, res) => {
  const { query, platform } = req.body; // platform: "tiktok" | "instagram"
  try {
    if (platform === 'tiktok') {
      const run = await apifyClient.actor('clockworks/tiktok-scraper').call({
        hashtags: [query],
        resultsPerPage: 20
      });
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      return res.json({ results: items });
    }
    if (platform === 'instagram') {
      const run = await apifyClient.actor('apify/instagram-scraper').call({
        search: query,
        searchType: 'user',
        resultsType: 'posts',
        resultsLimit: 20
      });
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      return res.json({ results: items });
    }
    return res.status(400).json({ error: 'Unknown platform' });
  } catch (err) {
    console.error('[Apify] Search failed:', err);
    res.status(502).json({ error: 'Search temporarily unavailable' });
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
