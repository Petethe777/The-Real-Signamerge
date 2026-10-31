/**
 * US-only location data and parsing, shared by the landing page demo and the contact sales form.
 * The city lists are suggestions (major cities per state), not a complete census of every US town.
 */

export interface UsState {
  code: string;
  name: string;
}

export const US_STATES: UsState[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

export const CITIES_BY_STATE: Record<string, string[]> = {
  AL: ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn'],
  AK: ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla', 'Sitka'],
  AZ: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Flagstaff'],
  AR: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'Conway'],
  CA: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Irvine', 'Santa Barbara'],
  CO: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Boulder', 'Lakewood', 'Pueblo'],
  CT: ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk'],
  DE: ['Wilmington', 'Dover', 'Newark', 'Middletown'],
  DC: ['Washington'],
  FL: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Tallahassee', 'Fort Lauderdale', 'Hialeah', 'Cape Coral', 'Gainesville', 'Sarasota'],
  GA: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Macon', 'Alpharetta'],
  HI: ['Honolulu', 'Hilo', 'Kailua', 'Kapolei'],
  ID: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', "Coeur d'Alene"],
  IL: ['Chicago', 'Aurora', 'Naperville', 'Rockford', 'Springfield', 'Peoria', 'Champaign'],
  IN: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Bloomington'],
  IA: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Iowa City', 'Sioux City'],
  KS: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence'],
  KY: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
  LA: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
  ME: ['Portland', 'Lewiston', 'Bangor', 'Augusta'],
  MD: ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Frederick', 'Annapolis'],
  MA: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton'],
  MI: ['Detroit', 'Grand Rapids', 'Warren', 'Ann Arbor', 'Lansing', 'Flint'],
  MN: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington'],
  MS: ['Jackson', 'Gulfport', 'Southaven', 'Biloxi', 'Hattiesburg'],
  MO: ['Kansas City', 'Saint Louis', 'Springfield', 'Columbia', 'Independence'],
  MT: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena'],
  NE: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island'],
  NV: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'],
  NH: ['Manchester', 'Nashua', 'Concord', 'Dover'],
  NJ: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Hoboken'],
  NM: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe'],
  NY: ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'],
  NC: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Asheville', 'Wilmington'],
  ND: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot'],
  OH: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
  OK: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond'],
  OR: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Bend'],
  PA: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Harrisburg'],
  RI: ['Providence', 'Warwick', 'Cranston', 'Newport'],
  SC: ['Charleston', 'Columbia', 'North Charleston', 'Greenville', 'Myrtle Beach'],
  SD: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings'],
  TN: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
  TX: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Plano', 'Corpus Christi', 'Lubbock'],
  UT: ['Salt Lake City', 'West Valley City', 'Provo', 'Orem', 'St. George'],
  VT: ['Burlington', 'Montpelier', 'Rutland'],
  VA: ['Virginia Beach', 'Norfolk', 'Richmond', 'Arlington', 'Alexandria', 'Chesapeake'],
  WA: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'],
  WV: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg'],
  WI: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Appleton'],
  WY: ['Cheyenne', 'Casper', 'Laramie', 'Gillette'],
};

/** Every suggestion as "City, ST", for autocomplete lists. */
export const CITY_OPTIONS: string[] = US_STATES.flatMap((s) =>
  (CITIES_BY_STATE[s.code] ?? []).map((city) => `${city}, ${s.code}`),
);

const normalize = (value: string) =>
  value.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();

const STATE_LOOKUP = new Map<string, UsState>();
for (const s of US_STATES) {
  STATE_LOOKUP.set(normalize(s.code), s);
  STATE_LOOKUP.set(normalize(s.name), s);
}

function canonicalCity(city: string, stateCode: string): string {
  const known = (CITIES_BY_STATE[stateCode] ?? []).find((c) => normalize(c) === normalize(city));
  return known ?? city;
}

export type ParsedLocation =
  | { ok: true; city: string; state: string; label: string }
  | { ok: false; message: string };

const HELP = 'Use a US city and state, like Austin, TX.';

/**
 * Accepts "Austin, TX", "Austin, Texas", "Austin TX", or just "Austin" when only one listed
 * US city has that name. Anything that does not end in a US state is rejected.
 */
export function parseUsLocation(raw: string): ParsedLocation {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return { ok: false, message: `Type a US city and state, like Austin, TX.` };

  let cityPart = '';
  let statePart = '';

  const comma = cleaned.lastIndexOf(',');
  if (comma > 0) {
    cityPart = cleaned.slice(0, comma).trim();
    statePart = cleaned.slice(comma + 1).trim();
  } else {
    const spaced = cleaned.match(/^(.*\S)\s+([A-Za-z]{2})$/);
    if (spaced && STATE_LOOKUP.has(normalize(spaced[2]))) {
      cityPart = spaced[1];
      statePart = spaced[2];
    }
  }

  if (cityPart && statePart) {
    const state = STATE_LOOKUP.get(normalize(statePart));
    if (!state) return { ok: false, message: `That does not look like a US state. ${HELP}` };
    const city = canonicalCity(cityPart, state.code);
    return { ok: true, city, state: state.code, label: `${city}, ${state.code}` };
  }

  // No state typed: accept it only if exactly one listed US city has this name.
  const matches = US_STATES.flatMap((s) =>
    (CITIES_BY_STATE[s.code] ?? [])
      .filter((c) => normalize(c) === normalize(cleaned))
      .map((city) => ({ city, state: s.code })),
  );
  if (matches.length === 1) {
    const { city, state } = matches[0];
    return { ok: true, city, state, label: `${city}, ${state}` };
  }
  if (matches.length > 1) {
    return {
      ok: false,
      message: `Which state? For example ${matches[0].city}, ${matches[0].state} or ${matches[1].city}, ${matches[1].state}.`,
    };
  }
  return { ok: false, message: `Add the state. ${HELP}` };
}
