"use client";

import * as React from "react";

// Map of skill hrids to character level property names
const SKILL_TO_LEVEL_PROPERTY: Record<string, string | null> = {
    "/skills/attack": "attackLevel",
    "/skills/magic": "magicLevel",
    "/skills/melee": "meleeLevel",
    "/skills/intelligence": "intelligenceLevel",
    "/skills/stamina": "staminaLevel",
    "/skills/defense": "defenseLevel",
    "/skills/ranged": "rangedLevel",
    // Non-combat skills - we ignore these requirements
    "/skills/alchemy": null,
    "/skills/brewing": null,
    "/skills/cheesesmithing": null,
    "/skills/cooking": null,
    "/skills/crafting": null,
    "/skills/enhancing": null,
    "/skills/foraging": null,
    "/skills/milking": null,
    "/skills/tailoring": null,
    "/skills/total_level": null,
    "/skills/woodcutting": null,
};

export interface CharacterContextType {
    /** Maps skillHrid to current level, e.g., { "/skills/ranged": 85 } */
    skillLevels: Record<string, number>;
}

const CharacterContext = React.createContext<CharacterContextType | null>(null);

export interface CharacterProviderProps {
    children: React.ReactNode;
    playerData: {
        attackLevel?: number;
        magicLevel?: number;
        meleeLevel?: number;
        intelligenceLevel?: number;
        staminaLevel?: number;
        defenseLevel?: number;
        rangedLevel?: number;
        [key: string]: any;
    };
}

export function CharacterProvider({ children, playerData }: CharacterProviderProps) {
    const skillLevels = React.useMemo(() => {
        const levels: Record<string, number> = {};

        // Map skill hrids to their levels from player data
        Object.entries(SKILL_TO_LEVEL_PROPERTY).forEach(([skillHrid, propertyName]) => {
            if (propertyName && playerData[propertyName] !== undefined) {
                levels[skillHrid] = playerData[propertyName];
            }
        });

        return levels;
    }, [playerData]);

    return <CharacterContext.Provider value={{ skillLevels }}>{children}</CharacterContext.Provider>;
}

export function useCharacter() {
    const context = React.useContext(CharacterContext);
    if (!context) {
        // Return null context for backward compatibility
        // Components can handle missing context gracefully
        return null;
    }
    return context;
}

/**
 * Check if an item's level requirements are met based on character skill levels.
 * Returns null if all requirements are met, or a string describing what's missing.
 */
export function checkRequirements(
    requirements: Array<{ skillHrid: string; level: number }> | undefined,
    skillLevels: Record<string, number>,
): string | null {
    if (!requirements || requirements.length === 0) {
        return null; // No requirements = always available
    }

    const unmetRequirements: Array<{ skill: string; required: number; current: number }> = [];

    for (const req of requirements) {
        const propertyName = SKILL_TO_LEVEL_PROPERTY[req.skillHrid];

        // Skip unmapped skills (non-combat skills we ignore)
        if (propertyName === null) {
            continue;
        }

        const currentLevel = skillLevels[req.skillHrid] || 0;

        if (currentLevel < req.level) {
            unmetRequirements.push({
                skill: formatSkillName(req.skillHrid),
                required: req.level,
                current: currentLevel,
            });
        }
    }

    if (unmetRequirements.length === 0) {
        return null; // All requirements met
    }

    // Build human-readable message
    if (unmetRequirements.length === 1) {
        const req = unmetRequirements[0];
        return `⚠ Requires ${req.skill} ${req.required}`;
    } else {
        const reqs = unmetRequirements.map((r) => `${r.skill} ${r.required}`).join(", ");
        return `⚠ Requires ${reqs}`;
    }
}

function formatSkillName(skillHrid: string): string {
    const parts = skillHrid.split("/");
    const skillName = parts[parts.length - 1];
    return skillName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
