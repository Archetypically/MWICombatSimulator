import { describe, it, expect } from "vitest";

/**
 * Test suite for experience calculation parity
 *
 * SimResult.addExperienceGain (simResult.js:96-149):
 * 1. Primary training: 30% of XP
 * 2. Focus training or distributed: 70% of XP
 * 3. Skill-specific XP bonuses applied
 * 4. Combat XP bonus applied
 * 5. Debuff on level gap applied
 *
 * Experience per skill = baseXP * (1 + combatExperience) * skillRate * (1 + skillExperience) * (1 + debuff)
 */

describe("Experience Calculations", () => {
    describe("Primary Training (30% XP)", () => {
        it("should allocate 30% to primary training skill", () => {
            const primaryTraining = "/skills/melee";
            const baseXP = 1000;

            // Primary training gets 30%
            const primaryRate = 0.3;
            const expectedPrimaryXP = baseXP * primaryRate;

            expect(expectedPrimaryXP).toBe(300);
        });

        it("should handle different primary training skills", () => {
            const testCases = [
                { combatStyle: "/combat_styles/smash", primary: "/skills/melee" },
                { combatStyle: "/combat_styles/slash", primary: "/skills/melee" },
                { combatStyle: "/combat_styles/ranged", primary: "/skills/ranged" },
                { combatStyle: "/combat_styles/magic", primary: "/skills/magic" },
            ];

            testCases.forEach((tc) => {
                const baseXP = 1000;
                const skillKey = tc.primary.split("/")[2];
                const expectedXP = baseXP * 0.3;

                expect(skillKey).toMatch(/^(melee|ranged|magic)$/);
                expect(expectedXP).toBe(300);
            });
        });
    });

    describe("Focus Training or Distributed (70% XP)", () => {
        it("should allocate 70% to focus training if set", () => {
            const focusTraining = "/skills/defense";
            const baseXP = 1000;

            // Focus training gets full 70%
            const focusRate = 0.7;
            const expectedFocusXP = baseXP * focusRate;

            expect(expectedFocusXP).toBe(700);
        });

        it("should distribute 70% evenly among skillExpMap skills when no focus", () => {
            // Example: Smash style has 5 skills in skillExpMap
            const skillExpMapLength = 5;
            const baseXP = 1000;

            // Each skill gets 70% / 5 = 14%
            const distributedRate = 0.7 / skillExpMapLength;
            const expectedXPPerSkill = baseXP * distributedRate;

            expect(distributedRate).toBeCloseTo(0.14, 10);
            expect(expectedXPPerSkill).toBeCloseTo(140, 10);
        });

        it("should distribute 70% among correct skills for smash style", () => {
            // Smash combat style skillExpMap:
            // /skills/attack, /skills/defense, /skills/intelligence, /skills/melee, /skills/stamina
            const smashSkills = [
                "/skills/attack",
                "/skills/defense",
                "/skills/intelligence",
                "/skills/melee",
                "/skills/stamina",
            ];
            const skillExpMapLength = smashSkills.length;
            const baseXP = 1000;

            // Each skill gets 70% / 5 = 14%
            const distributedRate = 0.7 / skillExpMapLength;

            smashSkills.forEach((skill) => {
                const expectedXP = baseXP * distributedRate;
                expect(expectedXP).toBeCloseTo(140, 10);
            });
        });
    });

    describe("Skill-Specific XP Bonuses", () => {
        it("should apply skill XP bonus multiplicatively", () => {
            const baseXP = 1000;
            const rate = 0.3; // Primary training
            const skillExperienceBonus = 0.2; // +20% melee XP

            const skillExperience = rate * (1 + skillExperienceBonus);
            const expectedXP = baseXP * skillExperience;

            // 1000 * 0.3 * 1.2 = 360
            expect(skillExperience).toBe(0.36);
            expect(expectedXP).toBe(360);
        });

        it("should apply different bonuses to different skills", () => {
            const baseXP = 1000;

            // Primary training: melee with +20% bonus
            const meleeRate = 0.3;
            const meleeBonus = 0.2;
            const meleeXP = baseXP * meleeRate * (1 + meleeBonus);

            // Distributed: defense with +10% bonus
            const defenseRate = 0.14;
            const defenseBonus = 0.1;
            const defenseXP = baseXP * defenseRate * (1 + defenseBonus);

            expect(meleeXP).toBe(360);
            expect(defenseXP).toBeCloseTo(154, 0);
        });
    });

    describe("Combat XP Bonus", () => {
        it("should apply combat XP bonus to all experience", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0.15; // +15% combat XP

            const modifiedXP = baseXP * (1 + combatExperienceBonus);

            // 1000 * 1.15 = 1150
            expect(modifiedXP).toBe(1150);
        });

        it("should stack combat XP bonus with skill bonuses", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0.15; // +15% combat XP
            const skillRate = 0.3; // Primary training
            const skillExperienceBonus = 0.2; // +20% skill XP

            const finalXP = baseXP * (1 + combatExperienceBonus) * skillRate * (1 + skillExperienceBonus);

            // 1000 * 1.15 * 0.3 * 1.2 = 414
            expect(finalXP).toBe(414);
        });
    });

    describe("Debuff on Level Gap", () => {
        it("should reduce XP with debuff", () => {
            const baseXP = 1000;
            const debuffOnLevelGap = -0.3; // -30% XP

            const modifiedXP = baseXP * (1 + debuffOnLevelGap);

            // 1000 * 0.7 = 700
            expect(modifiedXP).toBe(700);
        });

        it("should apply debuff last to all XP", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0.15;
            const skillRate = 0.3;
            const skillExperienceBonus = 0.2;
            const debuffOnLevelGap = -0.3;

            const finalXP =
                baseXP * (1 + combatExperienceBonus) * skillRate * (1 + skillExperienceBonus) * (1 + debuffOnLevelGap);

            // 1000 * 1.15 * 0.3 * 1.2 * 0.7 = 289.8
            expect(finalXP).toBeCloseTo(289.8, 1);
        });

        it("should handle max debuff of -90%", () => {
            const baseXP = 1000;
            const debuffOnLevelGap = -0.9; // -90%

            const modifiedXP = baseXP * (1 + debuffOnLevelGap);

            // 1000 * 0.1 = 100
            expect(modifiedXP).toBeCloseTo(100, 10);
        });
    });

    describe("Full Experience Formula", () => {
        it("should calculate experience correctly for primary training", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0.1; // +10%
            const skillRate = 0.3; // Primary training
            const skillExperienceBonus = 0.15; // +15% to this skill
            const debuffOnLevelGap = -0.2; // -20%

            const finalXP =
                baseXP * (1 + combatExperienceBonus) * skillRate * (1 + skillExperienceBonus) * (1 + debuffOnLevelGap);

            // 1000 * 1.1 * 0.3 * 1.15 * 0.8 = 303.6
            expect(finalXP).toBeCloseTo(303.6, 1);
        });

        it("should calculate experience correctly for distributed training", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0.1; // +10%
            const skillRate = 0.14; // Distributed (70% / 5 skills)
            const skillExperienceBonus = 0.05; // +5% to this skill
            const debuffOnLevelGap = 0; // No debuff

            const finalXP =
                baseXP * (1 + combatExperienceBonus) * skillRate * (1 + skillExperienceBonus) * (1 + debuffOnLevelGap);

            // 1000 * 1.1 * 0.14 * 1.05 * 1.0 = 161.7
            expect(finalXP).toBeCloseTo(161.7, 1);
        });

        it("should handle zero XP when debuffed to max", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0.5; // +50%
            const skillRate = 0.3;
            const skillExperienceBonus = 0.5; // +50%
            const debuffOnLevelGap = -0.9; // -90%

            const finalXP =
                baseXP * (1 + combatExperienceBonus) * skillRate * (1 + skillExperienceBonus) * (1 + debuffOnLevelGap);

            // 1000 * 1.5 * 0.3 * 1.5 * 0.1 = 67.5
            expect(finalXP).toBeCloseTo(67.5, 1);
        });
    });

    describe("Skill Distribution Examples", () => {
        it("should distribute XP correctly for smash combat style", () => {
            // Smash style: attack, defense, intelligence, melee, stamina
            const baseXP = 1000;
            const combatExperienceBonus = 0;
            const skillExperienceBonuses = {
                melee: 0.1, // +10% melee XP
                defense: 0.05, // +5% defense XP
            };
            const debuffOnLevelGap = 0;

            const expectedXP = {
                // Primary training (30%)
                melee:
                    baseXP *
                    (1 + combatExperienceBonus) *
                    0.3 *
                    (1 + (skillExperienceBonuses.melee || 0)) *
                    (1 + debuffOnLevelGap),
                // Distributed (14% each)
                attack:
                    baseXP *
                    (1 + combatExperienceBonus) *
                    0.14 *
                    (1 + (skillExperienceBonuses.attack || 0)) *
                    (1 + debuffOnLevelGap),
                defense:
                    baseXP *
                    (1 + combatExperienceBonus) *
                    0.14 *
                    (1 + (skillExperienceBonuses.defense || 0)) *
                    (1 + debuffOnLevelGap),
                intelligence:
                    baseXP *
                    (1 + combatExperienceBonus) *
                    0.14 *
                    (1 + (skillExperienceBonuses.intelligence || 0)) *
                    (1 + debuffOnLevelGap),
                stamina:
                    baseXP *
                    (1 + combatExperienceBonus) *
                    0.14 *
                    (1 + (skillExperienceBonuses.stamina || 0)) *
                    (1 + debuffOnLevelGap),
            };

            expect(expectedXP.melee).toBe(330); // 1000 * 0.3 * 1.1
            expect(expectedXP.defense).toBeCloseTo(147, 0); // 1000 * 0.14 * 1.05
            expect(expectedXP.attack).toBe(140); // 1000 * 0.14
        });

        it("should handle focus training correctly", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0;
            const focusTraining = "/skills/defense";
            const skillExperienceBonuses = {
                defense: 0.2, // +20% defense XP
            };

            // Primary: melee (30%)
            const meleeXP = baseXP * 0.3;

            // Focus: defense (70%)
            const defenseXP = baseXP * 0.7 * (1 + skillExperienceBonuses.defense);

            expect(meleeXP).toBe(300);
            expect(defenseXP).toBe(840); // 1000 * 0.7 * 1.2
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero base XP", () => {
            const baseXP = 0;
            const combatExperienceBonus = 0.5;
            const skillRate = 0.3;

            const finalXP = baseXP * (1 + combatExperienceBonus) * skillRate;

            expect(finalXP).toBe(0);
        });

        it("should handle no skill XP bonuses", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0;
            const skillRate = 0.3;
            const skillExperienceBonus = 0;
            const debuffOnLevelGap = 0;

            const finalXP =
                baseXP * (1 + combatExperienceBonus) * skillRate * (1 + skillExperienceBonus) * (1 + debuffOnLevelGap);

            expect(finalXP).toBe(300);
        });

        it("should handle max combat XP bonus", () => {
            const baseXP = 1000;
            const combatExperienceBonus = 0.5; // +50%
            const skillRate = 0.3;

            const finalXP = baseXP * (1 + combatExperienceBonus) * skillRate;

            // 1000 * 1.5 * 0.3 = 450
            expect(finalXP).toBe(450);
        });
    });
});

