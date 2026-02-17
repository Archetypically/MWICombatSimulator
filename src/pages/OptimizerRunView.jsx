import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSimulationHistory } from "@/contexts/SimulationHistoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { RotateCCWIcon } from "@/components/ui/rotate-ccw";
import { ChevronLeftIcon } from "@/components/ui/chevron-left";
import { ClockIcon } from "@/components/ui/clock";
import { UsersIcon } from "@/components/ui/users";
import { BadgeAlertIcon } from "@/components/ui/badge-alert";
import { PlayIcon } from "@/components/ui/play";
import { TrophyIcon } from "@/components/ui/trophy";
import { TrendingUpIcon } from "@/components/ui/trending-up";
import { TrendingDownIcon } from "@/components/ui/trending-down";
import { ZapIcon } from "@/components/ui/zap";
import { DollarSignIcon } from "@/components/ui/dollar-sign";
import { HandCoinsIcon } from "@/components/ui/hand-coins";
import { ParticleCard } from "@/components/MagicBento";

const GLOW_COLOR = "132, 0, 255";

const OPTIMIZATION_GOALS = {
    profit: { label: "Highest Profit", icon: TrendingUpIcon },
    revenue: { label: "Highest Revenue", icon: HandCoinsIcon },
    expense: { label: "Lowest Expense", icon: TrendingDownIcon },
    xp: { label: "Highest XP", icon: ZapIcon },
    gold_per_hour: { label: "Highest $/hr", icon: DollarSignIcon },
};

function BentoCard({ children, className = "" }) {
    return (
        <ParticleCard
            className={`relative overflow-hidden rounded-[20px] border border-solid transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] bg-card ${className}`}
            style={{ borderColor: "hsl(var(--border))" }}
            glowColor={GLOW_COLOR}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={true}
            particleCount={8}
        >
            <div className="p-4">{children}</div>
        </ParticleCard>
    );
}

function StatBentoCard({ title, value, subValue, icon: Icon, variant = "default" }) {
    const variantStyles = {
        default: "bg-card",
        success: "border-l-4 border-l-emerald-500 bg-emerald-100 dark:bg-emerald-900",
        danger: "border-l-4 border-l-rose-500 bg-rose-100 dark:bg-rose-900",
        warning: "border-l-4 border-l-amber-500 bg-amber-100 dark:bg-amber-900",
    };

    const iconColors = {
        default: "text-muted-foreground",
        success: "text-emerald-600 dark:text-emerald-400",
        danger: "text-rose-600 dark:text-rose-400",
        warning: "text-amber-600 dark:text-amber-400",
    };

    const bgColors = {
        default: "bg-muted",
        success: "bg-emerald-100 dark:bg-emerald-900",
        danger: "bg-rose-100 dark:bg-rose-900",
        warning: "bg-amber-100 dark:bg-amber-900",
    };

    return (
        <BentoCard className={`${variantStyles[variant] || ""}`}>
            <div className="flex items-start justify-between h-full">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-pixel">{title}</p>
                    <p className="text-2xl font-bold tracking-tight font-pixel">{value}</p>
                    {subValue && <p className="text-xs text-muted-foreground font-pixel">{subValue}</p>}
                </div>
                <div className={`p-2 rounded-lg ${bgColors[variant] || "bg-muted"}`}>
                    <Icon className={`h-4 w-4 ${iconColors[variant] || "text-muted-foreground"}`} />
                </div>
            </div>
        </BentoCard>
    );
}

function formatNumber(num) {
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(2) + "M";
    }
    if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toFixed(0);
}

