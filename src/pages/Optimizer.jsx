import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacterSlots } from "@/hooks/useCharacterSlots";
import { useSimulationHistory } from "@/contexts/SimulationHistoryContext";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SimulationDurationControl } from "@/components/simulator/SimulationDurationControl";
import { SettingsPanel } from "@/components/simulator/SettingsPanel";
import { TargetSelector } from "@/components/simulator/TargetSelector";
import { PartyMemberSelector } from "@/components/simulator";
import { Badge } from "@/components/ui/badge";
import { actionDetailMap } from "@/lib/dataLoader";
import { convertSlotsToPlayerDTOs } from "@/lib/playerDtoConverter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUpIcon } from "@/components/ui/trending-up";
import { TrendingDownIcon } from "@/components/ui/trending-down";
import { ZapIcon } from "@/components/ui/zap";
import { ShieldCheckIcon } from "@/components/ui/shield-check";
import { DollarSignIcon } from "@/components/ui/dollar-sign";
import { HandCoinsIcon } from "@/components/ui/hand-coins";
import { TrophyIcon } from "@/components/ui/trophy";
import { PlayIcon } from "@/components/ui/play";
import { SquareActivityIcon } from "@/components/ui/square-activity";
import { BadgeAlertIcon } from "@/components/ui/badge-alert";
import { TrendingUpDownIcon } from "@/components/ui/trending-up-down";
import { ParticleCard } from "@/components/MagicBento";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GLOW_COLOR = "132, 0, 255";

const OPTIMIZATION_GOALS = [
    {
        value: "profit",
        label: "Highest Profit",
        icon: TrendingUpIcon,
        description: "Total profit (revenue - expenses)",
    },
    { value: "revenue", label: "Highest Revenue", icon: HandCoinsIcon, description: "Total income from drops" },
    {
        value: "expense",
        label: "Lowest Expense",
        icon: TrendingDownIcon,
        description: "Consumable costs (lower is better)",
    },
    { value: "xp", label: "Highest XP", icon: ZapIcon, description: "Experience points per hour" },
    { value: "gold_per_hour", label: "Highest $/hr", icon: DollarSignIcon, description: "Profit per hour" },
];

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

