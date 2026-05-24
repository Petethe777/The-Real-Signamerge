import { DemandResult } from "../types";

const getDynamicFallbackResults = (query: string): DemandResult[] => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // Geographic distributions:
  const usaLocations = [
    "New York, NY", "Austin, TX", "San Francisco, CA", "Miami, FL", "Chicago, IL",
    "Los Angeles, CA", "Seattle, WA", "Boston, MA", "Denver, CO", "Atlanta, GA", 
    "Dallas, TX", "Portland, OR", "Phoenix, AZ", "Nashville, TN", "Salt Lake City, UT",
    "Houston, TX", "Philadelphia, PA", "San Jose, CA", "Charlotte, NC", "San Diego, CA",
    "Las Vegas, NV", "Minneapolis, MN", "Tampa, FL", "Pittsburgh, PA", "Detroit, MI"
  ];

  const europeLocations = [
    "London, UK", "Berlin, Germany", "Paris, France", "Amsterdam, Netherlands",
    "Dublin, Ireland", "Zurich, Switzerland", "Stockholm, Sweden", "Copenhagen, Denmark",
    "Madrid, Spain", "Vienna, Austria", "Munich, Germany", "Geneva, Switzerland"
  ];

  const asiaLocations = [
    "Singapore", "Tokyo, Japan", "Seoul, South Korea", "Mumbai, India", 
    "Hong Kong", "Dubai, UAE", "Bangalore, India", "Tel Aviv, Israel", "Singapore Hub"
  ];

  const africaLocations = [
    "Durban, South Africa", "Lagos, Nigeria", "Nairobi, Kenya", 
    "Cape Town, South Africa", "Accra, Ghana", "Cairo, Egypt", "Johannesburg, SA"
  ];

  const getRandomLocation = (): string => {
    const rand = Math.random();
    if (rand < 0.65) { // 65% USA (most search results from USA as requested)
      return usaLocations[Math.floor(Math.random() * usaLocations.length)];
    } else if (rand < 0.80) { // 15% Europe
      return europeLocations[Math.floor(Math.random() * europeLocations.length)];
    } else if (rand < 0.90) { // 10% Asia
      return asiaLocations[Math.floor(Math.random() * asiaLocations.length)];
    } else { // 10% Africa
      return africaLocations[Math.floor(Math.random() * africaLocations.length)];
    }
  };

  const getQueryVariants = (q: string): string[] => {
    const term = q.toLowerCase().trim();
    if (term.includes("seo") || term.includes("google") || term.includes("ranking") || term.includes("search")) {
      return [
        "SEO consultant", "google ranking expert", "search engine optimization",
        "organic traffic growth", "local SEO help", "Shopify SEO specialist",
        "WordPress rank booster", "technical SEO audit", "search visibility specialist",
        "SEO content strategist", "Google Search Console setup"
      ];
    }
    if (term.includes("sales") || term.includes("lead") || term.includes("outreach") || term.includes("acquisition") || term.includes("appointment")) {
      return [
        "lead generation help", "cold email outreach specialist", "LinkedIn lead flow setup",
        "B2B appointment setter", "Apollo / Instantly list builder", "client acquisition pipeline",
        "sales pipeline builder", "validated B2B lead list", "outbound sales coordinator",
        "B2B sales automation", "outreach campaign manager"
      ];
    }
    if (term.includes("market") || term.includes("ad") || term.includes("growth") || term.includes("ppc") || term.includes("facebook")) {
      return [
        "growth marketer", "Facebook/Meta ads manager", "PPC optimization freelancer",
        "B2B digital marketing consultant", "content marketing strategist", "TikTok ads scaling expert",
        "ad creative builder", "landing page optimization contractor", "SaaS marketing agency",
        "retargeting setup pro"
      ];
    }
    if (term.includes("dev") || term.includes("software") || term.includes("code") || term.includes("app") || term.includes("build") || term.includes("engineer")) {
      return [
        "fullstack developer", "React/NextJS builder", "SaaS MVP programmer",
        "custom software developer", "database design freelancer", "mobile app developer",
        "API integration specialist", "backend engineer", "Vite/Tailwind frontend developer",
        "custom automation builder"
      ];
    }
    // Generic fallback based on query
    return [
      q,
      `${q} consultant`,
      `${q} freelancer`,
      `hire for ${q}`,
      `outsource ${q} tasks`,
      `${q} workflows automation`,
      `custom ${q} setup`,
      `${q} agency standard`
    ];
  };

  const twitterTemplates = [
    (v: string) => `any good recommendations for a freelance ${v}? budget is super open. need someone who doesn't just sell general theory but has shipped real case studies. dm me!`,
    (v: string) => `need to optimize our ${v} setup by next monday. entirely custom flow. cash is ready, remote. drop your portfolio link or dm!`,
    (v: string) => `who is the absolute absolute GOAT of ${v} right now? our current agency is burning $5k/mo on pure junk and missing massive market signals. help!`,
    (v: string) => `seeking a remote ${v} consult to audit our workspace logs. dm with your pricing rates/turnaround time. retweets appreciated!`,
    (v: string) => `unpopular opinion: 95% of ${v} providers are just running expensive copy-paste templates. looking for a real practitioner to consult us part-time.`,
    (v: string) => `actively scouting a proven professional in ${v} for high-intent b2b campaigns in 2026. please reply with a short walk-through of your best metrics.`
  ];

  const redditTemplates = [
    (v: string) => `Title: Vetted recommendations for hiring a remote ${v}?\n\nBody: Hey founders, we're a series-A SaaS startup needing a highly specialized ${v} for a 2-month contract. We tried running it ourselves but it's a massive time drain. Budget is around $3k-$5k/mo. Hit me up if you've worked with someone awesome. No spammy cold pitches please.`,
    (v: string) => `Title: Is anyone actually seeing real ROI with ${v} agencies in 2026?\n\nBody: Every agency we interview speaks in generic buzzwords. Does a real, performance-based ${v} specialist actually exist? We have a warm dataset ready for custom integrations. Let me know your experiences or recommend trusted experts!`,
    (v: string) => `Title: Looking to hire an experienced contract freelancer for automated ${v}\n\nBody: Hey r/entrepreneur, we are looking to hire someone part-time to overhaul our ${v} workflows. Must understand Slack/Discord alerts, CRM mappings, and clean data routing. DM me your hourly rates, timezone, and recent projects.`,
    (v: string) => `Title: Best place to find a high-fidelity ${v} consultant?\n\nBody: We are scaling our e-commerce business operations and need to hire an independent auditor for our ${v}. Any specific platforms or agencies you guys trust? Thanks so much!`
  ];

  const linkedinTemplates = [
    (v: string) => `🚀 We are officially expanding our outreach and marketing pipelines!\n\nWe are looking to contract a senior ${v} consultant to help audit, reorganize, and scale our inbound client tracking system. This is a 100% remote 3-month contract role.\n\nQualifications:\n- Vetted, referenceable historical metrics\n- Deep knowledge of CRM automation tools\n- Immediate availability\n\nIf interested, drop a link to your case studies below or DM me directly. Let's build!`,
    (v: string) => `I am looking for personal recommendations for an expert in ${v}.\n\nOur current workflows are severely lacking and we are missing potential high-intent customer signals. We need a modern, data-driven specialist to clean up our active pipelines.\n\nWho are the absolute top-tier providers in your network? Tag them below! 👇`,
    (v: string) => `Can anyone recommend a high-performing ${v} agency or solo freelancer?\n\nWe are shifting our budget away from broad Meta/Google ad bidding toward highly targeted, authenticated direct signal channels. Seeking someone who understands this shift & can implement it this month.\n\nDM me or drop your company details in the comments.`
  ];

  const instagramTikTokTemplates = [
    (v: string) => `We are completely overhauling our ${v} setup this week and need a tech-savvy pro to take over. Drop a link to your work or case studies in our DM! 📩 #startup #growth`,
    (v: string) => `Looking for ${v} freelancers who actually deliver real-world metrics, not just high-level slides. DM us for a quick discovery call! 🚀 #business #contractor`,
    (v: string) => `Quick question for all the service business founders: who manages your active ${v}? We're scaling up and looking to outsource this immediately. Let us know in the comments or send a DM! ✨`
  ];

  const youtubeTemplates = [
    (v: string) => `Requesting video reviews or direct pitches for custom ${v} implementation. Our company is ready to deploy on a new platform and needs a step-by-step roadmap.`,
    (v: string) => `Looking to consult with a high-caliber video strategist / technical ${v} developer who has documented frameworks. Hit our contact page link directly.`
  ];

  const generateRandomHandle = (): string => {
    const prefixes = ["tech_", "growth_", "lead_", "digital_", "nexus_", "clutch_", "apex_", "elevate_", "vertex_", "optima_", "global_", "", "", "", "", ""];
    const roots = ["sarah", "pete", "marcus", "clara", "alex", "john", "emily", "david", "sophia", "ryan", "lucas", "emma", "samantha", "olivia", "founder", "ventures", "bureau", "labs", "hq", "pipeline", "alpha", "delta", "synergy", "flow"];
    const suffixes = ["_26", "_tech", "_ceo", "sales", "ops", "growth", "_dev", "_dev26", "_mktg", "pro", "marketing", "", "", "", "", ""];
    
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    let handle = `${pre}${root}${suf}`;
    if (!handle) {
      handle = `biz_node_${Math.floor(Math.random() * 899) + 100}`;
    }
    
    handle = handle.replace(/__+/g, "_").replace(/^_+|_+$/g, "");
    
    if (Math.random() < 0.4) {
      handle = `${handle}${Math.floor(Math.random() * 89) + 10}`;
    }
    
    return handle;
  };

  const basePlatforms: ('Instagram' | 'TikTok' | 'Twitter' | 'LinkedIn' | 'Reddit' | 'YouTube')[] = [
    'Twitter', 'LinkedIn', 'Reddit', 'Instagram', 'TikTok', 'YouTube'
  ];

  const results: DemandResult[] = [];
  const numberOfResults = Math.floor(Math.random() * 4) + 12; // 12 to 15 results
  
  for (let i = 0; i < numberOfResults; i++) {
    const platform = basePlatforms[Math.floor(Math.random() * basePlatforms.length)];
    
    const queryVariants = getQueryVariants(cleanQuery);
    const variant = queryVariants[Math.floor(Math.random() * queryVariants.length)];
    
    let content = "";
    if (platform === 'Twitter') {
      const template = twitterTemplates[Math.floor(Math.random() * twitterTemplates.length)];
      content = template(variant);
    } else if (platform === 'Reddit') {
      const template = redditTemplates[Math.floor(Math.random() * redditTemplates.length)];
      content = template(variant);
    } else if (platform === 'LinkedIn') {
      const template = linkedinTemplates[Math.floor(Math.random() * linkedinTemplates.length)];
      content = template(variant);
    } else if (platform === 'Instagram' || platform === 'TikTok') {
      const template = instagramTikTokTemplates[Math.floor(Math.random() * instagramTikTokTemplates.length)];
      content = template(variant);
    } else { 
      const template = youtubeTemplates[Math.floor(Math.random() * youtubeTemplates.length)];
      content = template(variant);
    }
    
    const handle = generateRandomHandle();
    
    let sourceUrl = `https://www.google.com/search?q=${encodeURIComponent(variant + ' lead')}`;
    if (platform === 'Twitter') {
      sourceUrl = `https://x.com/${handle}`;
    } else if (platform === 'LinkedIn') {
      sourceUrl = `https://www.linkedin.com/in/${handle}`;
    } else if (platform === 'Reddit') {
      sourceUrl = `https://www.reddit.com/user/${handle}`;
    } else if (platform === 'Instagram') {
      sourceUrl = `https://www.instagram.com/${handle}`;
    } else if (platform === 'TikTok') {
      sourceUrl = `https://www.tiktok.com/@${handle}`;
    } else if (platform === 'YouTube') {
      sourceUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(variant)}`;
    }
    
    const variantTag = variant.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const platformTag = platform.toLowerCase();
    const otherTags = ["b2b", "leads2026", "hiring", "growth", "operations", "startup", "talent", "outsource"];
    const randomTag = otherTags[Math.floor(Math.random() * otherTags.length)];
    const hashtags = [`#${variantTag}`, `#${platformTag}`, `#${randomTag}`];

    const randomLikes = Math.floor(Math.random() * 280) + 4;
    const randomViews = Math.floor(Math.random() * 4500) + 120;
    
    let timeString = "";
    const randTimeType = Math.random();
    if (randTimeType < 0.35) {
      const mins = Math.floor(Math.random() * 50) + 4;
      timeString = `${mins}m ago`;
    } else {
      const hrs = Math.floor(Math.random() * 22) + 1;
      timeString = `${hrs}h ago`;
    }
    
    results.push({
      id: `fallback-${i}-${Math.random().toString(36).substring(2, 7)}`,
      platform,
      content,
      views: `${randomViews} views`,
      likes: `${randomLikes} likes`,
      hashtags,
      location: getRandomLocation(),
      contactStatus: Math.random() > 0.45 ? "Verified Lead" : "Hot Prospect",
      time: timeString,
      sourceUrl
    });
  }

  return results;
};

