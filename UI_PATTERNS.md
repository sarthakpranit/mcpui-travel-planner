# MCP-UI Pattern Library

**Date:** 2025-11-10
**Project:** MCP-UI Travel Planner
**Purpose:** Reusable UI patterns for MCP-UI tool development

---

## Overview

This document catalogs the UI patterns developed for the MCP-UI Travel Planner. Each pattern includes:
- **Use cases** - When to apply this pattern
- **Structure** - HTML/CSS architecture
- **Variants** - Common modifications
- **Code example** - Reusable template
- **Design tokens** - CSS variables used

---

## Design System Foundation

All patterns use the **shadcn/ui design token system** for consistency.

### Color Tokens
```css
:root {
  --background: 0 0% 100%;           /* Page background */
  --foreground: 240 10% 3.9%;        /* Primary text */
  --card: 0 0% 100%;                 /* Card backgrounds */
  --card-foreground: 240 10% 3.9%;   /* Card text */
  --primary: 240 5.9% 10%;           /* Primary actions */
  --primary-foreground: 0 0% 98%;    /* Text on primary */
  --secondary: 240 4.8% 95.9%;       /* Secondary actions */
  --secondary-foreground: 240 5.9% 10%; /* Text on secondary */
  --muted: 240 4.8% 95.9%;           /* Muted backgrounds */
  --muted-foreground: 240 3.8% 46.1%; /* Muted text */
  --accent: 240 4.8% 95.9%;          /* Accent highlights */
  --accent-foreground: 240 5.9% 10%; /* Text on accent */
  --destructive: 0 84.2% 60.2%;      /* Error/danger */
  --destructive-foreground: 0 0% 98%; /* Text on destructive */
  --border: 240 5.9% 90%;            /* Border color */
  --ring: 240 5.9% 10%;              /* Focus rings */
  --radius: 0.5rem;                  /* Border radius */
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
```

### Typography Tokens
```css
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1 {
  font-size: 28-32px;
  font-weight: 700;
  letter-spacing: -0.025em;
}

h2 {
  font-size: 20-24px;
  font-weight: 600;
  letter-spacing: -0.025em;
}

h3 {
  font-size: 18-20px;
  font-weight: 600;
}

body {
  font-size: 14-16px;
  line-height: 1.5-1.6;
}

small {
  font-size: 12-13px;
}
```

### Usage in Patterns
All colors should use `hsl(var(--token-name))` format to ensure dark mode works:
```css
/* ✅ Correct - works with dark mode */
background: hsl(var(--card));
color: hsl(var(--foreground));
border: 1px solid hsl(var(--border));

/* ❌ Wrong - hard-coded colors break dark mode */
background: white;
color: #333;
border: 1px solid #e5e5e5;
```

---

## Pattern 1: Card Grid

**Used in:** `search_destinations_ui`

### When to Use
- Displaying multiple items for browsing/comparison
- Search results, product catalogs, gallery views
- Items have similar structure (name, description, metadata)
- Users need to compare items side-by-side
- 3-20 items (use pagination for more)

### Structure
```
Container
└─ Header Card (summary)
└─ Grid (responsive columns)
   ├─ Card 1
   │  ├─ Card Header (badges)
   │  ├─ Title + Subtitle
   │  ├─ Metadata (rating, etc)
   │  ├─ Description
   │  ├─ Details Box (key facts)
   │  └─ Actions (buttons)
   ├─ Card 2
   └─ Card N
```

### Visual Characteristics
- **Layout:** CSS Grid, responsive (1-3 columns)
- **Card style:** Border, rounded corners, subtle shadow
- **Hover effect:** Increased shadow, border color change
- **Spacing:** 20px gap between cards
- **Badges:** Small labels for categories
- **Buttons:** Primary + secondary at bottom

