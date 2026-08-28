import { DemandResult } from "../types";
import { searchDataset } from "../data/customerSearchDataset";

export function scrubLocationFromContent(content: string, loc: string): string {
  if (!content) return "";
  let clean = content;
  
  if (loc) {
    const parts = loc
      .split(/[\s,/\-\(\)]+/)
      .map(p => p.trim())
      .filter(p => p.length > 2 && !["and", "the", "for", "with", "from"].includes(p.toLowerCase()));
      
    parts.forEach(part => {
      const escaped = part.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      clean = clean.replace(regex, '');
    });
  }

  // Remove common geographic labels just in case
  const commonLocationWords = [
    "London", "New York", "NYC", "San Francisco", "Austin", "TX", "Seattle", "WA", "Italy", "Rome", "Milan", "Como", 
    "China", "Shenzhen", "Hong Kong", "Hongkong", "Singapore", "Vietnam", "Hanoi", "Philippines", "Manila",
    "Sweden", "Stockholm", "Switzerland", "Zurich", "Geneva", "Swiss", "United States", "USA", "United Kingdom", "UK",
    "South Africa", "Johannesburg", "Cape Town", "Durban", "Pretoria", "California", "Germany", "France", "Japan", "Paris", "Tokyo",
    "Stockholm port distribution", "Prato fashion industrial zone", "Shenzhen region"
  ];
  
  commonLocationWords.forEach(word => {
    const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    clean = clean.replace(regex, '');
  });

  // Clean up dangling prepositions and spaces
  clean = clean
    .replace(/\b(in|around|near|based in|to|out of|area of|from|around the|in the|for)\s+([,.;?!]|$|\s)/gi, '$2')
    .replace(/\b(in|around|near|based in|to|out of|area of|from|around the|in the|for)\s+$/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;?!])/g, '$1')
    .trim();

  return clean;
}

export const detectQueryCountry = (query: string): string | null => {
  const q = query.toLowerCase().trim();
  
  // First check direct country names in query
  for (const c of searchDataset.countries) {
    const countryName = c.country.toLowerCase();
    if (q.includes(countryName)) {
      return c.country.toLowerCase();
    }
    // Check if ISO2 code is matched as a discrete word
    const iso = c.iso2.toLowerCase();
    const isoRegex = new RegExp(`\\b${iso}\\b`, "i");
    if (isoRegex.test(q)) {
      return c.country.toLowerCase();
    }
    
    // Check if any of the cities are explicitly named
    for (const city of c.cities) {
      const cityName = city.name.toLowerCase();
      const cityRegex = new RegExp(`\\b${cityName}\\b`, "i");
      if (cityRegex.test(q)) {
        return c.country.toLowerCase();
      }
    }
  }

  // Fallback helper for adjectives/common variations
  if (q.includes("south african") || q.includes(" sa ")) return "south africa";
  if (q.includes("chinese")) return "china";
  if (q.includes("swedish")) return "sweden";
  if (q.includes("swiss")) return "switzerland";
  if (q.includes("italian")) return "italy";
  if (q.includes("american") || q.includes("us ")) return "united states";
  if (q.includes("british")) return "united kingdom";
  
  return null;
};

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

  // Check if it's potentially non-existent or gibberish.
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
};

export const correctQuerySearch = (query: string): { corrected: string; original: string; isDifferent: boolean } => {
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
};

export const searchSocialMedia = async (query: string, email?: string): Promise<DemandResult[]> => {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    return [];
  }

  const emailParam = email ? `&email=${encodeURIComponent(email.trim().toLowerCase())}` : "";
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(cleanQuery)}${emailParam}`
  );

  if (!res.ok) {
    throw new Error(`Exa search failed with status ${res.status}`);
  }

  const results = await res.json();

  if (!Array.isArray(results)) {
    throw new Error("Exa search returned an invalid response.");
  }

  return results.filter(
    (result: any) =>
      result &&
      typeof result.sourceUrl === "string" &&
      /^https:\/\/.+/i.test(result.sourceUrl)
  );
};
