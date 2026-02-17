/**
 * Utility functions for converting character slot data to Player DTO format
 * for the combat simulator
 */

import {
    abilitySlotsLevelRequirementList,
    itemDetailMap,
    enhancementLevelTotalBonusMultiplierTable,
} from "./dataLoader";

// Reverse mapping from item locations to equipment types
const ITEM_LOCATION_TO_EQUIPMENT_TYPE = {
    "/item_locations/head": "/equipment_types/head",
    "/item_locations/body": "/equipment_types/body",
    "/item_locations/legs": "/equipment_types/legs",
    "/item_locations/feet": "/equipment_types/feet",
    "/item_locations/hands": "/equipment_types/hands",
    "/item_locations/main_hand": "/equipment_types/main_hand",
    "/item_locations/off_hand": "/equipment_types/off_hand",
    "/item_locations/pouch": "/equipment_types/pouch",
    "/item_locations/back": "/equipment_types/back",
    "/item_locations/neck": "/equipment_types/neck",
    "/item_locations/ring": "/equipment_types/ring",
    "/item_locations/earrings": "/equipment_types/earrings",
    "/item_locations/charm": "/equipment_types/charm",
};

/**
 * Get the base combat stat value from an equipment item, considering enhancement level
 * @param {Object} equipmentDTO - Equipment DTO with hrid and enhancementLevel
 * @param {string} statName - Combat stat name to retrieve
 * @returns {number} The stat value
 */
function getEquipmentStat(equipmentDTO, statName) {
    if (!equipmentDTO || !equipmentDTO.hrid) {
        return 0;
    }

    try {
        const itemDetail = itemDetailMap()[equipmentDTO.hrid];
        if (!itemDetail || !itemDetail.equipmentDetail) {
            return 0;
        }

        const baseStat = itemDetail.equipmentDetail.combatStats?.[statName] || 0;
        const enhancementBonus = itemDetail.equipmentDetail.combatEnhancementBonuses?.[statName] || 0;
        const enhancementLevel = equipmentDTO.enhancementLevel || 0;
        const multiplier = enhancementLevelTotalBonusMultiplierTable()[enhancementLevel] || 1;

        return baseStat + multiplier * enhancementBonus;
    } catch (e) {
        console.warn(`[CONVERTER] Failed to get stat ${statName} for equipment ${equipmentDTO.hrid}:`, e);
        return 0;
    }
}

/**
 * Calculate food slots from equipment (base 1 + pouch bonus)
 * @param {Object} equipment - Equipment object with type keys
 * @returns {number} Number of food slots (1-4)
 */
function getFoodSlotsFromEquipment(equipment) {
    const baseSlots = 1;
    if (equipment && equipment["/equipment_types/pouch"]) {
        // Look up the actual foodSlots value from item details, including enhancement bonus
        const pouchFoodSlots = getEquipmentStat(equipment["/equipment_types/pouch"], "foodSlots");
        console.debug("[CONVERTER] getFoodSlotsFromEquipment:", {
            pouchHrid: equipment["/equipment_types/pouch"]?.hrid,
            pouchFoodSlots,
            baseSlots,
            total: baseSlots + pouchFoodSlots,
        });
        return baseSlots + pouchFoodSlots;
    }
    console.debug("[CONVERTER] getFoodSlotsFromEquipment: no pouch equipped, returning baseSlots", baseSlots);
    return baseSlots;
}

/**
 * Calculate drink slots from equipment (base 1 + pouch bonus)
 * @param {Object} equipment - Equipment object with type keys
 * @returns {number} Number of drink slots (1-4)
 */