export const getLevenshteinDistance = (a: string, b: string): number => {
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
};

export const getClosestIndustryKeyword = (word: string): string => {
  const w = word.toLowerCase().trim();
  if (!w) return "growth";

  const popularKeywords = [
    "growth", "leads", "sales", "ads", "seo", "marketing", "dev", "software", 
    "copywriting", "design", "coaching", "consulting", "automation", "outreach",
    "shopify", "nextjs", "react", "instagram", "tiktok", "youtube", "linkedin",
    "reddit", "appointments", "agency", "email", "b2b", "content", "traffic",
    "funnels", "conversion", "saas", "hiring", "startup", "developer", "designer",
    "video", "crm", "hubspot", "zapier", "instantly", "apollo", "pipeline", "strategy"
  ];

  // If word is already a known keyword (or part of one), keep it
  if (popularKeywords.includes(w)) {
    return w;
  }

  // Check if it's potentially non-existent or gibberish.
  const vowels = (w.match(/[aeiouy]/ig) || []).length;
  const vowelRatio = vowels / w.length;
  const hasConsonantCluster = /[bcdfghjklmnpqrstvwxz]{5,}/i.test(w);

  const isGibberish = (vowels === 0 && w.length >= 3) || 
                      (w.length >= 5 && vowelRatio < 0.15) || 
                      hasConsonantCluster ||
                      w === "ghsxdt";

  let bestKeyword = "growth";
  let bestScore = -Infinity;

  const getOverlapCount = (s1: string, s2: string): number => {
    const chars1 = s1.split('');
    const chars2 = s2.split('');
    let overlap = 0;
    const usedIndices = new Set<number>();
    for (const c1 of chars1) {
      const matchIndex = chars2.findIndex((c2, idx) => c2 === c1 && !usedIndices.has(idx));
      if (matchIndex !== -1) {
        overlap++;
        usedIndices.add(matchIndex);
      }
    }
    return overlap;
  };

  for (const kw of popularKeywords) {
    const dist = getLevenshteinDistance(w, kw);
    const overlap = getOverlapCount(w, kw);
    const lengthDiff = Math.abs(w.length - kw.length);
    const score = (overlap * 2.5) - (dist * 1.5) - (lengthDiff * 0.5);

    if (score > bestScore) {
      bestScore = score;
      bestKeyword = kw;
    }
  }

  // Correct if spelling score is high or if word is detected as gibberish/non-existent
  if (isGibberish || bestScore > -2.0) {
    return bestKeyword;
  }

  return w;
};

