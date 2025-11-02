# Testing the Travel Planner Tools

Open http://localhost:3000 and test these tools in your browser!

## Tool Overview

This project has **8 tools** organized in 3 categories:

### Demo Tools (2)
- `hello_world` - Simple text response
- `hello_world_ui` - Interactive UI greeting card

### Text-Based Travel Tools (3)
- `search_destinations` - Search for destinations (text results)
- `get_destination_info` - Get detailed destination info (text)
- `create_itinerary` - Generate day-by-day itinerary (text)

### UI-Enhanced Travel Tools (3) ✨
- `search_destinations_ui` - Search with interactive card grid
- `get_destination_info_ui` - Detailed destination card with visuals
- `create_itinerary_ui` - Visual timeline with day cards

---

## Demo Tools

### hello_world

**Purpose:** Basic tool to test MCP communication

**Input:** Just enter your name (no JSON needed)
```
John
```

**Expected Output:** Text message: "Hello, John! This is a simple MCP tool response."

---

### hello_world_ui

**Purpose:** Test MCP-UI interactive component rendering

**Input:** Just enter your name (no JSON needed)
```
Jane
```

**Expected Output:** Interactive UI card with:
- Purple gradient background
- Personalized greeting
- Current timestamp
- Styled container with shadow

---

## Text-Based Travel Tools

### 1. search_destinations

**Purpose:** Find destinations based on filters

#### Test Case 1: Search by type
**Select:** Search Destinations
**Input:**
```json
{"type": "beach"}
```
**Expected:** Returns 3 beach destinations (Bali, Maldives, Santorini) with basic info

#### Test Case 2: Search by budget
**Input:**
```json
{"budget": "low"}
```
**Expected:** Returns 4 budget-friendly destinations (Marrakech, Lisbon, Ubud, Chiang Mai)

#### Test Case 3: Combined filters
**Input:**
```json
{"type": "cultural", "climate": "temperate", "minRating": 4.5}
```
**Expected:** Returns Rome and Kyoto (cultural + temperate + highly rated)

#### Test Case 4: Text search
**Input:**
```json
{"query": "japan"}
```
**Expected:** Returns Tokyo and Kyoto

#### Test Case 5: Climate filter
**Input:**
```json
{"climate": "tropical"}
```
**Expected:** Returns tropical destinations (Bali, Maldives)

#### Test Case 6: High rating filter
**Input:**
```json
{"minRating": 4.7}
```
**Expected:** Returns only top-rated destinations

#### Test Case 7: No results
**Input:**
```json
{"type": "beach", "climate": "cold"}
```
**Expected:** "No destinations found" message

---

### 2. get_destination_info

**Purpose:** Get comprehensive details about a specific destination

#### Test Case 1: Popular beach destination
**Select:** Get Destination Info
**Input:**
```json
{"destination_id": "bali-001"}
```
**Expected:** Detailed Bali info including:
- Location (Indonesia)
- Climate (tropical)
- Budget level and daily cost ($75)
- Rating and popularity score
- Top attractions list
- Activities available
- Best months to visit
- Airport information

#### Test Case 2: City destination
**Input:**
```json
{"destination_id": "tokyo-001"}
```
**Expected:** Tokyo information with urban attractions and activities

#### Test Case 3: Cultural destination
**Input:**
```json
{"destination_id": "rome-001"}
```
**Expected:** Rome info with historical sites and cultural activities

#### Test Case 4: Adventure destination
**Input:**
```json
{"destination_id": "patagonia-001"}
```
**Expected:** Patagonia with hiking trails and adventure activities

#### Test Case 5: Invalid ID
**Input:**
```json
{"destination_id": "invalid-999"}
```
**Expected:** Error message "Destination not found: invalid-999"

---

### 3. create_itinerary

**Purpose:** Generate day-by-day travel itinerary

#### Test Case 1: Single destination, moderate pace
**Select:** Create Itinerary
**Input:**
```json
{
  "destination_ids": ["bali-001"],
  "duration": 5,
  "pace": "moderate",
  "interests": ["beaches", "culture", "food"]
}
```
**Expected:** 5-day Bali itinerary with:
- 3 activities per day (moderate pace)
- Morning/afternoon/evening time slots
- Daily cost breakdown
- Total trip cost
- Activities based on interests

#### Test Case 2: Multiple destinations
**Input:**
```json
{
  "destination_ids": ["tokyo-001", "kyoto-001"],
  "duration": 7,
  "pace": "packed"
}
```
**Expected:** 7-day itinerary with:
- 4 activities per day (packed pace)
- Split between Tokyo and Kyoto based on recommended stay days
- Transition notes between destinations

