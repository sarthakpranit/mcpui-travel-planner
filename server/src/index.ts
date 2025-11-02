#!/usr/bin/env node

/**
 * MCP-UI Travel Planner Server
 *
 * This is our MCP server that provides tools to Claude.
 * It demonstrates both regular text tools and interactive UI tools.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createUIResource } from "@mcp-ui/server";
import { destinations, getDestinationById, getDestinationsByIds } from "./data/destinations.js";
import {
  Destination,
  SearchCriteria,
  ItineraryPreferences,
  Activity,
  ItineraryDay,
  Itinerary,
} from "./types.js";

// Create the MCP server instance
const server = new Server(
  {
    name: "travel-planner",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // This server provides tools
    },
  }
);

/**
 * List all available tools
 * This tells Claude what tools are available and how to use them
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "hello_world",
        description: "A simple text-based tool that returns a greeting",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name to greet",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "hello_world_ui",
        description: "A UI-based tool that returns an interactive greeting card",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name to greet",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "search_destinations",
        description: "Search for travel destinations based on criteria like type, budget, climate, and rating",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Free-text search query (searches name, country, description)",
            },
            type: {
              type: "string",
              enum: ["beach", "mountain", "city", "cultural", "adventure"],
              description: "Type of destination",
            },
            budget: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Budget level",
            },
            climate: {
              type: "string",
              enum: ["tropical", "temperate", "cold", "arid"],
              description: "Preferred climate",
            },
            minRating: {
              type: "number",
              description: "Minimum rating (1-5)",
              minimum: 1,
              maximum: 5,
            },
          },
        },
      },
      {
        name: "get_destination_info",
        description: "Get detailed information about a specific destination by ID",
        inputSchema: {
          type: "object",
          properties: {
            destination_id: {
              type: "string",
              description: "The ID of the destination (e.g., 'bali-001', 'tokyo-001')",
            },
          },
          required: ["destination_id"],
        },
      },
      {
        name: "create_itinerary",
        description: "Create a day-by-day travel itinerary for selected destinations",
        inputSchema: {
          type: "object",
          properties: {
            destination_ids: {
              type: "array",
              items: { type: "string" },
              description: "Array of destination IDs to include in the itinerary",
            },
            duration: {
              type: "number",
              description: "Total number of days for the trip",
              minimum: 1,
            },
            pace: {
              type: "string",
              enum: ["relaxed", "moderate", "packed"],
              description: "How packed the itinerary should be",
            },
            interests: {
              type: "array",
              items: { type: "string" },
              description: "User interests (e.g., 'adventure', 'food', 'culture')",
            },
          },
          required: ["destination_ids", "duration"],
        },
      },
      {
        name: "search_destinations_ui",
        description: "Search for travel destinations with interactive UI cards (same filters as search_destinations)",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Free-text search query (searches name, country, description)",
            },
            type: {
              type: "string",
              enum: ["beach", "mountain", "city", "cultural", "adventure"],
              description: "Type of destination",
            },
            budget: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Budget level",
            },
            climate: {
              type: "string",
              enum: ["tropical", "temperate", "cold", "arid"],
              description: "Preferred climate",
            },
            minRating: {
              type: "number",
              description: "Minimum rating (1-5)",
              minimum: 1,
              maximum: 5,
            },
          },
        },
      },
      {
        name: "get_destination_info_ui",
        description: "Get detailed destination information with interactive UI card",
        inputSchema: {
          type: "object",
          properties: {
            destination_id: {
              type: "string",
              description: "The ID of the destination (e.g., 'bali-001', 'tokyo-001')",
            },
          },
          required: ["destination_id"],
        },
      },
      {
        name: "create_itinerary_ui",
        description: "Create a visual day-by-day itinerary with interactive timeline UI",
        inputSchema: {
          type: "object",
          properties: {
            destination_ids: {
              type: "array",
              items: { type: "string" },
              description: "Array of destination IDs to include in the itinerary",
            },
            duration: {
              type: "number",
              description: "Total number of days for the trip",
              minimum: 1,
            },
            pace: {
              type: "string",
              enum: ["relaxed", "moderate", "packed"],
              description: "How packed the itinerary should be",
            },
            interests: {
              type: "array",
              items: { type: "string" },
              description: "User interests (e.g., 'adventure', 'food', 'culture')",
            },
          },
          required: ["destination_ids", "duration"],
        },
      },
    ],
  };
});

/**
 * Handle tool execution
 * When Claude calls a tool, this handler processes it
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "hello_world": {
      // Simple text response
      const userName = (args as { name: string }).name;
      return {
        content: [
          {
            type: "text",
            text: `Hello, ${userName}! This is a plain text response from MCP.`,
          },
        ],
      };
    }

    case "hello_world_ui": {
      // Interactive UI response
      const userName = (args as { name: string }).name;

      // Create an interactive UI resource
      const uiResource = createUIResource({
        uri: `ui://travel-planner/hello/${userName}`,
        content: {
          type: 'externalUrl',
          iframeUrl: `data:text/html,${encodeURIComponent(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    padding: 20px;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  .card {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                    max-width: 400px;
                    text-align: center;
                  }
                  h1 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 28px;
                  }
                  p {
                    color: #666;
                    line-height: 1.6;
                    margin: 0 0 20px 0;
                  }
                  button {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                  }
                  button:hover {
                    background: #5568d3;
                  }
                  .emoji {
                    font-size: 48px;
                    margin-bottom: 15px;
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="emoji">👋</div>
                  <h1>Hello, ${userName}!</h1>
                  <p>This is an <strong>interactive UI</strong> rendered by MCP-UI. Notice the difference from plain text?</p>
                  <button onclick="alert('🎉 This button is interactive! This is what MCP-UI enables.')">
                    Click Me!
                  </button>
                </div>
              </body>
            </html>
          `)}`,
        },
        encoding: 'text',
      });

      // Serialize the UI resource for the client
      // We'll embed it in a special format that our client can parse
      return {
        content: [
          {
            type: "text",
            text: `UI_RESOURCE:${JSON.stringify(uiResource)}`,
          },
        ],
      };
    }

    case "search_destinations": {
      // Search for destinations based on criteria
      const criteria = args as SearchCriteria;

      // Start with all destinations
      let results = [...destinations];

      // Apply filters
      if (criteria.type) {
        results = results.filter((dest) => dest.type === criteria.type);
      }
      if (criteria.budget) {
        results = results.filter((dest) => dest.budgetLevel === criteria.budget);
      }
      if (criteria.climate) {
        results = results.filter((dest) => dest.climate === criteria.climate);
      }
      if (criteria.minRating !== undefined) {
        results = results.filter((dest) => dest.rating >= criteria.minRating!);
      }
      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        results = results.filter(
          (dest) =>
            dest.name.toLowerCase().includes(query) ||
            dest.country.toLowerCase().includes(query) ||
            dest.description.toLowerCase().includes(query)
        );
      }

      // Sort by popularity score (descending)
      results.sort((a, b) => b.popularityScore - a.popularityScore);

      // Format the response
      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No destinations found matching your criteria. Try adjusting your filters.",
            },
          ],
        };
      }

      // Build a nicely formatted text response
      let response = `Found ${results.length} destination${results.length > 1 ? "s" : ""}:\n\n`;

      results.forEach((dest, index) => {
        response += `${index + 1}. ${dest.name}, ${dest.country}\n`;
        response += `   ID: ${dest.id}\n`;
        response += `   Type: ${dest.type} | Climate: ${dest.climate} | Budget: ${dest.budgetLevel}\n`;
        response += `   Rating: ${"⭐".repeat(Math.round(dest.rating))} (${dest.rating}/5)\n`;
        response += `   Average cost: $${dest.averageDailyCost}/day\n`;
        response += `   ${dest.description}\n`;
        response += `   Best time to visit: ${dest.bestTimeToVisit.join(", ")}\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    }

    case "get_destination_info": {
      // Get detailed information about a specific destination
      const { destination_id } = args as { destination_id: string };

      const destination = getDestinationById(destination_id);

      if (!destination) {
        return {
          content: [
            {
              type: "text",
              text: `Destination with ID "${destination_id}" not found. Please check the ID and try again.`,
            },
          ],
        };
      }

      // Build a comprehensive formatted response
      let response = `# ${destination.name}, ${destination.country}\n\n`;
      response += `**ID:** ${destination.id}\n\n`;
      response += `## Overview\n`;
      response += `${destination.description}\n\n`;
      response += `**Type:** ${destination.type} | **Climate:** ${destination.climate}\n`;
      response += `**Rating:** ${"⭐".repeat(Math.round(destination.rating))} (${destination.rating}/5)\n`;
      response += `**Popularity Score:** ${destination.popularityScore}/100\n\n`;

      response += `## Travel Details\n`;
      response += `**Average Daily Cost:** $${destination.averageDailyCost} (${destination.budgetLevel} budget)\n`;
      response += `**Recommended Stay:** ${destination.averageStayDays} days\n`;
      response += `**Main Airport:** ${destination.mainAirport}\n`;
      response += `**Best Time to Visit:** ${destination.bestTimeToVisit.join(", ")}\n\n`;

      response += `## Top Attractions\n`;
      destination.topAttractions.forEach((attraction) => {
        response += `• ${attraction}\n`;
      });

      response += `\n## Popular Activities\n`;
      destination.activities.forEach((activity) => {
        response += `• ${activity}\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    }

    case "create_itinerary": {
      // Create a day-by-day itinerary
      const {
        destination_ids,
        duration,
        pace = "moderate",
        interests = [],
      } = args as {
        destination_ids: string[];
        duration: number;
        pace?: "relaxed" | "moderate" | "packed";
        interests?: string[];
      };

      // Validate destinations
      const validDestinations = getDestinationsByIds(destination_ids);

      if (validDestinations.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No valid destinations found. Please provide valid destination IDs.",
            },
          ],
        };
      }

      // Calculate activities per day based on pace
      const activitiesPerDay = pace === "relaxed" ? 2 : pace === "moderate" ? 3 : 4;

      // Generate itinerary days
      const days: ItineraryDay[] = [];
      let currentDestIndex = 0;
      let totalCost = 0;

      for (let dayNum = 1; dayNum <= duration; dayNum++) {
        const currentDest = validDestinations[currentDestIndex];

        // Generate sample activities for this day
        const dayActivities: Activity[] = [];
        for (let i = 0; i < activitiesPerDay; i++) {
          const activityType = currentDest.activities[i % currentDest.activities.length];
          const timeOfDay = i === 0 ? "morning" : i === 1 ? "afternoon" : "evening";

          dayActivities.push({
            id: `activity-${dayNum}-${i}`,
            name: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} activity`,
            description: `Enjoy ${activityType} in ${currentDest.name}`,
            duration: pace === "relaxed" ? 4 : pace === "moderate" ? 3 : 2,
            type: "sightseeing",
            cost: Math.round(currentDest.averageDailyCost * 0.3),
            timeOfDay: timeOfDay as "morning" | "afternoon" | "evening",
          });
        }

        const dayCost = currentDest.averageDailyCost;
        totalCost += dayCost;

        days.push({
          day: dayNum,
          destination: currentDest.id,
          activities: dayActivities,
          totalCost: dayCost,
          notes: dayNum === 1 ? "Arrival day - take it easy" : undefined,
        });

        // Move to next destination if we've stayed recommended days
        if (
          dayNum % currentDest.averageStayDays === 0 &&
          currentDestIndex < validDestinations.length - 1
        ) {
          currentDestIndex++;
        }
      }

      // Build the itinerary response
      let response = `# ${duration}-Day Itinerary\n\n`;
      response += `**Destinations:** ${validDestinations.map((d) => d.name).join(" → ")}\n`;
      response += `**Pace:** ${pace}\n`;
      response += `**Estimated Total Cost:** $${totalCost.toFixed(2)}\n`;
      response += `**Average Daily Cost:** $${(totalCost / duration).toFixed(2)}\n\n`;

      if (interests.length > 0) {
        response += `**Your Interests:** ${interests.join(", ")}\n\n`;
      }

      response += `---\n\n`;

      // Add day-by-day breakdown
      days.forEach((day) => {
        const dest = getDestinationById(day.destination)!;
        response += `## Day ${day.day}: ${dest.name}\n`;
        if (day.notes) {
          response += `*${day.notes}*\n\n`;
        }

        day.activities.forEach((activity, idx) => {
          response += `**${activity.timeOfDay.charAt(0).toUpperCase() + activity.timeOfDay.slice(1)}** (${activity.duration}h)\n`;
          response += `${idx + 1}. ${activity.name}\n`;
          response += `   ${activity.description}\n`;
          response += `   Cost: $${activity.cost}\n\n`;
        });

        response += `**Daily Total:** $${day.totalCost}\n\n`;
        response += `---\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    }

    case "get_destination_info_ui": {
      // UI version of get_destination_info - returns detailed card with shadcn design
      const { destination_id } = args as { destination_id: string };
      const destination = getDestinationById(destination_id);

      if (!destination) {
        const uiResource = createUIResource({
          uri: `ui://travel-planner/error/${Date.now()}`,
          content: {
            type: 'externalUrl',
            iframeUrl: `data:text/html,${encodeURIComponent(`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    :root {
                      --background: 0 0% 100%;
                      --foreground: 240 10% 3.9%;
                      --destructive: 0 84.2% 60.2%;
                      --destructive-foreground: 0 0% 98%;
                      --muted: 240 4.8% 95.9%;
                      --border: 240 5.9% 90%;
                      --radius: 0.5rem;
                    }
                    * { box-sizing: border-box; }
                    body {
                      font-family: system-ui, -apple-system, sans-serif;
                      padding: 40px;
                      margin: 0;
                      background: hsl(var(--muted) / 0.3);
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .error {
                      background: hsl(var(--background));
                      border: 1px solid hsl(var(--destructive) / 0.5);
                      border-radius: var(--radius);
                      padding: 40px;
                      text-align: center;
                      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    }
                    .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
                    h2 {
                      color: hsl(var(--foreground));
                      margin: 0 0 8px 0;
                      font-size: 20px;
                      font-weight: 600;
                    }
                    p {
                      color: hsl(var(--destructive));
                      margin: 0;
                      font-size: 14px;
                      font-family: monospace;
                    }
                  </style>
                </head>
                <body>
                  <div class="error">
                    <div class="icon">❌</div>
                    <h2>Destination Not Found</h2>
                    <p>ID: ${destination_id}</p>
                  </div>
                </body>
              </html>
            `)}`,
          },
          encoding: 'text',
        });

        return {
          content: [
            {
              type: "text",
              text: `UI_RESOURCE:${JSON.stringify(uiResource)}`,
            },
          ],
        };
      }

      // Build detailed destination card HTML with shadcn design
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              :root {
                --background: 0 0% 100%;
                --foreground: 240 10% 3.9%;
                --card: 0 0% 100%;
                --card-foreground: 240 10% 3.9%;
                --primary: 240 5.9% 10%;
                --primary-foreground: 0 0% 98%;
                --secondary: 240 4.8% 95.9%;
                --secondary-foreground: 240 5.9% 10%;
                --muted: 240 4.8% 95.9%;
                --muted-foreground: 240 3.8% 46.1%;
                --accent: 240 4.8% 95.9%;
                --accent-foreground: 240 5.9% 10%;
                --border: 240 5.9% 90%;
                --radius: 0.5rem;
              }
              * { box-sizing: border-box; }
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                padding: 20px;
                background: hsl(var(--muted) / 0.3);
                min-height: 100vh;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
              }
              .card {
                background: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                border-radius: var(--radius);
                overflow: hidden;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
              }
              .header {
                background: hsl(var(--muted));
                padding: 32px;
                border-bottom: 1px solid hsl(var(--border));
              }
              .header h1 {
                margin: 0 0 4px 0;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: -0.025em;
                color: hsl(var(--foreground));
              }
              .header p {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: hsl(var(--muted-foreground));
              }
              .badges {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
              }
              .badge {
                padding: 4px 12px;
                border-radius: calc(var(--radius) - 2px);
                background: hsl(var(--secondary));
                color: hsl(var(--secondary-foreground));
                font-size: 12px;
                font-weight: 500;
              }
              .content {
                padding: 32px;
              }
              .rating {
                font-size: 16px;
                color: hsl(var(--muted-foreground));
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid hsl(var(--border));
              }
              .rating .popularity {
                font-size: 13px;
                color: hsl(var(--muted-foreground));
                margin-left: 8px;
              }
              .description {
                font-size: 16px;
                line-height: 1.6;
                color: hsl(var(--foreground));
                margin-bottom: 32px;
              }
              .section {
                margin-bottom: 32px;
              }
              .section h2 {
                color: hsl(var(--foreground));
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 16px 0;
                letter-spacing: -0.025em;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
              }
              .info-box {
                background: hsl(var(--muted) / 0.5);
                border: 1px solid hsl(var(--border));
                padding: 16px;
                border-radius: calc(var(--radius) - 2px);
              }
              .info-box-label {
                font-size: 12px;
                color: hsl(var(--muted-foreground));
                font-weight: 500;
                text-transform: uppercase;
                margin-bottom: 4px;
                letter-spacing: 0.05em;
              }
              .info-box-value {
                font-size: 16px;
                color: hsl(var(--foreground));
                font-weight: 600;
              }
              .list {
                list-style: none;
                padding: 0;
                margin: 0;
              }
              .list li {
                padding: 12px;
                background: hsl(var(--muted) / 0.5);
                border: 1px solid hsl(var(--border));
                border-radius: calc(var(--radius) - 2px);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: hsl(var(--foreground));
              }
              .list li:before {
                content: "✓";
                background: hsl(var(--primary));
                color: hsl(var(--primary-foreground));
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                flex-shrink: 0;
              }
              .actions {
                display: flex;
                gap: 12px;
                margin-top: 32px;
                padding-top: 32px;
                border-top: 1px solid hsl(var(--border));
              }
              button {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: calc(var(--radius) - 2px);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
              }
              button.primary {
                background: hsl(var(--primary));
                color: hsl(var(--primary-foreground));
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
              }
              button.primary:hover {
                background: hsl(var(--primary) / 0.9);
              }
              button.secondary {
                background: hsl(var(--secondary));
                color: hsl(var(--secondary-foreground));
                border: 1px solid hsl(var(--border));
              }
              button.secondary:hover {
                background: hsl(var(--accent));
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <h1>${destination.name}</h1>
                  <p>${destination.country}</p>
                  <div class="badges">
                    <div class="badge">${destination.type}</div>
                    <div class="badge">${destination.climate}</div>
                    <div class="badge">${destination.budgetLevel} budget</div>
                  </div>
                </div>
                <div class="content">
                  <div class="rating">
                    ${"⭐".repeat(Math.round(destination.rating))} ${destination.rating}/5
                    <span class="popularity">(Popularity: ${destination.popularityScore}/100)</span>
                  </div>
                  <div class="description">${destination.description}</div>

                  <div class="section">
                    <h2>Travel Details</h2>
                    <div class="grid">
                      <div class="info-box">
                        <div class="info-box-label">Daily Cost</div>
                        <div class="info-box-value">$${destination.averageDailyCost}</div>
                      </div>
                      <div class="info-box">
                        <div class="info-box-label">Recommended Stay</div>
                        <div class="info-box-value">${destination.averageStayDays} days</div>
                      </div>
                      <div class="info-box">
                        <div class="info-box-label">Main Airport</div>
                        <div class="info-box-value" style="font-size: 13px;">${destination.mainAirport}</div>
                      </div>
                      <div class="info-box">
                        <div class="info-box-label">Best Months</div>
                        <div class="info-box-value" style="font-size: 13px;">
                          ${destination.bestTimeToVisit.slice(0, 3).join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="section">
                    <h2>Top Attractions</h2>
                    <ul class="list">
                      ${destination.topAttractions.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                  </div>

                  <div class="section">
                    <h2>Popular Activities</h2>
                    <ul class="list">
                      ${destination.activities.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                  </div>

                  <div class="actions">
                    <button class="primary" onclick="alert('Would create itinerary for ${destination.name}!')">
                      Plan Trip Here
                    </button>
                    <button class="secondary" onclick="alert('Destination ID: ${destination.id}')">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const uiResource = createUIResource({
        uri: `ui://travel-planner/destination/${destination_id}`,
        content: {
          type: 'externalUrl',
          iframeUrl: `data:text/html,${encodeURIComponent(html)}`,
        },
        encoding: 'text',
      });

      return {
        content: [
          {
            type: "text",
            text: `UI_RESOURCE:${JSON.stringify(uiResource)}`,
          },
        ],
      };
    }

    case "create_itinerary_ui": {
      // UI version of create_itinerary - returns visual timeline
      const {
        destination_ids,
        duration,
        pace = "moderate",
        interests = [],
      } = args as {
        destination_ids: string[];
        duration: number;
        pace?: "relaxed" | "moderate" | "packed";
        interests?: string[];
      };

      const validDestinations = getDestinationsByIds(destination_ids);

      if (validDestinations.length === 0) {
        const uiResource = createUIResource({
          uri: `ui://travel-planner/itinerary-error/${Date.now()}`,
          content: {
            type: 'externalUrl',
            iframeUrl: `data:text/html,${encodeURIComponent(`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    :root {
                      --background: 0 0% 100%;
                      --foreground: 240 10% 3.9%;
                      --destructive: 0 84.2% 60.2%;
                      --destructive-foreground: 0 0% 98%;
                      --muted: 240 4.8% 95.9%;
                      --border: 240 5.9% 90%;
                      --radius: 0.5rem;
                    }
                    * { box-sizing: border-box; }
                    body {
                      font-family: system-ui, -apple-system, sans-serif;
                      padding: 40px;
                      margin: 0;
                      background: hsl(var(--muted) / 0.3);
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .error {
                      background: hsl(var(--background));
                      border: 1px solid hsl(var(--destructive) / 0.5);
                      border-radius: var(--radius);
                      padding: 40px;
                      text-align: center;
                      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    }
                    .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
                    h2 {
                      color: hsl(var(--foreground));
                      margin: 0 0 8px 0;
                      font-size: 20px;
                      font-weight: 600;
                    }
                    p {
                      color: hsl(var(--destructive));
                      margin: 0;
                      font-size: 14px;
                    }
                  </style>
                </head>
                <body>
                  <div class="error">
                    <div class="icon">❌</div>
                    <h2>Invalid Destinations</h2>
                    <p>Please provide valid destination IDs</p>
                  </div>
                </body>
              </html>
            `)}`,
          },
          encoding: 'text',
        });

        return {
          content: [
            {
              type: "text",
              text: `UI_RESOURCE:${JSON.stringify(uiResource)}`,
            },
          ],
        };
      }

      // Generate itinerary (same logic as text version)
      const activitiesPerDay = pace === "relaxed" ? 2 : pace === "moderate" ? 3 : 4;
      const days: any[] = [];
      let currentDestIndex = 0;
      let totalCost = 0;

      for (let dayNum = 1; dayNum <= duration; dayNum++) {
        const currentDest = validDestinations[currentDestIndex];
        const dayActivities: any[] = [];

        for (let i = 0; i < activitiesPerDay; i++) {
          const activityType = currentDest.activities[i % currentDest.activities.length];
          const timeOfDay = i === 0 ? "morning" : i === 1 ? "afternoon" : "evening";

          dayActivities.push({
            name: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} activity`,
            description: `Enjoy ${activityType} in ${currentDest.name}`,
            duration: pace === "relaxed" ? 4 : pace === "moderate" ? 3 : 2,
            timeOfDay: timeOfDay,
            cost: Math.round(currentDest.averageDailyCost * 0.3),
          });
        }

        const dayCost = currentDest.averageDailyCost;
        totalCost += dayCost;

        days.push({
          day: dayNum,
          destination: currentDest,
          activities: dayActivities,
          totalCost: dayCost,
          notes: dayNum === 1 ? "Arrival day - take it easy" : undefined,
        });

        if (
          dayNum % currentDest.averageStayDays === 0 &&
          currentDestIndex < validDestinations.length - 1
        ) {
          currentDestIndex++;
        }
      }

      // Build timeline HTML
      const timelineHTML = days.map((day) => {
        const activitiesHTML = day.activities.map((activity: any) => `
          <div class="activity">
            <div class="time-badge">${activity.timeOfDay}</div>
            <div class="activity-content">
              <h4>${activity.name}</h4>
              <p>${activity.description}</p>
              <div class="activity-meta">
                <span>⏱️ ${activity.duration}h</span>
                <span>💵 $${activity.cost}</span>
              </div>
            </div>
          </div>
        `).join('');

        return `
          <div class="day-card">
            <div class="day-header">
              <div class="day-number">Day ${day.day}</div>
              <div class="day-location">📍 ${day.destination.name}</div>
            </div>
            ${day.notes ? `<div class="day-note">${day.notes}</div>` : ''}
            <div class="activities">
              ${activitiesHTML}
            </div>
            <div class="day-footer">
              <strong>Daily Cost:</strong> $${day.totalCost}
            </div>
          </div>
        `;
      }).join('');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              :root {
                --background: 0 0% 100%;
                --foreground: 240 10% 3.9%;
                --card: 0 0% 100%;
                --card-foreground: 240 10% 3.9%;
                --primary: 240 5.9% 10%;
                --primary-foreground: 0 0% 98%;
                --secondary: 240 4.8% 95.9%;
                --secondary-foreground: 240 5.9% 10%;
                --muted: 240 4.8% 95.9%;
                --muted-foreground: 240 3.8% 46.1%;
                --accent: 240 4.8% 95.9%;
                --accent-foreground: 240 5.9% 10%;
                --border: 240 5.9% 90%;
                --radius: 0.5rem;
              }
              * { box-sizing: border-box; }
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                padding: 20px;
                background: hsl(var(--muted) / 0.3);
                min-height: 100vh;
              }
              .container {
                max-width: 900px;
                margin: 0 auto;
              }
              .header {
                background: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                padding: 28px;
                border-radius: var(--radius);
                margin-bottom: 24px;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
              }
              .header h1 {
                margin: 0 0 12px 0;
                color: hsl(var(--foreground));
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.025em;
              }
              .header-meta {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
                color: hsl(var(--muted-foreground));
                font-size: 14px;
              }
              .header-meta strong {
                color: hsl(var(--foreground));
                font-weight: 600;
              }
              .pace-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: calc(var(--radius) - 2px);
                background: hsl(var(--primary));
                color: hsl(var(--primary-foreground));
                font-size: 12px;
                font-weight: 500;
                text-transform: uppercase;
              }
              .timeline {
                position: relative;
              }
              .timeline:before {
                content: '';
                position: absolute;
                left: 32px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: hsl(var(--border));
              }
              .day-card {
                background: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                border-radius: var(--radius);
                padding: 20px;
                margin-bottom: 20px;
                margin-left: 64px;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                position: relative;
              }
              .day-card:before {
                content: '';
                position: absolute;
                left: -47px;
                top: 20px;
                width: 14px;
                height: 14px;
                background: hsl(var(--primary));
                border: 3px solid hsl(var(--background));
                border-radius: 50%;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);
              }
              .day-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid hsl(var(--border));
              }
              .day-number {
                font-size: 20px;
                font-weight: 700;
                color: hsl(var(--primary));
                letter-spacing: -0.025em;
              }
              .day-location {
                font-size: 16px;
                font-weight: 600;
                color: hsl(var(--foreground));
              }
              .day-note {
                background: hsl(var(--muted) / 0.5);
                border: 1px solid hsl(var(--border));
                padding: 12px;
                border-radius: calc(var(--radius) - 2px);
                margin-bottom: 16px;
                font-size: 13px;
                color: hsl(var(--muted-foreground));
                font-style: italic;
              }
              .activities {
                display: flex;
                flex-direction: column;
                gap: 10px;
              }
              .activity {
                display: flex;
                gap: 12px;
                padding: 12px;
                background: hsl(var(--muted) / 0.5);
                border: 1px solid hsl(var(--border));
                border-radius: calc(var(--radius) - 2px);
              }
              .time-badge {
                padding: 4px 10px;
                border-radius: calc(var(--radius) - 4px);
                background: hsl(var(--secondary));
                color: hsl(var(--secondary-foreground));
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                height: fit-content;
                white-space: nowrap;
              }
              .activity-content {
                flex: 1;
              }
              .activity-content h4 {
                margin: 0 0 4px 0;
                color: hsl(var(--foreground));
                font-size: 15px;
                font-weight: 600;
              }
              .activity-content p {
                margin: 0 0 6px 0;
                color: hsl(var(--muted-foreground));
                font-size: 13px;
              }
              .activity-meta {
                display: flex;
                gap: 16px;
                font-size: 12px;
                color: hsl(var(--muted-foreground));
              }
              .day-footer {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid hsl(var(--border));
                text-align: right;
                font-size: 14px;
                color: hsl(var(--muted-foreground));
              }
              .day-footer strong {
                color: hsl(var(--foreground));
                font-weight: 600;
              }
              .summary {
                background: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                padding: 24px;
                border-radius: var(--radius);
                margin-top: 24px;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                text-align: center;
              }
              .summary h3 {
                margin: 0 0 16px 0;
                color: hsl(var(--foreground));
                font-size: 18px;
                font-weight: 600;
                letter-spacing: -0.025em;
              }
              .summary-stats {
                display: flex;
                justify-content: center;
                gap: 40px;
                flex-wrap: wrap;
              }
              .stat {
                text-align: center;
              }
              .stat-value {
                font-size: 32px;
                font-weight: 700;
                color: hsl(var(--foreground));
                letter-spacing: -0.05em;
              }
              .stat-label {
                font-size: 12px;
                color: hsl(var(--muted-foreground));
                text-transform: uppercase;
                font-weight: 500;
                letter-spacing: 0.05em;
                margin-top: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🗓️ ${duration}-Day Itinerary</h1>
                <div class="header-meta">
                  <div><strong>Destinations:</strong> ${validDestinations.map(d => d.name).join(' → ')}</div>
                  <div><span class="pace-badge">${pace} pace</span></div>
                  ${interests.length > 0 ? `<div><strong>Interests:</strong> ${interests.join(', ')}</div>` : ''}
                </div>
              </div>

              <div class="timeline">
                ${timelineHTML}
              </div>

              <div class="summary">
                <h3>Trip Summary</h3>
                <div class="summary-stats">
                  <div class="stat">
                    <div class="stat-value">$${totalCost.toFixed(0)}</div>
                    <div class="stat-label">Total Cost</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">$${(totalCost / duration).toFixed(0)}</div>
                    <div class="stat-label">Per Day</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">${validDestinations.length}</div>
                    <div class="stat-label">Destination${validDestinations.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const uiResource = createUIResource({
        uri: `ui://travel-planner/itinerary/${Date.now()}`,
        content: {
          type: 'externalUrl',
          iframeUrl: `data:text/html,${encodeURIComponent(html)}`,
        },
        encoding: 'text',
      });

      return {
        content: [
          {
            type: "text",
            text: `UI_RESOURCE:${JSON.stringify(uiResource)}`,
          },
        ],
      };
    }

    case "search_destinations_ui": {
      // UI version of search_destinations - returns interactive cards with shadcn design
      const criteria = args as SearchCriteria;

      // Use same search logic as text version
      let results = [...destinations];

      if (criteria.type) {
        results = results.filter((dest) => dest.type === criteria.type);
      }
      if (criteria.budget) {
        results = results.filter((dest) => dest.budgetLevel === criteria.budget);
      }
      if (criteria.climate) {
        results = results.filter((dest) => dest.climate === criteria.climate);
      }
      if (criteria.minRating !== undefined) {
        results = results.filter((dest) => dest.rating >= criteria.minRating!);
      }
      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        results = results.filter(
          (dest) =>
            dest.name.toLowerCase().includes(query) ||
            dest.country.toLowerCase().includes(query) ||
            dest.description.toLowerCase().includes(query)
        );
      }

      results.sort((a, b) => b.popularityScore - a.popularityScore);

      if (results.length === 0) {
        // Return shadcn-styled empty state
        const uiResource = createUIResource({
          uri: `ui://travel-planner/search/empty`,
          content: {
            type: 'externalUrl',
            iframeUrl: `data:text/html,${encodeURIComponent(`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    :root {
                      --background: 0 0% 100%;
                      --foreground: 240 10% 3.9%;
                      --card: 0 0% 100%;
                      --card-foreground: 240 10% 3.9%;
                      --muted: 240 4.8% 95.9%;
                      --muted-foreground: 240 3.8% 46.1%;
                      --border: 240 5.9% 90%;
                      --radius: 0.5rem;
                    }
                    * { box-sizing: border-box; }
                    body {
                      font-family: system-ui, -apple-system, sans-serif;
                      padding: 40px;
                      margin: 0;
                      background: hsl(var(--muted) / 0.3);
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .empty {
                      background: hsl(var(--card));
                      border: 1px solid hsl(var(--border));
                      border-radius: var(--radius);
                      padding: 40px;
                      text-align: center;
                      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    }
                    .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
                    h2 {
                      color: hsl(var(--foreground));
                      margin: 0 0 8px 0;
                      font-size: 20px;
                      font-weight: 600;
                    }
                    p {
                      color: hsl(var(--muted-foreground));
                      margin: 0;
                      font-size: 14px;
                    }
                  </style>
                </head>
                <body>
                  <div class="empty">
                    <div class="icon">🔍</div>
                    <h2>No Destinations Found</h2>
                    <p>Try adjusting your search filters</p>
                  </div>
                </body>
              </html>
            `)}`,
          },
          encoding: 'text',
        });

        return {
          content: [
            {
              type: "text",
              text: `UI_RESOURCE:${JSON.stringify(uiResource)}`,
            },
          ],
        };
      }

      // Build HTML for destination cards with shadcn design
      const cardsHTML = results.map((dest) => {
        const typeIcons: Record<string, string> = {
          beach: "🏖️",
          mountain: "⛰️",
          city: "🏙️",
          cultural: "🏛️",
          adventure: "🎒"
        };

        const climateIcons: Record<string, string> = {
          tropical: "🌴",
          temperate: "🍂",
          cold: "❄️",
          arid: "🌵"
        };

        return `
          <div class="card">
            <div class="card-header">
              <div class="badge">${typeIcons[dest.type]} ${dest.type}</div>
              <div class="badge climate-badge">${climateIcons[dest.climate]}</div>
            </div>
            <h3>${dest.name}</h3>
            <p class="country">${dest.country}</p>
            <div class="rating">${"⭐".repeat(Math.round(dest.rating))} ${dest.rating}/5</div>
            <p class="description">${dest.description}</p>
            <div class="details">
              <div class="detail">
                <span class="label">Budget</span>
                <span class="value">$${dest.averageDailyCost}/day</span>
              </div>
              <div class="detail">
                <span class="label">Level</span>
                <span class="value budget-${dest.budgetLevel}">${dest.budgetLevel}</span>
              </div>
              <div class="detail">
                <span class="label">Best time</span>
                <span class="value">${dest.bestTimeToVisit.slice(0, 2).join(", ")}</span>
              </div>
            </div>
            <div class="actions">
              <button class="primary" onclick="alert('Destination ID: ${dest.id}\\nUse get_destination_info_ui to see full details!')">
                View Details
              </button>
              <button class="secondary" onclick="alert('Would add ${dest.name} to trip planner!')">
                Add to Trip
              </button>
            </div>
          </div>
        `;
      }).join('');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              :root {
                --background: 0 0% 100%;
                --foreground: 240 10% 3.9%;
                --card: 0 0% 100%;
                --card-foreground: 240 10% 3.9%;
                --primary: 240 5.9% 10%;
                --primary-foreground: 0 0% 98%;
                --secondary: 240 4.8% 95.9%;
                --secondary-foreground: 240 5.9% 10%;
                --muted: 240 4.8% 95.9%;
                --muted-foreground: 240 3.8% 46.1%;
                --accent: 240 4.8% 95.9%;
                --accent-foreground: 240 5.9% 10%;
                --border: 240 5.9% 90%;
                --ring: 240 5.9% 10%;
                --radius: 0.5rem;
              }
              * { box-sizing: border-box; }
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                padding: 20px;
                background: hsl(var(--muted) / 0.3);
                min-height: 100vh;
              }
              .container {
                max-width: 1200px;
                margin: 0 auto;
              }
              .header {
                background: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                padding: 20px;
                border-radius: var(--radius);
                margin-bottom: 20px;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
              }
              .header h1 {
                margin: 0 0 4px 0;
                color: hsl(var(--foreground));
                font-size: 24px;
                font-weight: 600;
                letter-spacing: -0.025em;
              }
              .header p {
                margin: 0;
                color: hsl(var(--muted-foreground));
                font-size: 14px;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
              }
              .card {
                background: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                border-radius: var(--radius);
                padding: 20px;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                transition: all 0.2s;
              }
              .card:hover {
                box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.1);
                border-color: hsl(var(--ring) / 0.2);
              }
              .card-header {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
              }
              .badge {
                padding: 4px 12px;
                border-radius: calc(var(--radius) - 2px);
                font-size: 12px;
                font-weight: 500;
                background: hsl(var(--secondary));
                color: hsl(var(--secondary-foreground));
              }
              .card h3 {
                margin: 0 0 4px 0;
                color: hsl(var(--foreground));
                font-size: 20px;
                font-weight: 600;
                letter-spacing: -0.025em;
              }
              .country {
                color: hsl(var(--muted-foreground));
                font-size: 14px;
                margin: 0 0 8px 0;
              }
              .rating {
                font-size: 14px;
                color: hsl(var(--muted-foreground));
                margin-bottom: 12px;
              }
              .description {
                color: hsl(var(--foreground));
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 16px;
              }
              .details {
                background: hsl(var(--muted) / 0.5);
                border: 1px solid hsl(var(--border));
                padding: 12px;
                border-radius: calc(var(--radius) - 2px);
                margin-bottom: 16px;
              }
              .detail {
                display: flex;
                justify-content: space-between;
                margin-bottom: 6px;
                font-size: 13px;
              }
              .detail:last-child { margin-bottom: 0; }
              .label {
                color: hsl(var(--muted-foreground));
                font-weight: 500;
              }
              .value {
                color: hsl(var(--foreground));
                font-weight: 600;
              }
              .budget-low { color: hsl(142 76% 36%); }
              .budget-medium { color: hsl(32 95% 44%); }
              .budget-high { color: hsl(0 84% 60%); }
              .actions {
                display: flex;
                gap: 8px;
              }
              button {
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: calc(var(--radius) - 2px);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
              }
              button.primary {
                background: hsl(var(--primary));
                color: hsl(var(--primary-foreground));
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
              }
              button.primary:hover {
                background: hsl(var(--primary) / 0.9);
              }
              button.secondary {
                background: hsl(var(--secondary));
                color: hsl(var(--secondary-foreground));
                border: 1px solid hsl(var(--border));
              }
              button.secondary:hover {
                background: hsl(var(--accent));
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌍 ${results.length} Destination${results.length > 1 ? 's' : ''} Found</h1>
                <p>Click on a destination to see more details or add it to your trip</p>
              </div>
              <div class="grid">
                ${cardsHTML}
              </div>
            </div>
          </body>
        </html>
      `;

      const uiResource = createUIResource({
        uri: `ui://travel-planner/search/${Date.now()}`,
        content: {
          type: 'externalUrl',
          iframeUrl: `data:text/html,${encodeURIComponent(html)}`,
        },
        encoding: 'text',
      });

      return {
        content: [
          {
            type: "text",
            text: `UI_RESOURCE:${JSON.stringify(uiResource)}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Start the server
 * This connects the server to stdio (standard input/output)
 * so it can communicate with Claude Desktop
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP-UI Travel Planner Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