function OptimizationGoalSelector({ value, onChange }) {
    const selectedGoal = OPTIMIZATION_GOALS.find((g) => g.value === value);

    return (
        <div className="space-y-2">
            {/* Desktop: Card Grid (hidden on small screens) */}
            <div className="hidden md:grid md:grid-cols-5 gap-3">
                {OPTIMIZATION_GOALS.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = value === goal.value;
                    return (
                        <button
                            key={goal.value}
                            onClick={() => onChange(goal.value)}
                            className={`relative p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                isSelected
                                    ? "border-primary bg-primary/10 shadow-md"
                                    : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                            }`}
                        >
                            <div className="flex flex-col gap-2">
                                <div
                                    className={`p-2 rounded-md w-fit ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    <Icon size={16} />
                                </div>
                                <div>
                                    <p
                                        className={`font-pixel text-xs font-semibold ${isSelected ? "text-primary" : ""}`}
                                    >
                                        {goal.label}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-pixel leading-tight mt-0.5">
                                        {goal.description}
                                    </p>
                                </div>
                            </div>
                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mobile: Dropdown (hidden on medium and up) */}
            <div className="md:hidden">
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="w-full font-pixel text-sm h-12">
                        <SelectValue placeholder="Select goal...">
                            {selectedGoal && (
                                <div className="flex items-center gap-2">
                                    <selectedGoal.icon size={16} />
                                    <span>{selectedGoal.label}</span>
                                </div>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {OPTIMIZATION_GOALS.map((goal) => (
                            <SelectItem key={goal.value} value={goal.value} className="font-pixel text-sm">
                                <div className="flex items-center gap-2">
                                    <goal.icon size={16} />
                                    <span>{goal.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Description (shown on desktop) */}
            <p className="hidden md:block text-xs text-muted-foreground font-pixel">{selectedGoal?.description}</p>
        </div>
    );
}

export default function Optimizer() {
    const { slots, isLoaded, isSlotActive } = useCharacterSlots();
    const { addOptimizerRun } = useSimulationHistory();
    const navigate = useNavigate();

    // Settings state
    const [moopassEnabled, setMoopassEnabled] = useState(true);
    const [globalExpBuffEnabled, setGlobalExpBuffEnabled] = useState(true);
    const [globalExpBuffTier, setGlobalExpBuffTier] = useState(20);
    const [globalDropBuffEnabled, setGlobalDropBuffEnabled] = useState(true);
    const [globalDropBuffTier, setGlobalDropBuffTier] = useState(20);

    // Target selection
    const [selectedTargets, setSelectedTargets] = useState([]);

    // Simulation duration
    const [simulationDuration, setSimulationDuration] = useState(24);

    // Party members
    const [selectedPartyMembers, setSelectedPartyMembers] = useState([]);

    // Optimization goal
    const [optimizationGoal, setOptimizationGoal] = useState("profit");

    // Simulation state
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTarget, setCurrentTarget] = useState("");
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    // Worker ref
    const workersRef = useRef([]);
    const resultsRef = useRef([]);
    const completedCountRef = useRef(0);

    // Update party members when slots load
    useEffect(() => {
        if (isLoaded && selectedPartyMembers.length === 0) {
            const firstActiveSlot = slots.find((slot) => isSlotActive(slot.slotNumber));
            if (firstActiveSlot) {
                setSelectedPartyMembers([String(firstActiveSlot.slotNumber)]);
            }
        }
    }, [isLoaded, slots, isSlotActive, selectedPartyMembers.length]);

    // Get target name from hrid
    const getTargetName = useCallback((hrid) => {
        const action = actionDetailMap()[hrid];
        return action?.name || hrid;
    }, []);

    // Check if a target is single-spawn (maxSpawnCount = 1)
    const isSingleSpawnTarget = useCallback((hrid) => {
        const action = actionDetailMap()[hrid];
        if (!action) return false;
        if (action.combatZoneInfo?.isDungeon) return false;

        const fightInfo = action.combatZoneInfo?.fightInfo;
        if (!fightInfo) return false;

        const randomSpawnInfo = fightInfo.randomSpawnInfo;
        return randomSpawnInfo?.maxSpawnCount === 1;
    }, []);

    // Max party size based on selected targets
    // Single-spawn zones = 1 max, Dungeons/Zones = 3 max
    const maxPartySize = useMemo(() => {
        if (selectedTargets.length === 0) return 3;
        const hasSingleSpawn = selectedTargets.some((target) => isSingleSpawnTarget(target));
        return hasSingleSpawn ? 1 : 3;
    }, [selectedTargets, isSingleSpawnTarget]);

    // Validate party size against targets
    useEffect(() => {
        if (selectedTargets.length > 0 && selectedPartyMembers.length > maxPartySize) {
            setSelectedPartyMembers(selectedPartyMembers.slice(0, maxPartySize));
        }
    }, [selectedTargets, maxPartySize, selectedPartyMembers]);

    // Sort results based on optimization goal
    const sortedResults = useMemo(() => {
        const sorted = [...results];
        sorted.sort((a, b) => {
            switch (optimizationGoal) {
                case "profit":
                    return b.profit - a.profit;
                case "revenue":
                    return b.revenue - a.revenue;
                case "expense":
                    return a.expense - b.expense; // Lower is better
                case "xp":
                    return b.xpPerHour - a.xpPerHour;
                case "gold_per_hour":
                    return b.goldPerHour - a.goldPerHour;
                default:
                    return 0;
            }
        });
        return sorted;
    }, [results, optimizationGoal]);

    // Best result
    const bestResult = sortedResults[0];

    // Run single simulation
    const runSimulation = useCallback(
        async (targetHrid, playerDTOs, marketplaceData) => {
            return new Promise((resolve, reject) => {
                const worker = new Worker(new URL("../workers/simulator.worker.js", import.meta.url), {
                    type: "module",
                });

                const timeout = setTimeout(() => {
                    worker.terminate();
                    reject(new Error("Simulation timeout"));
                }, 30000); // 30 second timeout per simulation

                worker.onmessage = (event) => {
                    const { type } = event.data;

                    if (type === "complete") {
                        clearTimeout(timeout);
                        const result = event.data.result;
                        const playerIds = Object.keys(result.xpPerHour || {});

                        // Calculate aggregates
                        const totalXp = playerIds.reduce((sum, playerId) => {
                            const playerXp = Object.values(result.xpPerHour[playerId] || {});
                            return sum + playerXp.reduce((a, b) => a + b, 0);
                        }, 0);

                        const totalDeaths = Object.values(result.deathsPerHour || {}).reduce(
                            (sum, deaths) => sum + deaths,
                            0,
                        );

                        const simulationResult = {
                            targetHrid,
                            targetName: getTargetName(targetHrid),
                            targetDifficulty: 0,
                            killsPerHour: result.killsPerHour?.encounters || 0,
                            deathsPerHour: totalDeaths,
                            xpPerHour: totalXp,
                            profit: result.profit || 0,
                            revenue: result.revenue || 0,
                            expense: result.expense || 0,
                            goldPerHour: (result.profit || 0) / simulationDuration,
                            manaRanOut: result.manaRanOut || false,
                        };

                        worker.terminate();
                        resolve(simulationResult);
                    } else if (type === "error") {
                        clearTimeout(timeout);
                        worker.terminate();
                        reject(new Error(event.data.error));
                    }
                };

                worker.onerror = (err) => {
                    clearTimeout(timeout);
                    worker.terminate();
                    reject(err);
                };

                workersRef.current.push(worker);

                const config = {
                    players: playerDTOs,
                    zoneHrid: targetHrid,
                    difficultyTier: 0,
                    simulationDuration,
                    settings: {
                        moopassEnabled,
                        comExpBuffEnabled: globalExpBuffEnabled,
                        comExpBuffTier: globalExpBuffTier,
                        comDropBuffEnabled: globalDropBuffEnabled,
                        comDropBuffTier: globalDropBuffTier,
                    },
                };

                worker.postMessage({
                    ...config,
                    marketplaceData,
                });
            });
        },
        [
            simulationDuration,
            moopassEnabled,
            globalExpBuffEnabled,
            globalExpBuffTier,
            globalDropBuffEnabled,
            globalDropBuffTier,
            getTargetName,
        ],
    );

    // Load marketplace data
    const loadMarketplaceData = async () => {
        const isDev = import.meta.env.DEV || process.env.NODE_ENV === "development";

        if (isDev) {
            const devMarketplaceData = await import("../../development/marketplace.json");
            return devMarketplaceData.default?.marketData || devMarketplaceData.marketData;
        } else {
            const response = await fetch("https://www.milkywayidle.com/game_data/marketplace.json");
            if (!response.ok) throw new Error("Failed to fetch marketplace data");
            const data = await response.json();
            return data.marketData;
        }
    };

    // Start optimization
    const handleStartOptimization = async () => {
        if (selectedTargets.length === 0 || selectedPartyMembers.length === 0) {
            return;
        }

        setIsOptimizing(true);
        setProgress(0);
        setResults([]);
        setError(null);
        resultsRef.current = [];
        completedCountRef.current = 0;

        try {
            const marketplaceData = await loadMarketplaceData();
            const playerDTOs = convertSlotsToPlayerDTOs(slots, selectedPartyMembers);

            // Run simulations sequentially to avoid overwhelming the browser
            for (let i = 0; i < selectedTargets.length; i++) {
                const target = selectedTargets[i];
                setCurrentTarget(getTargetName(target));
                setProgress(Math.round((i / selectedTargets.length) * 100));

                try {
                    const result = await runSimulation(target, playerDTOs, marketplaceData);
                    resultsRef.current.push(result);
                } catch (err) {
                    console.error(`Simulation failed for ${target}:`, err);
                    resultsRef.current.push({
                        targetHrid: target,
                        targetName: getTargetName(target),
                        targetDifficulty: 0,
                        killsPerHour: 0,
                        deathsPerHour: 0,
                        xpPerHour: 0,
                        profit: 0,
                        revenue: 0,
                        expense: 0,
                        goldPerHour: 0,
                        manaRanOut: false,
                        error: err?.message || "Unknown error",
                    });
                }

                completedCountRef.current++;
            }

            setProgress(100);
            // Only show results after all simulations complete
            const finalResults = [...resultsRef.current];

            // Sort results based on optimization goal before saving
            finalResults.sort((a, b) => {
                switch (optimizationGoal) {
                    case "profit":
                        return b.profit - a.profit;
                    case "revenue":
                        return b.revenue - a.revenue;
                    case "expense":
                        return a.expense - b.expense; // Lower is better
                    case "xp":
                        return b.xpPerHour - a.xpPerHour;
                    case "gold_per_hour":
                        return b.goldPerHour - a.goldPerHour;
                    default:
                        return 0;
                }
            });

            setResults(finalResults);

            // Save to history and navigate
            const config = {
                players: playerDTOs,
                zoneHrid: selectedTargets[0] || "",
                difficultyTier: 0,
                simulationDuration,
                settings: {
                    moopassEnabled,
                    comExpBuffEnabled: globalExpBuffEnabled,
                    comExpBuffTier: globalExpBuffTier,
                    comDropBuffEnabled: globalDropBuffEnabled,
                    comDropBuffTier: globalDropBuffTier,
                },
            };

            // Create a results object that includes the optimizer results
            const resultsForHistory = {
                optimizerResults: finalResults,
                // Include minimal required fields for SimulationResults interface
                killsPerHour: { encounters: 0, byMonster: {} },
                deathsPerHour: {},
                xpPerHour: {},
                consumablesData: [],
                manaData: [],
                hpRestoredData: [],
                mpRestoredData: [],
                damageDoneTotal: [],
                damageTakenTotal: [],
                dropsData: [],
                profit: finalResults[0]?.profit || 0,
                noRngProfit: 0,
                manaRanOut: false,
                simulatedTime: simulationDuration * 3600,
                encounters: 0,
                isDungeon: false,
                dungeonsCompleted: 0,
                dungeonsFailed: 0,
                maxWaveReached: 0,
            };

            const id = await addOptimizerRun(config, resultsForHistory, optimizationGoal, selectedTargets);
            navigate(`/optimizer/${id}`);
        } catch (err) {
            setError(err?.message || "Optimization failed");
        } finally {
            setIsOptimizing(false);
            setCurrentTarget("");
            // Clean up any remaining workers
            workersRef.current.forEach((w) => w.terminate());
            workersRef.current = [];
        }
    };

    // Stop optimization
    const handleStopOptimization = () => {
        workersRef.current.forEach((w) => w.terminate());
        workersRef.current = [];
        setIsOptimizing(false);
        setCurrentTarget("");
    };

    // Check if we can start
    const canStart = selectedTargets.length > 0 && selectedPartyMembers.length > 0 && !isOptimizing;

    const goalConfig = OPTIMIZATION_GOALS.find((g) => g.value === optimizationGoal);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-pixel text-foreground tracking-wide">Optimizer</h1>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg font-pixel text-sm">
                    <BadgeAlertIcon size={16} className="inline mr-2" />
                    Error: {error}
                </div>
            )}

            {/* Settings Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-pixel text-lg">Configuration</CardTitle>
                    <CardAction>
                        {isOptimizing ? (
                            <div className="flex items-center gap-4 w-full max-w-md">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-pixel text-xs text-muted-foreground">
                                            {currentTarget || "Running simulations..."}
                                        </span>
                                        <span className="font-pixel text-xs">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                                <Button
                                    onClick={handleStopOptimization}
                                    variant="destructive"
                                    className="font-pixel"
                                    size="sm"
                                >
                                    <SquareActivityIcon size={16} className="mr-1" />
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={handleStartOptimization}
                                className="font-pixel"
                                size="sm"
                                disabled={!canStart}
                            >
                                <PlayIcon size={16} />
                                Run Optimization
                            </Button>
                        )}
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Optimization Goal */}
                    <div className="flex flex-col gap-2">
                        <label className="font-pixel text-sm text-muted-foreground">Optimization Goal</label>
                        <OptimizationGoalSelector value={optimizationGoal} onChange={setOptimizationGoal} />
                    </div>

                    {/* Row 1: Targets, Duration, Buffs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Target Selection */}
                        <div className="flex flex-col gap-2">
                            <label className="font-pixel text-sm text-muted-foreground">
                                Targets to Compare
                                {selectedTargets.length > 0 && (
                                    <span className="ml-2 text-[10px] text-muted-foreground">
                                        ({selectedTargets.length} selected)
                                    </span>
                                )}
                            </label>
                            <TargetSelector
                                mode="multiple"
                                values={selectedTargets}
                                onChange={setSelectedTargets}
                                placeholder="Select targets..."
                            />
                        </div>

                        {/* Simulation Duration */}
                        <div className="flex flex-col gap-2">
                            <SimulationDurationControl value={simulationDuration} onChange={setSimulationDuration} />
                        </div>

                        {/* Buff Settings - spans 2 columns */}
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <SettingsPanel
                                moopassEnabled={moopassEnabled}
                                setMoopassEnabled={setMoopassEnabled}
                                globalExpBuffEnabled={globalExpBuffEnabled}
                                setGlobalExpBuffEnabled={setGlobalExpBuffEnabled}
                                globalExpBuffTier={globalExpBuffTier}
                                setGlobalExpBuffTier={setGlobalExpBuffTier}
                                globalDropBuffEnabled={globalDropBuffEnabled}
                                setGlobalDropBuffEnabled={setGlobalDropBuffEnabled}
                                globalDropBuffTier={globalDropBuffTier}
                                setGlobalDropBuffTier={setGlobalDropBuffTier}
                            />
                        </div>
                    </div>

                    {/* Row 2: Party Selection - Full Width */}
                    <PartyMemberSelector
                        selectedPartyMembers={selectedPartyMembers}
                        onChange={setSelectedPartyMembers}
                        maxPartySize={maxPartySize}
                        slots={slots}
                        isLoaded={isLoaded}
                        isSlotActive={isSlotActive}
                        warningMessage={selectedTargets.length > 0 ? "Single-spawn targets only support solo play" : ""}
                    />
                </CardContent>
            </Card>

            {/* Loading State */}
            {isOptimizing && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                {/* Spinner ring around the icon */}
                                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                                {/* Icon container */}
                                <div className="p-4 rounded-full bg-primary/10">
                                    <ZapIcon size={32} className="text-primary" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-[10px] font-pixel text-primary-foreground">
                                        {completedCountRef.current}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2 max-w-md">
                                <h3 className="font-pixel text-lg font-semibold">Running Simulations...</h3>
                                <p className="text-sm text-muted-foreground font-pixel">
                                    {currentTarget || "Initializing..."}
                                </p>
                                <p className="text-xs text-muted-foreground font-pixel">
                                    {completedCountRef.current} of {selectedTargets.length} targets completed
                                </p>
                            </div>
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between text-xs font-pixel text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results Section */}
            {!isOptimizing && results.length > 0 && (
                <div className="space-y-4">
                    {/* Best Result Card */}
                    {bestResult && !bestResult.error && (
                        <BentoCard className="border-l-4 border-l-yellow-500 bg-yellow-100 dark:bg-yellow-900/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TrophyIcon size={20} className="text-yellow-600 dark:text-yellow-400" />
                                    <h3 className="font-pixel text-lg font-semibold">Best Target</h3>
                                </div>
                                <Badge variant="default" className="font-pixel">
                                    {goalConfig?.label}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-pixel">Target</p>
                                    <p className="text-lg font-bold font-pixel">{bestResult.targetName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-pixel">Kills/Hr</p>
                                    <p className="text-lg font-bold font-pixel">{bestResult.killsPerHour.toFixed(1)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-pixel">Deaths/Hr</p>
                                    <p
                                        className={`text-lg font-bold font-pixel ${bestResult.deathsPerHour > 0 ? "text-rose-500" : "text-emerald-500"}`}
                                    >
                                        {bestResult.deathsPerHour.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-pixel">XP/Hr</p>
                                    <p className="text-lg font-bold font-pixel text-emerald-500">
                                        {formatNumber(bestResult.xpPerHour)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-pixel">Profit</p>
                                    <p
                                        className={`text-lg font-bold font-pixel ${bestResult.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                                    >
                                        {bestResult.profit >= 0 ? "+" : ""}
                                        {formatNumber(bestResult.profit)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-pixel">$/Hr</p>
                                    <p
                                        className={`text-lg font-bold font-pixel ${bestResult.goldPerHour >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                                    >
                                        {bestResult.goldPerHour >= 0 ? "+" : ""}
                                        {formatNumber(bestResult.goldPerHour)}
                                    </p>
                                </div>
                            </div>
                        </BentoCard>
                    )}

                    {/* Results Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-pixel text-lg">
                                Results
                                <span className="ml-2 text-sm text-muted-foreground">
                                    (sorted by {goalConfig?.label})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                        {sortedResults.map((result, index) => (
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
                                                    {result.killsPerHour.toFixed(1)}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right ${result.deathsPerHour > 0 ? "text-rose-500" : "text-emerald-500"}`}
                                                >
                                                    {result.deathsPerHour.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-500">
                                                    {formatNumber(result.xpPerHour)}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-500">
                                                    +{formatNumber(result.revenue)}
                                                </TableCell>
                                                <TableCell className="text-right text-rose-500">
                                                    -{formatNumber(result.expense)}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-bold ${result.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                                                >
                                                    {result.profit >= 0 ? "+" : ""}
                                                    {formatNumber(result.profit)}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-bold ${result.goldPerHour >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                                                >
                                                    {result.goldPerHour >= 0 ? "+" : ""}
                                                    {formatNumber(result.goldPerHour)}
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
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Empty State */}
            {results.length === 0 && !isOptimizing && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-muted">
                                <TrendingUpDownIcon size={32} className="text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-pixel text-lg font-semibold">Ready to Optimize</h3>
                                <p className="text-sm text-muted-foreground font-pixel max-w-md mx-auto">
                                    Select your party members, targets, and optimization goal, then run the optimizer to
                                    find the best target for your setup.
                                </p>
                            </div>
                            <Button onClick={handleStartOptimization} disabled={!canStart} className="font-pixel">
                                <PlayIcon size={16} />
                                Start Optimization
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
