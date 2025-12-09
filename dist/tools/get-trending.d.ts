/**
 * Get Trending Tool
 *
 * Get trending/popular packages in a category.
 */
export interface TrendingPackage {
    name: string;
    description?: string;
    weeklyDownloads: number;
    githubStars?: number;
    lastUpdate?: string;
    trending: "rising" | "stable" | "declining";
}
export interface TrendingResult {
    category: string;
    framework?: string;
    packages: TrendingPackage[];
    topPick?: string;
    risingStars: string[];
}
export declare function getTrending(category: string, framework?: string): Promise<TrendingResult>;
