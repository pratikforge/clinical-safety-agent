import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { toolDefinitions } from "./tools.js";

const server = new McpServer({
  name: "social-services-copilot",
  version: "0.1.0"
});

for (const [name, definition] of Object.entries(toolDefinitions)) {
  server.registerTool(
    name,
    {
      title: definition.title,
      description: definition.description,
      inputSchema: definition.inputSchema.shape
    },
    async (args) => {
      const data = definition.handler(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
