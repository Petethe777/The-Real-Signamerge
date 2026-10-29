/**
 * SAMPLE DATA for the landing page demo.
 *
 * Nothing here is real. The leads, businesses, ratings and sales specialists are
 * generated or invented for illustration, and the demo never calls a live API,
 * so it costs nothing per visitor. Before launch:
 *   1. Replace SALESPEOPLE with your real appointment setters and their real rates.
 *   2. Adjust the price formula in DemoPanel.tsx if your pricing is not "leads x rate".
 *   3. Optionally swap the templates below for real, anonymized examples.
 */

export type Segment = 'customers' | 'businesses';

export type Intent = 'Ready to buy' | 'Comparing options' | 'Asking around';

export interface LeadResult {
  kind: 'lead';
  id: string;
  name: string;
  area: string;
  source: string;
  when: string;
  post: string;
  intent: Intent;
}

export interface BusinessResult {
  kind: 'business';
  id: string;
  name: string;
  area: string;
  rating: number;
  reviews: number;
  why: string;
  tags: string[];
}

export type DemoResult = LeadResult | BusinessResult;

export interface Topic {
  id: string;
  segment: Segment;
  label: string;
  summary: string;
}

export const TOPICS: Topic[] = [
  {
    id: 'ads',
    segment: 'customers',
    label: 'Businesses needing ad help',
    summary: 'Businesses asking for help with Facebook and Instagram ads',
  },
  {
    id: 'seo',
    segment: 'customers',
    label: 'Businesses needing SEO',
    summary: 'Businesses asking for an SEO or Google visibility specialist',
  },
  {
    id: 'store',
    segment: 'customers',
    label: 'Store owners wanting sales',
    summary: 'Online store owners asking how to get more sales',
  },
  {
    id: 'shoppers',
    segment: 'customers',
    label: 'Shoppers looking to buy',
    summary: 'Shoppers asking where to buy handmade goods online',
  },
  {
    id: 'agency',
    segment: 'businesses',
    label: 'Digital marketing agencies',
    summary: 'Highly reviewed digital marketing agencies',
  },
  {
    id: 'boutique',
    segment: 'businesses',
    label: 'Online boutiques',
    summary: 'Highly reviewed online boutiques for handmade leather goods',
  },
];

export function searchTitle(topic: Topic, city: string): string {
  return `${topic.summary} in ${city}`;
}

/* ---------- Deterministic sample generator ---------- */

interface LeadTemplate {
  post: string;
  intent: Intent;
}

interface BusinessTemplate {
  name: string;
  why: string;
  tags: string[];
}

const LEAD_TEMPLATES: Record<string, LeadTemplate[]> = {
  ads: [
    {
      post: 'Spent $500 boosting posts and got nothing. Does anyone in {city} know someone who actually runs Facebook ads properly?',
      intent: 'Ready to buy',
    },
    {
      post: 'Opening a second location in {city} next month and need someone to handle Instagram ads. The budget is real, I just need the right person.',
      intent: 'Ready to buy',
    },
    {
      post: 'My ads cost more every week and sales stay flat. Looking for a marketer who can audit my account. {city} area preferred.',
      intent: 'Ready to buy',
    },
    {
      post: 'Is it worth paying an agency for ads, or should I learn it myself? Small business in {city}, open to hearing what worked for you.',
      intent: 'Comparing options',
    },
    {
      post: 'Anyone in {city} used a freelancer for Meta ads? The agencies I called quoted way too much.',
      intent: 'Comparing options',
    },
  ],
  seo: [
    {
      post: 'Our website barely shows up on Google. Looking for an SEO person in {city} who can fix that.',
      intent: 'Ready to buy',
    },
    {
      post: 'We want to rank for "near me" searches in {city}. Who handles Google Business Profile and local SEO?',
      intent: 'Ready to buy',
    },
    {
      post: 'Anyone used an SEO freelancer they would recommend? Tired of agencies that send reports and no results. Based in {city}.',
      intent: 'Comparing options',
    },
    {
      post: 'A competitor jumped to the top of Google overnight. How do I even start competing in {city}?',
      intent: 'Comparing options',
    },
    {
      post: 'How long does SEO take to work for a small local business? Trying to decide if it is worth it here in {city}.',
      intent: 'Asking around',
    },
  ],
  store: [
    {
      post: 'My store gets traffic but almost nobody buys. Can someone look at my product pages and tell me what is wrong? Based in {city}.',
      intent: 'Ready to buy',
    },
    {
      post: 'Moving my shop from Instagram DMs to a real online store. Need help setting it up. Anyone in {city} do this?',
      intent: 'Ready to buy',
    },
    {
      post: 'Looking for someone in {city} to run email and SMS for my store. We do about $20k a month and want to grow.',
      intent: 'Ready to buy',
    },
    {
      post: 'What do you use for abandoned cart emails? Losing too many orders at checkout.',
      intent: 'Comparing options',
    },
    {
      post: 'Is it worth hiring a conversion consultant for a small Shopify store?',
      intent: 'Asking around',
    },
  ],
  shoppers: [
    {
      post: 'Looking for a handmade leather tote for work. Not mass-produced, preferably made in the USA. Any online stores that ship to {city}?',
      intent: 'Ready to buy',
    },
    {
      post: 'Need a gift for my dad in {city} by Friday. Handmade, nothing mass-produced. Where should I order?',
      intent: 'Ready to buy',
    },
    {
      post: 'Birthday gift for my sister who loves statement jewelry. Where do you shop online for something different?',
      intent: 'Comparing options',
    },
    {
      post: 'Where do you buy quality handmade candles online? Want to support small shops.',
      intent: 'Comparing options',
    },
    {
      post: 'Anyone know a small brand that sells good leather belts and wallets online? Tired of mall stuff. ({city})',
      intent: 'Asking around',
    },
  ],
};