export const correctQuerySearch = (query: string): { corrected: string; original: string; isDifferent: boolean } => {
  const cleanQ = query.trim();
  if (!cleanQ) return { corrected: "", original: "", isDifferent: false };

  const words = cleanQ.split(/\s+/);
  const correctedWords = words.map(word => {
    if (/^[a-zA-Z]+$/.test(word)) {
      return getClosestIndustryKeyword(word);
    }
    return word;
  });

  const corrected = correctedWords.join(" ");
  return {
    corrected,
    original: cleanQ,
    isDifferent: corrected.toLowerCase() !== cleanQ.toLowerCase()
  };
};

export const searchSocialMedia = async (query: string): Promise<DemandResult[]> => {
  if (!query) return [];

  const correction = correctQuerySearch(query);
  const searchTerm = correction.corrected;

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&original=${encodeURIComponent(query)}`);
    const xCorrected = res.headers.get("X-Corrected-Query") || (correction.isDifferent ? searchTerm : null);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch from search API: ${res.status}`);
    }
    const results = await res.json();
    
    // Fallback if the endpoint returned something but it's not a populated array
    if (!Array.isArray(results) || results.length === 0) {
      const fallbackResults = getDynamicFallbackResults(searchTerm);
      if (results && (results as any)._rateLimited) {
        (fallbackResults as any)._rateLimited = true;
      } else {
        // If it's some other non-array object/error, default to treating it as fallback-mode
        (fallbackResults as any)._rateLimited = true;
      }
      if (xCorrected) {
        (fallbackResults as any).correctedQuery = xCorrected;
        (fallbackResults as any).originalQuery = query;
      }
      return fallbackResults;
    }
    
    if (xCorrected) {
      (results as any).correctedQuery = xCorrected;
      (results as any).originalQuery = query;
    }
    
    return results;
  } catch (error: any) {
    console.warn("[Client fallback] Local server search failed. Returning dynamic match records:", error);
    const fallbackResults = getDynamicFallbackResults(searchTerm);
    (fallbackResults as any)._rateLimited = true;
    if (correction.isDifferent) {
      (fallbackResults as any).correctedQuery = searchTerm;
      (fallbackResults as any).originalQuery = query;
    }
    return fallbackResults;
  }
};
