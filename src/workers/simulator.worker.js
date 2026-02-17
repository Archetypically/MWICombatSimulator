// Web Worker for running combat simulations
// This runs the legacy combat simulator in a separate thread

// Import the combat simulator classes
import CombatSimulator from "../combatsimulator/combatSimulator.js";
import Player from "../combatsimulator/player.js";
import Zone from "../combatsimulator/zone.js";
import { initializeDataLoader, combatMonsterDetailMap, actionDetailMap } from "../lib/dataLoader";

const ONE_SECOND = 1e9;
const ONE_HOUR = 3600 * ONE_SECOND;

// Track if data is loaded
let dataLoaded = false;

self.onmessage = async function (event) {
    const { players: playerDTOs, zoneHrid, difficultyTier, simulationDuration, settings, marketplaceData } = event.data;

    console.debug("[WORKER] Received simulation request:", {
        playerCount: playerDTOs?.length,
        zoneHrid,
        difficultyTier,
        simulationDuration,
        settings,
        hasMarketplaceData: !!marketplaceData,
    });

    try {
        // Initialize data loader on first run
        if (!dataLoaded) {
            await initializeDataLoader();
            dataLoaded = true;
            console.debug("[WORKER] Data loaded successfully");
        }

        // Create a mapping of player hrids to names
        const playerNameMap = {};
        playerDTOs.forEach((dto) => {
            playerNameMap[dto.hrid] = dto.name || dto.hrid;
        });

        // Create players from DTOs
        const players = playerDTOs.map((dto) => Player.createFromDTO(dto));

        // Create zone
        const zone = new Zone(zoneHrid, difficultyTier);

        // Apply extra buffs based on settings
        const extraBuffs = [];

        if (settings.moopassEnabled) {
            extraBuffs.push({
                uniqueHrid: "/buff_uniques/experience_moo_pass_buff",
                typeHrid: "/buff_types/wisdom",
                ratioBoost: 0,
                flatBoost: 0.05,
                flatBoostLevelBonus: 0,
                startTime: "0001-01-01T00:00:00Z",
                duration: 0,
            });
        }

        if (settings.comExpBuffEnabled && settings.comExpBuffTier > 0) {
            extraBuffs.push({
                uniqueHrid: "/buff_uniques/experience_community_buff",
                typeHrid: "/buff_types/wisdom",
                ratioBoost: 0,
                flatBoost: 0.005 * (settings.comExpBuffTier - 1) + 0.2,
                flatBoostLevelBonus: 0,
                startTime: "0001-01-01T00:00:00Z",
                duration: 0,
            });
        }

        if (settings.comDropBuffEnabled && settings.comDropBuffTier > 0) {
            extraBuffs.push({
                uniqueHrid: "/buff_uniques/combat_community_buff",
                typeHrid: "/buff_types/combat_drop_quantity",
                ratioBoost: 0,
                flatBoost: 0.005 * (settings.comDropBuffTier - 1) + 0.2,
                flatBoostLevelBonus: 0,
                startTime: "0001-01-01T00:00:00Z",
                duration: 0,
            });
        }

        // Apply buffs to all players
        players.forEach((player) => {
            player.zoneBuffs = zone.buffs || [];
            player.extraBuffs = extraBuffs;

            // Generate permanent buffs (house rooms, achievements, zone buffs, extra buffs)
            player.generatePermanentBuffs();

            console.debug("[WORKER] Player after setup:", {
                hrid: player.hrid,
                maxHp: player.combatDetails.maxHitpoints,
                maxMp: player.combatDetails.maxManapoints,
                debuffOnLevelGap: player.debuffOnLevelGap,
                foodSlots: player.combatDetails.combatStats.foodSlots,
                drinkSlots: player.combatDetails.combatStats.drinkSlots,
                food: player.food?.filter((f) => f)?.map((f) => f.hrid),
                drinks: player.drinks?.filter((d) => d)?.map((d) => d.hrid),
                abilities: player.abilities?.filter((a) => a)?.map((a) => a.hrid),
                houseRooms: player.houseRooms?.map((r) => r.hrid),
                achievementBuffs: player.achievements?.buffs?.length || 0,
                zoneBuffs: player.zoneBuffs?.length || 0,
                extraBuffs: player.extraBuffs?.length || 0,
                permanentBuffs: Object.keys(player.permanentBuffs || {}).length,
            });
        });

        // Create simulator
        const simulator = new CombatSimulator(players, zone, {
            enableHpMpVisualization: false,
        });

        // Listen for progress events
        simulator.addEventListener("progress", (e) => {
            self.postMessage({
                type: "progress",
                progress: e.detail.progress,
                zone: e.detail.zone,
                difficultyTier: e.detail.difficultyTier,
            });
        });

        // Calculate simulation time in nanoseconds
        const simulationTime = simulationDuration * ONE_HOUR;

        // Run simulation
        const result = await simulator.simulate(simulationTime);

        // Transform result for dashboard
        const transformedResult = transformResult(result, simulationDuration, marketplaceData, zoneHrid, playerNameMap);

        console.debug("[WORKER] Simulation complete:", {
            encounters: result.encounters,
            simulatedTime: result.simulatedTime / 1e9,
            deaths: result.deaths,
            deathsPerHour: transformedResult.deathsPerHour,
            profit: transformedResult.profit,
            dropsDataCount: transformedResult.dropsData?.length,
        });

        // Send completed result
        self.postMessage({
            type: "complete",
            result: transformedResult,
        });
    } catch (error) {
        self.postMessage({
            type: "error",
            error: error.message,
        });
    }
};