### Code Template
```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Design tokens (include full token set) */
      :root {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --card: 0 0% 100%;
        --primary: 240 5.9% 10%;
        --secondary: 240 4.8% 95.9%;
        --muted: 240 4.8% 95.9%;
        --border: 240 5.9% 90%;
        --ring: 240 5.9% 10%;
        --radius: 0.5rem;
      }

      * { box-sizing: border-box; }

      body {
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 20px;
        background: hsl(var(--muted) / 0.3);
        min-height: 100vh;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
      }

      /* Header card */
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
      }

      /* Grid layout */
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      /* Individual card */
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

      /* Card header with badges */
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

      /* Card title */
      .card h3 {
        margin: 0 0 4px 0;
        color: hsl(var(--foreground));
        font-size: 20px;
        font-weight: 600;
      }

      /* Card description */
      .description {
        color: hsl(var(--foreground));
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 16px;
      }

      /* Details box */
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

      /* Action buttons */
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
        <h1>🌍 5 Results Found</h1>
        <p>Browse and compare your options</p>
      </div>

      <div class="grid">
        <!-- Card 1 -->
        <div class="card">
          <div class="card-header">
            <div class="badge">🏖️ beach</div>
            <div class="badge">🌴 tropical</div>
          </div>
          <h3>Bali</h3>
          <p class="country">Indonesia</p>
          <div class="rating">⭐⭐⭐⭐⭐ 4.8/5</div>
          <p class="description">A tropical paradise with stunning beaches...</p>
          <div class="details">
            <div class="detail">
              <span class="label">Budget</span>
              <span class="value">$80/day</span>
            </div>
            <div class="detail">
              <span class="label">Level</span>
              <span class="value">medium</span>
            </div>
          </div>
          <div class="actions">
            <button class="primary">View Details</button>
            <button class="secondary">Add to Trip</button>
          </div>
        </div>

        <!-- Card 2, 3, etc... -->
      </div>
    </div>
  </body>
</html>
```

### Variants

#### Compact Grid
Use for many items (20+):
```css
.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}
.card { padding: 16px; }
```

#### Large Cards
Use for few items (3-5) with rich content:
```css
.grid {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}
```

#### Single Column Mobile
Force single column on small screens:
```css
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### Best Practices
- ✅ Keep cards uniform height within same row (use flex if needed)
- ✅ Limit description to 2-3 lines (use `line-clamp` or truncation)
- ✅ Use hover states for interactivity feedback
- ✅ Place primary action on left (more prominent)
- ❌ Don't exceed 3 columns on desktop (cards become too narrow)
- ❌ Don't mix card heights drastically (looks messy)

---

## Pattern 2: Detailed Card

**Used in:** `get_destination_info_ui`

### When to Use
- Displaying comprehensive info about single item
- Detail views, profiles, full descriptions
- User navigated from summary/list to details
- Information has natural sections
- Rich metadata needs clear organization

### Structure
```
Container
└─ Card
   ├─ Header Section
   │  ├─ Title + Subtitle
   │  └─ Badges
   ├─ Content Section
   │  ├─ Rating/Metadata Bar
   │  ├─ Description Paragraph
   │  ├─ Info Grid (2x2 or 3x3)
   │  ├─ Section 1 (with list)
   │  ├─ Section 2 (with list)
   │  └─ Action Buttons
