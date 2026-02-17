"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
    HistoryRun,
    SimulationRun,
    OptimizerRun,
    SimulationConfig,
    SimulationResults,
    RunType,
} from "@/types/simulationHistory";
import * as db from "@/lib/simulationHistoryDb";

interface SimulationHistoryContextType {
    runs: HistoryRun[];
    isLoading: boolean;
    error: string | null;
    addRun: (config: SimulationConfig, results: SimulationResults) => Promise<string>;
    addOptimizerRun: (
        config: SimulationConfig,
        results: SimulationResults,
        optimizationGoal: string,
        targets: string[],
    ) => Promise<string>;
    deleteRun: (id: string) => Promise<void>;
    updateRunLabel: (id: string, label: string) => Promise<void>;
    refreshRuns: () => Promise<void>;
    clearAllRuns: () => Promise<void>;
    getRunById: (id: string) => Promise<HistoryRun | undefined>;
    getRunsByZone: (zoneHrid: string) => Promise<HistoryRun[]>;
    getRunsInDateRange: (start: Date, end: Date) => Promise<HistoryRun[]>;
    getRunsByType: (type: RunType) => Promise<HistoryRun[]>;
}

const SimulationHistoryContext = createContext<SimulationHistoryContextType | null>(null);

export function SimulationHistoryProvider({ children }: { children: React.ReactNode }) {
    const [runs, setRuns] = useState<HistoryRun[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshRuns = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const allRuns = await db.getAllSimulationRuns();
            setRuns(allRuns.reverse());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load history");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshRuns();
    }, [refreshRuns]);

    const addRun = useCallback(
        async (config: SimulationConfig, results: SimulationResults): Promise<string> => {
            const id = crypto.randomUUID();
            const run: SimulationRun = {
                id,
                timestamp: new Date().toISOString(),
                runType: "simulation",
                config,
                results,
                isFavorite: false,
            };

            await db.saveSimulationRun(run);
            await refreshRuns();
            return id;
        },
        [refreshRuns],
    );

    const addOptimizerRun = useCallback(
        async (
            config: SimulationConfig,
            results: SimulationResults,
            optimizationGoal: string,
            targets: string[],
        ): Promise<string> => {
            const id = crypto.randomUUID();
            const run: OptimizerRun = {
                id,
                timestamp: new Date().toISOString(),
                runType: "optimizer",
                config,
                results,
                optimizationGoal,
                targets,
                isFavorite: false,
            };

            await db.saveSimulationRun(run);
            await refreshRuns();
            return id;
        },
        [refreshRuns],
    );

    const deleteRun = useCallback(
        async (id: string) => {
            await db.deleteSimulationRun(id);
            await refreshRuns();
        },
        [refreshRuns],
    );

    const updateRunLabel = useCallback(
        async (id: string, label: string) => {
            const existing = await db.getSimulationRun(id);
            if (existing) {
                await db.saveSimulationRun({ ...existing, label });
                await refreshRuns();
            }
        },
        [refreshRuns],
    );

    const clearAllRuns = useCallback(async () => {
        await db.clearAllSimulationRuns();
        await refreshRuns();
    }, [refreshRuns]);

    const getRunById = useCallback(async (id: string) => {
        return db.getSimulationRun(id);
    }, []);

    const getRunsByZone = useCallback(async (zoneHrid: string) => {
        return db.getSimulationRunsByZone(zoneHrid);
    }, []);

    const getRunsInDateRange = useCallback(async (start: Date, end: Date) => {
        return db.getSimulationRunsInDateRange(start, end);
    }, []);

    const getRunsByType = useCallback(async (type: RunType) => {
        return db.getRunsByType(type);
    }, []);

    return (
        <SimulationHistoryContext.Provider
            value={{
                runs,
                isLoading,
                error,
                addRun,
                addOptimizerRun,
                deleteRun,
                updateRunLabel,
                refreshRuns,
                clearAllRuns,
                getRunById,
                getRunsByZone,
                getRunsInDateRange,
                getRunsByType,
            }}
        >
            {children}
        </SimulationHistoryContext.Provider>
    );
}

export function useSimulationHistory() {
    const context = useContext(SimulationHistoryContext);
    if (!context) {
        throw new Error("useSimulationHistory must be used within SimulationHistoryProvider");
    }
    return context;
}
