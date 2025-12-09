/**
 * Ecosystem MCP Tools
 *
 * All tool implementations exported from here.
 */

export { researchPackage } from "./research-package.js";
export { comparePackages } from "./compare-packages.js";
export { findAlternatives } from "./find-alternatives.js";
export { checkSecurity } from "./check-security.js";
export { analyzePackageJson } from "./analyze-package-json.js";
export { getTrending } from "./get-trending.js";

// Types
export type { PackageResearch } from "./research-package.js";
export type { PackageComparison } from "./compare-packages.js";
export type { AlternativesResult, Alternative } from "./find-alternatives.js";
export type { SecurityCheckResult } from "./check-security.js";
export type { PackageJsonAnalysis, DependencyAnalysis } from "./analyze-package-json.js";
export type { TrendingResult, TrendingPackage } from "./get-trending.js";
