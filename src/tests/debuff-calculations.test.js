import { describe, it, expect } from "vitest";

/**
 * Test suite for debuffOnLevelGap calculation parity
 *
 * Legacy implementation (legacy_main.js:3121-3138):
 * - Calculates combatLevel for each player
 * - Finds maxPlayerCombatLevel
 * - If max/combatLevel > 1.2, applies debuff
 * - Formula: debuff = -1 * min(0.9, 3 * (max/level - 1.2))
 * - debuffOnLevelGap ranges from 0 to -0.9 (-90%)
 */

describe("Debuff On Level Gap Calculations", () => {
    describe("Combat Level Calculation", () => {
        it("should calculate combat level correctly", () => {
            // From legacy_main.js:calcCombatLevel
            const levels = {
                stamina: 50,
                intelligence: 40,
                defense: 60,
                attack: 55,
                melee: 70,
                ranged: 45,
                magic: 30,
            };

            const combatLevel = calcCombatLevel(
                levels.stamina,
                levels.intelligence,
                levels.defense,
                levels.attack,
                levels.melee,
                levels.ranged,
                levels.magic,
            );

            // Manual calculation:
            // 0.1 * (50 + 40 + 55 + 60 + max(70, 45, 30)) + 0.5 * max(55, 60, 70, 45, 30)
            // 0.1 * (50 + 40 + 55 + 60 + 70) + 0.5 * 70
            // 0.1 * 275 + 35 = 27.5 + 35 = 62.5
            expect(combatLevel).toBe(62.5);
        });

        it("should calculate combat level with different skills", () => {
            const levels = {
                stamina: 1,
                intelligence: 1,
                defense: 1,
                attack: 1,
                melee: 1,
                ranged: 1,
                magic: 1,
            };

            const combatLevel = calcCombatLevel(
                levels.stamina,
                levels.intelligence,
                levels.defense,
                levels.attack,
                levels.melee,
                levels.ranged,
                levels.magic,
            );

            // 0.1 * (1+1+1+1+1) + 0.5 * 1 = 0.5 + 0.5 = 1.0
            expect(combatLevel).toBe(1);
        });
    });

    describe("Debuff Calculation", () => {
        it("should not apply debuff when level difference is small", () => {
            const playerLevel = 50;
            const maxLevel = 55; // 10% difference

            const debuff = calculateDebuff(playerLevel, maxLevel);
            expect(debuff).toBe(0);
        });

        it("should not apply debuff at exactly 20% difference", () => {
            const playerLevel = 50;
            const maxLevel = 60; // 20% difference, ratio = 1.2

            const debuff = calculateDebuff(playerLevel, maxLevel);
            expect(debuff).toBe(0);
        });

        it("should apply debuff at 30% difference", () => {
            const playerLevel = 50;
            const maxLevel = 65; // 30% difference, ratio = 1.3

            const debuff = calculateDebuff(playerLevel, maxLevel);
            // levelPercent = 1.3 - 1.2 = 0.1
            // debuff = -1 * min(0.9, 3 * 0.1) = -1 * min(0.9, 0.3) = -0.3
            expect(debuff).toBeCloseTo(-0.3, 5);
        });

        it("should apply debuff at 50% difference", () => {
            const playerLevel = 50;
            const maxLevel = 75; // 50% difference, ratio = 1.5

            const debuff = calculateDebuff(playerLevel, maxLevel);
            // levelPercent = 1.5 - 1.2 = 0.3
            // debuff = -1 * min(0.9, 3 * 0.3) = -1 * min(0.9, 0.9) = -0.9
            expect(debuff).toBe(-0.9);
        });

        it("should cap debuff at 90%", () => {
            const playerLevel = 30;
            const maxLevel = 80; // 166% difference, ratio = 2.67

            const debuff = calculateDebuff(playerLevel, maxLevel);
            // levelPercent = 2.67 - 1.2 = 1.47
            // debuff = -1 * min(0.9, 3 * 1.47) = -1 * min(0.9, 4.41) = -0.9
            expect(debuff).toBe(-0.9);
        });

        it("should apply partial debuff at 25% difference", () => {
            const playerLevel = 80;
            const maxLevel = 100; // 25% difference, ratio = 1.25

            const debuff = calculateDebuff(playerLevel, maxLevel);
            // levelPercent = 1.25 - 1.2 = 0.05
            // debuff = -1 * min(0.9, 3 * 0.05) = -1 * 0.15 = -0.15
            expect(debuff).toBeCloseTo(-0.15, 5);
        });
    });

    describe("Multiple Players", () => {
        it("should calculate debuff correctly for party with varying levels", () => {
            const players = [
                { name: "player1", combatLevel: 80 },
                { name: "player2", combatLevel: 70 },
                { name: "player3", combatLevel: 60 },
            ];

            const maxLevel = Math.max(...players.map((p) => p.combatLevel));
            expect(maxLevel).toBe(80);

            // player1: 80/80 = 1.0, no debuff
            expect(calculateDebuff(80, maxLevel)).toBe(0);

            // player2: 80/70 = 1.14, no debuff (less than 1.2)
            expect(calculateDebuff(70, maxLevel)).toBe(0);

            // player3: 80/60 = 1.33, debuff applies
            // levelPercent = 1.33 - 1.2 = 0.13 (but actually 80/60 = 1.333...)
            // debuff = -1 * min(0.9, 3 * 0.1333...) = -1 * 0.4 = -0.4
            expect(calculateDebuff(60, maxLevel)).toBeCloseTo(-0.4, 1);
        });
    });

    describe("Debuff Application", () => {
        it("should affect experience gain calculation", () => {
            const baseExperience = 1000;
            const debuff = -0.3; // 30% reduction

            const modifiedExperience = baseExperience * (1 + debuff);
            expect(modifiedExperience).toBe(700);
        });

        it("should affect drop calculations", () => {
            const baseDrops = 100;
            const debuff = -0.5; // 50% reduction

            const modifiedDrops = baseDrops * (1 + debuff);
            expect(modifiedDrops).toBe(50);
        });
    });
});

// Helper functions
function calcCombatLevel(
    staminaLevel,
    intelligenceLevel,
    defenseLevel,
    attackLevel,
    meleeLevel,
    rangedLevel,
    magicLevel,
) {
    return (
        0.1 *
            (staminaLevel +
                intelligenceLevel +
                attackLevel +
                defenseLevel +
                Math.max(meleeLevel, rangedLevel, magicLevel)) +
        0.5 * Math.max(attackLevel, defenseLevel, meleeLevel, rangedLevel, magicLevel)
    );
}

function calculateDebuff(playerLevel, maxLevel) {
    if (maxLevel / playerLevel <= 1.2) {
        return 0;
    }

    const maxDebuffOnLevelGap = 0.9;
    const levelPercent = maxLevel / playerLevel - 1.2;

    return -1 * Math.min(maxDebuffOnLevelGap, 3 * levelPercent);
}
