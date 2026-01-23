export type McpServerId = keyof typeof MCP_SERVERS;

// { "mcp-id": { id: string, name: string, url: string } }
export const MCP_SERVERS = {
  "686de5276fd1cae1afbb55be": {
    "id": "686de5276fd1cae1afbb55be",
    "name": "GMAIL",
    "url": "https://backend.composio.dev/v3/mcp/64ddd793-75d0-4c3d-8abf-56c7554f19be/mcp?user_id=6910a741b1b70bd284b566f1"
  },
  "686de48c6fd1cae1afbb55ba": {
    "id": "686de48c6fd1cae1afbb55ba",
    "name": "GoogleSheets",
    "url": "https://backend.composio.dev/v3/mcp/01b46296-8ea1-4686-a211-87ba79800a99/mcp?user_id=6910a741b1b70bd284b566f1"
  }
};