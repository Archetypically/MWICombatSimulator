import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Swords, Loader2 } from "lucide-react";
import { ActivityIcon } from "@/components/ui/activity";

export function EmptyState({ onStart, isLoading, progress }) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="44"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-muted-foreground/20"
                        />
                        <circle
                            cx="48"
                            cy="48"
                            r="44"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${progress * 2.76} 276`}
                            className="text-primary transition-all duration-300"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-pixel font-semibold text-foreground mb-2">Simulating...</h3>
                    <p className="text-sm text-muted-foreground max-w-md font-pixel">
                        Running combat simulation. This may take a moment depending on the duration and complexity.
                    </p>
                </div>
                <div className="w-64">
                    <div className="flex justify-between text-xs font-pixel text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <ActivityIcon size={48} className="text-muted-foreground" />
            </div>
            <div>
                <h3 className="text-xl font-pixel font-semibold text-foreground mb-2">No Simulation Results</h3>
                <p className="text-sm text-muted-foreground max-w-md font-pixel">
                    Configure your settings and run a simulation to see detailed combat statistics including kills per
                    hour, damage breakdowns, profit analysis, and more.
                </p>
            </div>
        </div>
    );
}