function getDrinkSlotsFromEquipment(equipment) {
    const baseSlots = 1;
    if (equipment && equipment["/equipment_types/pouch"]) {
        // Look up the actual drinkSlots value from item details, including enhancement bonus
        const pouchDrinkSlots = getEquipmentStat(equipment["/equipment_types/pouch"], "drinkSlots");
        console.debug("[CONVERTER] getDrinkSlotsFromEquipment:", {
            pouchHrid: equipment["/equipment_types/pouch"]?.hrid,
            pouchDrinkSlots,
            baseSlots,
            total: baseSlots + pouchDrinkSlots,
        });
        return baseSlots + pouchDrinkSlots;
    }
    console.debug("[CONVERTER] getDrinkSlotsFromEquipment: no pouch equipped, returning baseSlots", baseSlots);
    return baseSlots;
}

/**
 * Convert equipment from character slot format (array) to simulator format (object)
 * @param {Array} slotEquipment - Equipment array from character slot
 * @returns {Object} Equipment object with type keys
 */
export function convertEquipmentToDTO(slotEquipment) {
    const defaultEquipment = {
        "/equipment_types/head": null,
        "/equipment_types/body": null,
        "/equipment_types/legs": null,
        "/equipment_types/feet": null,
        "/equipment_types/hands": null,
        "/equipment_types/main_hand": null,
        "/equipment_types/two_hand": null,
        "/equipment_types/off_hand": null,
        "/equipment_types/pouch": null,
        "/equipment_types/back": null,
        "/equipment_types/neck": null,
        "/equipment_types/ring": null,
        "/equipment_types/earrings": null,
        "/equipment_types/charm": null,
    };

    if (!Array.isArray(slotEquipment)) {
        return defaultEquipment;
    }

    const result = { ...defaultEquipment };

    slotEquipment.forEach((item) => {
        // Support both old format (item.type) and new format (item.itemLocationHrid)
        const equipmentType = item.type || ITEM_LOCATION_TO_EQUIPMENT_TYPE[item.itemLocationHrid];
        if (item && item.itemHrid && equipmentType) {
            result[equipmentType] = {
                hrid: item.itemHrid,
                enhancementLevel: item.enhancementLevel || 0,
            };
        }
    });

    return result;
}

/**
 * Convert food/drinks from character slot format to simulator format
 * Character slot stores as {"/action_types/combat": [{itemHrid, ...}, ...]}
 * Simulator expects arrays of {hrid, triggers} or null
 * @param {Object} slotConsumables - Food/drinks object from character slot
 * @param {number} slots - Number of available slots (1-4 based on pouch)
 * @param {Object} triggerMap - Map of item hrid to triggers from the slot
 * @returns {Array} Array of 4 consumable slots
 */
export function convertConsumablesToDTO(slotConsumables, slots = 1, triggerMap = {}) {
    const combatConsumables = slotConsumables?.["/action_types/combat"] || [];

    console.debug("[CONVERTER] convertConsumablesToDTO:", {
        slotConsumables,
        combatConsumables,
        slots,
    });

    // Ensure slots is between 1 and 3
    const effectiveSlots = Math.min(Math.max(slots, 1), 3);

    console.debug("[CONVERTER] convertConsumablesToDTO:", {
        effectiveSlots,
        combatConsumablesLength: combatConsumables.length,
    });

    return combatConsumables.slice(0, 3).map((item, index) => {
        // If index is beyond available slots, return null
        if (index >= effectiveSlots) return null;
        if (!item || !item.itemHrid) return null;
        // Triggers are stored in triggerMap keyed by item hrid
        const triggers = triggerMap?.[item.itemHrid] || item.triggers || [];
        return {
            hrid: item.itemHrid,
            triggers: triggers,
        };
    });
}

/**
 * Convert abilities from character slot format to simulator format
 * Character slot stores as [{abilityHrid, level}, ...]
 * Simulator expects array of {hrid, level, triggers} or null
 * @param {Array} slotAbilities - Abilities array from character slot
 * @param {number} intelligenceLevel - Player's intelligence level for slot unlock check
 * @param {Object} triggerMap - Map of ability hrid to triggers from the slot
 * @returns {Array} Array of exactly 5 ability slots
 */
