# Sentiment Heatmap Issues & Fix Guide

## 🔴 The Problems

### Problem 1: Colors Keep Changing/Flashing
**What's happening:** The heatmap cells are constantly changing colors, creating a flashing effect.

**Why this happens:** The sentiment data is being regenerated on every render, likely through:
- `Math.random()` being called in the render cycle
- A `setInterval` updating the data periodically  
- Data being generated inside the component instead of being static

**User impact:** Can't read the actual sentiment values because they keep changing.

### Problem 2: Hover Shows Wrong Episode Counts
**What's happening:** When hovering over any cell, it shows the total episode count (1,171) instead of episodes for that specific week.

**Why this happens:** The tooltip is pulling from a global episode count instead of week-specific data.

**User impact:** Users can't tell how many episodes contributed to each week's sentiment score.

### Problem 3: All Cells React to One Hover
**What's happening:** Hovering over one cell might affect the display of other cells.

**Why this happens:** Using a shared hover state that all cells read from, instead of each cell managing its own hover state.

**User impact:** Confusing interaction where multiple tooltips appear or wrong data is shown.

### Problem 4: Left Alignment Issue
**What's happening:** The heatmap is pushed too far to the left of the container.

**Why this happens:** Missing proper centering styles or padding on the container.

**User impact:** Looks unpolished and breaks the visual hierarchy of the dashboard.

## ✅ Solution Approach

### For Claude Code to investigate:

**1. Find the data source:**
- Look for where sentiment data is created/stored
- Check if it's being regenerated (search for `Math.random`, `setInterval`, `generateMockData`)
- The data should be static - either hardcoded or fetched once

**2. Fix the hover system:**
- Each cell needs to track its own hover state
- The tooltip should receive cell-specific data (topic, week, value, weeklyEpisodeCount)
- Week episode counts need their own data structure

**3. Remove animations:**
- Check CSS for any `animation` or `@keyframes` rules
- Remove any background-color transitions
- Keep only simple hover effects (brightness, scale)

**4. Center the layout:**
- Add proper container margins/padding
- Ensure the grid is centered within its parent

## 🎯 Expected Outcome

**Before fixes:**
- Flashing colors
- Shows "1,171 episodes" for every cell
- Unstable hover behavior

**After fixes:**
- Static colors based on sentiment values (-1 to +1)
- Shows week-specific episode counts (e.g., "23 episodes" for Week 1)
- Clean hover interaction per cell
- Properly centered layout

## 💡 Suggested Investigation Order

1. **First, stabilize the data** - Stop the flashing by making data static
2. **Then fix hover interactions** - Make each cell independent
3. **Add week-specific episode counts** - Create proper data structure
4. **Finally, polish the layout** - Center and align properly

## 🔍 Key Questions for Claude Code to Answer

- Where is the sentiment data coming from?
- Is there a `setInterval` or animation timer anywhere?
- How is the hover state managed?
- Where is the episode count (1,171) coming from?
- Can we create a week-by-week episode count mapping?

The goal is a stable, readable heatmap where users can:
- See consistent sentiment trends
- Understand how many podcasts discussed each topic per week
- Get accurate information on hover
- Have a pleasant, non-distracting visual experience