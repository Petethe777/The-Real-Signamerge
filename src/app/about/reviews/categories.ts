// Countries available when adding a social media account.
// Asian and Middle Eastern countries are intentionally left out.
// Edit this list to add or remove a country; nothing else needs to change.
const EUROPE = [
  "Belgium", "Bulgaria", "Croatia", "Czechia",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo",
  "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands",
  "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia",
  "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City",
];
const AFRICA = [
  "Botswana", "Cabo Verde", "Cameroon", "Eswatini", "Ethiopia", "Ghana", "Guinea",
  "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius",
  "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "South Africa", "South Sudan", "Sudan", "Tanzania", "Zambia",
  "Zimbabwe",
];
const NORTH_AMERICA = [
  "Canada", "Costa Rica", "Cuba", "Dominica",
  "Dominican Republic", "Haiti", "Honduras", "Jamaica", "Mexico", "United States",
];
const SOUTH_AMERICA = [
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname",
  "Uruguay", "Venezuela",
];
const OCEANIA = [
  "Australia", "New Zealand", "Palau","Papua New Guinea", "Samoa",
];

export const COUNTRIES: string[] = [...EUROPE, ...AFRICA, ...NORTH_AMERICA, ...SOUTH_AMERICA, ...OCEANIA].sort((a, b) =>
  a.localeCompare(b),
);

// What the account posts about.
export const INTERESTS: string[] = [
  "Art & Design", "Beauty & Makeup", "Business & Finance", "Cars & Motorsport", "Comedy & Entertainment",
  "Education & Learning", "Fashion", "Fitness & Health", "Food & Cooking", "Gaming", "Home & DIY",
  "Lifestyle", "Music", "News & Commentary", "Parenting & Family", "Pets & Animals", "Photography & Video",
  "Sports", "Tech & Gadgets", "Travel",
];

export const MAX_INTERESTS = 3;
