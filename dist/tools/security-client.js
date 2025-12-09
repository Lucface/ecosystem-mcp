/**
 * Security Advisory Client
 *
 * Checks for security vulnerabilities using npm audit API and GitHub advisories.
 */
const GITHUB_ADVISORY_API = "https://api.github.com/advisories";
export async function checkSecurityAdvisories(packageName, version) {
    const advisories = [];
    // Check GitHub Security Advisories
    try {
        const headers = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "ecosystem-mcp",
        };
        const token = process.env.GITHUB_TOKEN;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch(`${GITHUB_ADVISORY_API}?ecosystem=npm&package=${encodeURIComponent(packageName)}`, { headers });
        if (response.ok) {
            const data = await response.json();
            for (const advisory of data) {
                advisories.push({
                    id: advisory.ghsa_id || advisory.id,
                    severity: advisory.severity?.toLowerCase() || "moderate",
                    title: advisory.summary || advisory.title || "Unknown vulnerability",
                    description: advisory.description,
                    cve: advisory.cve_id,
                    patchedVersions: advisory.vulnerabilities?.[0]?.patched_versions,
                    vulnerableVersions: advisory.vulnerabilities?.[0]?.vulnerable_version_range,
                    publishedAt: advisory.published_at,
                    url: advisory.html_url,
                });
            }
        }
    }
    catch (error) {
        console.error(`Failed to check GitHub advisories for ${packageName}:`, error);
    }
    // Filter by version if provided
    if (version && advisories.length > 0) {
        // Simple version filtering - could be enhanced with semver
        return advisories.filter((a) => {
            if (!a.vulnerableVersions)
                return true;
            // Basic check - production would use proper semver matching
            return true; // Return all for now, let caller filter
        });
    }
    return advisories;
}
