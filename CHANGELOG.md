# Changelog

## [Unreleased]

### Fixed
- Fixed quarterly data alignment issues in Topic Velocity Chart
  - Root cause: Multiple issues with ISO week to calendar quarter mapping
  - Fixed filterDataByQuarter to use Thursday of each week for quarter determination (ISO standard)
  - Fixed mergeQuarterData to show full quarter range (e.g., weeks 14-26 for Q2) even with incomplete data
  - Fixed comparison mapping so Q1 week 13 (with 28 mentions) correctly aligns with Q2 week 26
  - Changed default quarter to Q2 instead of current quarter
- Fixed command bar issues on main dashboard
  - Root cause: Dashboard was using outdated command bar component
  - Solution: Updated import to use search-command-bar-fixed.tsx (same as test page)
  - Resolved input field interaction difficulties and results flashing

### Changed
- Cleaned up all debugging code for production readiness
  - Removed 40+ console.log statements across the codebase
  - Removed debug logging from Topic Velocity Chart, Search Command Bar, API routes
  - Preserved legitimate error handling with console.error
  - Improved code quality and performance

### Fixed (Previous)
- Fixed infinite loop error when switching to quarterly view in Topic Velocity Chart
  - Root cause: Parent component's `onNotablePerformerChange` callback was creating new function references on each render
  - Solution: Disabled parent updates when in quarterly mode (`showComparison = true`)
  - Added proper data transformation for quarterly view showing weeks as "YYYY Q# W#" format
  - Quarterly view now shows last 3 quarters of available data
  - Removed hardcoded year filter that was causing empty data issues
  - Added memoization for derived calculations (periodTrends, notablePerformer, weeklyTrends)
  - Added guards to prevent invalid data updates

### Changed
- Quarterly chart now displays proper week numbering within quarters (W1-W13)
- X-axis labels in quarterly view are angled for better readability
- Updated quarterly view indicator to show actual quarters being displayed
- Removed duplicate "(Previous Period)" legend entries
- Button text changed from "Quarterly" to "Quarters" for clarity

### Technical Details
- The infinite loop was caused by a circular dependency: 
  - Chart updates notable performer → Parent updates state → Parent re-renders → New callback reference → Effect triggers again
- Fixed by adding `!showComparison` condition to prevent parent updates in quarterly mode
- Memoized all derived calculations to optimize performance
- Added proper null checks and default values for edge cases