/**
 * Compare Packages Tool
 *
 * Compare multiple npm packages side-by-side.
 */
export interface PackageComparison {
    packages: Array<{
        name: string;
        version: string;
        description?: string;
        weeklyDownloads?: number;
        githubStars?: number;
        lastUpdate?: string;
        typescript: boolean;
        license?: string;
        maintainers: number;
    }>;
    recommendation?: string;
}
export declare function comparePackages(packages: string[]): Promise<PackageComparison>;
