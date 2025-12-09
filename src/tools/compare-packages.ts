/**
 * Compare Packages Tool
 *
 * Compare multiple npm packages side-by-side.
 */

import { fetchPackageData, fetchDownloads } from "./npm-client.js";
import { fetchRepoFromNpmUrl } from "./github-client.js";

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

export async function comparePackages(
  packages: string[]
): Promise<PackageComparison> {
  if (packages.length < 2 || packages.length > 5) {
    throw new Error("Please provide 2-5 packages to compare");
  }

  // Fetch all package data in parallel
  const results = await Promise.all(
    packages.map(async (pkg) => {
      const [npmData, downloads] = await Promise.all([
        fetchPackageData(pkg),
        fetchDownloads(pkg, "last-week"),
      ]);

      if (!npmData) {
        return {
          name: pkg,
          version: "NOT FOUND",
          description: "Package not found on npm",
          weeklyDownloads: 0,
          githubStars: 0,
          lastUpdate: undefined,
          typescript: false,
          license: undefined,
          maintainers: 0,
        };
      }

      // Get GitHub data
      const githubData = await fetchRepoFromNpmUrl(npmData.repository?.url);

      // Check TypeScript support
      const hasTypes =
        npmData.keywords?.some(
          (k) => k.toLowerCase() === "typescript" || k.toLowerCase() === "types"
        ) ||
        npmData.name.startsWith("@types/") ||
        false;

      return {
        name: npmData.name,
        version: npmData.version,
        description: npmData.description,
        weeklyDownloads: downloads?.downloads,
        githubStars: githubData?.stargazers_count,
        lastUpdate: npmData.time?.[npmData.version],
        typescript: hasTypes,
        license: npmData.license,
        maintainers: npmData.maintainers?.length || 0,
      };
    })
  );

  // Generate recommendation based on data
  const validResults = results.filter((r) => r.version !== "NOT FOUND");
  let recommendation: string | undefined;

  if (validResults.length > 0) {
    // Sort by popularity (downloads + stars)
    const sorted = [...validResults].sort((a, b) => {
      const scoreA = (a.weeklyDownloads || 0) + (a.githubStars || 0) * 100;
      const scoreB = (b.weeklyDownloads || 0) + (b.githubStars || 0) * 100;
      return scoreB - scoreA;
    });

    const topPick = sorted[0];
    recommendation = `Based on popularity and activity, "${topPick.name}" leads with ${topPick.weeklyDownloads?.toLocaleString()} weekly downloads and ${topPick.githubStars?.toLocaleString()} GitHub stars.`;
  }

  return {
    packages: results,
    recommendation,
  };
}