// Calculate drops and profit based on monster deaths and drop tables
function calculateDropsAndProfit(simResult, hoursFactor, marketplaceData, getItemPrice) {
    const dropsData = [];
    let totalDropValue = 0;
    let noRngTotalDropValue = 0;

    const monsters = Object.keys(simResult.deaths).filter((m) => !m.startsWith("player"));
    const numberOfPlayers = simResult.numberOfPlayers || 1;
    const difficultyTier = simResult.difficultyTier || 0;

    for (const monster of monsters) {
        const monsterData = combatMonsterDetailMap()[monster];
        if (!monsterData) continue;

        const dropRateMultiplier = simResult.dropRateMultiplier?.[monster] || 1;
        const rareFindMultiplier = simResult.rareFindMultiplier?.[monster] || 1;
        const combatDropQuantity = simResult.combatDropQuantity?.[monster] || 0;
        const debuffOnLevelGap = simResult.debuffOnLevelGap?.[monster] || 0;

        const dropMap = new Map();
        const rareDropMap = new Map();

        // Process regular drop table
        if (monsterData.dropTable) {
            for (const drop of monsterData.dropTable) {
                if (drop.minDifficultyTier > difficultyTier) continue;

                let multiplier = 1.0 + 0.1 * difficultyTier;
                let dropRate = Math.min(
                    1.0,
                    multiplier * (drop.dropRate + (drop.dropRatePerDifficultyTier ?? 0) * difficultyTier),
                );
                if (dropRate <= 0) continue;

                dropMap.set(drop.itemHrid, {
                    dropRate: Math.min(1.0, dropRate * dropRateMultiplier),
                    number: 0,
                    dropMin: drop.minCount,
                    dropMax: drop.maxCount,
                    noRngDropAmount: 0,
                });
            }
        }

        // Process rare drop table
        if (monsterData.rareDropTable) {
            for (const drop of monsterData.rareDropTable) {
                if (drop.minDifficultyTier > difficultyTier) continue;

                rareDropMap.set(drop.itemHrid, {
                    dropRate: drop.dropRate * rareFindMultiplier,
                    number: 0,
                    dropMin: drop.minCount,
                    dropMax: drop.maxCount,
                    noRngDropAmount: 0,
                });
            }
        }

        const monsterDeaths = simResult.deaths[monster] || 0;

        // Calculate no-RNG expected drops
        for (const dropObject of dropMap.values()) {
            dropObject.noRngDropAmount +=
                (monsterDeaths *
                    dropObject.dropRate *
                    ((dropObject.dropMax + dropObject.dropMin) / 2) *
                    (1 + debuffOnLevelGap) *
                    (1 + combatDropQuantity)) /
                numberOfPlayers;
        }
        for (const dropObject of rareDropMap.values()) {
            dropObject.noRngDropAmount +=
                (monsterDeaths *
                    dropObject.dropRate *
                    ((dropObject.dropMax + dropObject.dropMin) / 2) *
                    (1 + debuffOnLevelGap) *
                    (1 + combatDropQuantity)) /
                numberOfPlayers;
        }

        // Calculate RNG-based drops (simplified - using expected for now)
        // In a full implementation, this would use actual random rolls
        for (const dropObject of dropMap.values()) {
            dropObject.number = dropObject.noRngDropAmount;
        }
        for (const dropObject of rareDropMap.values()) {
            dropObject.number = dropObject.noRngDropAmount;
        }

        // Aggregate drops
        for (const [name, dropObject] of dropMap.entries()) {
            const price = getItemPrice(name, 0);
            const value = dropObject.number * price;
            const noRngValue = dropObject.noRngDropAmount * price;

            totalDropValue += value;
            noRngTotalDropValue += noRngValue;

            dropsData.push({
                itemHrid: name,
                name: name
                    .split("/")
                    .pop()
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                count: Math.round(dropObject.number / hoursFactor),
                noRngCount: Math.round(dropObject.noRngDropAmount / hoursFactor),
                value: value / hoursFactor,
            });
        }
        for (const [name, dropObject] of rareDropMap.entries()) {
            const price = getItemPrice(name, 0);
            const value = dropObject.number * price;
            const noRngValue = dropObject.noRngDropAmount * price;

            totalDropValue += value;
            noRngTotalDropValue += noRngValue;

            dropsData.push({
                itemHrid: name,
                name: name
                    .split("/")
                    .pop()
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                count: Math.round(dropObject.number / hoursFactor),
                noRngCount: Math.round(dropObject.noRngDropAmount / hoursFactor),
                value: value / hoursFactor,
                isRare: true,
            });
        }
    }

    return { dropsData, totalDropValue, noRngTotalDropValue };
}

