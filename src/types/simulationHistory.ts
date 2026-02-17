export type RunType = "simulation" | "optimizer";

export interface SimulationRun {
    id: string;
    timestamp: string;
    runType: RunType;
    config: SimulationConfig;
    results: SimulationResults;
    label?: string;
    /** @deprecated Favorites functionality has been removed. Kept for backward compatibility with existing data. */
    isFavorite?: boolean;
}

export interface OptimizerRun extends SimulationRun {
    runType: "optimizer";
    optimizationGoal: string;
    targets: string[];
}

export type HistoryRun = SimulationRun | OptimizerRun;

export interface SimulationConfig {
    players: PlayerDTO[];
    zoneHrid: string;
    difficultyTier: number;
    simulationDuration: number;
    settings: {
        moopassEnabled: boolean;
        comExpBuffEnabled: boolean;
        comExpBuffTier: number;
        comDropBuffEnabled: boolean;
        comDropBuffTier: number;
    };
}

export interface PlayerDTO {
    hrid: string;
    staminaLevel: number;
    intelligenceLevel: number;
    attackLevel: number;
    meleeLevel: number;
    defenseLevel: number;
    rangedLevel: number;
    magicLevel: number;
    debuffOnLevelGap: number;
    equipment: Record<string, { hrid: string; enhancementLevel: number } | null>;
    food: Array<{ hrid: string; triggers?: string[] } | null>;
    drinks: Array<{ hrid: string; triggers?: string[] } | null>;
    abilities: Array<{ hrid: string; level: number; triggers?: string[] } | null>;
    houseRooms: Record<string, unknown>;
    achievements: Record<string, unknown>;
}

export interface SimulationResults {
    killsPerHour: {
        encounters: number;
        byMonster: Record<string, number>;
    };
    deathsPerHour: Record<string, number>;
    xpPerHour: Record<string, Record<string, number>>;
    consumablesData: Array<{
        name: string;
        count: number;
        itemHrid: string;
        playerId: string;
    }>;
    manaData: Array<{
        ability: string;
        avgMana: string;
        total: number;
        abilityHrid: string;
        playerId: string;
    }>;
    hpRestoredData: Array<{
        source: string;
        amount: string;
        percent: string;
        playerId: string;
    }>;
    mpRestoredData: Array<{
        source: string;
        amount: string;
        percent: string;
        playerId: string;
    }>;
    damageDoneTotal: Array<{
        source: string;
        hitchance: string;
        dps: string;
        percent: string;
    }>;
    damageTakenTotal: Array<{
        source: string;
        hitchance: string;
        dps: string;
        percent: string;
    }>;
    dropsData: Array<{
        itemHrid: string;
        name: string;
        count: number;
        noRngCount: number;
        value: number;
        isRare?: boolean;
    }>;
    profit: number;
    noRngProfit: number;
    manaRanOut: boolean;
    simulatedTime: number;
    encounters: number;
    isDungeon: boolean;
    dungeonsCompleted: number;
    dungeonsFailed: number;
    maxWaveReached: number;
}