export function convertAbilitiesToDTO(slotAbilities, intelligenceLevel = 1, triggerMap = {}) {
    const result = [null, null, null, null, null];

    if (!Array.isArray(slotAbilities)) {
        return result;
    }

    // Get ability slot level requirements
    // Default requirements if data not loaded: [0, 1, 10, 30, 60] (0 is unused, slots 1-4 need levels)
    let slotRequirements;
    try {
        slotRequirements = abilitySlotsLevelRequirementList();
    } catch (e) {
        // Data not loaded, use default requirements
        slotRequirements = [0, 1, 10, 30, 60];
    }

    slotAbilities.slice(0, 5).forEach((ability, index) => {
        // Check if this ability slot is unlocked based on intelligence level
        // Slot requirements are 1-indexed in the array, so check index + 1
        const requiredLevel = slotRequirements?.[index + 1] ?? 1;
        if (intelligenceLevel < requiredLevel) {
            // Slot not unlocked, leave as null
            return;
        }

        if (ability && ability.abilityHrid) {
            // Triggers are stored in triggerMap keyed by ability hrid
            const triggers = triggerMap?.[ability.abilityHrid] || ability.triggers || [];
            result[index] = {
                hrid: ability.abilityHrid,
                level: parseInt(ability.level, 10) || 1,
                triggers: triggers,
            };
        }
    });

    return result;
}

/**
 * Convert a character slot to a Player DTO for the simulator
 * @param {Object} slot - Character slot data
 * @param {number} playerIndex - Index for generating player ID
 * @returns {Object} Player DTO
 */
export function convertSlotToPlayerDTO(slot, playerIndex = 0) {
    if (!slot) return null;

    const playerData = slot.player || {};

    // Convert equipment first to calculate slots
    const equipment = convertEquipmentToDTO(playerData.equipment);

    // Calculate food and drink slots from equipment
    const foodSlots = getFoodSlotsFromEquipment(equipment);
    const drinkSlots = getDrinkSlotsFromEquipment(equipment);

    // Get intelligence level for ability slot unlock check
    const intelligenceLevel = playerData.intelligenceLevel || 1;

    // Get trigger map from slot (where triggers are stored keyed by item/ability hrid)
    const triggerMap = slot.triggerMap || {};

    const dto = {
        hrid: `player${playerIndex + 1}`,
        name: slot.name || `Player ${playerIndex + 1}`,
        staminaLevel: playerData.staminaLevel || 1,
        intelligenceLevel: intelligenceLevel,
        attackLevel: playerData.attackLevel || 1,
        meleeLevel: playerData.meleeLevel || 1,
        defenseLevel: playerData.defenseLevel || 1,
        rangedLevel: playerData.rangedLevel || 1,
        magicLevel: playerData.magicLevel || 1,
        debuffOnLevelGap: 0,

        // Equipment
        equipment: equipment,

        // Food and drinks (filtered by available slots)
        food: convertConsumablesToDTO(slot.food, foodSlots, triggerMap),
        drinks: convertConsumablesToDTO(slot.drinks, drinkSlots, triggerMap),

        // Abilities (5 slots, filtered by intelligence level)
        abilities: convertAbilitiesToDTO(slot.abilities, intelligenceLevel, triggerMap),

        // House rooms
        houseRooms: slot.houseRooms || {},

        // Achievements
        achievements: slot.achievements || {},
    };

    console.debug("[CONVERTER] convertSlotToPlayerDTO:", {
        slotNumber: slot.slotNumber,
        playerIndex,
        foodSlots,
        drinkSlots,
        pouchHrid: equipment["/equipment_types/pouch"]?.hrid || null,
        pouchEnhancement: equipment["/equipment_types/pouch"]?.enhancementLevel || 0,
        dto: {
            hrid: dto.hrid,
            levels: {
                stamina: dto.staminaLevel,
                intelligence: dto.intelligenceLevel,
                attack: dto.attackLevel,
                melee: dto.meleeLevel,
                defense: dto.defenseLevel,
                ranged: dto.rangedLevel,
                magic: dto.magicLevel,
            },
            food: dto.food?.filter((f) => f)?.map((f) => f.hrid),
            drinks: dto.drinks?.filter((d) => d)?.map((d) => d.hrid),
            abilities: dto.abilities?.filter((a) => a)?.map((a) => a.hrid),
            debuffOnLevelGap: dto.debuffOnLevelGap,
        },
    });

    return dto;
}

