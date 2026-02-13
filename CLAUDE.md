# Ecosystem MCP

**Type:** MCP server for package intelligence
**Location:** `~/Developer/tools/ecosystem-mcp`
**Language:** TypeScript (ESM)

## Commands

```bash
bun install          # Install deps
bun run build        # Build (tsc)
bun run dev          # Dev mode (tsx)
bun run start        # Production
```

## Structure

- `src/index.ts` -- Server entry, tool definitions
- `src/tools/` -- Tool implementations (research, compare, find, security, analyze, trending)
- `dist/` -- Built output

## Tools Provided

Six MCP tools for npm ecosystem intelligence:
1. `research_package` -- Deep package research
2. `compare_packages` -- Side-by-side comparison
3. `find_alternatives` -- Alternative discovery
4. `check_security` -- Security advisory check
5. `analyze_package_json` -- Dependency analysis
6. `get_trending` -- Trending packages by category

## Dependencies

- `@modelcontextprotocol/sdk` -- MCP protocol
- `zod` -- Schema validation
- `semver` -- Version parsing

## Notes

- Requires Node 20+
- No authentication needed (uses public registry APIs)
- Test with MCP inspector: `bunx @anthropic-ai/mcp-inspector tsx src/index.ts`
