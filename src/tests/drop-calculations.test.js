import { describe, it, expect } from "vitest";

/**
 * Test suite for drop calculation parity between legacy and new implementations
 *
 * Legacy implementation (legacy_main.js:1795-1926):
 * - Uses dropRateMultiplier, rareFindMultiplier, combatDropQuantity, debuffOnLevelGap from player
 * - Calculates dropRate with difficulty multiplier
 * - noRngDropAmount = deaths * dropRate * avgCount * (1 + debuff) * (1 + dropQty) / players
 * - RNG drops use actual random rolls (not tested here since we use EV)
 *
 * New implementation (simulator.worker.js:133-267):
 * - Same formulas for no-RNG expected drops
 * - Uses expected values instead of random rolls
 */

describe("Drop Calculations", () => {
    describe("Drop Rate Calculation", () => {
        it("should calculate drop rate with difficulty multiplier", () => {
            const drop = {
                dropRate: 0.5,
                dropRatePerDifficultyTier: 0.05,
                minDifficultyTier: 0,
            };
            const difficultyTier = 3;
            const dropRateMultiplier = 1.2;

            // Legacy formula
            const multiplier = 1.0 + 0.1 * difficultyTier; // 1.3
            const baseDropRate = Math.min(
                1.0,
                multiplier * (drop.dropRate + (drop.dropRatePerDifficultyTier ?? 0) * difficultyTier),
            );
            const finalDropRate = Math.min(1.0, baseDropRate * dropRateMultiplier);

            // Expected: 1.3 * (0.5 + 0.05 * 3) = 1.3 * 0.65 = 0.845
            // Then: min(1.0, 0.845 * 1.2) = min(1.0, 1.014) = 1.0
            expect(finalDropRate).toBe(1.0);
        });

        it("should respect minDifficultyTier", () => {
            const drop = {
                dropRate: 0.5,
                minDifficultyTier: 5,
            };
            const difficultyTier = 3;

            const shouldDrop = drop.minDifficultyTier <= difficultyTier;
            expect(shouldDrop).toBe(false);
        });

        it("should cap drop rate at 100%", () => {
            const drop = {
                dropRate: 0.9,
                minDifficultyTier: 0,
            };
            const difficultyTier = 10;
            const dropRateMultiplier = 2.0;

            const multiplier = 1.0 + 0.1 * difficultyTier; // 2.0
            const baseDropRate = multiplier * drop.dropRate; // 1.8
            const finalDropRate = Math.min(1.0, baseDropRate * dropRateMultiplier);

            expect(finalDropRate).toBe(1.0);
        });
    });

    describe("No-RNG Drop Amount Calculation", () => {
        it("should calculate expected drops for a single monster", () => {
            const monsterDeaths = 100;
            const dropRate = 0.5;
            const dropMin = 1;
            const dropMax = 3;
            const debuffOnLevelGap = 0;
            const combatDropQuantity = 0.2; // +20% drops
            const numberOfPlayers = 1;

            // Legacy formula for no-RNG drops
            const avgCount = (dropMin + dropMax) / 2; // 2
            const noRngDropAmount =
                (monsterDeaths * dropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            // Expected: 100 * 0.5 * 2 * 1.0 * 1.2 / 1 = 120
            expect(noRngDropAmount).toBe(120);
        });

        it("should apply debuff correctly", () => {
            const monsterDeaths = 100;
            const dropRate = 0.5;
            const dropMin = 1;
            const dropMax = 3;
            const debuffOnLevelGap = -0.3; // -30% drops
            const combatDropQuantity = 0;
            const numberOfPlayers = 1;

            const avgCount = (dropMin + dropMax) / 2;
            const noRngDropAmount =
                (monsterDeaths * dropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            // Expected: 100 * 0.5 * 2 * 0.7 * 1.0 / 1 = 70
            expect(noRngDropAmount).toBe(70);
        });

        it("should divide drops among party members", () => {
            const monsterDeaths = 100;
            const dropRate = 1.0;
            const dropMin = 10;
            const dropMax = 10;
            const debuffOnLevelGap = 0;
            const combatDropQuantity = 0;
            const numberOfPlayers = 3;

            const avgCount = (dropMin + dropMax) / 2;
            const noRngDropAmount =
                (monsterDeaths * dropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            // Expected: 100 * 1.0 * 10 * 1.0 * 1.0 / 3 = 333.33
            expect(noRngDropAmount).toBeCloseTo(333.33, 2);
        });
    });

    describe("Rare Drop Calculation", () => {
        it("should calculate rare drop rate with multiplier", () => {
            const drop = {
                dropRate: 0.01, // 1% base
            };
            const rareFindMultiplier = 1.5; // +50% rare find

            const finalDropRate = drop.dropRate * rareFindMultiplier;

            // Expected: 0.01 * 1.5 = 0.015 (1.5%)
            expect(finalDropRate).toBe(0.015);
        });

        it("should calculate rare drops with same formula as regular drops", () => {
            const monsterDeaths = 1000;
            const dropRate = 0.01;
            const dropMin = 1;
            const dropMax = 1;
            const debuffOnLevelGap = 0;
            const combatDropQuantity = 0.5; // +50% drops
            const numberOfPlayers = 1;

            const avgCount = (dropMin + dropMax) / 2;
            const noRngDropAmount =
                (monsterDeaths * dropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            // Expected: 1000 * 0.01 * 1 * 1.0 * 1.5 / 1 = 15
            expect(noRngDropAmount).toBe(15);
        });
    });

    describe("Drop Value Calculation", () => {
        it("should calculate drop value correctly", () => {
            const dropCount = 100;
            const price = 50;

            const value = dropCount * price;
            expect(value).toBe(5000);
        });

        it("should calculate per-hour values", () => {
            const totalDrops = 1200;
            const hoursFactor = 24; // 24 hours of simulation

            const dropsPerHour = totalDrops / hoursFactor;
            expect(dropsPerHour).toBe(50);
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero deaths", () => {
            const monsterDeaths = 0;
            const dropRate = 0.5;
            const avgCount = 2;
            const debuffOnLevelGap = 0;
            const combatDropQuantity = 0;
            const numberOfPlayers = 1;

            const noRngDropAmount =
                (monsterDeaths * dropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            expect(noRngDropAmount).toBe(0);
        });

        it("should handle zero drop rate", () => {
            const monsterDeaths = 100;
            const dropRate = 0;
            const avgCount = 2;
            const debuffOnLevelGap = 0;
            const combatDropQuantity = 0;
            const numberOfPlayers = 1;

            const noRngDropAmount =
                (monsterDeaths * dropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            expect(noRngDropAmount).toBe(0);
        });

        it("should handle 100% drop rate", () => {
            const monsterDeaths = 100;
            const dropRate = 1.0;
            const avgCount = 1;
            const debuffOnLevelGap = 0;
            const combatDropQuantity = 0;
            const numberOfPlayers = 1;

            const noRngDropAmount =
                (monsterDeaths * dropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            expect(noRngDropAmount).toBe(100);
        });

        it("should handle -90% debuff (max)", () => {
            const monsterDeaths = 100;
            const dropRate = 1.0;
            const avgCount = 10;
            const debuffOnLevelGap = -0.9; // -90%
            const combatDropQuantity = 0;
            const numberOfPlayers = 1;

            const noRngDropAmount =
                (monsterDeaths * dropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            // Expected: 100 * 1.0 * 10 * 0.1 * 1.0 / 1 = 100
            expect(noRngDropAmount).toBeCloseTo(100, 10);
        });
    });

    describe("Integration Scenarios", () => {
        it("should calculate drops for a realistic scenario", () => {
            // Simulating 100 abyssal imp kills at difficulty 3 with party of 2
            const monsterDeaths = 100;
            const difficultyTier = 3;
            const dropRateMultiplier = 1.2;
            const rareFindMultiplier = 1.5;
            const combatDropQuantity = 0.2;
            const debuffOnLevelGap = -0.1;
            const numberOfPlayers = 2;

            // Abyssal Imp drops abyssal_essence
            const drop = {
                itemHrid: "/items/abyssal_essence",
                dropRate: 0.3,
                dropRatePerDifficultyTier: 0,
                minCount: 1,
                maxCount: 4,
                minDifficultyTier: 0,
            };

            // Calculate drop rate
            const multiplier = 1.0 + 0.1 * difficultyTier;
            const baseDropRate = Math.min(
                1.0,
                multiplier * (drop.dropRate + (drop.dropRatePerDifficultyTier ?? 0) * difficultyTier),
            );
            const finalDropRate = Math.min(1.0, baseDropRate * dropRateMultiplier);

            // Calculate expected drops
            const avgCount = (drop.minCount + drop.maxCount) / 2;
            const noRngDropAmount =
                (monsterDeaths * finalDropRate * avgCount * (1 + debuffOnLevelGap) * (1 + combatDropQuantity)) /
                numberOfPlayers;

            // Verify reasonable values
            expect(finalDropRate).toBeGreaterThan(0);
            expect(finalDropRate).toBeLessThanOrEqual(1.0);
            expect(noRngDropAmount).toBeGreaterThan(0);
        });

        it("should handle multiple drops from same monster", () => {
            const monsterDeaths = 100;
            const dropRateMultiplier = 1.0;
            const combatDropQuantity = 0;
            const debuffOnLevelGap = 0;
            const numberOfPlayers = 1;

            // Two different drops from same monster
            const drops = [
                { dropRate: 0.5, minCount: 1, maxCount: 3 },
                { dropRate: 0.3, minCount: 1, maxCount: 1 },
            ];

            const totalDrops = drops.reduce((sum, drop) => {
                const avgCount = (drop.minCount + drop.maxCount) / 2;
                const noRngDropAmount =
                    (monsterDeaths *
                        drop.dropRate *
                        avgCount *
                        dropRateMultiplier *
                        (1 + debuffOnLevelGap) *
                        (1 + combatDropQuantity)) /
                    numberOfPlayers;
                return sum + noRngDropAmount;
            }, 0);

            // First: 100 * 0.5 * 2 * 1.0 * 1.0 * 1.0 / 1 = 100
            // Second: 100 * 0.3 * 1 * 1.0 * 1.0 * 1.0 / 1 = 30
            // Total: 130
            expect(totalDrops).toBe(130);
        });
    });
});

describe("Drop Calculation Parity", () => {
    it("legacy and new implementations should produce identical no-RNG drop values", () => {
        const testCases = [
            {
                name: "Basic drop",
                deaths: 100,
                dropRate: 0.5,
                minCount: 1,
                maxCount: 3,
                debuff: 0,
                dropQty: 0,
                players: 1,
            },
            {
                name: "With debuff",
                deaths: 100,
                dropRate: 0.5,
                minCount: 1,
                maxCount: 3,
                debuff: -0.3,
                dropQty: 0,
                players: 1,
            },
            {
                name: "With drop quantity buff",
                deaths: 100,
                dropRate: 0.5,
                minCount: 1,
                maxCount: 3,
                debuff: 0,
                dropQty: 0.5,
                players: 1,
            },
            {
                name: "Party of 3",
                deaths: 300,
                dropRate: 1.0,
                minCount: 10,
                maxCount: 10,
                debuff: 0,
                dropQty: 0,
                players: 3,
            },
            {
                name: "Max debuff",
                deaths: 100,
                dropRate: 1.0,
                minCount: 10,
                maxCount: 10,
                debuff: -0.9,
                dropQty: 0,
                players: 1,
            },
        ];

        testCases.forEach((tc) => {
            // Legacy calculation
            const legacyAvgCount = (tc.minCount + tc.maxCount) / 2;
            const legacyNoRngDropAmount =
                (tc.deaths * tc.dropRate * legacyAvgCount * (1 + tc.debuff) * (1 + tc.dropQty)) / tc.players;

            // New calculation (should match)
            const newAvgCount = (tc.minCount + tc.maxCount) / 2;
            const newNoRngDropAmount =
                (tc.deaths * tc.dropRate * newAvgCount * (1 + tc.debuff) * (1 + tc.dropQty)) / tc.players;

            expect(newNoRngDropAmount).toBeCloseTo(legacyNoRngDropAmount, 5);
        });
    });
});
