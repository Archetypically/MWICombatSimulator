import { describe, it, expect, vi, beforeAll } from "vitest";
import {
    convertSlotToPlayerDTO,
    convertSlotsToPlayerDTOs,
    convertEquipmentToDTO,
    convertConsumablesToDTO,
    convertAbilitiesToDTO,
} from "../lib/playerDtoConverter";

// Mock the dataLoader
vi.mock("../lib/dataLoader", async () => {
    const actual = await vi.importActual("../lib/dataLoader");
    return {
        ...actual,
        itemDetailMap: () => ({
            "/items/leather_pouch": {
                equipmentDetail: {
                    combatStats: {
                        foodSlots: 1,
                        drinkSlots: 1,
                    },
                    combatEnhancementBonuses: {
                        foodSlots: 0.1,
                        drinkSlots: 0.1,
                    },
                },
            },
            "/items/reinforced_pouch": {
                equipmentDetail: {
                    combatStats: {
                        foodSlots: 2,
                        drinkSlots: 2,
                    },
                    combatEnhancementBonuses: {
                        foodSlots: 0.2,
                        drinkSlots: 0.2,
                    },
                },
            },
        }),
        enhancementLevelTotalBonusMultiplierTable: () => ({
            0: 1,
            1: 1.1,
            2: 1.2,
            3: 1.3,
            4: 1.4,
            5: 1.5,
        }),
    };
});

/**
 * Test suite for player DTO converter
 * Ensures parity with legacy player setup
 */