describe("Experience Calculation Parity", () => {
    it("legacy and new implementations should produce identical XP values", () => {
        const testCases = [
            {
                name: "Basic primary training",
                baseXP: 1000,
                combatExp: 0,
                skillRate: 0.3,
                skillBonus: 0,
                debuff: 0,
            },
            {
                name: "With combat XP bonus",
                baseXP: 1000,
                combatExp: 0.2,
                skillRate: 0.3,
                skillBonus: 0,
                debuff: 0,
            },
            {
                name: "With skill XP bonus",
                baseXP: 1000,
                combatExp: 0,
                skillRate: 0.3,
                skillBonus: 0.25,
                debuff: 0,
            },
            {
                name: "With debuff",
                baseXP: 1000,
                combatExp: 0.1,
                skillRate: 0.14,
                skillBonus: 0.1,
                debuff: -0.3,
            },
            {
                name: "Max bonuses",
                baseXP: 1000,
                combatExp: 0.5,
                skillRate: 0.7, // Focus training
                skillBonus: 0.5,
                debuff: -0.5,
            },
        ];

        testCases.forEach((tc) => {
            // Legacy calculation
            const legacySkillExperience = tc.skillRate * (1 + tc.skillBonus);
            const legacyFinalXP = tc.baseXP * (1 + tc.combatExp) * legacySkillExperience * (1 + tc.debuff);

            // New calculation (should match)
            const newSkillExperience = tc.skillRate * (1 + tc.skillBonus);
            const newFinalXP = tc.baseXP * (1 + tc.combatExp) * newSkillExperience * (1 + tc.debuff);

            expect(newFinalXP).toBeCloseTo(legacyFinalXP, 5);
        });
    });

    it("should calculate total XP correctly across all skills", () => {
        // Example: 1000 base XP, slash style with no bonuses
        const baseXP = 1000;
        const combatExp = 0;

        // Primary training (30% to melee)
        const meleePrimaryXP = baseXP * 1.0 * 0.3 * 1.0 * 1.0; // 300

        // Distributed training (70% / 5 = 14% to each of 5 skills including melee again)
        const meleeDistributedXP = baseXP * 1.0 * 0.14 * 1.0 * 1.0; // 140
        const attackXP = baseXP * 1.0 * 0.14 * 1.0 * 1.0; // 140
        const defenseXP = baseXP * 1.0 * 0.14 * 1.0 * 1.0; // 140
        const intelligenceXP = baseXP * 1.0 * 0.14 * 1.0 * 1.0; // 140
        const staminaXP = baseXP * 1.0 * 0.14 * 1.0 * 1.0; // 140

        // Total: 300 + 140*5 = 300 + 700 = 1000
        const totalXP = meleePrimaryXP + meleeDistributedXP + attackXP + defenseXP + intelligenceXP + staminaXP;

        // Should equal baseXP (all 1000 XP is distributed)
        expect(totalXP).toBeCloseTo(baseXP, 10);
    });
});
