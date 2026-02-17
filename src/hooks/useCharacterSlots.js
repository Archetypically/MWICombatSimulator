import { useState, useEffect, useCallback } from "react";
import { itemDetailMap, abilityDetailMap } from "../lib/dataLoader";

const SLOT_COUNT = 5;
const SLOT_KEY_PREFIX = "character_slot_";
const LEGACY_KEY = "mwi_imported_character";

const createDefaultCharacter = (slotNumber) => ({
    name: `Slot ${slotNumber}`,
    player: {
        attackLevel: 1,
        magicLevel: 1,
        meleeLevel: 1,
        intelligenceLevel: 1,
        staminaLevel: 1,
        defenseLevel: 1,
        rangedLevel: 1,
        equipment: [],
    },
    food: {
        "/action_types/combat": [{ itemHrid: "" }, { itemHrid: "" }, { itemHrid: "" }, { itemHrid: "" }],
    },
    drinks: {
        "/action_types/combat": [{ itemHrid: "" }, { itemHrid: "" }, { itemHrid: "" }, { itemHrid: "" }],
    },
    abilities: [
        { abilityHrid: "", level: "1" },
        { abilityHrid: "", level: "1" },
        { abilityHrid: "", level: "1" },
        { abilityHrid: "", level: "1" },
        { abilityHrid: "", level: "1" },
    ],
    triggerMap: {},
    houseRooms: {},
    achievements: {},
});