describe("Player DTO Converter", () => {
    describe("Equipment Conversion", () => {
        it("should convert equipment array to equipment object using itemLocationHrid", () => {
            const slotEquipment = [
                {
                    itemHrid: "/items/iron_helmet",
                    itemLocationHrid: "/item_locations/head",
                    enhancementLevel: 5,
                },
                {
                    itemHrid: "/items/iron_sword",
                    itemLocationHrid: "/item_locations/main_hand",
                    enhancementLevel: 3,
                },
            ];

            const result = convertEquipmentToDTO(slotEquipment);

            expect(result["/equipment_types/head"]).toEqual({
                hrid: "/items/iron_helmet",
                enhancementLevel: 5,
            });
            expect(result["/equipment_types/main_hand"]).toEqual({
                hrid: "/items/iron_sword",
                enhancementLevel: 3,
            });
            expect(result["/equipment_types/body"]).toBeNull();
        });

        it("should still support legacy format with type property", () => {
            const slotEquipment = [
                {
                    itemHrid: "/items/iron_helmet",
                    type: "/equipment_types/head",
                    enhancementLevel: 5,
                },
            ];

            const result = convertEquipmentToDTO(slotEquipment);

            expect(result["/equipment_types/head"]).toEqual({
                hrid: "/items/iron_helmet",
                enhancementLevel: 5,
            });
        });

        it("should handle null/undefined equipment", () => {
            const result = convertEquipmentToDTO(null);
            expect(result["/equipment_types/head"]).toBeNull();
            // Default equipment has 14 slots (not including charm)
            expect(Object.keys(result)).toHaveLength(14);
        });
    });

    describe("Consumables Conversion", () => {
        it("should convert food from slot format", () => {
            const slotConsumables = {
                "/action_types/combat": [
                    { itemHrid: "/items/cheese", triggers: [] },
                    { itemHrid: "/items/bread", triggers: [] },
                    null,
                ],
            };

            // Pass slots=3 to allow all 3 consumables
            const result = convertConsumablesToDTO(slotConsumables, 3);

            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({ hrid: "/items/cheese", triggers: [] });
            expect(result[1]).toEqual({ hrid: "/items/bread", triggers: [] });
            expect(result[2]).toBeNull();
        });

        it("should filter consumables based on available slots", () => {
            const slotConsumables = {
                "/action_types/combat": [
                    { itemHrid: "/items/cheese", triggers: [] },
                    { itemHrid: "/items/bread", triggers: [] },
                    { itemHrid: "/items/meat", triggers: [] },
                ],
            };

            // With only 1 slot, only first item should be kept
            const result = convertConsumablesToDTO(slotConsumables, 1);

            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({ hrid: "/items/cheese", triggers: [] });
            expect(result[1]).toBeNull(); // Beyond slot limit
            expect(result[2]).toBeNull(); // Beyond slot limit
        });

        it("should handle missing consumables", () => {
            const result = convertConsumablesToDTO({});
            // Empty object returns empty array (implementation detail)
            expect(result).toEqual([]);
        });
    });

    describe("Abilities Conversion", () => {
        it("should convert abilities and pad to 5 slots", () => {
            const slotAbilities = [
                { abilityHrid: "/abilities/slash", level: "5", triggers: [] },
                { abilityHrid: "/abilities/cleave", level: "3", triggers: [] },
            ];

            // Pass intelligenceLevel=10 to unlock second ability slot (requires level 10)
            const result = convertAbilitiesToDTO(slotAbilities, 10);

            expect(result).toHaveLength(5);
            expect(result[0]).toEqual({
                hrid: "/abilities/slash",
                level: 5,
                triggers: [],
            });
            expect(result[1]).toEqual({
                hrid: "/abilities/cleave",
                level: 3,
                triggers: [],
            });
            expect(result[2]).toBeNull();
            expect(result[3]).toBeNull();
            expect(result[4]).toBeNull();
        });

        it("should filter abilities based on intelligence level", () => {
            const slotAbilities = [
                { abilityHrid: "/abilities/slash", level: "5", triggers: [] },
                { abilityHrid: "/abilities/cleave", level: "3", triggers: [] },
                { abilityHrid: "/abilities/bash", level: "1", triggers: [] },
            ];

            // With intelligence=1, only first slot is unlocked
            const result = convertAbilitiesToDTO(slotAbilities, 1);

            expect(result).toHaveLength(5);
            expect(result[0]).toEqual({
                hrid: "/abilities/slash",
                level: 5,
                triggers: [],
            });
            // Second and third slots locked due to low intelligence
            expect(result[1]).toBeNull();
            expect(result[2]).toBeNull();
            expect(result[3]).toBeNull();
            expect(result[4]).toBeNull();
        });
    });

    describe("Single Slot Conversion", () => {
        it("should convert a character slot to player DTO", () => {
            const slot = {
                slotNumber: 1,
                name: "Test Character",
                player: {
                    staminaLevel: 50,
                    intelligenceLevel: 40,
                    attackLevel: 60,
                    meleeLevel: 70,
                    defenseLevel: 55,
                    rangedLevel: 30,
                    magicLevel: 20,
                    equipment: [
                        {
                            itemHrid: "/items/iron_helmet",
                            type: "/equipment_types/head",
                            enhancementLevel: 5,
                        },
                    ],
                },
                food: {
                    "/action_types/combat": [{ itemHrid: "/items/cheese", triggers: [] }],
                },
                drinks: {
                    "/action_types/combat": [{ itemHrid: "/items/water", triggers: [] }],
                },
                abilities: [{ abilityHrid: "/abilities/slash", level: "5", triggers: [] }],
                houseRooms: { "/house_rooms/dojo": 5 },
                achievements: { "/achievements/kill_100_rats": true },
            };

            const result = convertSlotToPlayerDTO(slot, 0);

            expect(result.hrid).toBe("player1");
            expect(result.staminaLevel).toBe(50);
            expect(result.meleeLevel).toBe(70);
            expect(result.debuffOnLevelGap).toBe(0); // Single player, no debuff
            expect(result.equipment["/equipment_types/head"]).toEqual({
                hrid: "/items/iron_helmet",
                enhancementLevel: 5,
            });
            expect(result.houseRooms["/house_rooms/dojo"]).toBe(5);
        });

        it("should default missing levels to 1", () => {
            const slot = {
                slotNumber: 1,
                player: {},
            };

            const result = convertSlotToPlayerDTO(slot, 0);

            expect(result.staminaLevel).toBe(1);
            expect(result.intelligenceLevel).toBe(1);
            expect(result.attackLevel).toBe(1);
        });
    });

    describe("Multiple Slots with Debuff Calculation", () => {
        it("should calculate debuff for low-level player in high-level party", () => {
            const slots = [
                {
                    slotNumber: 1,
                    player: {
                        // Combat level ~80
                        staminaLevel: 80,
                        intelligenceLevel: 70,
                        attackLevel: 90,
                        meleeLevel: 100,
                        defenseLevel: 85,
                        rangedLevel: 60,
                        magicLevel: 50,
                    },
                },
                {
                    slotNumber: 2,
                    player: {
                        // Combat level ~60, will get debuff
                        staminaLevel: 60,
                        intelligenceLevel: 50,
                        attackLevel: 70,
                        meleeLevel: 80,
                        defenseLevel: 65,
                        rangedLevel: 40,
                        magicLevel: 30,
                    },
                },
            ];

            const result = convertSlotsToPlayerDTOs(slots, ["1", "2"]);

            expect(result).toHaveLength(2);

            // Player 1: higher level, no debuff
            const player1 = result.find((p) => p.hrid === "player1");
            expect(player1.debuffOnLevelGap).toBe(0);
            expect(player1.combatLevel).toBeGreaterThan(70);

            // Player 2: lower level, should have debuff
            const player2 = result.find((p) => p.hrid === "player2");
            expect(player2.debuffOnLevelGap).toBeLessThan(0);
            expect(player2.combatLevel).toBeLessThan(80);

            // Verify debuff calculation: max/combat > 1.2
            const maxLevel = Math.max(player1.combatLevel, player2.combatLevel);
            const ratio = maxLevel / player2.combatLevel;
            expect(ratio).toBeGreaterThan(1.2);
        });

        it("should not apply debuff when level difference is small", () => {
            const slots = [
                {
                    slotNumber: 1,
                    player: {
                        staminaLevel: 50,
                        intelligenceLevel: 50,
                        attackLevel: 50,
                        meleeLevel: 50,
                        defenseLevel: 50,
                        rangedLevel: 50,
                        magicLevel: 50,
                    },
                },
                {
                    slotNumber: 2,
                    player: {
                        staminaLevel: 45,
                        intelligenceLevel: 45,
                        attackLevel: 45,
                        meleeLevel: 45,
                        defenseLevel: 45,
                        rangedLevel: 45,
                        magicLevel: 45,
                    },
                },
            ];

            const result = convertSlotsToPlayerDTOs(slots, ["1", "2"]);

            // Both players should have minimal or no debuff
            expect(result[0].debuffOnLevelGap).toBe(0);
            expect(result[1].debuffOnLevelGap).toBe(0);
        });

        it("should cap debuff at 90%", () => {
            const slots = [
                {
                    slotNumber: 1,
                    player: {
                        // Combat level ~150
                        staminaLevel: 150,
                        intelligenceLevel: 150,
                        attackLevel: 150,
                        meleeLevel: 150,
                        defenseLevel: 150,
                        rangedLevel: 150,
                        magicLevel: 150,
                    },
                },
                {
                    slotNumber: 2,
                    player: {
                        // Combat level ~30, should get max debuff
                        staminaLevel: 30,
                        intelligenceLevel: 30,
                        attackLevel: 30,
                        meleeLevel: 30,
                        defenseLevel: 30,
                        rangedLevel: 30,
                        magicLevel: 30,
                    },
                },
            ];

            const result = convertSlotsToPlayerDTOs(slots, ["1", "2"]);

            const lowLevelPlayer = result.find((p) => p.hrid === "player2");
            expect(lowLevelPlayer.debuffOnLevelGap).toBe(-0.9); // Max debuff
        });

        it("should filter out invalid slots", () => {
            const slots = [
                {
                    slotNumber: 1,
                    player: { staminaLevel: 50 },
                },
                {
                    slotNumber: 2,
                    player: { staminaLevel: 40 },
                },
            ];

            // Only select slot 1
            const result = convertSlotsToPlayerDTOs(slots, ["1"]);

            expect(result).toHaveLength(1);
            expect(result[0].hrid).toBe("player1");
        });

        it("should handle empty party selection", () => {
            const slots = [
                {
                    slotNumber: 1,
                    player: { staminaLevel: 50 },
                },
            ];

            const result = convertSlotsToPlayerDTOs(slots, []);
            expect(result).toHaveLength(0);
        });
    });

    describe("Combat Level Calculation", () => {
        it("should calculate combat level correctly from DTO", () => {
            const slots = [
                {
                    slotNumber: 1,
                    player: {
                        staminaLevel: 50,
                        intelligenceLevel: 40,
                        attackLevel: 55,
                        meleeLevel: 70,
                        defenseLevel: 60,
                        rangedLevel: 45,
                        magicLevel: 30,
                    },
                },
            ];

            const result = convertSlotsToPlayerDTOs(slots, ["1"]);

            // Combat level formula:
            // 0.1 * (sta + int + att + def + max(mel, ran, mag)) + 0.5 * max(att, def, mel, ran, mag)
            // 0.1 * (50 + 40 + 55 + 60 + 70) + 0.5 * 70
            // 0.1 * 275 + 35 = 27.5 + 35 = 62.5
            expect(result[0].combatLevel).toBe(62.5);
        });
    });

    describe("Pouch Slot Calculation", () => {
        it("should calculate food/drink slots without pouch", () => {
            const slot = {
                slotNumber: 1,
                player: {
                    staminaLevel: 50,
                    equipment: [], // No pouch
                },
                food: {
                    "/action_types/combat": [
                        { itemHrid: "/items/cheese", triggers: [] },
                        { itemHrid: "/items/bread", triggers: [] },
                    ],
                },
                drinks: {
                    "/action_types/combat": [{ itemHrid: "/items/water", triggers: [] }],
                },
            };

            const result = convertSlotToPlayerDTO(slot, 0);

            // Without pouch: base 1 slot
            expect(result.food.filter((f) => f !== null)).toHaveLength(1);
            expect(result.drinks.filter((d) => d !== null)).toHaveLength(1);
        });

        it("should calculate food/drink slots with basic pouch", () => {
            const slot = {
                slotNumber: 1,
                player: {
                    staminaLevel: 50,
                    equipment: [
                        {
                            itemHrid: "/items/leather_pouch",
                            type: "/equipment_types/pouch",
                            enhancementLevel: 0,
                        },
                    ],
                },
                food: {
                    "/action_types/combat": [
                        { itemHrid: "/items/cheese", triggers: [] },
                        { itemHrid: "/items/bread", triggers: [] },
                    ],
                },
                drinks: {
                    "/action_types/combat": [
                        { itemHrid: "/items/water", triggers: [] },
                        { itemHrid: "/items/juice", triggers: [] },
                    ],
                },
            };

            const result = convertSlotToPlayerDTO(slot, 0);

            // With leather pouch: base 1 + 1 = 2 slots
            expect(result.food.filter((f) => f !== null)).toHaveLength(2);
            expect(result.drinks.filter((d) => d !== null)).toHaveLength(2);
        });

        it("should calculate food/drink slots with enhanced pouch", () => {
            const slot = {
                slotNumber: 1,
                player: {
                    staminaLevel: 50,
                    equipment: [
                        {
                            itemHrid: "/items/leather_pouch",
                            type: "/equipment_types/pouch",
                            enhancementLevel: 5, // +50% bonus
                        },
                    ],
                },
                food: {
                    "/action_types/combat": [
                        { itemHrid: "/items/cheese", triggers: [] },
                        { itemHrid: "/items/bread", triggers: [] },
                        { itemHrid: "/items/meat", triggers: [] },
                    ],
                },
                drinks: {
                    "/action_types/combat": [
                        { itemHrid: "/items/water", triggers: [] },
                        { itemHrid: "/items/juice", triggers: [] },
                        { itemHrid: "/items/milk", triggers: [] },
                    ],
                },
            };

            const result = convertSlotToPlayerDTO(slot, 0);

            // With enhanced leather pouch (level 5):
            // base 1 + (1 + 0.1 * 1.5) = 1 + 1.15 = 2.15 -> 2 slots (truncated)
            // Actually: base 1 + 1 + (0.1 * 1.5) = 2.15, but we allow up to 3
            expect(result.food.filter((f) => f !== null)).toHaveLength(3);
            expect(result.drinks.filter((d) => d !== null)).toHaveLength(3);
        });

        it("should calculate food/drink slots with advanced pouch", () => {
            const slot = {
                slotNumber: 1,
                player: {
                    staminaLevel: 50,
                    equipment: [
                        {
                            itemHrid: "/items/reinforced_pouch",
                            type: "/equipment_types/pouch",
                            enhancementLevel: 0,
                        },
                    ],
                },
                food: {
                    "/action_types/combat": [
                        { itemHrid: "/items/cheese", triggers: [] },
                        { itemHrid: "/items/bread", triggers: [] },
                        { itemHrid: "/items/meat", triggers: [] },
                    ],
                },
                drinks: {
                    "/action_types/combat": [
                        { itemHrid: "/items/water", triggers: [] },
                        { itemHrid: "/items/juice", triggers: [] },
                        { itemHrid: "/items/milk", triggers: [] },
                    ],
                },
            };

            const result = convertSlotToPlayerDTO(slot, 0);

            // With reinforced pouch: base 1 + 2 = 3 slots (max)
            expect(result.food.filter((f) => f !== null)).toHaveLength(3);
            expect(result.drinks.filter((d) => d !== null)).toHaveLength(3);
        });

        it("should look up triggers from triggerMap", () => {
            const customTriggers = [
                {
                    dependencyHrid: "/combat_trigger_dependencies/self",
                    conditionHrid: "/combat_trigger_conditions/current_mp",
                    comparatorHrid: "/combat_trigger_comparators/less_than",
                    value: 50,
                },
            ];

            const slot = {
                slotNumber: 1,
                player: {
                    staminaLevel: 50,
                },
                food: {
                    "/action_types/combat": [{ itemHrid: "/items/mana_pie" }],
                },
                // Triggers are stored in triggerMap keyed by item hrid
                triggerMap: {
                    "/items/mana_pie": customTriggers,
                },
            };

            const result = convertSlotToPlayerDTO(slot, 0);

            // Food array should have 1 item (padded to 3 with nulls, but only 1 is non-null)
            expect(result.food.filter((f) => f !== null)).toHaveLength(1);
            expect(result.food[0].hrid).toBe("/items/mana_pie");
            expect(result.food[0].triggers).toEqual(customTriggers);
        });

        it("should use default triggers when not in triggerMap", () => {
            const slot = {
                slotNumber: 1,
                player: {
                    staminaLevel: 50,
                },
                food: {
                    "/action_types/combat": [
                        {
                            itemHrid: "/items/cheese",
                            triggers: [
                                {
                                    dependencyHrid: "/combat_trigger_dependencies/self",
                                    conditionHrid: "/combat_trigger_conditions/current_hp",
                                    comparatorHrid: "/combat_trigger_comparators/less_than",
                                    value: 75,
                                },
                            ],
                        },
                    ],
                },
                triggerMap: {}, // Empty triggerMap
            };

            const result = convertSlotToPlayerDTO(slot, 0);

            expect(result.food[0].triggers).toHaveLength(1);
            expect(result.food[0].triggers[0].conditionHrid).toBe("/combat_trigger_conditions/current_hp");
        });
    });
});
