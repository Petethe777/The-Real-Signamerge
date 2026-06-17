import part1 from "./dataset_part_1.json";
import part2 from "./dataset_part_2.json";
import part3 from "./dataset_part_3.json";

// Merge countries list
const countries = [...part1, ...part2, ...part3.countries];

export interface CityInfo {
  name: string;
  zip: string;
}

export interface CountryInfo {
  country: string;
  iso2: string;
  cities: CityInfo[];
}

export interface SocialPlatformInfo {
  name: string;
  url: string;
  type: string;
  focus: string[];
}

export interface ProductsInfo {
  digital: string[];
  physical: string[];
}

export interface CustomDataset {
  meta: {
    version: string;
    description: string;
    sections: string[];
  };
  countries: CountryInfo[];
  products: ProductsInfo;
  search_phrases: string[];
  social_platforms: SocialPlatformInfo[];
}

export const searchDataset: CustomDataset = {
  meta: {
    version: "1.0",
    description: "Customer Search Engine Dataset — countries/cities/postcodes, products, search phrases, social platforms",
    sections: ["countries", "products", "search_phrases", "social_platforms"]
  },
  countries,
  products: part3.products,
  search_phrases: part3.search_phrases,
  social_platforms: part3.social_platforms
};