export default function OptimizerRunView() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const { getRunById } = useSimulationHistory();
    const [run, setRun] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        const loadRun = async () => {
            try {
                setIsLoading(true);
                const data = await getRunById(uuid);
                if (!data) {
                    setError("Optimizer run not found");
                } else if (data.runType !== "optimizer") {
                    setError("This is not an optimizer run");
                } else {
                    setRun(data);
                }
            } catch (err) {
                setError(err.message || "Failed to load optimizer run");
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
                            <p>Loading optimizer run...</p>
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
                                The optimizer run you're looking for doesn't exist or has been deleted.
                            </p>
                            <Button onClick={() => navigate("/history")}>Go to History</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const goalConfig = OPTIMIZATION_GOALS[run.optimizationGoal] || { label: run.optimizationGoal, icon: TrophyIcon };
    const GoalIcon = goalConfig.icon;

    // Parse results - optimizer stores results as an array of target results
    const results = run.results?.optimizerResults || [];
    const bestResult = results[0];

    // Mobile table columns definition
    const mobileColumns = [
        {
            key: "rank",
            title: "Rank",
            render: (_, result, index) =>
                index === 0 ? (
                    <TrophyIcon size={16} className="text-yellow-500" />
                ) : (
                    <span className="font-bold">{index + 1}</span>
                ),
        },
        {
            key: "targetName",
            title: "Target",
            render: (value) => <span className="font-medium">{value}</span>,
        },
        {
            key: "killsPerHour",
            title: "Kills/Hr",
            render: (value) => value?.toFixed(1) || "0.0",
        },
        {
            key: "deathsPerHour",
            title: "Deaths/Hr",
            render: (value) => (
                <span className={value > 0 ? "text-rose-500" : "text-emerald-500"}>{value?.toFixed(2) || "0.00"}</span>
            ),
        },
        {
            key: "xpPerHour",
            title: "XP/Hr",
            render: (value) => <span className="text-emerald-500">{formatNumber(value || 0)}</span>,
        },
        {
            key: "revenue",
            title: "Revenue",
            render: (value) => <span className="text-emerald-500">+{formatNumber(value || 0)}</span>,
        },
        {
            key: "expense",
            title: "Expense",
            render: (value) => <span className="text-rose-500">-{formatNumber(value || 0)}</span>,
        },
        {
            key: "profit",
            title: "Profit",
            render: (value) => (
                <span className={`font-bold ${value >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {value >= 0 ? "+" : ""}
                    {formatNumber(value || 0)}
                </span>
            ),
        },
        {
            key: "goldPerHour",
            title: "$/Hr",
            render: (value) => (
                <span className={`font-bold ${value >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {value >= 0 ? "+" : ""}
                    {formatNumber(value || 0)}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (_, result) => {
                if (result.error) {
                    return (
                        <Badge variant="destructive" className="text-[10px]">
                            Error
                        </Badge>
                    );
                }
                if (result.manaRanOut) {
                    return (
                        <Badge variant="warning" className="text-[10px]">
                            OOM
                        </Badge>
                    );
                }
                if (result.deathsPerHour > 1) {
                    return (
                        <Badge variant="destructive" className="text-[10px]">
                            Risky
                        </Badge>
                    );
                }
                return (
                    <Badge variant="outline" className="text-[10px]">
                        OK
                    </Badge>
                );
            },
        },
    ];

    // Custom row renderer for mobile to pass index
    const renderMobileRow = (result, index) => {
        const columnsWithIndex = mobileColumns.map((col) => ({
            ...col,
            render:
                col.key === "rank" || col.key === "status"
                    ? (value, data) => col.render(value, data, index)
                    : col.render,
        }));

        return (
            <Card
                key={result.targetHrid}
                className={`overflow-hidden border-border/50 ${index === 0 ? "bg-yellow-500/10 border-l-4 border-l-yellow-500" : index % 2 === 0 ? "bg-card" : "bg-card/50"}`}
            >
                <CardContent className="px-4 py-0">
                    <div className="space-y-0">
                        {columnsWithIndex.map((column, colIndex) => {
                            const value = result[column.key];
                            const displayValue = column.render ? column.render(value, result) : value;

                            return (
                                <div
                                    key={column.key}
                                    className={`flex items-start justify-between py-2 ${colIndex !== columnsWithIndex.length - 1 ? "border-b border-border/30" : ""}`}
                                >
                                    <span className="text-xs text-muted-foreground font-medium shrink-0 mr-3">
                                        {column.title}
                                    </span>
                                    <div className="text-sm text-foreground text-right">{displayValue}</div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        );
    };

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
                        <h1 className="text-2xl sm:text-3xl font-bold font-pixel text-foreground tracking-wide">
                            Optimizer Run
                        </h1>
                        {run.label && (
                            <p className="text-base sm:text-lg text-muted-foreground font-pixel mt-1">{run.label}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/optimizer">
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
                            <p className="text-xs text-muted-foreground font-pixel">Optimization Goal</p>
                            <div className="flex items-center gap-2">
                                <GoalIcon size={16} className="text-primary" />
                                <Badge variant="default" className="font-pixel">
                                    {goalConfig.label}
                                </Badge>
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
                            <p className="text-xs text-muted-foreground font-pixel">Targets Compared</p>
                            <p className="font-medium">{run.targets?.length || 0} targets</p>
                        </div>
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
                            <p className="text-xs text-muted-foreground font-pixel">Boosts</p>
                            <div className="flex gap-1">
                                <Badge
                                    variant={run.config.settings.comExpBuffEnabled ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    XP{" "}
                                    {run.config.settings.comExpBuffEnabled
                                        ? `T${run.config.settings.comExpBuffTier}`
                                        : "Off"}
                                </Badge>
                                <Badge
                                    variant={run.config.settings.comDropBuffEnabled ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    Drop{" "}
                                    {run.config.settings.comDropBuffEnabled
                                        ? `T${run.config.settings.comDropBuffTier}`
                                        : "Off"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Best Result */}
            {bestResult && (
                <BentoCard className="border-l-4 border-l-yellow-500 bg-yellow-100 dark:bg-yellow-900/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrophyIcon size={20} className="text-yellow-600 dark:text-yellow-400" />
                            <h3 className="font-pixel text-lg font-semibold">Best Target</h3>
                        </div>
                        <Badge variant="default" className="font-pixel">
                            {goalConfig.label}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground font-pixel">Target</p>
                            <p className="text-lg font-bold font-pixel">{bestResult.targetName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-pixel">Kills/Hr</p>
                            <p className="text-lg font-bold font-pixel">
                                {bestResult.killsPerHour?.toFixed(1) || "0.0"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-pixel">Deaths/Hr</p>
                            <p
                                className={`text-lg font-bold font-pixel ${bestResult.deathsPerHour > 0 ? "text-rose-500" : "text-emerald-500"}`}
                            >
                                {bestResult.deathsPerHour?.toFixed(2) || "0.00"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-pixel">XP/Hr</p>
                            <p className="text-lg font-bold font-pixel text-emerald-500">
                                {formatNumber(bestResult.xpPerHour || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-pixel">Profit</p>
                            <p
                                className={`text-lg font-bold font-pixel ${bestResult.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                            >
                                {bestResult.profit >= 0 ? "+" : ""}
                                {formatNumber(bestResult.profit || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-pixel">$/Hr</p>
                            <p
                                className={`text-lg font-bold font-pixel ${bestResult.goldPerHour >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                            >
                                {bestResult.goldPerHour >= 0 ? "+" : ""}
                                {formatNumber(bestResult.goldPerHour || 0)}
                            </p>
                        </div>
                    </div>
                </BentoCard>
            )}

            {/* Results Table */}
            {results.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-pixel text-lg">
                            Results
                            <span className="ml-2 text-sm text-muted-foreground hidden sm:inline">
                                (sorted by {goalConfig.label})
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isMobile ? (
                            <div className="space-y-2">
                                {results.map((result, index) => renderMobileRow(result, index))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="font-pixel">
                                            <TableHead className="w-12 text-center">Rank</TableHead>
                                            <TableHead>Target</TableHead>
                                            <TableHead className="text-right">Kills/Hr</TableHead>
                                            <TableHead className="text-right">Deaths/Hr</TableHead>
                                            <TableHead className="text-right">XP/Hr</TableHead>
                                            <TableHead className="text-right">Revenue</TableHead>
                                            <TableHead className="text-right">Expense</TableHead>
                                            <TableHead className="text-right">Profit</TableHead>
                                            <TableHead className="text-right">$/Hr</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((result, index) => (
                                            <TableRow
                                                key={result.targetHrid}
                                                className={`font-pixel text-xs ${index === 0 ? "bg-yellow-500/10" : ""}`}
                                            >
                                                <TableCell className="text-center font-bold">
                                                    {index === 0 ? (
                                                        <TrophyIcon size={16} className="text-yellow-500 mx-auto" />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{result.targetName}</TableCell>
                                                <TableCell className="text-right">
                                                    {result.killsPerHour?.toFixed(1) || "0.0"}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right ${result.deathsPerHour > 0 ? "text-rose-500" : "text-emerald-500"}`}
                                                >
                                                    {result.deathsPerHour?.toFixed(2) || "0.00"}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-500">
                                                    {formatNumber(result.xpPerHour || 0)}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-500">
                                                    +{formatNumber(result.revenue || 0)}
                                                </TableCell>
                                                <TableCell className="text-right text-rose-500">
                                                    -{formatNumber(result.expense || 0)}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-bold ${result.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                                                >
                                                    {result.profit >= 0 ? "+" : ""}
                                                    {formatNumber(result.profit || 0)}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-bold ${result.goldPerHour >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                                                >
                                                    {result.goldPerHour >= 0 ? "+" : ""}
                                                    {formatNumber(result.goldPerHour || 0)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {result.error ? (
                                                        <Badge variant="destructive" className="text-[10px]">
                                                            Error
                                                        </Badge>
                                                    ) : result.manaRanOut ? (
                                                        <Badge variant="warning" className="text-[10px]">
                                                            OOM
                                                        </Badge>
                                                    ) : result.deathsPerHour > 1 ? (
                                                        <Badge variant="destructive" className="text-[10px]">
                                                            Risky
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            OK
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
