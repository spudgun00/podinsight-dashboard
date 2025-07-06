# Asana MCP Setup Guide for PodInsight API

This guide will help you set up the Asana MCP (Model Context Protocol) server in your API repository.

## Prerequisites

1. Node.js and npm installed
2. Asana Personal Access Token (PAT)

## Step 1: Get your Asana Personal Access Token

1. Go to https://app.asana.com/0/my-apps
2. Click "Create new token"
3. Name it something like "PodInsight MCP"
4. Copy the token (you won't see it again!)

## Step 2: Install the Asana MCP Server

Open a terminal in your API repository:

```bash
cd /Users/jamesgill/PodInsights/podinsight-api
npm install -g @modelcontextprotocol/server-asana
```

Or install locally:

```bash
npm install @modelcontextprotocol/server-asana
```

## Step 3: Update Claude Desktop Configuration

You need to add the Asana MCP server to your Claude Desktop configuration.

Edit the file: `/Users/jamesgill/Library/Application Support/Claude/claude_desktop_config.json`

Add the Asana server configuration:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/jamesgill/Documents",
        "/Users/jamesgill/Desktop",
        "/Users/jamesgill/MCP"
      ]
    },
    "memory": {
      "command": "/Users/jamesgill/MCP/mcp-memory-service/venv/bin/python",
      "args": [
        "/Users/jamesgill/MCP/mcp-memory-service/scripts/run_memory_server.py"
      ],
      "env": {
        "MCP_MEMORY_CHROMA_PATH": "/Users/jamesgill/Library/Application Support/mcp-memory/chroma_db",
        "MCP_MEMORY_BACKUPS_PATH": "/Users/jamesgill/Library/Application Support/mcp-memory/backups"
      }
    },
    "zen": {
      "command": "/Users/jamesgill/PodInsights/podinsight-etl/zen-mcp-server/.zen_venv/bin/python",
      "args": ["/Users/jamesgill/PodInsights/podinsight-etl/zen-mcp-server/server.py"]
    },
    "asana": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-asana"
      ],
      "env": {
        "ASANA_PAT": "YOUR_ASANA_PERSONAL_ACCESS_TOKEN_HERE"
      }
    }
  }
}
```

Replace `YOUR_ASANA_PERSONAL_ACCESS_TOKEN_HERE` with your actual Asana token.

## Step 4: Restart Claude Desktop

After updating the configuration:

1. Quit Claude Desktop completely (Cmd+Q)
2. Restart Claude Desktop
3. The Asana MCP server should now be available

## Step 5: Test the Connection

In a new Claude conversation, you should now be able to use Asana commands. Test with:

```
List my Asana workspaces
```

## Step 6: Add to API Repository (Optional)

If you want the Asana MCP configuration to be part of your API repository, create a `.claude/settings.local.json` file:

```bash
cd /Users/jamesgill/PodInsights/podinsight-api
mkdir -p .claude
```

Then add permissions for Asana tools in `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__asana-server__*",
      // ... other existing permissions
    ]
  }
}
```

## Using Asana MCP in your API Repository

Once set up, you can use Asana commands like:

- `mcp__asana-server__asana_list_workspaces` - List all workspaces
- `mcp__asana-server__asana_typeahead_search` - Search for tasks, projects, etc.
- `mcp__asana-server__asana_get_task` - Get task details
- `mcp__asana-server__asana_create_task` - Create new tasks
- `mcp__asana-server__asana_update_task` - Update existing tasks

## Known Workspace and Project IDs

Based on your ETL repository:
- **Workspace GID**: `1210591545825845` (podinsighthq.com)
- **Project GID**: `1210696245097468` (PodInsightHQ Development)

## Environment Variables Alternative

Instead of hardcoding the token in the config file, you can use environment variables:

1. Create a `.env` file in your home directory or use your shell profile
2. Add: `export ASANA_PAT="your_token_here"`
3. Update the MCP config to not include the env section, and it will use the system environment variable

## Troubleshooting

1. **MCP server not found**: Make sure npm packages are installed globally or adjust the path
2. **Authentication errors**: Double-check your Personal Access Token
3. **No Asana tools available**: Restart Claude Desktop after configuration changes

## Security Notes

- Never commit your Asana PAT to version control
- Consider using environment variables instead of hardcoding tokens
- The `.claude/settings.local.json` file should be in `.gitignore`