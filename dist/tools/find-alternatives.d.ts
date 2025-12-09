/**
 * Find Alternatives Tool
 *
 * Find alternative packages to a given package.
 */
export interface Alternative {
    name: string;
    description?: string;
    weeklyDownloads?: number;
    githubStars?: number;
    pros: string[];
    cons: string[];
    migrationEffort: "low" | "medium" | "high";
}
export interface AlternativesResult {
    original: string;
    category?: string;
    alternatives: Alternative[];
    recommendation?: string;
}
export declare function findAlternatives(packageName: string, _category?: string): Promise<AlternativesResult>;
