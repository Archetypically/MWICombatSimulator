// Combat stats calculation logic based on MilkyWayIdle game mechanics

import {
    itemDetailMap,
    enhancementLevelTotalBonusMultiplierTable,
    houseRoomDetailMap,
    achievementTierDetailMap,
    achievementDetailMap,
} from "@/lib/dataLoader";

// Calculate equipment combat stat with enhancement bonuses
export const getEquipmentCombatStat = (itemHrid, enhancementLevel, stat) => {
    if (!itemHrid || !itemDetailMap()[itemHrid]) return 0;

    const gameItem = itemDetailMap()[itemHrid];
    if (!gameItem.equipmentDetail?.combatStats) return 0;

    const multiplier = enhancementLevelTotalBonusMultiplierTable()[enhancementLevel] || 1;
    const baseStat = gameItem.equipmentDetail.combatStats[stat] || 0;
    const enhancementBonus = gameItem.equipmentDetail.combatEnhancementBonuses?.[stat] || 0;

    return baseStat + multiplier * enhancementBonus;
};

// Get equipment combat style
export const getEquipmentCombatStyle = (itemHrid) => {
    if (!itemHrid || !itemDetailMap()[itemHrid]) return "/combat_styles/smash";
    const gameItem = itemDetailMap()[itemHrid];
    return gameItem.equipmentDetail?.combatStats?.combatStyleHrids?.[0] || "/combat_styles/smash";
};

// Get equipment damage type
export const getEquipmentDamageType = (itemHrid) => {
    if (!itemHrid || !itemDetailMap()[itemHrid]) return "/damage_types/physical";
    const gameItem = itemDetailMap()[itemHrid];
    return gameItem.equipmentDetail?.combatStats?.damageType || "/damage_types/physical";
};

// Get equipment attack interval
export const getEquipmentAttackInterval = (itemHrid) => {
    if (!itemHrid || !itemDetailMap()[itemHrid]) return 3000000000;
    const gameItem = itemDetailMap()[itemHrid];
    return gameItem.equipmentDetail?.combatStats?.attackInterval || 3000000000;
};

// All possible combat stats
const ALL_COMBAT_STATS = [
    "stabAccuracy",
    "slashAccuracy",
    "smashAccuracy",
    "rangedAccuracy",
    "magicAccuracy",
    "stabDamage",
    "slashDamage",
    "smashDamage",
    "rangedDamage",
    "magicDamage",
    "defensiveDamage",
    "taskDamage",
    "physicalAmplify",
    "waterAmplify",
    "natureAmplify",
    "fireAmplify",
    "healingAmplify",
    "stabEvasion",
    "slashEvasion",
    "smashEvasion",
    "rangedEvasion",
    "magicEvasion",
    "armor",
    "waterResistance",
    "natureResistance",
    "fireResistance",
    "maxHitpoints",
    "maxManapoints",
    "lifeSteal",
    "hpRegenPer10",
    "mpRegenPer10",
    "physicalThorns",
    "elementalThorns",
    "combatDropRate",
    "combatRareFind",
    "combatDropQuantity",
    "combatExperience",
    "criticalRate",
    "criticalDamage",
    "armorPenetration",
    "waterPenetration",
    "naturePenetration",
    "firePenetration",
    "abilityHaste",
    "tenacity",
    "manaLeech",
    "castSpeed",
    "threat",
    "parry",
    "mayhem",
    "pierce",
    "curse",
    "fury",
    "weaken",
    "ripple",
    "bloom",
    "blaze",
    "attackSpeed",
    "foodHaste",
    "drinkConcentration",
    "autoAttackDamage",
    "abilityDamage",
    "staminaExperience",
    "intelligenceExperience",
    "attackExperience",
    "defenseExperience",
    "meleeExperience",
    "rangedExperience",
    "magicExperience",
    "retaliation",
];

