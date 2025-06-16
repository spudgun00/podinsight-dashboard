# Technical Debt Register - PodInsightHQ Dashboard

**Last Updated:** June 16, 2025  
**Sprint:** Genesis Sprint (Phase 3)  
**Priority Levels:** 🔴 High | 🟡 Medium | 🟢 Low

---

## Overview

This document tracks technical debt incurred during rapid development of the PodInsightHQ dashboard. Each item includes impact assessment, proposed resolution, and effort estimation.

---

## 🟡 TypeScript Configuration Issues

### Files with TypeScript Checking Disabled

The following UI components have `// @ts-nocheck` directive due to missing type definitions:

| File | Missing Dependency | Used in App | Impact | Priority |
|------|-------------------|-------------|--------|----------|
| `components/ui/calendar.tsx` | `react-day-picker` v9 API mismatch | ❌ No | None | 🟢 Low |
| `components/ui/carousel.tsx` | `embla-carousel-react` | ❌ No | None | 🟢 Low |
| `components/ui/drawer.tsx` | `vaul` | ❌ No | None | 🟢 Low |
| `components/ui/input-otp.tsx` | `input-otp` | ❌ No | None | 🟢 Low |
| `components/ui/resizable.tsx` | `react-resizable-panels` | ❌ No | None | 🟢 Low |
| `components/ui/sonner.tsx` | `sonner`, `next-themes` | ❌ No | None | 🟢 Low |

**Total Files Affected:** 6 (all unused in current implementation)

### Resolution Options:
1. **Immediate (Recommended):** Remove unused components
2. **Future Sprint:** Install missing dependencies if components needed
3. **Alternative:** Create dedicated UI component library

**Effort Estimate:** 1-2 hours

### Cleanup Commands:
```bash
# Step 1: Remove all unused UI components with @ts-nocheck
rm -f components/ui/calendar.tsx
rm -f components/ui/carousel.tsx
rm -f components/ui/drawer.tsx
rm -f components/ui/input-otp.tsx
rm -f components/ui/resizable.tsx
rm -f components/ui/sonner.tsx

# Step 2: Verify no imports reference these files
grep -r "calendar\|carousel\|drawer\|input-otp\|resizable\|sonner" components/ lib/ app/

# Step 3: Remove from git
git rm components/ui/{calendar,carousel,drawer,input-otp,resizable,sonner}.tsx
```

---

## 🟡 Dependency Bloat

### Unnecessary Dependencies Installed

During v0 component integration, the following packages were added:

**Radix UI Components (28 packages, ~1.2MB):**
```
@radix-ui/react-accordion     @radix-ui/react-navigation-menu
@radix-ui/react-alert-dialog  @radix-ui/react-popover
@radix-ui/react-aspect-ratio  @radix-ui/react-progress
@radix-ui/react-avatar        @radix-ui/react-radio-group
@radix-ui/react-checkbox      @radix-ui/react-scroll-area
@radix-ui/react-collapsible   @radix-ui/react-select
@radix-ui/react-context-menu  @radix-ui/react-separator
@radix-ui/react-dialog        @radix-ui/react-slider
@radix-ui/react-dropdown-menu @radix-ui/react-slot
@radix-ui/react-hover-card    @radix-ui/react-switch
@radix-ui/react-label         @radix-ui/react-tabs
@radix-ui/react-menubar       @radix-ui/react-toast
                              @radix-ui/react-toggle
                              @radix-ui/react-toggle-group
                              @radix-ui/react-tooltip
```

**Additional Dependencies:**
- `class-variance-authority` (10KB)
- `cmdk` (15KB) - Command menu, not used
- `react-day-picker` (45KB) - Calendar, not used
- `date-fns` (75KB) - Date utilities, not used
- `react-hook-form` (25KB) - Forms, not used

**Total Impact:**
- **Bundle Size:** ~2MB additional (uncompressed)
- **Node Modules:** 71 extra packages
- **Install Time:** +5 seconds
- **Security Surface:** Increased dependency maintenance

### Resolution:
1. **Phase 1:** Identify actually used components (currently: none)
2. **Phase 2:** Remove unused dependencies
3. **Phase 3:** Implement tree-shaking for production builds

**Effort Estimate:** 2-3 hours

### Cleanup Commands:
```bash
# Step 1: Analyze unused dependencies
npx depcheck

# Step 2: Check which UI components are actually imported
grep -r "@/components/ui" app/ components/dashboard/ lib/ | grep -v "node_modules"

# Step 3: Remove unused Radix UI packages (if none are used)
npm uninstall @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox \
  @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label \
  @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover \
  @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area \
  @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider \
  @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast \
  @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Step 4: Remove other unused packages
npm uninstall cmdk react-day-picker date-fns react-hook-form

# Step 5: Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Step 6: Verify build still works
npm run build
```

---

## 🟢 Import Path Inconsistencies

### Incorrect Import Paths Fixed

The following files had incorrect import paths that were corrected:

