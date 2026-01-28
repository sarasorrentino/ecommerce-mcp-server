import { createServer } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = createServer({
  name: "ecommerce-mcp-server",
  version: "0.1.0",
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_places_by_brand",
      description:
        "Find physical shops or places of a specific brand near a given location",
      inputSchema: {
        type: "object",
        properties: {
          brand: { type: "string" },
          location: { type: "string" },
          radius_km: { type: "number", default: 5 },
          limit: { type: "number", default: 5 }
        },
        required: ["brand", "location"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "search_places_by_brand") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const { brand, location, limit = 5 } = args;

  const places = [
    {
      id: "nova-slice-lab",
      name: "Nova Slice Lab",
      coords: [-122.4098, 37.8001],
      description: "Award-winning Neapolitan pies in North Beach.",
      city: "North Beach",
      rating: 4.8,
      price: "$$$",
      thumbnail: "https://persistent.oaistatic.com/pizzaz/pizzaz-1.png"
    },
    {
      id: "midnight-marinara",
      name: "Midnight Marinara",
      coords: [-122.4093, 37.7990],
      description: "Focaccia-style squares, late-night favorite.",
      city: "North Beach",
      rating: 4.6,
      price: "$",
      thumbnail: "https://persistent.oaistatic.com/pizzaz/pizzaz-2.png"
    }
  ].slice(0, limit);

  return {
    content: [
      {
        type: "json",
        data: {
          brand,
          location,
          places
        }
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("🟢 Ecommerce MCP Server running");
