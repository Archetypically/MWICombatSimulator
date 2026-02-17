/**
 * DataLoader Service
 *
 * Fetches JSON data files from /assets/data/ instead of bundling them.
 * This reduces bundle size and enables browser/CDN caching.
 *
 * Data is loaded once at app startup and cached for synchronous access.
 */

// Cache for loaded data
const dataCache = new Map();
const loadingPromises = new Map();

// List of all data files to load
const DATA_FILES = [
    "abilityDetailMap",
    "abilitySlotsLevelRequirementList",
    "achievementDetailMap",
    "achievementTierDetailMap",
    "actionDetailMap",
    "buffs",
    "combatMonsterDetailMap",
    "combatStyleDetailMap",
    "combatTriggerComparatorDetailMap",
    "combatTriggerConditionDetailMap",
    "combatTriggerDependencyDetailMap",
    "damageTypeDetailMap",
    "enhancementLevelTotalBonusMultiplierTable",
    "houseRoomDetailMap",
    "itemDetailMap",
    "openableLootDropMap",
];

// Fetch a single data file
async function fetchData(fileName) {
    const response = await fetch(`/data/${fileName}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load ${fileName}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Load a single data file (with caching)
async function loadData(fileName) {
    // Check cache first
    if (dataCache.has(fileName)) {
        return dataCache.get(fileName);
    }

    // Check if already loading
    if (loadingPromises.has(fileName)) {
        return loadingPromises.get(fileName);
    }

    // Start loading
    const loadPromise = fetchData(fileName);
    loadingPromises.set(fileName, loadPromise);

    try {
        const data = await loadPromise;
        dataCache.set(fileName, data);
        loadingPromises.delete(fileName);
        return data;
    } catch (error) {
        loadingPromises.delete(fileName);
        throw error;
    }
}

// Load all data files at once
export async function initializeDataLoader() {
    const promises = DATA_FILES.map((name) => loadData(name));
    await Promise.all(promises);
    console.log("[DataLoader] All data files loaded successfully");
}

// Synchronous access to loaded data (throws if not loaded)
export function getData(fileName) {
    if (!dataCache.has(fileName)) {
        throw new Error(`Data "${fileName}" not loaded. Call initializeDataLoader() first.`);
    }
    return dataCache.get(fileName);
}

// Check if data is loaded
export function isDataLoaded(fileName) {
    return dataCache.has(fileName);
}

// Clear cache (useful for testing)
export function clearDataCache() {
    dataCache.clear();
    loadingPromises.clear();
}

// Convenience exports for commonly used data
export const abilityDetailMap = () => getData("abilityDetailMap");
export const itemDetailMap = () => getData("itemDetailMap");
export const combatMonsterDetailMap = () => getData("combatMonsterDetailMap");
export const actionDetailMap = () => getData("actionDetailMap");
export const houseRoomDetailMap = () => getData("houseRoomDetailMap");
export const achievementDetailMap = () => getData("achievementDetailMap");
export const achievementTierDetailMap = () => getData("achievementTierDetailMap");
export const enhancementLevelTotalBonusMultiplierTable = () => getData("enhancementLevelTotalBonusMultiplierTable");
export const combatStyleDetailMap = () => getData("combatStyleDetailMap");
export const combatTriggerDependencyDetailMap = () => getData("combatTriggerDependencyDetailMap");
export const combatTriggerConditionDetailMap = () => getData("combatTriggerConditionDetailMap");
export const combatTriggerComparatorDetailMap = () => getData("combatTriggerComparatorDetailMap");
export const damageTypeDetailMap = () => getData("damageTypeDetailMap");
export const abilitySlotsLevelRequirementList = () => getData("abilitySlotsLevelRequirementList");
export const openableLootDropMap = () => getData("openableLootDropMap");
export const buffs = () => getData("buffs");