| Original Path | Corrected Path | Files Affected |
|--------------|----------------|----------------|
| `@/lib/types` | `@/lib/v0-types` | 4 files |
| `@/hooks/use-mobile` | `@/components/ui/use-mobile` | sidebar.tsx |
| `@/hooks/use-toast` | `@/components/ui/use-toast` | toaster.tsx |

**Root Cause:** v0 generated code with different file structure than expected

### Resolution:
1. Standardize file organization
2. Move hooks to proper `/hooks` directory
3. Rename `v0-types.ts` to `types.ts`

**Effort Estimate:** 1 hour

### Cleanup Commands:
```bash
# Step 1: Create hooks directory
mkdir -p hooks

# Step 2: Move hook files to proper location
mv components/ui/use-mobile.tsx hooks/use-mobile.tsx
mv components/ui/use-toast.ts hooks/use-toast.ts

# Step 3: Update imports in affected files
sed -i '' 's|@/components/ui/use-mobile|@/hooks/use-mobile|g' components/ui/sidebar.tsx
sed -i '' 's|@/components/ui/use-toast|@/hooks/use-toast|g' components/ui/toaster.tsx

# Step 4: Rename v0-types to types
mv lib/v0-types.ts lib/types.ts

# Step 5: Update all imports
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|v0-types|types|g'

# Step 6: Verify no broken imports
npm run build
```

---

## 🟢 Code Quality Issues

### Type Safety Compromises

1. **Unsafe Type Conversions:**
   - Used `Number()` wrapper to fix arithmetic operations
   - Files: `topic-velocity-chart.tsx` (2 instances)
   - Better solution: Proper type definitions

2. **String Type Assertions:**
   - Used `String()` wrapper for parseFloat operations
   - File: `topic-velocity-chart-with-api.tsx`
   - Better solution: Type guards

### Resolution:
- Add proper TypeScript interfaces
- Implement type guards for data validation
- Remove type assertion workarounds

**Effort Estimate:** 2 hours

### Cleanup Commands:
```bash
# Step 1: Find all Number() and String() workarounds
grep -rn "Number(" components/dashboard/ --include="*.tsx"
grep -rn "String(" components/dashboard/ --include="*.tsx"

# Step 2: Create type guard utilities
cat > lib/type-guards.ts << 'EOF'
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function ensureNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) return num;
  }
  return 0;
}
EOF

# Step 3: Replace Number() calls with type-safe alternatives
# Manual process - example:
# Before: const recent = Number(data[len - 1][topicName as keyof TopicData])
# After:  const recent = ensureNumber(data[len - 1][topicName as keyof TopicData])

# Step 4: Run TypeScript compiler to check
npx tsc --noEmit
```

---

## 🟡 Build Configuration

### Current Build Warnings

1. **Large First Load JS:** 235 kB (target: <200 kB)
2. **Unused Components:** 54 UI components bundled but not used
3. **No Bundle Analyzer:** Can't identify largest contributors

### Resolution:
1. Configure bundle analyzer
2. Implement code splitting
3. Remove unused components
4. Optimize imports

**Effort Estimate:** 3-4 hours

### Optimization Commands:
```bash
# Step 1: Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Step 2: Configure analyzer in next.config.js
cat > next.config.js << 'EOF'
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your existing config
})
EOF

# Step 3: Analyze bundle
ANALYZE=true npm run build

# Step 4: Find largest dependencies
du -sh node_modules/* | sort -rh | head -20

# Step 5: Check for duplicate dependencies
npm ls --depth=0 | grep -E "deduped|UNMET"

# Step 6: Implement dynamic imports for heavy components
# Example: const Chart = dynamic(() => import('./TopicVelocityChart'), { ssr: false })
```

---

## 📋 Resolution Priority Matrix

| Priority | Items | Impact | Effort | When |
|----------|-------|---------|---------|------|
| 🔴 High | None currently | - | - | - |
| 🟡 Medium | Remove unused dependencies | -2MB bundle | 3h | Sprint 2 |
| 🟡 Medium | Fix TypeScript paths | Code clarity | 1h | Sprint 2 |
| 🟢 Low | Remove @ts-nocheck | Type safety | 2h | Sprint 3 |
| 🟢 Low | Optimize bundle | Performance | 4h | Sprint 3 |

---

## 🎯 Recommendations

### Immediate Actions (Before Production):
1. ✅ None required - app functions correctly

### Sprint 2 Actions:
1. Remove unused UI components and dependencies
2. Standardize import paths
3. Add bundle analyzer to track size

### Future Improvements:
1. Create custom UI component library
2. Implement proper TypeScript configurations
3. Add pre-commit hooks for type checking
4. Consider switching to more lightweight UI libraries

---

## 📊 Metrics to Track

- **Bundle Size:** Currently ~235KB first load
- **Type Coverage:** ~94% (6 files excluded)
- **Dependency Count:** 536 packages (target: <300)
- **Build Time:** ~15 seconds (target: <10s)
- **Type Errors:** 0 (with workarounds)

---

## 🔄 Update History

| Date | Author | Changes |
|------|--------|---------|
| 2025-06-16 | Claude/Team | Initial technical debt documentation |

---

*This document should be reviewed and updated at the end of each sprint.*