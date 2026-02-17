import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSimulationHistory } from "@/contexts/SimulationHistoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultsDashboard } from "@/components/simulator/ResultsDashboard";
import { RotateCCWIcon } from "@/components/ui/rotate-ccw";
import { ChevronLeftIcon } from "@/components/ui/chevron-left";
import { ClockIcon } from "@/components/ui/clock";
import { UsersIcon } from "@/components/ui/users";
import { BadgeAlertIcon } from "@/components/ui/badge-alert";
import { PlayIcon } from "@/components/ui/play";

export default function SimulatorRunView() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const { getRunById } = useSimulationHistory();
    const [run, setRun] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRun = async () => {
            try {
                setIsLoading(true);
                const data = await getRunById(uuid);
                if (!data) {
                    setError("Simulation run not found");
                } else if (data.runType !== "simulation") {
                    setError("This is not a simulation run");
                } else {
                    setRun(data);
                }
            } catch (err) {
                setError(err.message || "Failed to load simulation run");
            } finally {
                setIsLoading(false);
            }
        };

        loadRun();
    }, [uuid, getRunById]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatZoneName = (zoneHrid) => {
        if (!zoneHrid) return "Unknown";
        return zoneHrid.split("/").pop()?.replace(/_/g, " ") || zoneHrid;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                        <ChevronLeftIcon size={16} />
                        Back to History
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <RotateCCWIcon className="w-8 h-8 animate-spin" />
                            <p>Loading simulation run...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                        <ChevronLeftIcon size={16} />
                        Back to History
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <BadgeAlertIcon size={32} className="text-destructive" />
                            </div>
                            <h3 className="text-lg font-semibold">Error Loading Run</h3>
                            <p className="text-muted-foreground max-w-sm">{error}</p>
                            <Button onClick={() => navigate("/history")}>Go to History</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!run) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                        <ChevronLeftIcon size={16} />
                        Back to History
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <BadgeAlertIcon size={32} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Run Not Found</h3>
                            <p className="text-muted-foreground max-w-sm">
                                The simulation run you're looking for doesn't exist or has been deleted.
                            </p>
                            <Button onClick={() => navigate("/history")}>Go to History</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                        <ChevronLeftIcon size={16} />
                        Back to History
                    </Button>
                </div>

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-pixel text-foreground tracking-wide">Simulation Run</h1>
                        {run.label && <p className="text-lg text-muted-foreground font-pixel mt-1">{run.label}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/simulator">
                                <PlayIcon size={16} className="mr-2" />
                                Run Again
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Run Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-pixel text-lg">Run Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">Date</p>
                            <p className="font-medium">{formatDate(run.timestamp)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">Time</p>
                            <p className="font-medium">{formatTime(run.timestamp)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">Zone</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{formatZoneName(run.config.zoneHrid)}</Badge>
                                {run.config.difficultyTier > 0 && (
                                    <Badge variant="outline" className="font-mono">
                                        T{run.config.difficultyTier}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">Party Size</p>
                            <div className="flex items-center gap-1">
                                <UsersIcon size={16} className="text-muted-foreground" />
                                <span className="font-medium">{run.config.players.length} players</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">Duration</p>
                            <div className="flex items-center gap-1">
                                <ClockIcon size={16} className="text-muted-foreground" />
                                <span className="font-medium">{run.config.simulationDuration} hours</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">Moo Pass</p>
                            <Badge
                                variant={run.config.settings.moopassEnabled ? "default" : "secondary"}
                                className="text-xs"
                            >
                                {run.config.settings.moopassEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">XP Boost</p>
                            <Badge
                                variant={run.config.settings.comExpBuffEnabled ? "default" : "secondary"}
                                className="text-xs"
                            >
                                {run.config.settings.comExpBuffEnabled
                                    ? `Tier ${run.config.settings.comExpBuffTier}`
                                    : "None"}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">Drop Boost</p>
                            <Badge
                                variant={run.config.settings.comDropBuffEnabled ? "default" : "secondary"}
                                className="text-xs"
                            >
                                {run.config.settings.comDropBuffEnabled
                                    ? `Tier ${run.config.settings.comDropBuffTier}`
                                    : "None"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div>
                <h2 className="text-xl font-bold font-pixel mb-4">Results</h2>
                <ResultsDashboard result={run.results} />
            </div>
        </div>
    );
}
