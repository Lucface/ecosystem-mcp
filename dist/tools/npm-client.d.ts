/**
 * NPM Registry Client
 *
 * Fetches package data from the npm registry.
 */
export interface NpmPackageData {
    name: string;
    description?: string;
    version: string;
    license?: string;
    homepage?: string;
    repository?: {
        type: string;
        url: string;
    };
    keywords?: string[];
    maintainers?: Array<{
        name: string;
        email: string;
    }>;
    time?: Record<string, string>;
    versions?: Record<string, unknown>;
    "dist-tags"?: Record<string, string>;
}
export interface NpmDownloads {
    downloads: number;
    start: string;
    end: string;
    package: string;
}
export declare function fetchPackageData(packageName: string): Promise<NpmPackageData | null>;
export declare function fetchDownloads(packageName: string, period?: "last-week" | "last-month" | "last-year"): Promise<NpmDownloads | null>;