const BUSINESS_TEMPLATES: Record<string, BusinessTemplate[]> = {
  agency: [
    {
      name: 'Tidewater Digital',
      why: 'Clients mention clear monthly reporting and ad spend that is explained line by line.',
      tags: ['Paid ads', 'Reporting', 'Small business'],
    },
    {
      name: 'Northbeach Marketing',
      why: 'Praised for fast replies and for turning around social content within the week.',
      tags: ['Social media', 'Content', 'Fast replies'],
    },
    {
      name: 'Pixel and Pine',
      why: 'Mostly mentioned for SEO work that moved local businesses onto the first page of Google.',
      tags: ['SEO', 'Local search', 'Websites'],
    },
    {
      name: 'Brightline Growth',
      why: 'Reviewers like that they turn down work that will not pay off for the client.',
      tags: ['Strategy', 'Audits', 'Honest advice'],
    },
    {
      name: 'Copperleaf Media',
      why: 'Online store owners say they felt like a priority, not an account number.',
      tags: ['E-commerce', 'Email', 'Conversion'],
    },
    {
      name: 'Harbor Street Digital',
      why: 'Known for transparent pricing and simple month-to-month contracts.',
      tags: ['Transparent pricing', 'Paid ads', 'No lock-in'],
    },
  ],
  boutique: [
    {
      name: 'Saddle and Stitch',
      why: 'Customers highlight hand-stitched totes made in small batches and quick shipping.',
      tags: ['Handmade', 'Totes', 'Fast shipping'],
    },
    {
      name: 'Tanner and Co.',
      why: 'Known for belts and wallets, with custom monogramming on request.',
      tags: ['Belts', 'Wallets', 'Custom'],
    },
    {
      name: 'Cedar Leatherworks',
      why: 'Reviewers like the mix of leather bags and accessories from small studios.',
      tags: ['Bags', 'Accessories', 'Small batch'],
    },
    {
      name: 'Oak and Awl',
      why: 'Praised for thoughtful packaging and same-day replies to questions.',
      tags: ['Gifting', 'Packaging', 'Responsive'],
    },
    {
      name: 'Ridgeline Leather',
      why: 'Buyers say the leather ages well and the repair service is worth it.',
      tags: ['Durable', 'Repairs', 'Made in USA'],
    },
    {
      name: 'Wren and Hide',
      why: 'Often recommended for gifts under $100 that arrive nicely wrapped.',
      tags: ['Gifts', 'Under $100', 'Gift wrap'],
    },
  ],
};

