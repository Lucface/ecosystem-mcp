# Ecosystem MCP

MCP server for ecosystem intelligence -- research packages, find alternatives, compare options, and check security advisories from within Claude Code.

## Tools

| Tool | Description |
|------|-------------|
| `research_package` | Deep dive on a specific npm package (downloads, stars, security, maintenance, TS support, bundle size) |
| `compare_packages` | Compare multiple packages side-by-side |
| `find_alternatives` | Find alternatives to a given package |
| `check_security` | Check for security advisories |
| `analyze_package_json` | Analyze a project's dependencies |
| `get_trending` | Get trending packages in a category |

## Setup

```bash
cd ~/Developer/tools/ecosystem-mcp

# Install dependencies
bun install

# Build
bun run build

# Run in development
bun run dev
```

## Usage with Claude Code

Add to your Claude Code MCP configuration (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "ecosystem-mcp": {
      "command": "node",
      "args": ["/Users/YOU/Developer/tools/ecosystem-mcp/dist/index.js"]
    }
  }
}
```

Or run the inspector for testing:

```bash
bunx @anthropic-ai/mcp-inspector tsx src/index.ts
```

## Stack

- TypeScript (ESM)
- `@modelcontextprotocol/sdk` v1.0
- `zod` for schema validation
- Node 20+

## Project Structure

```
ecosystem-mcp/
  src/
    index.ts          # Server entry, tool definitions
    tools/            # Tool implementations
  dist/               # Built output
  package.json
  tsconfig.json
```

## License

MIT
