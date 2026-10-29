/**
 * SAMPLE DATA for the landing page demo.
 *
 * Every name, post, business and rating below is invented for illustration.
 * Before launch, replace these with real cached results from your own pipeline
 * (run the searches once, save the output, paste it here), so the demo shows
 * exactly what a paying customer would get and costs nothing per visitor.
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

export interface DemoExample {
  id: string;
  segment: Segment;
  label: string;
  query: string;
  results: DemoResult[];
}

export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'pest-durban',
    segment: 'customers',
    label: 'Pest control in Durban',
    query: 'Homeowners asking for pest control in Durban',
    results: [
      {
        kind: 'lead',
        id: 'p1',
        name: 'Thandi M.',
        area: 'Durban North',
        source: 'Facebook group',
        when: '2 hours ago',
        post: 'Found termites in the wooden frames of our kitchen. Can anyone recommend someone reliable who can come this week?',
        intent: 'Ready to buy',
      },
      {
        kind: 'lead',
        id: 'p2',
        name: 'Pieter V.',
        area: 'Umhlanga',
        source: 'Facebook group',
        when: '5 hours ago',
        post: 'Rats in the roof again. The last company never came back. Who do you use?',
        intent: 'Ready to buy',
      },
      {
        kind: 'lead',
        id: 'p3',
        name: 'Naledi K.',
        area: 'Westville',
        source: 'X',
        when: 'Yesterday',
        post: 'Moving into a rental next month and it has cockroaches. Is a once-off treatment worth it before we bring the furniture in?',
        intent: 'Comparing options',
      },
    ],
  },
  {
    id: 'fashion-jhb',
    segment: 'customers',
    label: 'Handmade accessories in Johannesburg',
    query: 'Shoppers asking where to buy handmade leather accessories in Johannesburg',
    results: [
      {
        kind: 'lead',
        id: 'f1',
        name: 'Lerato D.',
        area: 'Sandton',
        source: 'X',
        when: '1 hour ago',
        post: 'Looking for a handmade leather tote for work. Not mass-produced, preferably South African. Any shop suggestions?',
        intent: 'Ready to buy',
      },
      {
        kind: 'lead',
        id: 'f2',
        name: 'Chloe B.',
        area: 'Rosebank',
        source: 'Facebook group',
        when: '4 hours ago',
        post: 'Birthday gift for my sister who loves statement jewellery. Where do you shop for something different?',
        intent: 'Comparing options',
      },
      {
        kind: 'lead',
        id: 'f3',
        name: 'Sipho N.',
        area: 'Melville',
        source: 'Reddit',
        when: 'Yesterday',
        post: 'Anyone know a local brand for good leather belts and wallets? Tired of the mall stuff.',
        intent: 'Asking around',
      },
    ],
  },
  {
    id: 'webdev-leads',
    segment: 'customers',
    label: 'Businesses needing a website',
    query: 'Small businesses asking for a website developer',
    results: [
      {
        kind: 'lead',
        id: 'w1',
        name: 'Marcus T.',
        area: 'Pinetown',
        source: 'Facebook group',
        when: '3 hours ago',
        post: 'We run a small plumbing company and our website is from 2014. Looking for a developer who can rebuild it and get us showing on Google.',
        intent: 'Ready to buy',
      },
      {
        kind: 'lead',
        id: 'w2',
        name: 'Zinhle P.',
        area: 'Centurion',
        source: 'X',
        when: '6 hours ago',
        post: 'Need a simple online store for my candle business. Shopify or custom? Open to recommendations from devs.',
        intent: 'Comparing options',
      },
      {
        kind: 'lead',
        id: 'w3',
        name: 'Daniel R.',
        area: 'Durban Central',
        source: 'Reddit',
        when: 'Yesterday',
        post: 'Looking to hire a freelance developer for a booking site for my guesthouse. Budget is flexible for the right person.',
        intent: 'Ready to buy',
      },
    ],
  },
  {
    id: 'pest-umhlanga',
    segment: 'businesses',
    label: 'Pest control near Umhlanga',
    query: 'Reliable pest control near Umhlanga',
    results: [
      {
        kind: 'business',
        id: 'b1',
        name: 'Shoreline Pest Control',
        area: 'Umhlanga',
        rating: 4.8,
        reviews: 126,
        why: 'Reviewers mention same-week call-outs and a follow-up visit when pests return.',
        tags: ['Termites', 'Rodents', 'Same-week'],
      },
      {
        kind: 'business',
        id: 'b2',
        name: 'Green Door Pest Solutions',
        area: 'Durban North',
        rating: 4.6,
        reviews: 88,
        why: 'Praised for explaining each treatment clearly and using pet-safe products.',
        tags: ['Pet-safe', 'Cockroaches', 'Once-off'],
      },
      {
        kind: 'business',
        id: 'b3',
        name: 'Coastal Termite Specialists',
        area: 'Umhlanga Ridge',
        rating: 4.7,
        reviews: 54,
        why: 'Mostly mentioned for termite inspections and guarantees on treated timber.',
        tags: ['Termites', 'Inspections', 'Guarantee'],
      },
    ],
  },
  {
    id: 'leather-jhb',
    segment: 'businesses',
    label: 'Leather bags in Johannesburg',
    query: 'Boutique with handmade leather bags in Johannesburg',
    results: [
      {
        kind: 'business',
        id: 'l1',
        name: 'Hide & Thread',
        area: 'Melville',
        rating: 4.9,
        reviews: 73,
        why: 'Customers highlight hand-stitched totes made in small batches.',
        tags: ['Handmade', 'Totes', 'Made locally'],
      },
      {
        kind: 'business',
        id: 'l2',
        name: "Maker's Row",
        area: 'Maboneng',
        rating: 4.6,
        reviews: 41,
        why: 'Known for belts and wallets, with custom monogramming on request.',
        tags: ['Belts', 'Wallets', 'Custom'],
      },
      {
        kind: 'business',
        id: 'l3',
        name: 'Studio Karoo',
        area: 'Rosebank',
        rating: 4.7,
        reviews: 96,
        why: 'Reviewers like the mix of leather bags and jewellery from local designers.',
        tags: ['Bags', 'Jewellery', 'Local designers'],
      },
    ],
  },
];

export interface Vertical {
  id: string;
  title: string;
  body: string;
  exampleId: string;
}

export const VERTICALS: Vertical[] = [
  {
    id: 'pest',
    title: 'Pest control and home services',
    body: 'See homeowners asking for help with termites, rodents and cockroaches while they are still deciding who to call.',
    exampleId: 'pest-durban',
  },
  {
    id: 'fashion',
    title: 'Fashion and accessories',
    body: 'Find shoppers asking where to buy something different, before they settle for the mall.',
    exampleId: 'fashion-jhb',
  },
  {
    id: 'webdev',
    title: 'Web developers and agencies',
    body: 'Reach small businesses asking for a new website, a rebuild or an online store.',
    exampleId: 'webdev-leads',
  },
];
