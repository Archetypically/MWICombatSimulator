import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
    TrendingUp,
    TrendingDown,
    Skull,
    Shield,
    Zap,
    Droplets,
    Coins,
    Swords,
    Heart,
    Droplet,
    Users,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DamageTable } from "./DamageTable";
import { ConsumablesTable } from "./ConsumablesTable";
import { ResourceTable } from "./ResourceTable";
import { ManaTable } from "./ManaTable";
import { DropsTable } from "./DropsTable";
import { ExperienceBreakdown, CompactExperienceRow } from "./ExperienceBreakdown";
import { ParticleCard } from "@/components/MagicBento";

const GLOW_COLOR = "132, 0, 255";

function BentoCard({ children, className = "", style = {}, noPadding = false, hasBackground = false }) {
    return (
        <ParticleCard
            className={`relative overflow-hidden rounded-[20px] border border-solid transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] ${hasBackground ? "" : "bg-card"} ${className}`}
            style={{
                borderColor: "hsl(var(--border))",
                ...style,
            }}
            glowColor={GLOW_COLOR}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={true}
            particleCount={8}
        >
            <div className={noPadding ? "" : "p-4"}>{children}</div>
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
        <BentoCard className={`h-full ${variantStyles[variant] || ""}`} hasBackground={true}>
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

// Player-specific dashboard component
function PlayerDashboard({ playerId, playerName, result }) {
    const {
        deathsPerHour,
        xpPerHour,
        consumablesData,
        manaData,
        hpRestoredData,
        mpRestoredData,
        damageDoneTotal,
        damageTakenTotal,
        playerRanOutOfMana,
    } = result;

    // Filter data for this player
    const playerConsumables = consumablesData?.filter((item) => item.playerId === playerId) || [];
    const playerMana = manaData?.filter((item) => item.playerId === playerId) || [];
    const playerHpRestored = hpRestoredData?.filter((item) => item.playerId === playerId) || [];
    const playerMpRestored = mpRestoredData?.filter((item) => item.playerId === playerId) || [];

    // Calculate player stats
    const playerXp = xpPerHour?.[playerId] || {};
    const playerDeaths = deathsPerHour?.[playerId] || 0;
    const ranOutOfMana = playerRanOutOfMana?.[playerId] || false;

    // Filter damage data for this player's contributions
    const playerDamageDone =
        damageDoneTotal?.filter((row) => row.source === playerId || row.source.startsWith(playerId)) || [];
    const playerDamageTaken = damageTakenTotal?.filter((row) => row.target === playerId) || [];

    return (
        <div className="space-y-4">
            {/* Player Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ExperienceBreakdown xpData={playerXp} title="XP Per Hour" />
                <StatBentoCard
                    title="Deaths Per Hour"
                    value={playerDeaths.toFixed(2)}
                    icon={Shield}
                    variant={playerDeaths > 0 ? "danger" : "success"}
                />
                <StatBentoCard
                    title="Mana Status"
                    value={ranOutOfMana ? "Depleted" : "OK"}
                    subValue={ranOutOfMana ? "Ran Out" : "Sufficient"}
                    icon={Droplets}
                    variant={ranOutOfMana ? "warning" : "success"}
                />
            </div>

            {/* Player Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                    {playerConsumables.length > 0 && (
                        <BentoCard>
                            <ConsumablesTable data={playerConsumables} />
                        </BentoCard>
                    )}
                    {playerMana.length > 0 && (
                        <BentoCard>
                            <ManaTable data={playerMana} />
                        </BentoCard>
                    )}
                    {playerHpRestored.length > 0 && (
                        <BentoCard>
                            <ResourceTable title="Health Restored / Sec" data={playerHpRestored} />
                        </BentoCard>
                    )}
                    {playerMpRestored.length > 0 && (
                        <BentoCard>
                            <ResourceTable title="Mana Restored / Sec" data={playerMpRestored} />
                        </BentoCard>
                    )}
                </div>

                <div className="space-y-4">
                    {playerDamageDone.length > 0 && (
                        <BentoCard>
                            <DamageTable title="Damage Done" data={playerDamageDone} />
                        </BentoCard>
                    )}
                    {playerDamageTaken.length > 0 && (
                        <BentoCard>
                            <DamageTable title="Damage Taken" data={playerDamageTaken} />
                        </BentoCard>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ResultsDashboard({ result }) {
    const [activeTab, setActiveTab] = useState("overview");

    if (!result) {
        return null;
    }

    const {
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
        manaRanOut,
        playerNameMap,
        encounterName,
    } = result;

    // Helper function to get player name
    const getPlayerName = (playerId) => playerNameMap?.[playerId] || playerId;

    // Aggregate stats across all party members
    const playerIds = Object.keys(xpPerHour || {});
    const playerCount = playerIds.length;

    // Calculate total XP across all players
    const totalXp = playerIds.reduce((sum, playerId) => {
        const playerXp = Object.values(xpPerHour[playerId] || {});
        return sum + playerXp.reduce((a, b) => a + b, 0);
    }, 0);

    // Calculate total deaths across all players
    const totalDeaths = Object.values(deathsPerHour || {}).reduce((sum, deaths) => sum + deaths, 0);

    // Get per-player death info for display
    const playerDeathsList = Object.entries(deathsPerHour || {}).map(([player, deaths]) => ({
        player,
        deaths,
    }));

    // Check mana status per player
    const playersWithManaIssues = playerIds.filter((playerId) => {
        return result.playerRanOutOfMana?.[playerId] || false;
    });

    const hasMultiplePlayers = playerCount > 1;

    // Prepare chart data from damage done
    const chartColors = [
        "#A85448",
        "#4A8A8A",
        "#6E7A8A",
        "#8A9A4A",
        "#9A6E8A",
        "#8A5A4A",
        "#5A6E8A",
        "#6A8A7A",
        "#7A6A8A",
        "#8A7A5A",
    ];
    const dpsChartData =
        damageDoneTotal
            ?.filter((row) => row.source !== "Total")
            ?.map((row, index) => ({
                name: row.source,
                value: parseFloat(row.dps) || 0,
                color: chartColors[index % chartColors.length],
            })) || [];

    return (
        <div className="space-y-4">
            {/* Summary Stats Row - Always visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBentoCard
                    title="Kills Per Hour"
                    value={killsPerHour?.encounters?.toFixed(1) || "0.0"}
                    subValue={encounterName}
                    icon={Skull}
                    variant="default"
                />
                <StatBentoCard
                    title={`Deaths Per Hour${hasMultiplePlayers ? ` (${playerCount} players)` : ""}`}
                    value={totalDeaths.toFixed(2)}
                    subValue={
                        hasMultiplePlayers
                            ? `${playerDeathsList.map((p) => `${getPlayerName(p.player)}: ${p.deaths.toFixed(1)}`).join(", ")}`
                            : undefined
                    }
                    icon={Shield}
                    variant={totalDeaths > 0 ? "danger" : "success"}
                />
                <StatBentoCard
                    title={`XP Per Hour${hasMultiplePlayers ? ` (${playerCount} players)` : ""}`}
                    value={Math.round(totalXp).toLocaleString()}
                    subValue={hasMultiplePlayers ? "Combined party XP" : undefined}
                    icon={Zap}
                    variant="success"
                />
                <StatBentoCard
                    title="Mana Status"
                    value={manaRanOut ? "Depleted" : "OK"}
                    subValue={
                        manaRanOut
                            ? hasMultiplePlayers && playersWithManaIssues.length > 0
                                ? `${playersWithManaIssues.map(getPlayerName).join(", ")} ran out`
                                : "Ran Out"
                            : "Sufficient"
                    }
                    icon={Droplets}
                    variant={manaRanOut ? "warning" : "success"}
                />
            </div>

            {hasMultiplePlayers ? (
                /* Multi-player tabbed interface */
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList
                        className="w-full grid"
                        style={{ gridTemplateColumns: `repeat(${playerCount + 1}, minmax(0, 1fr))` }}
                    >
                        <TabsTrigger value="overview" className="font-pixel text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Party
                        </TabsTrigger>
                        {playerIds.map((playerId) => (
                            <TabsTrigger key={playerId} value={playerId} className="font-pixel text-xs">
                                {getPlayerName(playerId)}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                        {/* Party Overview */}
                        <div className="space-y-4">
                            <BentoCard>
                                <h4 className="font-pixel text-sm font-semibold mb-3">Party Summary</h4>
                                <div className="space-y-3">
                                    {playerIds.map((playerId) => {
                                        const playerXp = xpPerHour?.[playerId] || {};
                                        const playerDeathCount = deathsPerHour?.[playerId] || 0;
                                        const playerRanOutOfMana = result.playerRanOutOfMana?.[playerId];

                                        return (
                                            <div
                                                key={playerId}
                                                className="flex items-center justify-between py-2 border-b border-border last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${playerDeathCount > 0 ? "bg-red-500" : "bg-emerald-500"}`}
                                                    />
                                                    <span className="font-pixel text-sm font-medium">
                                                        {getPlayerName(playerId)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <CompactExperienceRow xpData={playerXp} />
                                                    <span
                                                        className={`text-xs font-pixel ${
                                                            playerDeathCount > 0 ? "text-red-500" : "text-emerald-500"
                                                        }`}
                                                    >
                                                        <Shield className="w-3 h-3 inline mr-1" />
                                                        {playerDeathCount.toFixed(2)} deaths/hr
                                                    </span>
                                                    {playerRanOutOfMana && (
                                                        <span className="text-xs text-amber-500 font-pixel">
                                                            <Droplets className="w-3 h-3 inline mr-1" />
                                                            OOM
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </BentoCard>

                            {/* Party-wide data */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <BentoCard>
                                    <ConsumablesTable data={consumablesData || []} />
                                </BentoCard>
                                <BentoCard>
                                    <ManaTable data={manaData || []} />
                                </BentoCard>
                                <BentoCard>
                                    <ResourceTable title="Health Restored / Sec" data={hpRestoredData || []} />
                                </BentoCard>
                                <BentoCard>
                                    <ResourceTable title="Mana Restored / Sec" data={mpRestoredData || []} />
                                </BentoCard>
                            </div>

                            {/* Profit & Drops - shared across party */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <BentoCard>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Coins className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-pixel text-sm">Profit</span>
                                            </div>
                                            <Badge
                                                variant={profit >= 0 ? "default" : "destructive"}
                                                className="font-pixel"
                                            >
                                                {profit >= 0 ? (
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3 mr-1" />
                                                )}
                                                {profit?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </Badge>
                                        </div>
                                    </BentoCard>
                                    <BentoCard>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Coins className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-pixel text-sm">No RNG Profit</span>
                                            </div>
                                            <Badge
                                                variant={noRngProfit >= 0 ? "default" : "destructive"}
                                                className="font-pixel"
                                            >
                                                {noRngProfit?.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                            </Badge>
                                        </div>
                                    </BentoCard>
                                </div>
                                <BentoCard>
                                    <DropsTable title="Drops (Total)" data={dropsData || []} />
                                </BentoCard>
                            </div>

                            {/* Charts */}
                            {dpsChartData.length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <BentoCard className="h-[280px]">
                                        <h4 className="font-pixel text-sm font-semibold mb-2">DPS Distribution</h4>
                                        <ChartContainer config={{}} className="h-[220px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={dpsChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                    >
                                                        {dpsChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <Legend fontSize={10} wrapperStyle={{ color: "currentColor" }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </BentoCard>

                                    <BentoCard className="h-[280px]">
                                        <h4 className="font-pixel text-sm font-semibold mb-2">Damage Per Ability</h4>
                                        <ChartContainer config={{}} className="h-[220px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={dpsChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{ fill: "currentColor", fontSize: 9 }}
                                                        interval={0}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                    />
                                                    <YAxis tick={{ fill: "currentColor", fontSize: 10 }} />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <Bar dataKey="value">
                                                        {dpsChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </BentoCard>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {playerIds.map((playerId) => (
                        <TabsContent key={playerId} value={playerId} className="mt-4">
                            <PlayerDashboard playerId={playerId} playerName={getPlayerName(playerId)} result={result} />
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                /* Single player - original layout */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Experience & Tables */}
                    <div className="lg:col-span-1 space-y-4">
                        <ExperienceBreakdown xpData={xpPerHour?.[playerIds[0]] || {}} title="XP Per Hour" />
                        <BentoCard>
                            <ConsumablesTable data={consumablesData || []} />
                        </BentoCard>
                        <BentoCard>
                            <ManaTable data={manaData || []} />
                        </BentoCard>
                        <BentoCard>
                            <ResourceTable title="Health Restored / Sec" data={hpRestoredData || []} />
                        </BentoCard>
                        <BentoCard>
                            <ResourceTable title="Mana Restored / Sec" data={mpRestoredData || []} />
                        </BentoCard>
                    </div>

                    {/* Middle Column - Damage Tables & Profit */}
                    <div className="lg:col-span-1 space-y-4">
                        <BentoCard>
                            <DamageTable title="Damage Done (Total)" data={damageDoneTotal || []} />
                        </BentoCard>
                        <BentoCard>
                            <DamageTable title="Damage Taken (Total)" data={damageTakenTotal || []} />
                        </BentoCard>

                        {/* Profit Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            <BentoCard>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-pixel text-sm">Profit</span>
                                    </div>
                                    <Badge variant={profit >= 0 ? "default" : "destructive"} className="font-pixel">
                                        {profit >= 0 ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        {profit?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </Badge>
                                </div>
                            </BentoCard>
                            <BentoCard>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-pixel text-sm">No RNG Profit</span>
                                    </div>
                                    <Badge
                                        variant={noRngProfit >= 0 ? "default" : "destructive"}
                                        className="font-pixel"
                                    >
                                        {noRngProfit?.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                    </Badge>
                                </div>
                            </BentoCard>
                        </div>

                        <BentoCard>
                            <DropsTable title="Drops (Total)" data={dropsData || []} />
                        </BentoCard>
                    </div>

                    {/* Right Column - Charts */}
                    {dpsChartData.length > 0 && (
                        <div className="lg:col-span-1 space-y-4">
                            <BentoCard className="h-[280px]">
                                <h4 className="font-pixel text-sm font-semibold mb-2">DPS Distribution</h4>
                                <ChartContainer config={{}} className="h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dpsChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {dpsChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend fontSize={10} wrapperStyle={{ color: "currentColor" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </BentoCard>

                            <BentoCard className="h-[280px]">
                                <h4 className="font-pixel text-sm font-semibold mb-2">Damage Per Ability</h4>
                                <ChartContainer config={{}} className="h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dpsChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: "currentColor", fontSize: 9 }}
                                                interval={0}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis tick={{ fill: "currentColor", fontSize: 10 }} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="value">
                                                {dpsChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </BentoCard>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
