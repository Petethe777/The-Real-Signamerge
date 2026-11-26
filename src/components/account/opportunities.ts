// Public teaser fields only. Contact details live in Supabase (supabase/opportunity_contacts.sql)
// behind a login so they are never shipped in the browser bundle.
export interface Opportunity {
  id: number;
  org: string;
  state: string;
  project: string;
  deadline: string;
  scope: string;
  eligibility: string;
  value: string | null;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    "id": 1,
    "org": "St. Lucie County Clerk of Court",
    "state": "Florida",
    "project": "Website redesign, hosting, security and digital customer experience",
    "deadline": "30 Nov 2026, 17:00 EST",
    "scope": "Full redesign, CMS, integrations, hosting, cybersecurity, accessibility, maintenance; optional AI customer service.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": null
  },
  {
    "id": 2,
    "org": "SunLine Transit Agency",
    "state": "California",
    "project": "Website hosting and maintenance",
    "deadline": "8 Dec 2026 (time not stated)",
    "scope": "Hosting, security, updates, monitoring, backups, redundancy, disaster recovery and technical support. One-year term plus four optional renewals.",
    "eligibility": "No foreign-supplier prohibition identified. Confirm with the agency.",
    "value": "Est. $90,000"
  },
  {
    "id": 3,
    "org": "Eastern Kentucky University",
    "state": "Kentucky",
    "project": "Athletics digital platform and website solution",
    "deadline": "3 Dec 2026",
    "scope": "Custom website, CMS, iOS/Android apps, live statistics, fan engagement, ticketing and revenue tools.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": null
  },
  {
    "id": 4,
    "org": "Virginia Tourism Corporation",
    "state": "Virginia",
    "project": "Tourism website development and implementation",
    "deadline": "3 Feb 2027, 17:00 EST",
    "scope": "Full-stack website development, tourism website, infrastructure and implementation. Mandatory virtual conference registration closes 4 Dec 2026, 16:00 EST.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": null
  },
  {
    "id": 5,
    "org": "City of Boulder",
    "state": "Colorado",
    "project": "Web development, database management and technical support",
    "deadline": "30 Nov 2026",
    "scope": "CRM/database management, help desk, building-owner portals and central web platform.",
    "eligibility": "US-onshore organisation restriction reported. Overseas eligibility appears unlikely.",
    "value": "Est. $150,000 to $500,000"
  },
  {
    "id": 6,
    "org": "Morgantown Utility Board",
    "state": "West Virginia",
    "project": "Public website redesign and development",
    "deadline": "4 Dec 2026, 16:30 EST (verify)",
    "scope": "Website redesign, custom CMS, content migration, customer-service integrations, accessibility, security testing and support.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": "Est. $15,000 (third party)"
  },
  {
    "id": 7,
    "org": "Richmond Redevelopment and Housing Authority",
    "state": "Indiana (verify)",
    "project": "Public website redesign, hosting and maintenance",
    "deadline": "8 Dec 2026, 12:00 EST (verify)",
    "scope": "Responsive website, CMS, hosting, security, maintenance and support. One-year base plus four optional years.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": null
  },
  {
    "id": 8,
    "org": "City of Farmington Hills",
    "state": "Michigan",
    "project": "Municipal website development and maintenance",
    "deadline": "15 Dec 2026, 15:00 EST (verify)",
    "scope": "Public and internal websites, CMS, AI chatbot, forms, search, integrations, migration, hosting and maintenance.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": null
  },
  {
    "id": 9,
    "org": "Centralina Economic Development District",
    "state": "North Carolina",
    "project": "Economic development website redevelopment and communications support",
    "deadline": "30 Nov 2026, 17:00 EST",
    "scope": "WordPress redevelopment, UX/UI, responsive design, migration, templates, analytics and staff training; also newsletter/communications support.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": null
  },
  {
    "id": 10,
    "org": "Sacramento Housing and Redevelopment Agency",
    "state": "California",
    "project": "Website accessibility, hosting and WordPress support",
    "deadline": "30 Nov 2026, 15:00 PST (verify)",
    "scope": "WordPress accessibility remediation, managed hosting, security, maintenance and support. Two-year term plus three optional years.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": "Est. $55,000"
  },
  {
    "id": 11,
    "org": "Coast Community College District",
    "state": "California",
    "project": "District website redesign",
    "deadline": "11 Dec 2026",
    "scope": "Website redesign, accessibility, CMS, navigation and digital experience.",
    "eligibility": "Not confirmed. Check with the buyer.",
    "value": "Est. $150,000 to $450,000"
  },
  {
    "id": 12,
    "org": "Yakima Valley Libraries",
    "state": "Washington",
    "project": "Library website redesign and catalog overlay",
    "deadline": "15 Dec 2026, 15:00 PST",
    "scope": "WordPress, redesign, migration, library integrations, maps, translation, hosting and maintenance.",
    "eligibility": "Work must be performed in the US by individuals authorised to work there. Overseas delivery appears unsuitable.",
    "value": "Est. $35,000 to $45,000"
  },
  {
    "id": 13,
    "org": "City of Burien",
    "state": "Washington",
    "project": "Website redesign, development and migration",
    "deadline": "7 Dec 2026, 17:00 PST",
    "scope": "WordPress, custom theme, migration, accessibility, staff training and optional hosting.",
    "eligibility": "The City reportedly excludes vendors outside North America.",
    "value": null
  },
  {
    "id": 14,
    "org": "Housing Assistance Council",
    "state": "Washington, DC",
    "project": "Website redesign and development",
    "deadline": "15 Dec 2026, 23:59 EST",
    "scope": "Redesign, CMS, resource search, document filtering, accessibility, analytics, SEO and staff training.",
    "eligibility": "Vendor must reportedly be registered in the US.",
    "value": "Est. $50,000 to $75,000"
  }
];
