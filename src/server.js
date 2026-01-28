import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import {
  geocodeLocation,
  searchPlacesByBrand
} from "./services/osm.js";

// ---- Create MCP server ----
const server = new Server(
  { name: "ecommerce-mcp-server", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// ---- Register tools list ----
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

// ---- Register tool call handler ----
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "search_places_by_brand") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const { brand, location, radius_km = 5, limit = 5 } = args;

  // ---- Geocode user location ----
  const geo = await geocodeLocation(location);

  // ---- Search OSM for nearby places ----
  const places = await searchPlacesByBrand({
    brand,
    lat: geo.lat,
    lng: geo.lng,
    radiusKm: radius_km,
    limit
  });

  return {
    content: [
      {
        type: "json",
        data: {
          brand,
          location: geo.displayName,
          places
        }
      }
    ]
  };
});

// ---- Connect via stdio transport ----
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("🟢 Ecommerce MCP Server running");
