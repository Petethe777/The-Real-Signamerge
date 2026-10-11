export interface Category {
  id: string;
  label: string;
  hint: string;
  featured?: boolean;
}

export const CATEGORIES: Category[] = [
  { id: "digital-creators", label: "Digital Creators & Influencers", hint: "Creators, influencers, content channels", featured: true },
  { id: "restaurants-food", label: "Restaurants & Food", hint: "Restaurants, cafes, takeaways" },
  { id: "online-stores", label: "Online Stores", hint: "Web shops and online sellers" },
  { id: "home-services", label: "Home Services", hint: "Plumbers, cleaners, repairs" },
  { id: "beauty-personal-care", label: "Beauty & Personal Care", hint: "Salons, barbers, spas" },
  { id: "automotive", label: "Automotive", hint: "Mechanics, dealers, car care" },
  { id: "professional-services", label: "Professional Services", hint: "Lawyers, accountants, agencies" },
  { id: "health-fitness", label: "Health & Fitness", hint: "Gyms, clinics, wellness" },
];

export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
