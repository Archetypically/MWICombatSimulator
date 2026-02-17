# Data Loading System

This document describes how game data JSON files are loaded and accessed in the MWI Combat Simulator.

## Overview

All JSON data files (4MB total) are stored in `public/data/` and fetched at runtime rather than bundled. This reduces bundle size by ~50% and enables browser/CDN caching.

## Architecture

### Data Loader (`src/lib/dataLoader.js`)

The central service that manages data loading:

```javascript
// Initialize once at app startup
await initializeDataLoader();

// Access data synchronously after initialization
const data = getData("itemDetailMap");

// Or use convenience functions
const items = itemDetailMap();
const abilities = abilityDetailMap();
```

**Key features:**

- Loads all 16 JSON files in parallel at startup
- Caches data in memory for synchronous access
- Provides typed convenience exports for each data file
- Graceful error handling with retry UI

### Data Provider (`src/contexts/DataLoadingContext.jsx`)

React context that wraps the app and handles the loading state:

```jsx
<DataProvider>
    <App />
</DataProvider>
```

**Features:**

- Shows loading spinner while data loads
- Displays error/retry UI on failure
- Prevents app rendering until data is ready

### Available Data Files

| File                                             | Size  | Purpose                         |
| ------------------------------------------------ | ----- | ------------------------------- |
| `itemDetailMap.json`                             | 2.0MB | All game items, equipment stats |
| `actionDetailMap.json`                           | 1.3MB | Combat zones and dungeons       |
| `combatMonsterDetailMap.json`                    | 289KB | Monster stats and drop tables   |
| `abilityDetailMap.json`                          | 130KB | Ability definitions             |
| `houseRoomDetailMap.json`                        | 169KB | House room buffs                |
| `achievementDetailMap.json`                      | 25KB  | Achievement requirements        |
| `achievementTierDetailMap.json`                  | 4.8KB | Achievement tier buffs          |
| `combatStyleDetailMap.json`                      | 1.9KB | Combat style exp mappings       |
| `combatTrigger*.json`                            | ~25KB | Combat trigger definitions      |
| `buffs.json`                                     | 980B  | Buff definitions                |
| `damageTypeDetailMap.json`                       | 504B  | Damage types                    |
| `enhancementLevelTotalBonusMultiplierTable.json` | 160B  | Enhancement multipliers         |
| `openableLootDropMap.json`                       | 32KB  | Loot tables                     |
| `abilitySlotsLevelRequirementList.json`          | 22B   | Ability slot unlock levels      |

## Usage Patterns

### In React Components

**❌ Don't do this (module-level data access):**

```javascript
// BAD - runs during module initialization before data loads
const combatActions = Object.values(actionDetailMap()).filter(...);
```

**✅ Do this (lazy-loaded inside component/hook):**

```javascript
// GOOD - runs after DataProvider has loaded data
const targetGroups = React.useMemo(() => {
  return Object.values(actionDetailMap()).filter(...);
}, []);
```

### In Simulator Classes

Classes like `Ability`, `Equipment`, `Monster` use data synchronously. They rely on the DataProvider having loaded data before any instances are created:

```javascript
// In ability.js
import { abilityDetailMap } from "../lib/dataLoader";

class Ability {
    constructor(hrid) {
        // This throws if data isn't loaded yet
        const gameAbility = abilityDetailMap()[hrid];
        // ...
    }
}
```

### In Web Workers

Workers also need to ensure data is loaded before accessing:

```javascript
import { combatMonsterDetailMap } from "../lib/dataLoader";

// Data is already loaded by main thread before worker starts
const monsterData = combatMonsterDetailMap()[monsterHrid];
```

## Migration Guide

When adding new data files:

1. **Copy JSON to public folder:**

    ```bash
    cp src/combatsimulator/data/newData.json public/data/
    ```

2. **Add to dataLoader.js:**

    ```javascript
    // In DATA_FILES array
    const DATA_FILES = [
        // ... existing files
        "newData",
    ];

    // Add convenience export
    export const newData = () => getData("newData");
    ```

3. **Update imports in consuming files:**

    ```javascript
    // OLD (bundled)
    import newData from "./data/newData.json";

    // NEW (fetched)
    import { newData } from "../lib/dataLoader";

    // Usage (now a function call)
    const data = newData()[key];
    ```

## Performance Considerations

- **First load:** ~200-500ms to fetch all JSON files (4MB)
- **Subsequent loads:** Instant (cached by browser)
- **Bundle size:** Reduced from 5.7MB to 1.9MB (~67% reduction)
- **Worker size:** Reduced from 1.9MB to 116KB (~94% reduction)

## Troubleshooting

### "Data not loaded" Error

If you see `Error: Data "actionDetailMap" not loaded. Call initializeDataLoader() first.`:

1. Check you're not accessing data at module level (top of file)
2. Ensure access is inside a component, hook, or function
3. Use `React.useMemo` or `React.useEffect` for data transformations

### Cache Invalidation

JSON files are served with standard HTTP caching headers. To force refresh:

- Dev: Data reloads automatically on page refresh
- Prod: Change file content or use cache-busting query params

## File Locations

- **JSON files:** `public/data/*.json`
- **Data loader:** `src/lib/dataLoader.js`
- **React provider:** `src/contexts/DataLoadingContext.jsx`
- **Entry point:** `src/main.jsx` (wraps App with DataProvider)
