import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { HistoryRun, RunType } from "@/types/simulationHistory";

interface SimulationHistoryDB extends DBSchema {
    "simulation-runs": {
        key: string;
        value: HistoryRun;
        indexes: {
            "by-timestamp": string;
            "by-zone": string;
            "by-difficulty": number;
            "by-label": string;
            "by-favorite": number;
            "by-run-type": string;
        };
    };
}

const DB_NAME = "mwi-combat-simulator";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<SimulationHistoryDB>> | null = null;

export async function openSimulationDb(): Promise<IDBPDatabase<SimulationHistoryDB>> {
    if (!dbPromise) {
        dbPromise = openDB<SimulationHistoryDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                if (oldVersion < 1) {
                    const store = db.createObjectStore("simulation-runs", {
                        keyPath: "id",
                    });

                    store.createIndex("by-timestamp", "timestamp");
                    store.createIndex("by-zone", "config.zoneHrid");
                    store.createIndex("by-difficulty", "config.difficultyTier");
                    store.createIndex("by-label", "label");
                    store.createIndex("by-favorite", "isFavorite");
                    store.createIndex("by-run-type", "runType");
                } else if (oldVersion < 2) {
                    // Upgrading from version 1 - store already exists
                    const store = transaction.objectStore("simulation-runs");
                    store.createIndex("by-run-type", "runType");
                }
            },
        });
    }
    return dbPromise;
}

export async function saveSimulationRun(run: HistoryRun): Promise<string> {
    const db = await openSimulationDb();
    await db.put("simulation-runs", run);
    return run.id;
}

export async function getSimulationRun(id: string): Promise<HistoryRun | undefined> {
    const db = await openSimulationDb();
    return db.get("simulation-runs", id);
}

export async function getAllSimulationRuns(): Promise<HistoryRun[]> {
    const db = await openSimulationDb();
    return db.getAllFromIndex("simulation-runs", "by-timestamp");
}

export async function getSimulationRunsByZone(zoneHrid: string): Promise<HistoryRun[]> {
    const db = await openSimulationDb();
    return db.getAllFromIndex("simulation-runs", "by-zone", zoneHrid);
}

export async function getSimulationRunsInDateRange(startDate: Date, endDate: Date): Promise<HistoryRun[]> {
    const db = await openSimulationDb();
    const index = db.transaction("simulation-runs").store.index("by-timestamp");
    const range = IDBKeyRange.bound(startDate.toISOString(), endDate.toISOString());
    return index.getAll(range);
}

export async function deleteSimulationRun(id: string): Promise<void> {
    const db = await openSimulationDb();
    await db.delete("simulation-runs", id);
}

export async function clearAllSimulationRuns(): Promise<void> {
    const db = await openSimulationDb();
    await db.clear("simulation-runs");
}

export async function updateSimulationRun(id: string, updates: Partial<HistoryRun>): Promise<void> {
    const db = await openSimulationDb();
    const existing = await db.get("simulation-runs", id);
    if (!existing) throw new Error("Run not found");

    const updated = { ...existing, ...updates, id };
    await db.put("simulation-runs", updated);
}

export async function getRunsByType(type: RunType): Promise<HistoryRun[]> {
    const db = await openSimulationDb();
    return db.getAllFromIndex("simulation-runs", "by-run-type", type);
}
