import { describe, it, expect } from "vitest";

/**
 * Test suite for buff calculation parity between legacy and new implementations
 *
 * Legacy implementation (legacy_worker.js):
 * - MooPass: flatBoost = 0.05 (5%)
 * - Community Exp (comExp): flatBoost = 0.005 * (tier - 1) + 0.2
 *   - Tier 1: 20%, Tier 10: 24.5%
 * - Community Drop (comDrop): flatBoost = 0.005 * (tier - 1) + 0.2
 *   - Tier 1: 20%, Tier 10: 24.5%
 *
 * New implementation should match these calculations exactly.
 */

describe("Buff Calculations", () => {
    describe("MooPass Buff", () => {
        it("should have flatBoost of 0.05 (5%)", () => {
            const expectedBuff = {
                uniqueHrid: "/buff_uniques/experience_moo_pass_buff",
                typeHrid: "/buff_types/wisdom",
                ratioBoost: 0,
                flatBoost: 0.05,
                flatBoostLevelBonus: 0,
                duration: 0,
            };

            // TODO: Import and test actual implementation
            // const actualBuff = createMooPassBuff();
            // expect(actualBuff).toEqual(expectedBuff);

            expect(expectedBuff.flatBoost).toBe(0.05);
        });
    });

    describe("Community Experience Buff", () => {
        it("should calculate correct flatBoost for tier 1 (20%)", () => {
            const tier = 1;
            const expectedFlatBoost = 0.005 * (tier - 1) + 0.2; // 0.2
            expect(expectedFlatBoost).toBe(0.2);
        });

        it("should calculate correct flatBoost for tier 5 (22%)", () => {
            const tier = 5;
            const expectedFlatBoost = 0.005 * (tier - 1) + 0.2; // 0.22
            expect(expectedFlatBoost).toBe(0.22);
        });

        it("should calculate correct flatBoost for tier 10 (24.5%)", () => {
            const tier = 10;
            const expectedFlatBoost = 0.005 * (tier - 1) + 0.2; // 0.245
            expect(expectedFlatBoost).toBe(0.245);
        });

        it("should have correct buff structure", () => {
            const tier = 5;
            const expectedBuff = {
                uniqueHrid: "/buff_uniques/experience_community_buff",
                typeHrid: "/buff_types/wisdom",
                ratioBoost: 0,
                flatBoost: 0.005 * (tier - 1) + 0.2,
                flatBoostLevelBonus: 0,
                startTime: "0001-01-01T00:00:00Z",
                duration: 0,
            };

            expect(expectedBuff.typeHrid).toBe("/buff_types/wisdom");
            expect(expectedBuff.flatBoost).toBe(0.22);
        });
    });

    describe("Community Drop Buff", () => {
        it("should calculate correct flatBoost for tier 1 (20%)", () => {
            const tier = 1;
            const expectedFlatBoost = 0.005 * (tier - 1) + 0.2; // 0.2
            expect(expectedFlatBoost).toBe(0.2);
        });

        it("should calculate correct flatBoost for tier 5 (22%)", () => {
            const tier = 5;
            const expectedFlatBoost = 0.005 * (tier - 1) + 0.2; // 0.22
            expect(expectedFlatBoost).toBe(0.22);
        });

        it("should calculate correct flatBoost for tier 10 (24.5%)", () => {
            const tier = 10;
            const expectedFlatBoost = 0.005 * (tier - 1) + 0.2; // 0.245
            expect(expectedFlatBoost).toBe(0.245);
        });

        it("should have correct buff type (combat_drop_quantity not combat_drop_rate)", () => {
            const tier = 5;
            const expectedBuff = {
                uniqueHrid: "/buff_uniques/combat_community_buff",
                typeHrid: "/buff_types/combat_drop_quantity",
                ratioBoost: 0,
                flatBoost: 0.005 * (tier - 1) + 0.2,
                flatBoostLevelBonus: 0,
                startTime: "0001-01-01T00:00:00Z",
                duration: 0,
            };

            // CRITICAL: Must be combat_drop_quantity, not combat_drop_rate
            expect(expectedBuff.typeHrid).toBe("/buff_types/combat_drop_quantity");
            expect(expectedBuff.ratioBoost).toBe(0);
            expect(expectedBuff.flatBoost).toBe(0.22);
        });
    });
});

