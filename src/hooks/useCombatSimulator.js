import { useState, useCallback, useRef, useEffect } from "react";

// Development marketplace data import
import devMarketplaceData from "../../development/marketplace.json";

const MARKETPLACE_URL = "https://www.milkywayidle.com/game_data/marketplace.json";

export function useCombatSimulator() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [marketplaceData, setMarketplaceData] = useState(null);
    const workerRef = useRef(null);

    // Load marketplace data on mount
    useEffect(() => {
        const loadMarketplaceData = async () => {
            try {
                // Check if we're in development
                const isDev = import.meta.env.DEV || process.env.NODE_ENV === "development";

                if (isDev) {
                    // Use local frozen data
                    setMarketplaceData(devMarketplaceData.marketData);
                } else {
                    // Fetch from live API in production
                    const response = await fetch(MARKETPLACE_URL);
                    if (!response.ok) {
                        throw new Error("Failed to fetch marketplace data");
                    }
                    const data = await response.json();
                    setMarketplaceData(data.marketData);
                }
            } catch (err) {
                console.error("Failed to load marketplace data:", err);
                // Fall back to dev data if available
                setMarketplaceData(devMarketplaceData.marketData);
            }
        };

        loadMarketplaceData();
    }, []);

    const startSimulation = useCallback(
        async (config) => {
            if (!marketplaceData) {
                setError("Marketplace data not loaded yet");
                return;
            }

            setIsSimulating(true);
            setProgress(0);
            setError(null);
            setResult(null);

            // Create worker
            const worker = new Worker(new URL("../workers/simulator.worker.js", import.meta.url), { type: "module" });

            workerRef.current = worker;

            worker.onmessage = (event) => {
                const { type } = event.data;

                if (type === "progress") {
                    setProgress(Math.round(event.data.progress * 100));
                } else if (type === "complete") {
                    setResult(event.data.result);
                    setIsSimulating(false);
                    setProgress(100);
                    worker.terminate();
                    workerRef.current = null;
                } else if (type === "error") {
                    setError(event.data.error);
                    setIsSimulating(false);
                    worker.terminate();
                    workerRef.current = null;
                }
            };

            worker.onerror = (err) => {
                setError(err.message);
                setIsSimulating(false);
                worker.terminate();
                workerRef.current = null;
            };

            // Send configuration to worker
            console.debug("[HOOK] Starting simulation with config:", {
                playerCount: config.players?.length,
                zoneHrid: config.zoneHrid,
                difficultyTier: config.difficultyTier,
                simulationDuration: config.simulationDuration,
                settings: config.settings,
                hasMarketplaceData: !!marketplaceData,
            });
            worker.postMessage({
                ...config,
                marketplaceData,
            });
        },
        [marketplaceData],
    );

    const stopSimulation = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
        setIsSimulating(false);
        setProgress(0);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    return {
        isSimulating,
        progress,
        result,
        error,
        startSimulation,
        stopSimulation,
        marketplaceData,
    };
}
