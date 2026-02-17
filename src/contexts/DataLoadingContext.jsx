import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeDataLoader } from "@/lib/dataLoader";

const DataLoadingContext = createContext({
    isLoading: true,
    error: null,
    isReady: false,
});

export function DataProvider({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                await initializeDataLoader();
                setIsReady(true);
            } catch (err) {
                console.error("Failed to load game data:", err);
                setError(err.message || "Failed to load game data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading game data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center max-w-md px-4">
                    <h2 className="text-xl font-semibold text-destructive mb-2">Failed to Load Data</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return <DataLoadingContext.Provider value={{ isLoading, error, isReady }}>{children}</DataLoadingContext.Provider>;
}

export function useDataLoading() {
    return useContext(DataLoadingContext);
}
