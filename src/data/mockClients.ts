export interface Client {
  id: string;
  name: string;
  platform: 'Twitter' | 'LinkedIn' | 'Instagram' | 'Reddit';
  intent: string;
  score: number;
  location: string;
  handle: string;
  avatar: string;
}

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    platform: 'Twitter',
    intent: 'Looking for a reliable CRM for my growing agency. Any recommendations?',
    score: 98,
    location: 'New York, USA',
    handle: '@sarahj_agency',
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    platform: 'LinkedIn',
    intent: 'Interested in AI-driven sales automation tools for enterprise teams.',
    score: 95,
    location: 'San Francisco, USA',
    handle: 'marcus-chen-sales',
    avatar: 'https://i.pravatar.cc/150?u=marcus'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    platform: 'Reddit',
    intent: 'How do I find high-intent leads without spending a fortune on ads?',
    score: 92,
    location: 'Madrid, Spain',
    handle: 'u/elena_growth',
    avatar: 'https://i.pravatar.cc/150?u=elena'
  },
  {
    id: '4',
    name: 'David Smith',
    platform: 'Twitter',
    intent: 'Need a better way to track customer signals in real-time.',
    score: 89,
    location: 'London, UK',
    handle: '@dsmith_dev',
    avatar: 'https://i.pravatar.cc/150?u=david'
  },
  {
    id: '5',
    name: 'Anna Wong',
    platform: 'Instagram',
    intent: 'Scaling my coaching business and need more consistent client leads.',
    score: 87,
    location: 'Singapore',
    handle: '@annawong_coach',
    avatar: 'https://i.pravatar.cc/150?u=anna'
  },
  {
    id: '6',
    name: 'James Porter',
    platform: 'LinkedIn',
    intent: 'Evaluating lead gen platforms for our Q3 outreach strategy.',
    score: 85,
    location: 'Toronto, Canada',
    handle: 'jporter-growth',
    avatar: 'https://i.pravatar.cc/150?u=james'
  },
  {
    id: '7',
    name: 'Linda Miller',
    platform: 'Twitter',
    intent: 'Does anyone know an AI tool that finds customers on social media?',
    score: 94,
    location: 'Austin, USA',
    handle: '@lindam_marketing',
    avatar: 'https://i.pravatar.cc/150?u=linda'
  },
  {
    id: '8',
    name: 'Tom Harris',
    platform: 'Reddit',
    intent: 'Looking for beta testers for our new project management tool.',
    score: 82,
    location: 'Berlin, Germany',
    handle: 'u/tomh_startup',
    avatar: 'https://i.pravatar.cc/150?u=tom'
  },
  {
    id: '9',
    name: 'Rachel Bloom',
    platform: 'Twitter',
    intent: 'I need a florist in San Diego for a corporate event next week! #sandiego #florist #event',
    score: 99,
    location: 'San Diego, USA',
    handle: '@rachel_events',
    avatar: 'https://i.pravatar.cc/150?u=rachel'
  },
  {
    id: '10',
    name: 'Michael Brown',
    platform: 'LinkedIn',
    intent: 'Searching for a cybersecurity consultant to audit our cloud infrastructure.',
    score: 96,
    location: 'Seattle, USA',
    handle: 'michael-b-security',
    avatar: 'https://i.pravatar.cc/150?u=michael'
  },
  {
    id: '11',
    name: 'Sophie Laurent',
    platform: 'Instagram',
    intent: 'Looking for a sustainable fashion brand for a collaboration. DM me! #sustainablefashion #collab',
    score: 91,
    location: 'Paris, France',
    handle: '@sophie_style',
    avatar: 'https://i.pravatar.cc/150?u=sophie'
  },
  {
    id: '12',
    name: 'Kevin Park',
    platform: 'Reddit',
    intent: 'What is the best accounting software for a small e-commerce business in Canada?',
    score: 88,
    location: 'Vancouver, Canada',
    handle: 'u/kevin_park_biz',
    avatar: 'https://i.pravatar.cc/150?u=kevin'
  },
  {
    id: '13',
    name: 'Jessica Wu',
    platform: 'LinkedIn',
    intent: 'Hiring a remote React developer. Must have experience with Vite and Tailwind.',
    score: 97,
    location: 'Remote',
    handle: 'jessica-wu-tech',
    avatar: 'https://i.pravatar.cc/150?u=jessica'
  },
  {
    id: '14',
    name: 'David Chen',
    platform: 'Twitter',
    intent: 'Anyone know a reliable 3PL for a growing e-commerce brand in the UK? #3pl #fulfillment #ecommerce',
    score: 94,
    location: 'London, UK',
    handle: '@david_ship',
    avatar: 'https://i.pravatar.cc/150?u=david'
  },
  {
    id: '15',
    name: 'Elena Rossi',
    platform: 'LinkedIn',
    intent: 'Looking for a freelance copywriter fluent in Italian and English for a fashion project.',
    score: 92,
    location: 'Milan, Italy',
    handle: 'elena-rossi-creative',
    avatar: 'https://i.pravatar.cc/150?u=elena'
  },
  {
    id: '16',
    name: 'Marcus Thorne',
    platform: 'Reddit',
    intent: 'Top recommendations for a CRM that actually works for real estate agents? Not Salesforce.',
    score: 89,
    location: 'Miami, USA',
    handle: 'u/marcus_realty',
    avatar: 'https://i.pravatar.cc/150?u=marcus'
  }
];