```

### Visual Characteristics
- **Layout:** Single card, full width (max-width: 800px)
- **Header:** Larger text, colored background
- **2x2 Grid:** Key facts in uniform boxes
- **Lists:** Checkmark bullets for visual interest
- **Sections:** Clear h2 headers with spacing
- **Buttons:** Full-width or side-by-side at bottom

### Code Template
```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Design tokens */
      :root {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --card: 0 0% 100%;
        --primary: 240 5.9% 10%;
        --muted: 240 4.8% 95.9%;
        --border: 240 5.9% 90%;
        --radius: 0.5rem;
      }

      * { box-sizing: border-box; }

      body {
        font-family: system-ui, -apple-system, sans-serif;
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

      /* Header section */
      .header {
        background: hsl(var(--muted));
        padding: 32px;
        border-bottom: 1px solid hsl(var(--border));
      }

      .header h1 {
        margin: 0 0 4px 0;
        font-size: 32px;
        font-weight: 700;
        color: hsl(var(--foreground));
      }

      .header p {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: hsl(var(--muted-foreground));
      }

      /* Badges */
      .badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .badge {
        padding: 4px 12px;
        border-radius: calc(var(--radius) - 2px);
        background: hsl(var(--secondary));
        font-size: 12px;
        font-weight: 500;
      }

      /* Content section */
      .content {
        padding: 32px;
      }

      /* Rating bar */
      .rating {
        font-size: 16px;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid hsl(var(--border));
      }

      /* Description */
      .description {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 32px;
      }

      /* Section headers */
      .section {
        margin-bottom: 32px;
      }

      .section h2 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
      }

      /* 2x2 info grid */
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
      }

      .info-box-value {
        font-size: 16px;
        color: hsl(var(--foreground));
        font-weight: 600;
      }

      /* Lists with checkmarks */
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

      /* Action buttons */
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
      }

      button.primary:hover {
        background: hsl(var(--primary) / 0.9);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <h1>Bali</h1>
          <p>Indonesia</p>
          <div class="badges">
            <div class="badge">beach</div>
            <div class="badge">tropical</div>
            <div class="badge">medium budget</div>
          </div>
        </div>

        <div class="content">
          <div class="rating">
            ⭐⭐⭐⭐⭐ 4.8/5
            <span class="popularity">(Popularity: 95/100)</span>
          </div>

          <div class="description">
            A tropical paradise with stunning beaches, lush rice terraces...
          </div>

          <div class="section">
            <h2>Travel Details</h2>
            <div class="grid">
              <div class="info-box">
                <div class="info-box-label">Daily Cost</div>
                <div class="info-box-value">$80</div>
              </div>
              <div class="info-box">
                <div class="info-box-label">Recommended Stay</div>
                <div class="info-box-value">5 days</div>
              </div>
              <div class="info-box">
                <div class="info-box-label">Main Airport</div>
                <div class="info-box-value">DPS</div>
              </div>
              <div class="info-box">
                <div class="info-box-label">Best Months</div>
                <div class="info-box-value">Apr, May, Jun</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Top Attractions</h2>
            <ul class="list">
              <li>Uluwatu Temple</li>
              <li>Rice Terraces</li>
              <li>Monkey Forest</li>
            </ul>
          </div>

          <div class="actions">
            <button class="primary">Plan Trip Here</button>
            <button class="secondary">Share</button>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
```

### Variants

#### 3x3 Info Grid
For more metadata:
```css
.grid {
  grid-template-columns: repeat(3, 1fr);
}
```

#### Tabbed Sections
For very long content:
```javascript
<div class="tabs">
  <button class="tab active">Overview</button>
  <button class="tab">Attractions</button>
  <button class="tab">Activities</button>
</div>
<div class="tab-content active">...</div>
```

#### With Image Header
Add visual appeal:
```html
<div class="image-header">
  <img src="bali.jpg" alt="Bali">
  <div class="overlay">
    <h1>Bali</h1>
  </div>
</div>
```

### Best Practices
- ✅ Use 2x2 or 3x3 grids (not 2x3 - looks unbalanced)
- ✅ Group related info in sections
- ✅ Use checkmark lists for actionable items
- ✅ Keep description to 2-3 sentences (expandable if needed)
- ❌ Don't exceed 800px max-width (too wide to scan)
- ❌ Don't mix different list styles (bullets vs checkmarks)

---

## Pattern 3: Timeline

**Used in:** `create_itinerary_ui`

### When to Use
- Sequential or temporal data (schedules, processes, histories)
- Multi-step workflows
- Day-by-day itineraries, project milestones
- Progress tracking
- Any data with before/after relationships

### Structure
```
Container
└─ Header Card (summary)
└─ Timeline (with vertical line)
   ├─ Day Card 1
   │  ├─ Day Header (day # + location)
   │  ├─ Note (optional)
   │  ├─ Activities List
   │  │  ├─ Activity 1 (time badge + content)
   │  │  ├─ Activity 2
   │  │  └─ Activity N
   │  └─ Day Footer (daily total)
   ├─ Day Card 2
   └─ Summary Card
```

### Visual Characteristics
- **Layout:** Vertical cards with left-side timeline
- **Timeline:** Vertical line with dot markers
- **Cards:** Offset from timeline with connecting lines
- **Time badges:** Small pills showing time of day
- **Hierarchy:** Day > Activities > Sub-info
- **Summary:** Final card with stats

### Code Template
```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Design tokens */
      :root {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --card: 0 0% 100%;
        --primary: 240 5.9% 10%;
        --secondary: 240 4.8% 95.9%;
        --muted: 240 4.8% 95.9%;
        --border: 240 5.9% 90%;
        --radius: 0.5rem;
      }

      * { box-sizing: border-box; }

      body {
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 20px;
        background: hsl(var(--muted) / 0.3);
        min-height: 100vh;
      }

      .container {
        max-width: 900px;
        margin: 0 auto;
      }

      /* Header card */
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
        font-size: 28px;
        font-weight: 700;
      }

      /* Timeline container */
      .timeline {
        position: relative;
      }

      /* Vertical line */
      .timeline:before {
        content: '';
        position: absolute;
        left: 32px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: hsl(var(--border));
      }

      /* Day card */
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

      /* Timeline dot */
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

      /* Day header */
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
      }

      .day-location {
        font-size: 16px;
        font-weight: 600;
      }

      /* Day note */
      .day-note {
        background: hsl(var(--muted) / 0.5);
        border: 1px solid hsl(var(--border));
        padding: 12px;
        border-radius: calc(var(--radius) - 2px);
        margin-bottom: 16px;
        font-size: 13px;
        font-style: italic;
        color: hsl(var(--muted-foreground));
      }

      /* Activities list */
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

      /* Time badge */
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

      /* Activity content */
      .activity-content {
        flex: 1;
      }

      .activity-content h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
      }

      .activity-content p {
        margin: 0 0 6px 0;
        font-size: 13px;
        color: hsl(var(--muted-foreground));
      }

      .activity-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: hsl(var(--muted-foreground));
      }

      /* Day footer */
      .day-footer {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid hsl(var(--border));
        text-align: right;
        font-size: 14px;
      }

      .day-footer strong {
        color: hsl(var(--foreground));
        font-weight: 600;
      }

      /* Summary card */
      .summary {
        background: hsl(var(--card));
        border: 1px solid hsl(var(--border));
        padding: 24px;
        border-radius: var(--radius);
        margin-top: 24px;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        text-align: center;
      }

      .summary-stats {
        display: flex;
        justify-content: center;
        gap: 40px;
        flex-wrap: wrap;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
      }

      .stat-label {
        font-size: 12px;
        color: hsl(var(--muted-foreground));
        text-transform: uppercase;
        margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🗓️ 7-Day Itinerary</h1>
        <div class="header-meta">
          <strong>Destinations:</strong> Bali → Tokyo
        </div>
      </div>

      <div class="timeline">
        <div class="day-card">
          <div class="day-header">
            <div class="day-number">Day 1</div>
            <div class="day-location">📍 Bali</div>
          </div>
          <div class="day-note">Arrival day - take it easy</div>
          <div class="activities">
            <div class="activity">
              <div class="time-badge">morning</div>
              <div class="activity-content">
                <h4>Beach relaxation</h4>
                <p>Enjoy the beautiful beaches</p>
                <div class="activity-meta">
                  <span>⏱️ 3h</span>
                  <span>💵 $24</span>
                </div>
              </div>
            </div>
            <!-- More activities -->
          </div>
          <div class="day-footer">
            <strong>Daily Total:</strong> $80
          </div>
        </div>

        <!-- More day cards -->
      </div>

      <div class="summary">
        <h3>Trip Summary</h3>
        <div class="summary-stats">
          <div class="stat">
            <div class="stat-value">$630</div>
            <div class="stat-label">Total Cost</div>
          </div>
          <div class="stat">
            <div class="stat-value">$90</div>
            <div class="stat-label">Per Day</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
```

### Variants

#### Horizontal Timeline
For fewer items (3-5 steps):
```css
.timeline {
  display: flex;
  justify-content: space-between;
}
.timeline:before {
  /* Horizontal line instead */
  left: 0;
  right: 0;
  top: 20px;
  width: 100%;
  height: 2px;
}
```

#### Compact Timeline
For many items (20+):
```css
.day-card {
  padding: 12px;
  margin-bottom: 12px;
}
.activities {
  gap: 6px;
}
```

#### Progress Timeline
Show completion status:
```css
.day-card.completed:before {
  background: hsl(142 76% 36%); /* Green */
  content: "✓";
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Best Practices
- ✅ Use vertical timeline for 5+ items (easier to scan)
- ✅ Keep timeline on left (reading order: dot → content)
- ✅ Group sub-items within each timeline entry
- ✅ Use time badges for temporal data
- ✅ Include summary card at end for overview
- ❌ Don't mix completed and incomplete items without clear distinction
- ❌ Don't use timeline for unordered data (use grid instead)

---

## Common Sub-Patterns

### Badges
**Purpose:** Categorize, tag, or label items

```html
<div class="badge">🏖️ beach</div>
<div class="badge primary">Active</div>
<div class="badge destructive">Expired</div>
```

```css
.badge {
  padding: 4px 12px;
  border-radius: calc(var(--radius) - 2px);
  font-size: 12px;
  font-weight: 500;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.badge.primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.badge.destructive {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}
```

### Empty States
**Purpose:** Communicate no results gracefully

```html
<div class="empty">
  <div class="icon">🔍</div>
  <h2>No Results Found</h2>
  <p>Try adjusting your filters</p>
</div>
```

```css
.empty {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 40px;
  text-align: center;
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
```

### Info Boxes
**Purpose:** Display key facts in structured format

```html
<div class="info-box">
  <div class="info-box-label">Daily Cost</div>
  <div class="info-box-value">$80</div>
</div>
```

```css
.info-box {
  background: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border));
  padding: 16px;
  border-radius: calc(var(--radius) - 2px);
}

.info-box-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  margin-bottom: 4px;
}

.info-box-value {
  font-size: 16px;
  color: hsl(var(--foreground));
  font-weight: 600;
}
```

---

## Integration with MCP-UI

### createUIResource Boilerplate
```typescript
const uiResource = createUIResource({
  uri: `ui://your-app/tool-name/${uniqueId}`,
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
```

### HTML Escaping
Always use `encodeURIComponent()` for data URLs:
```typescript
const html = `<!DOCTYPE html>...`;
const encoded = encodeURIComponent(html);
const dataUrl = `data:text/html,${encoded}`;
```

**Common pitfalls:**
- ❌ Don't use template literal variables without escaping: `${user.name}` → XSS risk
- ✅ Escape user data: `${escapeHtml(user.name)}`
- ❌ Don't forget to encode data URL: `data:text/html,${html}` → breaks on special chars
- ✅ Always encode: `data:text/html,${encodeURIComponent(html)}`

---

## Pattern Selection Guide

| Data Type | Pattern | Reason |
|-----------|---------|--------|
| 3-20 similar items | Card Grid | Comparison, browsing |
| Single detailed item | Detailed Card | Comprehensive info |
| Sequential steps | Timeline | Shows progression |
| 2 items | Detailed Card (side-by-side) | Direct comparison |
| 20+ items | Compact Grid + Pagination | Scalability |
| Form/input | Detailed Card + inputs | Focused interaction |
| Dashboard/metrics | Grid of Info Boxes | Scannable stats |
| Process flow | Timeline | Shows steps |

---

## Performance Optimization

### Minimize Payload Size
```
Base overhead: ~5KB (design tokens, base styles)
Per card: ~0.5-1KB
Total for 10 cards: ~10-15KB
```

**Optimization tips:**
- ✅ Inline only essential CSS (no unused rules)
- ✅ Use CSS shorthand: `padding: 10px` not `padding-top: 10px; padding-right: 10px...`
- ✅ Minify HTML in production (remove whitespace)
- ✅ Paginate large lists (max 20 items per page)
- ❌ Don't inline images (use emoji or icons instead)
- ❌ Don't include unused CSS frameworks

### Rendering Performance
```
Target: <100ms initial render
Acceptable: <500ms for complex UIs
```

**Tips:**
- ✅ Avoid deeply nested DOM (max 10 levels)
- ✅ Use CSS transforms for animations (GPU accelerated)
- ✅ Lazy-load images if used
- ❌ Don't use complex JavaScript in data URLs
- ❌ Don't animate expensive properties (width, height)

---

## Accessibility

### Semantic HTML
```html
<!-- ✅ Good: semantic structure -->
<article class="card">
  <header>
    <h3>Title</h3>
  </header>
  <section>
    <p>Description</p>
  </section>
  <footer>
    <button>Action</button>
  </footer>
</article>

<!-- ❌ Bad: all divs -->
<div class="card">
  <div class="title">Title</div>
  <div>Description</div>
  <div onclick="...">Action</div>
</div>
```

### ARIA Labels
```html
<button aria-label="Add Bali to trip">
  Add to Trip
</button>

<div class="rating" aria-label="4.8 out of 5 stars">
  ⭐⭐⭐⭐⭐ 4.8/5
</div>
```

### Keyboard Navigation
```html
<button tabindex="0">Clickable</button>
<a href="#" tabindex="0">Link</a>
```

Ensure all interactive elements are keyboard accessible.

---

## Testing Checklist

Before shipping a UI pattern:

- [ ] Renders correctly in iframe
- [ ] Dark mode works (if using design tokens)
- [ ] Responsive on mobile (320px-768px)
- [ ] Hover states provide feedback
- [ ] Buttons are clickable (or show alert for demo)
- [ ] Empty states display correctly
- [ ] Error states display correctly
- [ ] Payload size < 20KB
- [ ] No console errors in browser
- [ ] Works in sandboxed iframe (no external resources)

---

## Conclusion

These three patterns (Card Grid, Detailed Card, Timeline) cover 80% of MCP-UI use cases. Combine with sub-patterns (badges, info boxes, empty states) for complete UIs.

**Key takeaways:**
1. Always use design tokens for consistency
2. Keep patterns simple and reusable
3. Optimize payload size (<20KB target)
4. Test in actual iframe sandbox
5. Provide text alternative when possible

For more guidance, see TEXT_VS_UI_ANALYSIS.md and MCP_UI_BEST_PRACTICES.md.

---

*Pattern library extracted from MCP-UI Travel Planner project (2025-11-10)*
