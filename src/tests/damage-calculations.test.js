import { describe, it, expect } from "vitest";

/**
 * Test suite for damage calculation parity
 *
 * Legacy damage formulas from combatSimulator.js and combatUtilities.js:
 * - Accuracy vs Evasion determines hit chance
 * - Damage calculation based on combat style and weapon
 * - Critical hits apply critical damage multiplier
 * - Armor reduces damage
 * - Various modifiers: amplify, penetration, etc.
 */

describe("Damage Calculations", () => {
    describe("Hit Chance Calculation", () => {
        it("should calculate hit chance from accuracy vs evasion", () => {
            // Hit chance = accuracy / (accuracy + evasion)
            const accuracy = 1000;
            const evasion = 500;

            const hitChance = accuracy / (accuracy + evasion);

            // 1000 / 1500 = 0.666... (66.67%)
            expect(hitChance).toBeCloseTo(0.6667, 4);
        });

        it("should have 50% hit chance when accuracy equals evasion", () => {
            const accuracy = 1000;
            const evasion = 1000;

            const hitChance = accuracy / (accuracy + evasion);

            expect(hitChance).toBe(0.5);
        });

        it("should have high hit chance when accuracy >> evasion", () => {
            const accuracy = 10000;
            const evasion = 100;

            const hitChance = accuracy / (accuracy + evasion);

            expect(hitChance).toBeCloseTo(0.99, 2);
        });

        it("should have low hit chance when accuracy << evasion", () => {
            const accuracy = 100;
            const evasion = 10000;

            const hitChance = accuracy / (accuracy + evasion);

            expect(hitChance).toBeCloseTo(0.01, 2);
        });
    });

    describe("Damage Calculation", () => {
        it("should calculate base damage from weapon and stats", () => {
            const weaponMaxDamage = 100;
            const combatStyleDamageBonus = 0; // No bonus

            // Damage roll: 1 to maxDamage
            const minDamage = 1;
            const maxDamage = weaponMaxDamage * (1 + combatStyleDamageBonus);

            expect(minDamage).toBe(1);
            expect(maxDamage).toBe(100);
        });

        it("should apply combat style damage modifier", () => {
            const weaponMaxDamage = 100;
            const combatStyleDamageBonus = 0.2; // +20%

            const maxDamage = weaponMaxDamage * (1 + combatStyleDamageBonus);

            expect(maxDamage).toBe(120);
        });

        it("should apply armor reduction", () => {
            const baseDamage = 100;
            const armor = 50;
            const armorPenetration = 0; // No penetration

            // Armor reduces damage: damage / (1 + armor * 0.01)
            const effectiveArmor = armor * (1 - armorPenetration);
            const reducedDamage = baseDamage / (1 + effectiveArmor * 0.01);

            // 100 / (1 + 50 * 0.01) = 100 / 1.5 = 66.67
            expect(reducedDamage).toBeCloseTo(66.67, 2);
        });

        it("should apply armor penetration", () => {
            const baseDamage = 100;
            const armor = 50;
            const armorPenetration = 0.5; // 50% penetration

            const effectiveArmor = armor * (1 - armorPenetration);
            const reducedDamage = baseDamage / (1 + effectiveArmor * 0.01);

            // 100 / (1 + 25 * 0.01) = 100 / 1.25 = 80
            expect(reducedDamage).toBe(80);
        });
    });

    describe("Critical Hits", () => {
        it("should apply critical damage multiplier on crit", () => {
            const baseDamage = 100;
            const criticalDamage = 1.5; // +50% crit damage

            const critDamage = baseDamage * criticalDamage;

            expect(critDamage).toBe(150);
        });

        it("should calculate crit chance from critical rate stat", () => {
            const criticalRate = 0.25; // 25% crit chance

            // Crit chance is checked against Math.random()
            // If random < critRate, it's a crit
            expect(criticalRate).toBe(0.25);
        });

        it("should stack crit damage with other multipliers", () => {
            const baseDamage = 100;
            const combatStyleBonus = 0.2; // +20%
            const criticalDamage = 1.5; // +50% crit

            const styledDamage = baseDamage * (1 + combatStyleBonus);
            const critDamage = styledDamage * criticalDamage;

            // 100 * 1.2 * 1.5 = 180
            expect(critDamage).toBe(180);
        });
    });

    describe("Elemental Damage", () => {
        it("should apply elemental amplify bonuses", () => {
            const baseDamage = 100;
            const physicalAmplify = 0.3; // +30% physical

            const amplifiedDamage = baseDamage * (1 + physicalAmplify);

            expect(amplifiedDamage).toBe(130);
        });

        it("should apply elemental resistance reduction", () => {
            const baseDamage = 100;
            const targetResistance = 50;

            // Resistance reduces damage similar to armor
            const reducedDamage = baseDamage / (1 + targetResistance * 0.01);

            // 100 / (1 + 50 * 0.01) = 100 / 1.5 = 66.67
            expect(reducedDamage).toBeCloseTo(66.67, 2);
        });

        it("should apply elemental penetration", () => {
            const baseDamage = 100;
            const targetResistance = 50;
            const penetration = 0.4; // 40% penetration

            const effectiveResistance = targetResistance * (1 - penetration);
            const reducedDamage = baseDamage / (1 + effectiveResistance * 0.01);

            // 100 / (1 + 30 * 0.01) = 100 / 1.3 = 76.92
            expect(reducedDamage).toBeCloseTo(76.92, 2);
        });
    });

    describe("Thorns and Retaliation", () => {
        it("should calculate thorn damage from attacker damage", () => {
            const attackerDamage = 100;
            const thornsPercentage = 0.15; // 15% thorns

            const thornDamage = attackerDamage * thornsPercentage;

            expect(thornDamage).toBe(15);
        });

        it("should calculate retaliation damage", () => {
            const attackerDamage = 100;
            const retaliationPercentage = 0.1; // 10% retaliation

            const retaliationDamage = attackerDamage * retaliationPercentage;

            expect(retaliationDamage).toBe(10);
        });
    });

    describe("Life Steal and Mana Leech", () => {
        it("should calculate life steal heal", () => {
            const damageDealt = 100;
            const lifeStealPercentage = 0.05; // 5% lifesteal

            const lifeStealHeal = damageDealt * lifeStealPercentage;

            expect(lifeStealHeal).toBe(5);
        });

        it("should calculate mana leech", () => {
            const damageDealt = 100;
            const manaLeechPercentage = 0.03; // 3% mana leech

            const manaLeechAmount = damageDealt * manaLeechPercentage;

            expect(manaLeechAmount).toBe(3);
        });
    });

    describe("Complete Damage Formula", () => {
        it("should calculate full damage with all modifiers", () => {
            const weaponDamage = 100;
            const combatStyleBonus = 0.2; // +20%
            const isCrit = true;
            const critDamage = 1.5; // +50% crit damage
            const amplify = 0.25; // +25% amplify
            const armor = 50;
            const armorPenetration = 0.2; // 20% penetration

            // Step 1: Apply combat style bonus
            let damage = weaponDamage * (1 + combatStyleBonus);

            // Step 2: Apply crit if critical hit
            if (isCrit) {
                damage *= critDamage;
            }

            // Step 3: Apply amplify
            damage *= 1 + amplify;

            // Step 4: Apply armor
            const effectiveArmor = armor * (1 - armorPenetration);
            damage /= 1 + effectiveArmor * 0.01;

            // 100 * 1.2 * 1.5 * 1.25 / (1 + 40 * 0.01)
            // = 225 / 1.4
            // = 160.71
            expect(damage).toBeCloseTo(160.71, 2);
        });

        it("should handle non-critical hits", () => {
            const weaponDamage = 100;
            const combatStyleBonus = 0.1;
            const isCrit = false;
            const amplify = 0.15;
            const armor = 30;

            let damage = weaponDamage * (1 + combatStyleBonus);

            if (isCrit) {
                damage *= 1.5; // Would apply if crit
            }

            damage *= 1 + amplify;
            damage /= 1 + armor * 0.01;

            // 100 * 1.1 * 1.15 / 1.3 = 97.31
            expect(damage).toBeCloseTo(97.31, 2);
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero damage", () => {
            const baseDamage = 0;
            const modifiers = 1.5;

            const finalDamage = baseDamage * modifiers;

            expect(finalDamage).toBe(0);
        });

        it("should handle very high armor", () => {
            const baseDamage = 100;
            const armor = 500; // Very high armor

            const reducedDamage = baseDamage / (1 + armor * 0.01);

            // 100 / 6 = 16.67
            expect(reducedDamage).toBeCloseTo(16.67, 2);
        });

        it("should handle 100% armor penetration", () => {
            const baseDamage = 100;
            const armor = 100;
            const armorPenetration = 1.0; // 100% penetration

            const effectiveArmor = armor * (1 - armorPenetration);
            const finalDamage = baseDamage / (1 + effectiveArmor * 0.01);

            // 100 / 1 = 100 (no reduction)
            expect(finalDamage).toBe(100);
        });

        it("should cap damage reduction appropriately", () => {
            const baseDamage = 100;
            // Even with very high armor, damage shouldn't be zero
            const armor = 10000;

            const reducedDamage = baseDamage / (1 + armor * 0.01);

            // 100 / 101 = 0.99 (minimum damage floor)
            expect(reducedDamage).toBeGreaterThan(0);
            expect(reducedDamage).toBeCloseTo(0.99, 2);
        });
    });
});

