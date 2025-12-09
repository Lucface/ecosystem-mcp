/**
 * GitHub API Client
 *
 * Fetches repository data from GitHub.
 */
const GITHUB_API = "https://api.github.com";
export async function fetchRepoFromNpmUrl(repoUrl) {
    if (!repoUrl)
        return null;
    // Parse GitHub URL from various formats
    const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w.-]+?)(?:\.git)?(?:\/|$)/i);
    if (!match)
        return null;
    const [, owner, repo] = match;
    return fetchRepo(owner, repo);
}
export async function fetchRepo(owner, repo) {
    try {
        const headers = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "ecosystem-mcp",
        };
        // Use token if available
        const token = process.env.GITHUB_TOKEN;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
            headers,
        });
        if (!response.ok) {
            if (response.status === 404)
                return null;
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`Failed to fetch GitHub repo ${owner}/${repo}:`, error);
        return null;
    }
}
