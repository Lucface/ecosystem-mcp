/**
 * Get Trending Tool
 *
 * Get trending/popular packages in a category.
 */

import { fetchPackageData, fetchDownloads } from "./npm-client.js";
import { fetchRepoFromNpmUrl } from "./github-client.js";

// Curated lists by category
const CATEGORY_PACKAGES: Record<string, string[]> = {
  "state-management": [
    "zustand",
    "jotai",
    "valtio",
    "redux",
    "@reduxjs/toolkit",
    "recoil",
    "mobx",
    "xstate",
  ],
  testing: [
    "vitest",
    "jest",
    "@testing-library/react",
    "playwright",
    "cypress",
    "mocha",
    "ava",
  ],
  "ui-components": [
    "@radix-ui/react-dialog",
    "@headlessui/react",
    "@chakra-ui/react",
    "@mantine/core",
    "antd",
    "@mui/material",
    "shadcn-ui",
  ],
  "date-time": ["date-fns", "dayjs", "luxon", "moment", "tempo", "@internationalized/date"],
  validation: ["zod", "yup", "valibot", "ajv", "joi", "superstruct"],
  "http-client": ["axios", "ky", "got", "undici", "ofetch", "wretch"],
  orm: [
    "prisma",
    "drizzle-orm",
    "typeorm",
    "sequelize",
    "knex",
    "kysely",
    "mikro-orm",
  ],
  bundler: ["vite", "esbuild", "rollup", "webpack", "parcel", "turbopack", "tsup"],
  "css-framework": [
    "tailwindcss",
    "unocss",
    "bootstrap",
    "bulma",
    "styled-components",
    "@emotion/react",
  ],
  animation: [
    "framer-motion",
    "react-spring",
    "@react-spring/web",
    "gsap",
    "animejs",
    "motion",
  ],
};

// Framework-specific filters
const FRAMEWORK_PREFIXES: Record<string, string[]> = {
  react: ["react-", "@react-", "use-"],
  vue: ["vue-", "@vue/", "vueuse"],
  svelte: ["svelte-", "@svelte/"],
  node: [], // No filter
};

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

export async function getTrending(
  category: string,
  framework?: string
): Promise<TrendingResult> {
  const packageNames = CATEGORY_PACKAGES[category];

  if (!packageNames) {
    throw new Error(
      `Unknown category: ${category}. Available: ${Object.keys(CATEGORY_PACKAGES).join(", ")}`
    );
  }

  // Filter by framework if provided
  let filteredPackages = packageNames;
  if (framework && FRAMEWORK_PREFIXES[framework]) {
    const prefixes = FRAMEWORK_PREFIXES[framework];
    if (prefixes.length > 0) {
      filteredPackages = packageNames.filter(
        (pkg) =>
          prefixes.some((p) => pkg.toLowerCase().includes(p.toLowerCase())) ||
          packageNames.includes(pkg) // Keep all if no matches
      );
      // If filter too aggressive, keep original
      if (filteredPackages.length < 3) {
        filteredPackages = packageNames;
      }
    }
  }

  // Fetch data for packages
  const results = await Promise.all(
    filteredPackages.slice(0, 8).map(async (name) => {
      const [npmData, weeklyDownloads, monthlyDownloads] = await Promise.all([
        fetchPackageData(name),
        fetchDownloads(name, "last-week"),
        fetchDownloads(name, "last-month"),
      ]);

      if (!npmData || !weeklyDownloads) {
        return null;
      }

      const githubData = await fetchRepoFromNpmUrl(npmData.repository?.url);

      // Calculate trend (compare weekly to monthly average)
      let trending: TrendingPackage["trending"] = "stable";
      if (monthlyDownloads) {
        const weeklyAvg = monthlyDownloads.downloads / 4;
        if (weeklyDownloads.downloads > weeklyAvg * 1.1) {
          trending = "rising";
        } else if (weeklyDownloads.downloads < weeklyAvg * 0.9) {
          trending = "declining";
        }
      }

      return {
        name,
        description: npmData.description,
        weeklyDownloads: weeklyDownloads.downloads,
        githubStars: githubData?.stargazers_count,
        lastUpdate: npmData.time?.[npmData.version],
        trending,
      };
    })
  );

  const validResults: TrendingPackage[] = results.filter(
    (r): r is NonNullable<typeof r> => r !== null
  );

  // Sort by weekly downloads
  validResults.sort((a, b) => b.weeklyDownloads - a.weeklyDownloads);

  // Identify rising stars
  const risingStars = validResults
    .filter((p) => p.trending === "rising")
    .map((p) => p.name);

  return {
    category,
    framework,
    packages: validResults,
    topPick: validResults[0]?.name,
    risingStars,
  };
}