#### Test Case 3: Relaxed pace
**Input:**
```json
{
  "destination_ids": ["santorini-001"],
  "duration": 4,
  "pace": "relaxed"
}
```
**Expected:** 4-day itinerary with 2 activities per day

#### Test Case 4: Adventure trip
**Input:**
```json
{
  "destination_ids": ["patagonia-001", "iceland-001"],
  "duration": 14,
  "pace": "moderate",
  "interests": ["hiking", "photography", "nature"]
}
```
**Expected:** 14-day multi-destination itinerary

#### Test Case 5: Invalid destination
**Input:**
```json
{
  "destination_ids": ["invalid-001"],
  "duration": 5
}
```
**Expected:** Error message about invalid destinations

---

## UI-Enhanced Travel Tools ✨

### 4. search_destinations_ui

**Purpose:** Interactive card grid of destinations with rich visuals

#### Test Case 1: Beach search with UI
**Select:** Search Destinations (UI) ✨
**Input:**
```json
{"type": "beach"}
```
**Expected:** Interactive UI showing:
- Grid of destination cards
- Type and climate badges on each card
- Star ratings
- Budget information with color coding
- "View Details" and "Add to Trip" buttons
- Hover effects on cards

#### Test Case 2: Budget search
**Input:**
```json
{"budget": "medium"}
```
**Expected:** Card grid with medium-budget destinations

#### Test Case 3: Combined filters
**Input:**
```json
{"type": "cultural", "minRating": 4.5}
```
**Expected:** High-rated cultural destinations in card format

#### Test Case 4: Empty results
**Input:**
```json
{"type": "beach", "climate": "cold"}
```
**Expected:** Clean empty state card with search icon

---

### 5. get_destination_info_ui

**Purpose:** Detailed destination card with visual hierarchy

#### Test Case 1: Beach destination
**Select:** Get Destination Info (UI) ✨
**Input:**
```json
{"destination_id": "bali-001"}
```
**Expected:** Comprehensive UI card with:
- Header with badges (type, climate, budget)
- Star rating with popularity score
- Description paragraph
- 2x2 grid of travel details (cost, stay, airport, months)
- Checkmark-bulleted lists for attractions
- Checkmark-bulleted lists for activities
- Action buttons (Plan Trip, Share)

#### Test Case 2: City destination
**Input:**
```json
{"destination_id": "tokyo-001"}
```
**Expected:** Tokyo card with urban-specific info

#### Test Case 3: Cultural site
**Input:**
```json
{"destination_id": "rome-001"}
```
**Expected:** Rome card highlighting historical attractions

#### Test Case 4: Adventure location
**Input:**
```json
{"destination_id": "iceland-001"}
```
**Expected:** Iceland card with adventure activities

#### Test Case 5: Error state
**Input:**
```json
{"destination_id": "invalid-999"}
```
**Expected:** Error card with red accent border

---

### 6. create_itinerary_ui

**Purpose:** Visual timeline showing day-by-day plan

#### Test Case 1: Single destination
**Select:** Create Itinerary (UI) ✨
**Input:**
```json
{
  "destination_ids": ["bali-001"],
  "duration": 5,
  "pace": "moderate"
}
```
**Expected:** Visual timeline with:
- Header showing trip title and metadata
- Pace badge
- Vertical timeline with dots
- Day cards connected by timeline
- Activity cards grouped by time of day
- Time badges (morning/afternoon/evening)
- Daily cost on each card
- Summary card with total cost, per-day cost, destination count

#### Test Case 2: Multi-destination trip
**Input:**
```json
{
  "destination_ids": ["tokyo-001", "kyoto-001"],
  "duration": 7,
  "pace": "packed",
  "interests": ["culture", "food", "temples"]
}
```
**Expected:** Timeline showing location changes and 4 activities/day

#### Test Case 3: Relaxed vacation
**Input:**
```json
{
  "destination_ids": ["maldives-001"],
  "duration": 6,
  "pace": "relaxed"
}
```
**Expected:** Timeline with 2 leisurely activities per day

#### Test Case 4: Invalid input
**Input:**
```json
{
  "destination_ids": ["invalid-001"],
  "duration": 5
}
```
**Expected:** Error state UI with helpful message

---

## Quick Reference: All Destination IDs

### Beach Destinations
- `bali-001` - Bali, Indonesia (tropical, medium budget, 4.7★)
- `maldives-001` - Maldives (tropical, high budget, 4.9★)
- `santorini-001` - Santorini, Greece (temperate, high budget, 4.8★)

### City Destinations
- `tokyo-001` - Tokyo, Japan (temperate, high budget, 4.8★)
- `lisbon-001` - Lisbon, Portugal (temperate, low budget, 4.5★)
- `dubai-001` - Dubai, UAE (arid, high budget, 4.6★)