// Calculate combat stats based on legacy game logic
export const calculateCombatStats = (playerData, equipment, houseRooms, achievements) => {
    const stats = {
        staminaLevel: playerData.staminaLevel || 1,
        intelligenceLevel: playerData.intelligenceLevel || 1,
        attackLevel: playerData.attackLevel || 1,
        meleeLevel: playerData.meleeLevel || 1,
        defenseLevel: playerData.defenseLevel || 1,
        rangedLevel: playerData.rangedLevel || 1,
        magicLevel: playerData.magicLevel || 1,
    };

    // Initialize combat stats from equipment
    const combatStats = {};

    ALL_COMBAT_STATS.forEach((stat) => {
        combatStats[stat] = equipment.reduce((total, item) => {
            if (!item.itemHrid) return total;
            return total + getEquipmentCombatStat(item.itemHrid, item.enhancementLevel || 0, stat);
        }, 0);
    });

    // Determine main hand equipment and combat style
    const mainHand = equipment.find((item) => item.itemLocationHrid === "/item_locations/main_hand" && item.itemHrid);
    const combatStyle = mainHand ? getEquipmentCombatStyle(mainHand.itemHrid) : "/combat_styles/smash";
    const damageType = mainHand ? getEquipmentDamageType(mainHand.itemHrid) : "/damage_types/physical";
    const baseAttackInterval = mainHand ? getEquipmentAttackInterval(mainHand.itemHrid) : 3000000000;

    // Calculate max HP and MP
    const maxHitpoints = Math.floor(10 * (10 + stats.staminaLevel) + combatStats.maxHitpoints);
    const maxManapoints = Math.floor(10 * (10 + stats.intelligenceLevel) + combatStats.maxManapoints);

    // Calculate attack interval (in nanoseconds, convert to seconds for display)
    let attackInterval = baseAttackInterval / 1e9;
    attackInterval /= 1 + stats.attackLevel / 2000;
    attackInterval /= 1 + combatStats.attackSpeed;

    // Calculate accuracy and damage based on combat style
    let accuracy = 0;
    let damage = 0;
    let evasion = 0;

    const accuracyMultiplier =
        1 + (combatStats.stabAccuracy + combatStats.slashAccuracy + combatStats.smashAccuracy) / 3;
    const damageMultiplier = 1 + (combatStats.stabDamage + combatStats.slashDamage + combatStats.smashDamage) / 3;

    if (combatStyle.includes("stab") || combatStyle.includes("slash") || combatStyle.includes("smash")) {
        const style = combatStyle.split("/").pop();
        accuracy = Math.floor((10 + stats.attackLevel) * (1 + combatStats[style + "Accuracy"]) * accuracyMultiplier);
        damage = Math.floor((10 + stats.meleeLevel) * (1 + combatStats[style + "Damage"]) * damageMultiplier);
        evasion = Math.floor((10 + stats.defenseLevel) * (1 + combatStats[style + "Evasion"]));
    } else if (combatStyle.includes("ranged")) {
        accuracy = Math.floor((10 + stats.attackLevel) * (1 + combatStats.rangedAccuracy) * accuracyMultiplier);
        damage = Math.floor((10 + stats.rangedLevel) * (1 + combatStats.rangedDamage) * damageMultiplier);
        evasion = Math.floor((10 + stats.defenseLevel) * (1 + combatStats.rangedEvasion));
    } else if (combatStyle.includes("magic")) {
        accuracy = Math.floor((10 + stats.attackLevel) * (1 + combatStats.magicAccuracy) * accuracyMultiplier);
        damage = Math.floor((10 + stats.magicLevel) * (1 + combatStats.magicDamage) * damageMultiplier);
        evasion = Math.floor((10 + stats.defenseLevel) * (1 + combatStats.magicEvasion));
    }

    // Calculate armor
    const armor = Math.floor(0.2 * stats.defenseLevel + combatStats.armor);

    // Calculate resistances
    const waterResistance = Math.floor(0.2 * stats.defenseLevel + combatStats.waterResistance);
    const natureResistance = Math.floor(0.2 * stats.defenseLevel + combatStats.natureResistance);
    const fireResistance = Math.floor(0.2 * stats.defenseLevel + combatStats.fireResistance);

    // Apply house room buffs
    Object.entries(houseRooms || {}).forEach(([roomHrid, level]) => {
        if (level <= 0) return;
        const roomDetail = houseRoomDetailMap()[roomHrid];
        if (!roomDetail) return;

        const applyBuff = (buff) => {
            if (!buff) return;
            const flatBoost = (buff.flatBoost || 0) * level;
            const ratioBoost = (buff.ratioBoost || 0) * level;

            if (buff.typeHrid === "/buff_types/max_hitpoints") {
                combatStats.maxHitpoints += flatBoost;
            } else if (buff.typeHrid === "/buff_types/max_manapoints") {
                combatStats.maxManapoints += flatBoost;
            } else if (buff.typeHrid === "/buff_types/accuracy") {
                accuracy = Math.floor(accuracy * (1 + ratioBoost));
            } else if (buff.typeHrid === "/buff_types/damage") {
                damage = Math.floor(damage * (1 + ratioBoost));
            } else if (buff.typeHrid === "/buff_types/armor") {
                combatStats.armor += flatBoost + armor * ratioBoost;
            } else if (buff.typeHrid === "/buff_types/evasion") {
                evasion += flatBoost + Math.floor(evasion * ratioBoost);
            }
        };

        if (roomDetail.actionBuffs) {
            roomDetail.actionBuffs.forEach(applyBuff);
        }
        if (roomDetail.globalBuffs) {
            roomDetail.globalBuffs.forEach(applyBuff);
        }
    });

    // Apply achievement buffs
    if (achievements) {
        Object.values(achievementTierDetailMap()).forEach((tier) => {
            const tierAchievements = Object.values(achievementDetailMap()).filter(
                (detail) => detail.tierHrid === tier.hrid,
            );
            const hasAll = tierAchievements.every((achievement) => achievements[achievement.hrid]);

            if (hasAll && tier.buff) {
                const buff = tier.buff;
                const flatBoost = buff.flatBoost || 0;
                const ratioBoost = buff.ratioBoost || 0;

                if (buff.typeHrid === "/buff_types/max_hitpoints") {
                    combatStats.maxHitpoints += flatBoost;
                } else if (buff.typeHrid === "/buff_types/max_manapoints") {
                    combatStats.maxManapoints += flatBoost;
                } else if (buff.typeHrid === "/buff_types/accuracy") {
                    accuracy = Math.floor(accuracy * (1 + ratioBoost));
                } else if (buff.typeHrid === "/buff_types/damage") {
                    damage = Math.floor(damage * (1 + ratioBoost));
                } else if (buff.typeHrid === "/buff_types/armor") {
                    combatStats.armor += flatBoost + armor * ratioBoost;
                } else if (buff.typeHrid === "/buff_types/evasion") {
                    evasion += flatBoost + Math.floor(evasion * ratioBoost);
                }
            }
        });
    }

    // Recalculate HP/MP after buffs
    const finalMaxHitpoints = Math.floor(10 * (10 + stats.staminaLevel) + combatStats.maxHitpoints);
    const finalMaxManapoints = Math.floor(10 * (10 + stats.intelligenceLevel) + combatStats.maxManapoints);

    // Calculate all accuracy ratings
    const stabAccuracy = Math.floor((10 + stats.attackLevel) * (1 + combatStats.stabAccuracy));
    const slashAccuracy = Math.floor((10 + stats.attackLevel) * (1 + combatStats.slashAccuracy));
    const smashAccuracy = Math.floor((10 + stats.attackLevel) * (1 + combatStats.smashAccuracy));
    const rangedAccuracy = Math.floor((10 + stats.attackLevel) * (1 + combatStats.rangedAccuracy));
    const magicAccuracy = Math.floor((10 + stats.attackLevel) * (1 + combatStats.magicAccuracy));

    // Calculate all damage ratings
    const stabDamage = Math.floor((10 + stats.meleeLevel) * (1 + combatStats.stabDamage));
    const slashDamage = Math.floor((10 + stats.meleeLevel) * (1 + combatStats.slashDamage));
    const smashDamage = Math.floor((10 + stats.meleeLevel) * (1 + combatStats.smashDamage));
    const defensiveDamage = Math.floor((10 + stats.defenseLevel) * (1 + combatStats.defensiveDamage));
    const rangedDamage = Math.floor((10 + stats.rangedLevel) * (1 + combatStats.rangedDamage));
    const magicDamage = Math.floor((10 + stats.magicLevel) * (1 + combatStats.magicDamage));

    // Calculate all evasion ratings
    const stabEvasion = Math.floor((10 + stats.defenseLevel) * (1 + combatStats.stabEvasion));
    const slashEvasion = Math.floor((10 + stats.defenseLevel) * (1 + combatStats.slashEvasion));
    const smashEvasion = Math.floor((10 + stats.defenseLevel) * (1 + combatStats.smashEvasion));
    const rangedEvasion = Math.floor((10 + stats.defenseLevel) * (1 + combatStats.rangedEvasion));
    const magicEvasion = Math.floor((10 + stats.defenseLevel) * (1 + combatStats.magicEvasion));

    // Calculate cast speed
    const castSpeed = 1 + stats.attackLevel / 2000 + combatStats.castSpeed;

    // Determine primary and focus training
    const primaryTraining = mainHand
        ? getEquipmentCombatStyle(mainHand.itemHrid).includes("ranged")
            ? "Ranged"
            : getEquipmentCombatStyle(mainHand.itemHrid).includes("magic")
              ? "Magic"
              : "Melee"
        : "Melee";

    // Get focus training from charm if equipped
    const charm = equipment.find((item) => item.itemLocationHrid === "/item_locations/charm" && item.itemHrid);
    const focusTraining = charm ? primaryTraining : "";

    return {
        maxHitpoints: finalMaxHitpoints,
        maxManapoints: finalMaxManapoints,
        attackInterval: attackInterval.toFixed(3),
        accuracy,
        damage,
        armor,
        evasion,
        combatStyle,
        damageType,
        waterResistance,
        natureResistance,
        fireResistance,
        combatStats,
        stats,
        // Detailed accuracy
        stabAccuracy,
        slashAccuracy,
        smashAccuracy,
        rangedAccuracy,
        magicAccuracy,
        // Detailed damage
        stabDamage,
        slashDamage,
        smashDamage,
        defensiveDamage,
        rangedDamage,
        magicDamage,
        // Detailed evasion
        stabEvasion,
        slashEvasion,
        smashEvasion,
        rangedEvasion,
        magicEvasion,
        // Training
        primaryTraining,
        focusTraining,
        castSpeed,
    };
};