/**
 * Calculate combat level from skill levels
 * @param {Object} levels - Object with skill levels
 * @returns {number} Combat level
 */
function calcCombatLevel(levels) {
    const maxCombatSkill = Math.max(
        levels.attackLevel || 1,
        levels.defenseLevel || 1,
        levels.meleeLevel || 1,
        levels.rangedLevel || 1,
        levels.magicLevel || 1,
    );

    return (
        0.1 *
            ((levels.staminaLevel || 1) +
                (levels.intelligenceLevel || 1) +
                (levels.attackLevel || 1) +
                (levels.defenseLevel || 1) +
                maxCombatSkill) +
        0.5 * maxCombatSkill
    );
}

/**
 * Calculate debuff on level gap for a player
 * @param {number} playerCombatLevel - Player's combat level
 * @param {number} maxCombatLevel - Maximum combat level in party
 * @returns {number} Debuff multiplier (0 to -0.9)
 */
function calculateDebuffOnLevelGap(playerCombatLevel, maxCombatLevel) {
    if (maxCombatLevel / playerCombatLevel <= 1.2) {
        return 0;
    }

    const maxDebuffOnLevelGap = 0.9;
    const levelPercent = Math.floor((maxCombatLevel / playerCombatLevel - 1.2) * 100) / 100;

    return -1 * Math.min(maxDebuffOnLevelGap, 3 * levelPercent);
}

/**
 * Convert multiple character slots to Player DTOs
 * Calculates debuffOnLevelGap based on party composition
 * @param {Array} slots - All character slots
 * @param {Array} selectedPartyMembers - Array of slot numbers to include
 * @returns {Array} Array of Player DTOs
 */
export function convertSlotsToPlayerDTOs(slots, selectedPartyMembers) {
    if (!Array.isArray(selectedPartyMembers) || selectedPartyMembers.length === 0) {
        return [];
    }

    // First pass: Convert all slots and calculate combat levels
    const playerDTOs = selectedPartyMembers
        .map((slotNumber, index) => {
            const slot = slots.find((s) => String(s.slotNumber) === String(slotNumber));
            if (!slot) return null;

            const dto = convertSlotToPlayerDTO(slot, index);
            if (!dto) return null;

            // Calculate combat level for debuff calculation
            dto.combatLevel = calcCombatLevel({
                staminaLevel: dto.staminaLevel,
                intelligenceLevel: dto.intelligenceLevel,
                attackLevel: dto.attackLevel,
                meleeLevel: dto.meleeLevel,
                defenseLevel: dto.defenseLevel,
                rangedLevel: dto.rangedLevel,
                magicLevel: dto.magicLevel,
            });

            return dto;
        })
        .filter(Boolean);

    if (playerDTOs.length === 0) {
        return [];
    }

    // Find max combat level in party
    const maxCombatLevel = Math.max(...playerDTOs.map((p) => p.combatLevel));

    // Second pass: Calculate debuff for each player
    playerDTOs.forEach((dto) => {
        dto.debuffOnLevelGap = calculateDebuffOnLevelGap(dto.combatLevel, maxCombatLevel);

        if (dto.debuffOnLevelGap !== 0) {
            console.debug(`[CONVERTER] Player ${dto.hrid} debuff: ${(dto.debuffOnLevelGap * 100).toFixed(1)}%`, {
                combatLevel: dto.combatLevel.toFixed(1),
                maxCombatLevel: maxCombatLevel.toFixed(1),
                ratio: (maxCombatLevel / dto.combatLevel).toFixed(2),
            });
        }
    });

    return playerDTOs;
}