// Transform SimResult into dashboard-friendly format
function transformResult(simResult, durationHours, marketplaceData, zoneHrid, playerNameMap = {}) {
    const simulatedSeconds = simResult.simulatedTime / ONE_SECOND;
    const hoursFactor = simulatedSeconds / 3600;

    // Helper to get item price (use ask price if available, otherwise bid)
    const getItemPrice = (itemHrid, enhancementLevel = 0) => {
        if (!marketplaceData || !marketplaceData[itemHrid]) {
            return 0;
        }
        const itemData = marketplaceData[itemHrid];
        const levelData = itemData[enhancementLevel.toString()] || itemData["0"];
        if (!levelData) return 0;
        // Use ask price, fall back to bid if no ask
        return levelData.a > 0 ? levelData.a : levelData.b > 0 ? levelData.b : 0;
    };

    // Calculate kills per hour
    const killsPerHour = {
        encounters: simResult.encounters / hoursFactor,
        byMonster: {},
    };

    // Calculate deaths per hour
    const deathsPerHour = {};
    Object.entries(simResult.deaths).forEach(([unit, count]) => {
        if (unit.startsWith("player")) {
            deathsPerHour[unit] = count / hoursFactor;
        }
    });

    // Calculate experience per hour per player per skill
    const xpPerHour = {};
    Object.entries(simResult.experienceGained).forEach(([playerId, skills]) => {
        xpPerHour[playerId] = {};
        Object.entries(skills).forEach(([skill, amount]) => {
            xpPerHour[playerId][skill] = amount / hoursFactor;
        });
    });

    // Transform consumables data
    const consumablesData = [];
    Object.entries(simResult.consumablesUsed).forEach(([playerId, items]) => {
        Object.entries(items).forEach(([itemHrid, count]) => {
            // Get item name from the item hrid (would need itemDetailMap in real implementation)
            const itemName = itemHrid
                .split("/")
                .pop()
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
            consumablesData.push({
                name: itemName,
                count: Math.round(count / hoursFactor),
                itemHrid,
                playerId,
            });
        });
    });

    // Transform mana usage
    const manaData = [];
    Object.entries(simResult.manaUsed).forEach(([playerId, abilities]) => {
        Object.entries(abilities).forEach(([abilityHrid, totalMana]) => {
            const abilityName = abilityHrid
                .split("/")
                .pop()
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
            const count = simResult.attacks[playerId]
                ? Object.values(simResult.attacks[playerId]).reduce((sum, targets) => {
                      return (
                          sum +
                          (targets[abilityHrid] ? Object.values(targets[abilityHrid]).reduce((a, b) => a + b, 0) : 0)
                      );
                  }, 0)
                : 0;
            const avgMana = count > 0 ? (totalMana / count).toFixed(2) : "0.00";

            manaData.push({
                ability: abilityName,
                avgMana: `(${avgMana})`,
                total: Math.round(totalMana / hoursFactor),
                abilityHrid,
                playerId,
            });
        });
    });

    // Transform HP/MP restoration
    const hpRestoredData = [];
    const mpRestoredData = [];

    Object.entries(simResult.hitpointsGained).forEach(([playerId, sources]) => {
        const totalHp = Object.values(sources).reduce((a, b) => a + b, 0);
        Object.entries(sources).forEach(([source, amount]) => {
            const percent = totalHp > 0 ? ((amount / totalHp) * 100).toFixed(0) : "0";
            hpRestoredData.push({
                source: source.startsWith("/")
                    ? source
                          .split("/")
                          .pop()
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())
                    : source,
                amount: (amount / hoursFactor / 3600).toFixed(2), // per second
                percent: `${percent}%`,
                playerId,
            });
        });
    });

    Object.entries(simResult.manapointsGained).forEach(([playerId, sources]) => {
        const totalMp = Object.values(sources).reduce((a, b) => a + b, 0);
        Object.entries(sources).forEach(([source, amount]) => {
            const percent = totalMp > 0 ? ((amount / totalMp) * 100).toFixed(0) : "0";
            mpRestoredData.push({
                source: source.startsWith("/")
                    ? source
                          .split("/")
                          .pop()
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())
                    : source,
                amount: (amount / hoursFactor / 3600).toFixed(2), // per second
                percent: `${percent}%`,
                playerId,
            });
        });
    });

    // Transform damage data
    const damageDoneTotal = [];
    const damageTakenTotal = [];

    // Aggregate damage by ability across all players
    const damageByAbility = {};
    const damageTakenByAbility = {};

    Object.entries(simResult.attacks).forEach(([sourceId, targets]) => {
        const isPlayer = sourceId.startsWith("player");

        Object.entries(targets).forEach(([targetId, abilities]) => {
            const isTargetPlayer = targetId.startsWith("player");

            Object.entries(abilities).forEach(([ability, hits]) => {
                let totalDamage = 0;
                let hitCount = 0;
                let missCount = 0;

                Object.entries(hits).forEach(([hit, count]) => {
                    if (hit === "miss") {
                        missCount += count;
                    } else {
                        totalDamage += parseInt(hit) * count;
                        hitCount += count;
                    }
                });

                const totalAttacks = hitCount + missCount;
                const hitChance = totalAttacks > 0 ? ((hitCount / totalAttacks) * 100).toFixed(1) : "0.0";
                const dps = totalDamage / simulatedSeconds;

                if (isPlayer && !isTargetPlayer) {
                    // Player dealing damage to monster
                    if (!damageByAbility[ability]) {
                        damageByAbility[ability] = { totalDamage: 0, hitCount: 0, missCount: 0 };
                    }
                    damageByAbility[ability].totalDamage += totalDamage;
                    damageByAbility[ability].hitCount += hitCount;
                    damageByAbility[ability].missCount += missCount;
                } else if (!isPlayer && isTargetPlayer) {
                    // Monster dealing damage to player
                    if (!damageTakenByAbility[ability]) {
                        damageTakenByAbility[ability] = { totalDamage: 0, hitCount: 0, missCount: 0 };
                    }
                    damageTakenByAbility[ability].totalDamage += totalDamage;
                    damageTakenByAbility[ability].hitCount += hitCount;
                    damageTakenByAbility[ability].missCount += missCount;
                }
            });
        });
    });

    // Calculate total damage done
    const totalDamageDone = Object.values(damageByAbility).reduce((sum, data) => sum + data.totalDamage, 0);
    const totalDps = totalDamageDone / simulatedSeconds;

    // Format damage done data
    damageDoneTotal.push({
        source: "Total",
        hitchance:
            Object.values(damageByAbility).reduce((sum, data) => sum + data.hitCount, 0) > 0
                ? (
                      (Object.values(damageByAbility).reduce((sum, data) => sum + data.hitCount, 0) /
                          Object.values(damageByAbility).reduce(
                              (sum, data) => sum + data.hitCount + data.missCount,
                              0,
                          )) *
                      100
                  ).toFixed(1) + "%"
                : "0.0%",
        dps: totalDps.toFixed(2),
        percent: "100%",
    });

    Object.entries(damageByAbility).forEach(([ability, data]) => {
        const abilityName =
            ability === "autoAttack"
                ? "Auto Attack"
                : ability
                      .split("/")
                      .pop()
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase());
        const hitChance =
            data.hitCount + data.missCount > 0
                ? ((data.hitCount / (data.hitCount + data.missCount)) * 100).toFixed(1) + "%"
                : "0.0%";
        const dps = data.totalDamage / simulatedSeconds;
        const percent = totalDamageDone > 0 ? ((data.totalDamage / totalDamageDone) * 100).toFixed(0) + "%" : "0%";

        damageDoneTotal.push({
            source: abilityName,
            hitchance: hitChance,
            dps: dps.toFixed(2),
            percent,
        });
    });

    // Format damage taken data
    const totalDamageTaken = Object.values(damageTakenByAbility).reduce((sum, data) => sum + data.totalDamage, 0);
    const totalTakenDps = totalDamageTaken / simulatedSeconds;

    damageTakenTotal.push({
        source: "Total",
        hitchance:
            Object.values(damageTakenByAbility).reduce((sum, data) => sum + data.hitCount, 0) > 0
                ? (
                      (Object.values(damageTakenByAbility).reduce((sum, data) => sum + data.hitCount, 0) /
                          Object.values(damageTakenByAbility).reduce(
                              (sum, data) => sum + data.hitCount + data.missCount,
                              0,
                          )) *
                      100
                  ).toFixed(1) + "%"
                : "0.0%",
        dps: totalTakenDps.toFixed(2),
        percent: "100%",
    });

    Object.entries(damageTakenByAbility).forEach(([ability, data]) => {
        const abilityName =
            ability === "autoAttack"
                ? "Auto Attack"
                : ability
                      .split("/")
                      .pop()
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase());
        const hitChance =
            data.hitCount + data.missCount > 0
                ? ((data.hitCount / (data.hitCount + data.missCount)) * 100).toFixed(1) + "%"
                : "0.0%";
        const dps = data.totalDamage / simulatedSeconds;
        const percent = totalDamageTaken > 0 ? ((data.totalDamage / totalDamageTaken) * 100).toFixed(0) + "%" : "0%";

        damageTakenTotal.push({
            source: abilityName,
            hitchance: hitChance,
            dps: dps.toFixed(2),
            percent,
        });
    });

    // Calculate drops and profit
    const { dropsData, totalDropValue, noRngTotalDropValue } = calculateDropsAndProfit(
        simResult,
        hoursFactor,
        marketplaceData,
        getItemPrice,
    );

    // Calculate consumable costs
    let consumableCost = 0;
    Object.entries(simResult.consumablesUsed).forEach(([playerId, items]) => {
        Object.entries(items).forEach(([itemHrid, count]) => {
            const price = getItemPrice(itemHrid, 0);
            consumableCost += price * count;
        });
    });

    // Calculate profit
    const profit = (totalDropValue - consumableCost) / hoursFactor;
    const noRngProfit = (noRngTotalDropValue - consumableCost) / hoursFactor;

    // Revenue and expense for optimizer
    const revenue = totalDropValue / hoursFactor;
    const expense = consumableCost / hoursFactor;

    // Check mana status
    const manaRanOut = Object.values(simResult.playerRanOutOfMana).some((v) => v);

    return {
        killsPerHour,
        deathsPerHour,
        xpPerHour,
        consumablesData,
        manaData,
        hpRestoredData,
        mpRestoredData,
        damageDoneTotal,
        damageTakenTotal,
        dropsData,
        profit,
        noRngProfit,
        revenue,
        expense,
        manaRanOut,
        playerRanOutOfMana: simResult.playerRanOutOfMana,
        playerNameMap,
        simulatedTime: simResult.simulatedTime,
        encounters: simResult.encounters,
        encounterName: actionDetailMap()[zoneHrid]?.name || zoneHrid.split("/").pop().replace(/_/g, " "),
        isDungeon: simResult.isDungeon,
        dungeonsCompleted: simResult.dungeonsCompleted,
        dungeonsFailed: simResult.dungeonsFailed,
        maxWaveReached: simResult.maxWaveReached,
    };
}