export const useCharacterSlots = () => {
    const [slots, setSlots] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load all slots from localStorage on mount
    useEffect(() => {
        const loadedSlots = [];

        for (let i = 1; i <= SLOT_COUNT; i++) {
            const key = `${SLOT_KEY_PREFIX}${i}`;
            const stored = localStorage.getItem(key);

            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    loadedSlots.push({
                        slotNumber: i,
                        ...parsed,
                    });
                } catch (e) {
                    console.error(`Failed to parse slot ${i}:`, e);
                    loadedSlots.push({
                        slotNumber: i,
                        ...createDefaultCharacter(i),
                    });
                }
            } else {
                loadedSlots.push({
                    slotNumber: i,
                    ...createDefaultCharacter(i),
                });
            }
        }

        // Check for legacy data and migrate if found
        const legacyData = localStorage.getItem(LEGACY_KEY);
        if (legacyData) {
            try {
                const parsed = JSON.parse(legacyData);
                loadedSlots[0] = {
                    slotNumber: 1,
                    name: parsed.name || "Slot 1",
                    ...parsed,
                };
                // Save to new format and remove legacy
                localStorage.setItem(`${SLOT_KEY_PREFIX}1`, JSON.stringify(loadedSlots[0]));
                localStorage.removeItem(LEGACY_KEY);
            } catch (e) {
                console.error("Failed to migrate legacy data:", e);
            }
        }

        // Migrate existing slots to ensure triggerMap is populated
        loadedSlots.forEach((slot, index) => {
            if (!slot.triggerMap) {
                slot.triggerMap = {};
            }

            // Ensure all food items have triggers
            const foodItems = slot.food?.["/action_types/combat"] || [];
            let triggerMapUpdated = false;

            foodItems.forEach((item) => {
                if (item?.itemHrid && !slot.triggerMap[item.itemHrid]) {
                    const itemData = itemDetailMap()[item.itemHrid];
                    if (itemData?.consumableDetail?.defaultCombatTriggers) {
                        slot.triggerMap[item.itemHrid] = JSON.parse(
                            JSON.stringify(itemData.consumableDetail.defaultCombatTriggers),
                        );
                        triggerMapUpdated = true;
                    }
                }
            });

            // Ensure all drink items have triggers
            const drinkItems = slot.drinks?.["/action_types/combat"] || [];
            drinkItems.forEach((item) => {
                if (item?.itemHrid && !slot.triggerMap[item.itemHrid]) {
                    const itemData = itemDetailMap()[item.itemHrid];
                    if (itemData?.consumableDetail?.defaultCombatTriggers) {
                        slot.triggerMap[item.itemHrid] = JSON.parse(
                            JSON.stringify(itemData.consumableDetail.defaultCombatTriggers),
                        );
                        triggerMapUpdated = true;
                    }
                }
            });

            // Ensure all abilities have triggers
            const abilities = slot.abilities || [];
            abilities.forEach((ability) => {
                if (ability?.abilityHrid && !slot.triggerMap[ability.abilityHrid]) {
                    const abilityData = abilityDetailMap()[ability.abilityHrid];
                    if (abilityData?.defaultCombatTriggers) {
                        slot.triggerMap[ability.abilityHrid] = JSON.parse(
                            JSON.stringify(abilityData.defaultCombatTriggers),
                        );
                        triggerMapUpdated = true;
                    }
                }
            });

            // Save back to localStorage if updated
            if (triggerMapUpdated) {
                const key = `${SLOT_KEY_PREFIX}${index + 1}`;
                const dataToSave = { ...slot };
                delete dataToSave.slotNumber;
                localStorage.setItem(key, JSON.stringify(dataToSave));
            }
        });

        setSlots(loadedSlots);
        setIsLoaded(true);
    }, []);

    // Save a slot to localStorage
    const saveSlot = useCallback((slotNumber, characterData) => {
        const key = `${SLOT_KEY_PREFIX}${slotNumber}`;
        const dataToSave = { ...characterData };
        delete dataToSave.slotNumber; // Don't save the slot number in the data
        localStorage.setItem(key, JSON.stringify(dataToSave));

        setSlots((prev) =>
            prev.map((slot) => (slot.slotNumber === slotNumber ? { slotNumber, ...characterData } : slot)),
        );
    }, []);

    // Get a specific slot
    const getSlot = useCallback(
        (slotNumber) => {
            return slots.find((slot) => slot.slotNumber === slotNumber);
        },
        [slots],
    );

    // Update character name
    const updateCharacterName = useCallback(
        (slotNumber, newName) => {
            const slot = getSlot(slotNumber);
            if (slot) {
                const updated = { ...slot, name: newName || `Slot ${slotNumber}` };
                saveSlot(slotNumber, updated);
            }
        },
        [getSlot, saveSlot],
    );

    // Import character data to a slot
    const importCharacter = useCallback(
        (slotNumber, importData) => {
            try {
                const parsed = typeof importData === "string" ? JSON.parse(importData) : importData;

                if (!parsed.player) {
                    return { success: false, error: "Invalid character data format. Missing player information." };
                }

                const existingSlot = getSlot(slotNumber);
                const characterData = {
                    name: parsed.name || existingSlot?.name || `Slot ${slotNumber}`,
                    player: parsed.player,
                    food: parsed.food || existingSlot?.food,
                    drinks: parsed.drinks || existingSlot?.drinks,
                    abilities: parsed.abilities || existingSlot?.abilities,
                    triggerMap: parsed.triggerMap || existingSlot?.triggerMap,
                    houseRooms: parsed.houseRooms || existingSlot?.houseRooms,
                    achievements: parsed.achievements || existingSlot?.achievements,
                };

                saveSlot(slotNumber, characterData);
                return { success: true };
            } catch (e) {
                return { success: false, error: "Invalid JSON format. Please check your data." };
            }
        },
        [getSlot, saveSlot],
    );

    // Clear a slot
    const clearSlot = useCallback(
        (slotNumber) => {
            const defaultChar = createDefaultCharacter(slotNumber);
            saveSlot(slotNumber, defaultChar);
        },
        [saveSlot],
    );

    // Check if a slot has been modified from default
    const isSlotActive = useCallback(
        (slotNumber) => {
            const slot = getSlot(slotNumber);
            if (!slot) return false;

            const defaultChar = createDefaultCharacter(slotNumber);
            // Consider active if it has equipment or any meaningful data
            return (
                slot.player?.equipment?.length > 0 ||
                slot.player?.attackLevel > 1 ||
                slot.player?.rangedLevel > 1 ||
                slot.player?.magicLevel > 1 ||
                slot.player?.meleeLevel > 1
            );
        },
        [getSlot],
    );

    // Update player stats
    const updatePlayerStats = useCallback(
        (slotNumber, playerData) => {
            const slot = getSlot(slotNumber);
            if (slot) {
                const updated = {
                    ...slot,
                    player: { ...slot.player, ...playerData },
                };
                saveSlot(slotNumber, updated);
            }
        },
        [getSlot, saveSlot],
    );

    // Update equipment
    const updateEquipment = useCallback(
        (slotNumber, equipment) => {
            const slot = getSlot(slotNumber);
            if (slot) {
                const updated = {
                    ...slot,
                    player: { ...slot.player, equipment },
                };
                saveSlot(slotNumber, updated);
            }
        },
        [getSlot, saveSlot],
    );

    // Update house rooms
    const updateHouseRooms = useCallback(
        (slotNumber, houseRooms) => {
            const slot = getSlot(slotNumber);
            if (slot) {
                const updated = { ...slot, houseRooms };
                saveSlot(slotNumber, updated);
            }
        },
        [getSlot, saveSlot],
    );

    // Update achievements
    const updateAchievements = useCallback(
        (slotNumber, achievements) => {
            const slot = getSlot(slotNumber);
            if (slot) {
                const updated = { ...slot, achievements };
                saveSlot(slotNumber, updated);
            }
        },
        [getSlot, saveSlot],
    );

    // Helper to get default triggers for an item
    const getDefaultTriggersForItem = useCallback((itemHrid) => {
        if (!itemHrid) return [];

        const item = itemDetailMap()[itemHrid];
        if (item?.consumableDetail?.defaultCombatTriggers) {
            return JSON.parse(JSON.stringify(item.consumableDetail.defaultCombatTriggers));
        }
        return [];
    }, []);

    // Helper to get default triggers for an ability
    const getDefaultTriggersForAbility = useCallback((abilityHrid) => {
        if (!abilityHrid) return [];

        const ability = abilityDetailMap()[abilityHrid];
        if (ability?.defaultCombatTriggers) {
            return JSON.parse(JSON.stringify(ability.defaultCombatTriggers));
        }
        return [];
    }, []);

    // Update food with triggerMap population
    const updateFood = useCallback(
        (slotNumber, food) => {
            const slot = getSlot(slotNumber);
            if (!slot) return;

            // Build updated triggerMap with defaults for new items
            const updatedTriggerMap = { ...slot.triggerMap };
            const combatFood = food?.["/action_types/combat"] || [];

            combatFood.forEach((item) => {
                if (item?.itemHrid && !updatedTriggerMap[item.itemHrid]) {
                    // Populate with default triggers when item is newly added
                    updatedTriggerMap[item.itemHrid] = getDefaultTriggersForItem(item.itemHrid);
                }
            });

            // Clean up triggers for removed items
            const currentItemHrids = new Set(combatFood.filter((i) => i?.itemHrid).map((i) => i.itemHrid));
            Object.keys(updatedTriggerMap).forEach((key) => {
                if (key.startsWith("/items/") && !currentItemHrids.has(key)) {
                    // Check if this item exists in drinks before removing
                    const drinksHrids = new Set(
                        (slot.drinks?.["/action_types/combat"] || []).filter((i) => i?.itemHrid).map((i) => i.itemHrid),
                    );
                    if (!drinksHrids.has(key)) {
                        delete updatedTriggerMap[key];
                    }
                }
            });

            const updated = {
                ...slot,
                food,
                triggerMap: updatedTriggerMap,
            };
            saveSlot(slotNumber, updated);
        },
        [getSlot, saveSlot, getDefaultTriggersForItem],
    );

    // Update drinks with triggerMap population
    const updateDrinks = useCallback(
        (slotNumber, drinks) => {
            const slot = getSlot(slotNumber);
            if (!slot) return;

            // Build updated triggerMap with defaults for new items
            const updatedTriggerMap = { ...slot.triggerMap };
            const combatDrinks = drinks?.["/action_types/combat"] || [];

            combatDrinks.forEach((item) => {
                if (item?.itemHrid && !updatedTriggerMap[item.itemHrid]) {
                    // Populate with default triggers when item is newly added
                    updatedTriggerMap[item.itemHrid] = getDefaultTriggersForItem(item.itemHrid);
                }
            });

            // Clean up triggers for removed items
            const currentItemHrids = new Set(combatDrinks.filter((i) => i?.itemHrid).map((i) => i.itemHrid));
            Object.keys(updatedTriggerMap).forEach((key) => {
                if (key.startsWith("/items/") && !currentItemHrids.has(key)) {
                    // Check if this item exists in food before removing
                    const foodHrids = new Set(
                        (slot.food?.["/action_types/combat"] || []).filter((i) => i?.itemHrid).map((i) => i.itemHrid),
                    );
                    if (!foodHrids.has(key)) {
                        delete updatedTriggerMap[key];
                    }
                }
            });

            const updated = {
                ...slot,
                drinks,
                triggerMap: updatedTriggerMap,
            };
            saveSlot(slotNumber, updated);
        },
        [getSlot, saveSlot, getDefaultTriggersForItem],
    );

    // Update abilities with triggerMap population
    const updateAbilities = useCallback(
        (slotNumber, abilities) => {
            const slot = getSlot(slotNumber);
            if (!slot) return;

            // Build updated triggerMap with defaults for new abilities
            const updatedTriggerMap = { ...slot.triggerMap };

            abilities.forEach((ability) => {
                if (ability?.abilityHrid && !updatedTriggerMap[ability.abilityHrid]) {
                    // Populate with default triggers when ability is newly added
                    updatedTriggerMap[ability.abilityHrid] = getDefaultTriggersForAbility(ability.abilityHrid);
                }
            });

            // Clean up triggers for removed abilities
            const currentAbilityHrids = new Set(abilities.filter((a) => a?.abilityHrid).map((a) => a.abilityHrid));
            Object.keys(updatedTriggerMap).forEach((key) => {
                if (key.startsWith("/abilities/") && !currentAbilityHrids.has(key)) {
                    delete updatedTriggerMap[key];
                }
            });

            const updated = {
                ...slot,
                abilities,
                triggerMap: updatedTriggerMap,
            };
            saveSlot(slotNumber, updated);
        },
        [getSlot, saveSlot, getDefaultTriggersForAbility],
    );

    // Update trigger for a specific item/ability
    const updateTrigger = useCallback(
        (slotNumber, hrid, triggers) => {
            const slot = getSlot(slotNumber);
            if (slot) {
                const updatedTriggerMap = {
                    ...slot.triggerMap,
                    [hrid]: triggers,
                };
                const updated = {
                    ...slot,
                    triggerMap: updatedTriggerMap,
                };
                saveSlot(slotNumber, updated);
            }
        },
        [getSlot, saveSlot],
    );

    return {
        slots,
        isLoaded,
        getSlot,
        saveSlot,
        updateCharacterName,
        importCharacter,
        clearSlot,
        isSlotActive,
        updatePlayerStats,
        updateEquipment,
        updateFood,
        updateDrinks,
        updateAbilities,
        updateHouseRooms,
        updateAchievements,
        updateTrigger,
    };
};