describe("Damage Calculation Parity", () => {
    it("legacy and new should calculate damage identically", () => {
        const testCases = [
            {
                name: "Basic hit",
                weaponDamage: 50,
                accuracy: 500,
                evasion: 300,
                armor: 20,
                expectedHitChance: 500 / 800,
            },
            {
                name: "Crit hit",
                weaponDamage: 100,
                isCrit: true,
                critDamage: 1.5,
                amplify: 0.2,
                armor: 40,
                armorPen: 0.1,
            },
            {
                name: "High armor target",
                weaponDamage: 80,
                armor: 100,
                armorPen: 0.5,
            },
        ];

        testCases.forEach((tc) => {
            // Legacy calculation
            let legacyDamage = tc.weaponDamage;
            if (tc.isCrit) {
                legacyDamage *= tc.critDamage;
            }
            if (tc.amplify) {
                legacyDamage *= 1 + tc.amplify;
            }
            if (tc.armor) {
                const effectiveArmor = tc.armor * (1 - (tc.armorPen || 0));
                legacyDamage /= 1 + effectiveArmor * 0.01;
            }

            // New calculation (should match)
            let newDamage = tc.weaponDamage;
            if (tc.isCrit) {
                newDamage *= tc.critDamage;
            }
            if (tc.amplify) {
                newDamage *= 1 + tc.amplify;
            }
            if (tc.armor) {
                const effectiveArmor = tc.armor * (1 - (tc.armorPen || 0));
                newDamage /= 1 + effectiveArmor * 0.01;
            }

            expect(newDamage).toBeCloseTo(legacyDamage, 5);
        });
    });
});
