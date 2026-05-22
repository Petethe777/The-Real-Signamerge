import { DemandResult } from "../types";

export const searchSocialMedia = async (query: string): Promise<DemandResult[]> => {
  if (!query) return [];

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch from search API: ${res.status}`);
    }
    const results = await res.json();
    return results;
  } catch (error: any) {
    console.error("Error searching social signals via internal discovery engine:", error);
    // Return a special flag that Dashboard.tsx can catch
    return { _rateLimited: true } as any;
  }
};
