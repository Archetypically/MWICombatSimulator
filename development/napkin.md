# Combat Simulator Debugging Notes - COMPLETED

## Overview

Comparing legacy implementation (`src/legacy_main.js`) vs new React-based implementation (`src/hooks/useCombatSimulator.js` + `src/workers/simulator.worker.js`).

## Architecture Differences

### Legacy Flow

1. `legacy_main.js` has UI controls and creates worker directly
2. Uses `worker.js` or `multiWorker.js` (separate files)
3. Worker imports and uses CombatSimulator directly
4. Results displayed directly in legacy UI

### New Flow

1. `useCombatSimulator.js` hook manages state
2. Loads marketplace data (dev vs prod)
3. Creates `simulator.worker.js` via Web Worker
4. Worker transforms results via `transformResult()` before returning
5. Results displayed in React components

## Testing Framework ✅ COMPLETE

Created comprehensive test suite with Vitest:

### Test Files (109 tests total)

1. **`src/tests/buff-calculations.test.js`** (10 tests)
    - MooPass buff calculations
    - Community Exp buff tier calculations
    - Community Drop buff tier calculations
    - Buff structure verification

2. **`src/tests/debuff-calculations.test.js`** (11 tests)
    - Combat level calculation
    - Debuff application logic
    - Max debuff cap (-90%)
    - Multi-player party scenarios

3. **`src/tests/player-dto-converter.test.js`** (13 tests)
    - Equipment conversion
    - Consumables conversion
    - Abilities conversion
    - Combat level calculation in parties
    - Debuff calculation per player

4. **`src/tests/drop-calculations.test.js`** (17 tests)
    - Drop rate with difficulty multiplier
    - No-RNG expected drop calculations
    - Debuff application to drops
    - Party member drop division
    - Rare drop calculations
    - Edge cases

5. **`src/tests/experience-calculations.test.js`** (22 tests)
    - Primary training allocation (30%)
    - Focus training allocation (70%)
    - Distributed training (70% / skills)
    - Skill-specific XP bonuses
    - Combat XP bonus
    - Debuff application to XP

6. **`src/tests/damage-calculations.test.js`** (25 tests)
    - Hit chance calculation
    - Base damage calculation
    - Critical hits
    - Elemental damage and resistance
    - Thorns and retaliation
    - Life steal and mana leech
    - Armor and penetration

7. **`src/tests/integration-parity.test.js`** (11 tests)
    - Complete simulation flow
    - Player setup parity
    - Buff calculation parity
    - Experience distribution parity
    - Drop calculation parity
    - Debuff calculation parity
    - Result transformation parity

### Run Tests

```bash
pnpm test           # Run all tests
pnpm test:ui        # Run with UI
pnpm test:coverage  # Run with coverage
```

## Bug Fixes Applied ✅ COMPLETE

### 1. Buff Calculation Bug ✅ FIXED

**Problem**: New implementation hardcoded buff values instead of calculating based on tier.

**Legacy Worker (legacy_worker.js:8-47)**:

```javascript
// MooPass buff
flatBoost: 0.05;

// Community Exp buff (comExp is the tier level)
flatBoost: 0.005 * (event.data.extra.comExp - 1) + 0.2;

// Community Drop buff (comDrop is the tier level)
flatBoost: 0.005 * (event.data.extra.comDrop - 1) + 0.2;
typeHrid: "/buff_types/combat_drop_quantity";
```

**Fixed in simulator.worker.js**:

```javascript
if (settings.comExpBuffEnabled && settings.comExpBuffTier > 0) {
    extraBuffs.push({
        uniqueHrid: "/buff_uniques/experience_community_buff",
        typeHrid: "/buff_types/wisdom",
        flatBoost: 0.005 * (settings.comExpBuffTier - 1) + 0.2,
        // ...
    });
}

if (settings.comDropBuffEnabled && settings.comDropBuffTier > 0) {
    extraBuffs.push({
        uniqueHrid: "/buff_uniques/combat_community_buff",
        typeHrid: "/buff_types/combat_drop_quantity", // FIXED: was combat_drop_rate
        flatBoost: 0.005 * (settings.comDropBuffTier - 1) + 0.2, // FIXED: was ratioBoost
        // ...
    });
}
```

### 2. Debuff Calculation Bug ✅ FIXED

**Problem**: `debuffOnLevelGap` was hardcoded to 0 in player DTO converter.

**Legacy (legacy_main.js:3108-3138)**:

```javascript
// Calculate combatLevel for each player
player.combatLevel = calcCombatLevel(...);
maxPlayerCombatLevel = Math.max(maxPlayerCombatLevel, player.combatLevel);

// Apply debuff if level difference > 20%
if (maxPlayerCombatLevel / player.combatLevel > 1.2) {
    const maxDebuffOnLevelGap = 0.9;
    let levelPercent = maxPlayerCombatLevel / player.combatLevel - 1.2;
    player.debuffOnLevelGap = -1 * Math.min(maxDebuffOnLevelGap, 3 * levelPercent);
}
```

**Fixed in playerDtoConverter.js**:

```javascript
// First pass: Convert all slots and calculate combat levels
// Second pass: Calculate debuff for each player
dto.debuffOnLevelGap = calculateDebuffOnLevelGap(dto.combatLevel, maxCombatLevel);
```

### 3. UI Settings Integration ✅ COMPLETED

**Added TierInput component** (`src/components/ui/tier-input.jsx`):

- Number input with +/- buttons
- Min/max constraints (1-10)
- Disabled state support

**Updated SettingsPanel** (`src/components/simulator/SettingsPanel.jsx`):

- Added tier inputs for Community Exp Buff and Community Drop Buff
- Tiers only enabled when buff is toggled on
- Shows "Buff Name: [Switch] [Tier 1-10]"

**Updated Simulator page** (`src/pages/Simulator.jsx`):

- Added state: `globalExpBuffTier`, `globalDropBuffTier`
- Passes tiers to SettingsPanel
- Updated config object with new setting names:
    - `comExpBuffEnabled` (was globalExpBuffEnabled)
    - `comExpBuffTier`
    - `comDropBuffEnabled` (was globalDropBuffEnabled)
    - `comDropBuffTier`

**Updated TypeScript types** (`src/types/simulationHistory.ts`):

- Changed settings interface to use new property names

**Updated History page** (`src/pages/History.jsx`):

- Shows tier level in history (e.g., "Exp Buff: Yes (Tier 5)")

## Test Coverage Summary

### Verified Calculations

✅ **Buff Calculation**

- MooPass: 5% flat boost
- Community Exp: 0.005 \* (tier - 1) + 0.2
- Community Drop: 0.005 \* (tier - 1) + 0.2
- Correct buff types

✅ **Debuff Calculation**

- Combat level formula
- Debuff trigger: max/combatLevel > 1.2
- Debuff formula: -1 _ min(0.9, 3 _ (ratio - 1.2))
- Max debuff: -90%

✅ **Experience Distribution**

- Primary training: 30%
- Focus training: 70%
- Distributed training: 70% / skillCount
- Skill XP bonuses
- Combat XP bonus
- Debuff application

✅ **Drop Calculation**

- Drop rate with difficulty multiplier
- No-RNG expected drops
- Debuff and drop quantity application
- Party member division
- Rare drops

✅ **Damage Calculation**

- Hit chance: accuracy / (accuracy + evasion)
- Base damage with modifiers
- Critical hits
- Armor and penetration
- Elemental damage
- Thorns and retaliation

✅ **Result Transformation**

- Per-hour calculations
- Profit calculation
- Hours factor

## Files Modified

### Core Fixes

1. `src/workers/simulator.worker.js` - Buff calculations, drop calculations
2. `src/lib/playerDtoConverter.js` - Debuff calculation

### UI Updates

3. `src/components/simulator/SettingsPanel.jsx` - Buff tier inputs
4. `src/components/ui/tier-input.jsx` - New component
5. `src/pages/Simulator.jsx` - State management
6. `src/types/simulationHistory.ts` - Type updates
7. `src/pages/History.jsx` - Display updates

### Test Suite

8. `src/tests/buff-calculations.test.js`
9. `src/tests/debuff-calculations.test.js`
10. `src/tests/player-dto-converter.test.js`
11. `src/tests/drop-calculations.test.js`
12. `src/tests/experience-calculations.test.js`
13. `src/tests/damage-calculations.test.js`
14. `src/tests/integration-parity.test.js`
15. `vitest.config.js` - Test configuration
16. `package.json` - Test scripts

## Final Status

**All 109 tests passing ✅**

The test-driven development approach successfully:

1. Identified critical bugs in buff calculations
2. Identified missing debuff calculation
3. Fixed both issues with verified solutions
4. Created comprehensive test coverage for future regression prevention
5. Modernized UI to include missing settings
6. Verified parity between legacy and new implementations

The new implementation now produces identical results to the legacy version while maintaining a cleaner, more maintainable architecture.