### Cultural Destinations
- `rome-001` - Rome, Italy (temperate, medium budget, 4.7★)
- `kyoto-001` - Kyoto, Japan (temperate, medium budget, 4.8★)
- `marrakech-001` - Marrakech, Morocco (arid, low budget, 4.4★)
- `bali-ubud-001` - Ubud, Bali (tropical, low budget, 4.6★)
- `chiang-mai-001` - Chiang Mai, Thailand (tropical, low budget, 4.5★)

### Adventure Destinations
- `patagonia-001` - Patagonia, Argentina (cold, medium budget, 4.7★)
- `iceland-001` - Iceland (cold, high budget, 4.8★)
- `new-zealand-001` - New Zealand (temperate, medium budget, 4.9★)

### Mountain Destinations
- `swiss-alps-001` - Swiss Alps, Switzerland (cold, high budget, 4.9★)

---

## Testing Strategy

### Level 1: Basic Functionality
1. **Test demo tools** to verify MCP communication works
2. **Test each text tool** with simple single-parameter inputs
3. **Test each UI tool** with same inputs to compare output

### Level 2: Feature Coverage
1. **Test all parameter combinations** for search_destinations
2. **Test multiple destination IDs** for get_destination_info
3. **Test all pace options** (relaxed, moderate, packed) for itineraries
4. **Test multi-destination trips** with 2-3 locations

### Level 3: Edge Cases
1. **Empty results** - Search with impossible criteria
2. **Invalid inputs** - Wrong destination IDs, negative durations
3. **Boundary values** - Max ratings, min budgets
4. **Large trips** - 14+ day itineraries

### Level 4: UI/UX Testing
1. **Compare text vs UI** for same data
2. **Test responsive behavior** in iframe
3. **Verify button interactions** (alerts work)
4. **Check visual consistency** across all UI tools

---

## What to Look For

### Text Tools
✅ **Formatting:** Markdown headers, bullets, spacing
✅ **Completeness:** All requested data present
✅ **Accuracy:** Numbers, dates, and names correct
✅ **Error messages:** Helpful and clear

### UI Tools
✅ **Visual design:** shadcn tokens applied consistently
✅ **Layout:** Cards, grids, timelines render properly
✅ **Interactivity:** Buttons show alerts, hover states work
✅ **Responsive:** Content fits iframe without scrolling issues
✅ **Typography:** Font sizes, weights, spacing appropriate
✅ **Colors:** Semantic tokens used correctly

### Performance
✅ **Response time:** < 100ms for all tools
✅ **No errors:** Check browser console
✅ **Build status:** TypeScript compiles without warnings

---

## Common Testing Patterns

### Pattern 1: Search → Info → Itinerary
```
1. Search for "beach" destinations
2. Note the destination_id from results (e.g., "bali-001")
3. Get info for that destination
4. Create 5-day itinerary using that destination
```

### Pattern 2: Compare Text vs UI
```
1. Use search_destinations with {"type": "city"}
2. Use search_destinations_ui with same input
3. Compare information density and clarity
4. Note which format is easier to scan
```

### Pattern 3: Multi-Destination Planning
```
1. Search for "cultural" destinations
2. Get info for 2-3 results
3. Create 10-day itinerary combining them
4. Verify trip flows logically between locations
```

---

## Troubleshooting

### Tool Not Found Error
- Check tool name spelling exactly matches
- Ensure server is rebuilt after code changes: `npm run build:server`
- Restart bridge server: `npm run bridge --workspace=server`

### UI Not Rendering
- Check browser console for errors
- Verify iframe sandbox permissions
- Ensure HTML is properly encoded in data URL

### Invalid JSON Error
- Use valid JSON syntax (double quotes, no trailing commas)
- Test JSON in a validator first
- Check for missing braces or brackets

### Server Not Responding
- Kill old processes: `lsof -ti:3001 | xargs kill`
- Restart bridge: `npm run bridge --workspace=server`
- Check server logs for errors

---

## Next Steps After Testing

### Document Findings
- Which tools are most useful in text vs UI format?
- What UI patterns work best for travel data?
- Any performance bottlenecks?

### Identify Improvements
- Additional filters needed for search?
- Missing information in destination details?
- Better activity suggestions for itineraries?

### Design Insights
- When does UI add value vs complexity?
- What interaction patterns feel natural?
- How to handle errors gracefully?

### Phase 5 Planning
- Add more destinations to database
- Implement real-time pricing APIs
- Add map visualizations
- Enable itinerary editing/saving

---

**Happy Testing! 🧪**