const FIRST_NAMES = [
  'Taylor', 'Jamie', 'Maya', 'Chris', 'Alexis', 'Devon', 'Nina', 'Elena',
  'Omar', 'Sophie', 'Andre', 'Grace', 'Luis', 'Tyrell', 'Brooke', 'Caleb',
];
const LAST_INITIALS = 'ABCDEFGHJKLMNPRSTW';
const SOURCES = ['Facebook group', 'X', 'Reddit', 'Nextdoor'];
const WHEN_SETS = [
  ['1 hour ago', '4 hours ago', 'Yesterday'],
  ['2 hours ago', '5 hours ago', 'Yesterday'],
  ['3 hours ago', '7 hours ago', '2 days ago'],
];
const INTENT_ORDER: Record<Intent, number> = {
  'Ready to buy': 0,
  'Comparing options': 1,
  'Asking around': 2,
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickN<T>(items: T[], n: number, rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/**
 * Builds three sample results for any city. The same topic and city always give
 * the same results, so the demo feels stable when someone re-runs it.
 */
export function buildDemoResults(topicId: string, city: string): DemoResult[] {
  const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0];
  const rand = mulberry32(hashString(`${topic.id}|${city.trim().toLowerCase()}`));

  if (topic.segment === 'customers') {
    const templates = pickN(LEAD_TEMPLATES[topic.id] ?? LEAD_TEMPLATES.ads, 3, rand).sort(
      (a, b) => INTENT_ORDER[a.intent] - INTENT_ORDER[b.intent],
    );
    const names = pickN(FIRST_NAMES, 3, rand);
    const whens = WHEN_SETS[Math.floor(rand() * WHEN_SETS.length)];
    return templates.map((tpl, i): LeadResult => ({
      kind: 'lead',
      id: `${topic.id}-${i}`,
      name: `${names[i]} ${LAST_INITIALS[Math.floor(rand() * LAST_INITIALS.length)]}.`,
      area: city,
      source: SOURCES[Math.floor(rand() * SOURCES.length)],
      when: whens[i],
      post: tpl.post.replace(/\{city\}/g, () => city),
      intent: tpl.intent,
    }));
  }

  const templates = pickN(BUSINESS_TEMPLATES[topic.id] ?? BUSINESS_TEMPLATES.agency, 3, rand);
  return templates.map((tpl, i): BusinessResult => ({
    kind: 'business',
    id: `${topic.id}-${i}`,
    name: tpl.name,
    area: topic.id === 'boutique' ? `Online, based in ${city}` : city,
    rating: Math.round((4.5 + rand() * 0.4) * 10) / 10,
    reviews: 28 + Math.floor(rand() * 160),
    why: tpl.why,
    tags: tpl.tags,
  }));
}

/* ---------- Sales specialists (SAMPLE, replace with your real appointment setters) ---------- */

export interface Salesperson {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  bio: string;
  /** Sample price in US dollars for each lead they work. */
  ratePerLead: number;
}

export const SALESPEOPLE: Salesperson[] = [
  {
    id: 'priya',
    name: 'Priya Raman',
    city: 'Chicago, IL',
    rating: 4.8,
    reviews: 141,
    bio: 'Six years in B2B sales. Strong at following up with leads who say "maybe later" until they book.',
    ratePerLead: 3.3,
  },
  {
    id: 'jordan',
    name: 'Jordan Ellis',
    city: 'Austin, TX',
    rating: 4.9,
    reviews: 212,
    bio: 'Former agency account manager. Writes short, friendly first messages that busy owners reply to.',
    ratePerLead: 4.5,
  },
  {
    id: 'marcus',
    name: 'Marcus Bell',
    city: 'Atlanta, GA',
    rating: 4.6,
    reviews: 87,
    bio: 'Ran his own online store before moving into sales. Knows what shoppers ask before they buy.',
    ratePerLead: 2.9,
  },
  {
    id: 'hannah',
    name: 'Hannah Cho',
    city: 'Seattle, WA',
    rating: 4.7,
    reviews: 119,
    bio: "Personalizes every message to the lead's own post. Best for higher-ticket services.",
    ratePerLead: 3.9,
  },
];

export const LEAD_QUANTITIES = [10, 30, 50];
export const DEFAULT_QUANTITY = 30;

/* ---------- Who it is for ---------- */

export interface Vertical {
  id: string;
  title: string;
  body: string;
  topicId: string;
}

export const VERTICALS: Vertical[] = [
  {
    id: 'digital-marketing',
    title: 'Digital marketing agencies and freelancers',
    body: 'See businesses asking for ads, SEO and social media help while they are still deciding who to hire.',
    topicId: 'ads',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce stores and the people who serve them',
    body: 'Find shoppers asking where to buy what you sell, and store owners asking how to get more sales.',
    topicId: 'shoppers',
  },
];
