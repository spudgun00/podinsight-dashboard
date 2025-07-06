#!/bin/bash

# Export the Asana access token
export ASANA_ACCESS_TOKEN="2/1210591287134009/1210718842133145:c9a9c643dd0e21a0d7700429f2f2358a"

# Run Claude Code with Asana MCP server
claude-code --mcp "npx -y @roychri/mcp-server-asana" "$@"