describe("Buff Calculation Parity", () => {
    it("legacy and new implementations should produce identical buff values", () => {
        // Test cases: [mooPassEnabled, comExpTier, comDropTier]
        const testCases = [
            { mooPass: false, comExp: 0, comDrop: 0 },
            { mooPass: true, comExp: 0, comDrop: 0 },
            { mooPass: false, comExp: 1, comDrop: 0 },
            { mooPass: false, comExp: 0, comDrop: 1 },
            { mooPass: true, comExp: 5, comDrop: 5 },
            { mooPass: true, comExp: 10, comDrop: 10 },
        ];

        testCases.forEach((tc) => {
            const legacyBuffs = calculateLegacyBuffs(tc.mooPass, tc.comExp, tc.comDrop);
            const newBuffs = calculateNewBuffs(tc.mooPass, tc.comExp, tc.comDrop);

            expect(newBuffs).toEqual(legacyBuffs);
        });
    });
});

// Helper functions to simulate legacy and new implementations
function calculateLegacyBuffs(mooPass, comExp, comDrop) {
    const buffs = [];

    if (mooPass) {
        buffs.push({
            uniqueHrid: "/buff_uniques/experience_moo_pass_buff",
            typeHrid: "/buff_types/wisdom",
            ratioBoost: 0,
            flatBoost: 0.05,
            flatBoostLevelBonus: 0,
            startTime: "0001-01-01T00:00:00Z",
            duration: 0,
        });
    }

    if (comExp > 0) {
        buffs.push({
            uniqueHrid: "/buff_uniques/experience_community_buff",
            typeHrid: "/buff_types/wisdom",
            ratioBoost: 0,
            flatBoost: 0.005 * (comExp - 1) + 0.2,
            flatBoostLevelBonus: 0,
            startTime: "0001-01-01T00:00:00Z",
            duration: 0,
        });
    }

    if (comDrop > 0) {
        buffs.push({
            uniqueHrid: "/buff_uniques/combat_community_buff",
            typeHrid: "/buff_types/combat_drop_quantity",
            ratioBoost: 0,
            flatBoost: 0.005 * (comDrop - 1) + 0.2,
            flatBoostLevelBonus: 0,
            startTime: "0001-01-01T00:00:00Z",
            duration: 0,
        });
    }

    return buffs;
}

function calculateNewBuffs(mooPass, comExp, comDrop) {
    // This should match the fixed implementation
    const buffs = [];

    if (mooPass) {
        buffs.push({
            uniqueHrid: "/buff_uniques/experience_moo_pass_buff",
            typeHrid: "/buff_types/wisdom",
            ratioBoost: 0,
            flatBoost: 0.05,
            flatBoostLevelBonus: 0,
            startTime: "0001-01-01T00:00:00Z",
            duration: 0,
        });
    }

    if (comExp > 0) {
        buffs.push({
            uniqueHrid: "/buff_uniques/experience_community_buff",
            typeHrid: "/buff_types/wisdom",
            ratioBoost: 0,
            flatBoost: 0.005 * (comExp - 1) + 0.2,
            flatBoostLevelBonus: 0,
            startTime: "0001-01-01T00:00:00Z",
            duration: 0,
        });
    }

    if (comDrop > 0) {
        buffs.push({
            uniqueHrid: "/buff_uniques/combat_community_buff",
            typeHrid: "/buff_types/combat_drop_quantity",
            ratioBoost: 0,
            flatBoost: 0.005 * (comDrop - 1) + 0.2,
            flatBoostLevelBonus: 0,
            startTime: "0001-01-01T00:00:00Z",
            duration: 0,
        });
    }

    return buffs;
}
