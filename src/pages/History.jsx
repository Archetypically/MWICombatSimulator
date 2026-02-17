import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSimulationHistory } from "@/contexts/SimulationHistoryContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCCWIcon } from "@/components/ui/rotate-ccw";
import { ChevronDownIcon } from "@/components/ui/chevron-down";
import { ChevronUpIcon } from "@/components/ui/chevron-up";
import { UsersIcon } from "@/components/ui/users";
import { ClockIcon } from "@/components/ui/clock";
import { SparklesIcon } from "@/components/ui/sparkles";
import { HandCoinsIcon } from "@/components/ui/hand-coins";
import { DeleteIcon } from "@/components/ui/delete";
import { SlidersHorizontalIcon } from "@/components/ui/sliders-horizontal";
import { BoneIcon } from "@/components/ui/bone";
import { BoxIcon } from "@/components/ui/box";
import { HandFistIcon } from "@/components/ui/hand-fist";
import { BadgeAlertIcon } from "@/components/ui/badge-alert";
import { EyeIcon } from "@/components/ui/eye";
import { TrophyIcon } from "@/components/ui/trophy";
import { ChartSplineIcon } from "@/components/ui/chart-spline";

export default function History() {
    const { runs, isLoading, deleteRun, refreshRuns, clearAllRuns } = useSimulationHistory();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [expandedRun, setExpandedRun] = useState(null);
    const [filterZone, setFilterZone] = useState("all");
    const [filterType, setFilterType] = useState("all");

    const filteredRuns = runs.filter((run) => {
        if (filterZone !== "all" && run.config.zoneHrid !== filterZone) return false;
        if (filterType !== "all" && run.runType !== filterType) return false;
        return true;
    });

    const uniqueZones = [...new Set(runs.map((r) => r.config.zoneHrid).filter(Boolean))];

    const getRunTypeIcon = (runType) => {
        switch (runType) {
            case "optimizer":
                return <TrophyIcon size={14} className="text-yellow-500" />;
            case "simulation":
            default:
                return <ChartSplineIcon size={14} className="text-blue-500" />;
        }
    };

    const getRunTypeLabel = (runType) => {
        switch (runType) {
            case "optimizer":
                return "Optimizer";
            case "simulation":
            default:
                return "Simulation";
        }
    };

    const handleViewRun = (run) => {
        if (run.runType === "optimizer") {
            navigate(`/optimizer/${run.id}`);
        } else {
            navigate(`/simulator/${run.id}`);
        }
    };

    const formatZoneName = (zoneHrid) => {
        return zoneHrid.split("/").pop()?.replace(/_/g, " ") || zoneHrid;
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatNumber = (num) => {
        return Math.round(num).toLocaleString();
    };

    const formatSkillName = (skill) => {
        return skill.charAt(0).toUpperCase() + skill.slice(1);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold font-pixel text-foreground tracking-wide">Simulation History</h1>
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <RotateCCWIcon className="w-8 h-8 animate-spin" />
                            <p>Loading simulation history...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold font-pixel text-foreground tracking-wide">
                        Simulation History
                    </h1>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={refreshRuns}>
                                    <RotateCCWIcon size={20} className="mr-2" />
                                    Refresh
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Reload history from database</p>
                            </TooltipContent>
                        </Tooltip>
                        {runs.length > 0 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    "Are you sure you want to clear all history? This action cannot be undone.",
                                                )
                                            ) {
                                                clearAllRuns();
                                            }
                                        }}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <DeleteIcon size={20} className="mr-2" />
                                        Clear All
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete all history permanently</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontalIcon size={20} className="text-muted-foreground" />
                                    <span className="text-sm font-medium">Filters</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-full sm:w-[140px]">
                                            <SelectValue placeholder="Run type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="simulation">Simulation</SelectItem>
                                            <SelectItem value="optimizer">Optimizer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterZone} onValueChange={setFilterZone}>
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue placeholder="Select zone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Zones</SelectItem>
                                            {uniqueZones.map((zone) => (
                                                <SelectItem key={zone} value={zone}>
                                                    {formatZoneName(zone)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Badge variant="secondary" className="font-mono w-fit">
                                {filteredRuns.length} {filteredRuns.length === 1 ? "run" : "runs"}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Results */}
                <Card>
                    <CardContent className="p-0">
                        {filteredRuns.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <BadgeAlertIcon size={32} className="text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {runs.length === 0 ? "No Simulation History" : "No Matches Found"}
                                </h3>
                                <p className="text-muted-foreground max-w-sm">
                                    {runs.length === 0
                                        ? "You haven't run any simulations yet. Head to the Simulator to get started!"
                                        : "No simulation runs match your current filters. Try adjusting your search criteria."}
                                </p>
                            </div>
                        ) : isMobile ? (
                            // Mobile: Card-based view
                            <div className="divide-y">
                                {filteredRuns.map((run) => (
                                    <div key={run.id} className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        variant={run.runType === "optimizer" ? "default" : "secondary"}
                                                        className="text-[10px] font-pixel flex items-center gap-1"
                                                    >
                                                        {getRunTypeIcon(run.runType)}
                                                        {getRunTypeLabel(run.runType)}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(run.timestamp)}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {formatZoneName(run.config.zoneHrid)}
                                                    {run.config.difficultyTier > 0 && (
                                                        <span className="ml-1 font-mono">
                                                            T{run.config.difficultyTier}
                                                        </span>
                                                    )}
                                                </Badge>
                                            </div>
                                            <div
                                                className={`font-mono font-medium text-sm ${run.results.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                                            >
                                                {formatNumber(run.results.profit)}g
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                                            <div className="flex items-center gap-1">
                                                <UsersIcon size={14} />
                                                <span>{run.config.players.length} players</span>
                                            </div>
                                            <span className="text-xs">{formatTime(run.timestamp)}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs"
                                                onClick={() => handleViewRun(run)}
                                            >
                                                <EyeIcon size={14} className="mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this run?")) {
                                                        deleteRun(run.id);
                                                    }
                                                }}
                                            >
                                                <DeleteIcon size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Desktop: Table view
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10"></TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Zone</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <UsersIcon size={20} />
                                                Players
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <HandCoinsIcon size={20} />
                                                Profit/hr
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRuns.map((run) => (
                                        <React.Fragment key={run.id}>
                                            <TableRow className="group">
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            setExpandedRun(expandedRun === run.id ? null : run.id)
                                                        }
                                                    >
                                                        {expandedRun === run.id ? (
                                                            <ChevronUpIcon size={20} />
                                                        ) : (
                                                            <ChevronDownIcon size={20} />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{formatDate(run.timestamp)}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTime(run.timestamp)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={run.runType === "optimizer" ? "default" : "secondary"}
                                                        className="text-xs font-pixel flex items-center gap-1 w-fit"
                                                    >
                                                        {getRunTypeIcon(run.runType)}
                                                        {getRunTypeLabel(run.runType)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 flex-wrap">
                                                        <Badge variant="outline" className="text-xs">
                                                            {formatZoneName(run.config.zoneHrid)}
                                                        </Badge>
                                                        {run.config.difficultyTier > 0 && (
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                T{run.config.difficultyTier}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <UsersIcon size={16} className="text-muted-foreground" />
                                                        <span className="font-medium">{run.config.players.length}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className={`flex items-center gap-1 font-mono font-medium ${run.results.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                                                    >
                                                        <HandCoinsIcon size={16} />
                                                        {formatNumber(run.results.profit)}g
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => handleViewRun(run)}
                                                                >
                                                                    <EyeIcon size={18} className="text-primary" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>View run details</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => {
                                                                        if (
                                                                            confirm(
                                                                                "Are you sure you want to delete this run?",
                                                                            )
                                                                        ) {
                                                                            deleteRun(run.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon
                                                                        size={20}
                                                                        className="text-destructive"
                                                                    />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Delete this run</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedRun === run.id && (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="p-0">
                                                        <div className="p-6 bg-muted/30 border-t">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                                {/* Settings */}
                                                                <Card className="bg-background/50">
                                                                    <CardHeader className="pb-3">
                                                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                                            <ClockIcon
                                                                                size={20}
                                                                                className="text-primary"
                                                                            />
                                                                            Simulation Settings
                                                                        </CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent className="space-y-2 pt-0">
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-muted-foreground">
                                                                                Duration
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                {run.config.simulationDuration} hours
                                                                            </span>
                                                                        </div>
                                                                        <Separator />
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-muted-foreground">
                                                                                Moo Pass Active
                                                                            </span>
                                                                            <Badge
                                                                                variant={
                                                                                    run.config.settings.moopassEnabled
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                {run.config.settings.moopassEnabled
                                                                                    ? "Yes"
                                                                                    : "No"}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-muted-foreground">
                                                                                XP Boost
                                                                            </span>
                                                                            <Badge
                                                                                variant={
                                                                                    run.config.settings
                                                                                        .comExpBuffEnabled
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                {run.config.settings.comExpBuffEnabled
                                                                                    ? `Tier ${run.config.settings.comExpBuffTier}`
                                                                                    : "None"}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-muted-foreground">
                                                                                Drop Boost
                                                                            </span>
                                                                            <Badge
                                                                                variant={
                                                                                    run.config.settings
                                                                                        .comDropBuffEnabled
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                {run.config.settings.comDropBuffEnabled
                                                                                    ? `Tier ${run.config.settings.comDropBuffTier}`
                                                                                    : "None"}
                                                                            </Badge>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>

                                                                {/* XP per Hour */}
                                                                <Card className="bg-background/50">
                                                                    <CardHeader className="pb-3">
                                                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                                            <SparklesIcon
                                                                                size={20}
                                                                                className="text-yellow-500"
                                                                            />
                                                                            Experience per Hour
                                                                        </CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent className="pt-0">
                                                                        {Object.entries(run.results.xpPerHour).length >
                                                                        0 ? (
                                                                            <div className="space-y-3">
                                                                                {Object.entries(
                                                                                    run.results.xpPerHour,
                                                                                ).map(([player, skills]) => (
                                                                                    <div key={player}>
                                                                                        <h5 className="text-xs font-semibold text-muted-foreground mb-1">
                                                                                            {player}
                                                                                        </h5>
                                                                                        <div className="flex flex-wrap gap-1">
                                                                                            {Object.entries(skills).map(
                                                                                                ([skill, xp]) => (
                                                                                                    <Badge
                                                                                                        key={skill}
                                                                                                        variant="outline"
                                                                                                        className="text-xs font-mono"
                                                                                                    >
                                                                                                        {formatSkillName(
                                                                                                            skill,
                                                                                                        )}
                                                                                                        :{" "}
                                                                                                        {formatNumber(
                                                                                                            xp,
                                                                                                        )}
                                                                                                    </Badge>
                                                                                                ),
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                                <BadgeAlertIcon size={16} />
                                                                                No XP data available
                                                                            </p>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>

                                                                {/* Top Drops */}
                                                                <Card className="bg-background/50">
                                                                    <CardHeader className="pb-3">
                                                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                                            <BoxIcon
                                                                                size={20}
                                                                                className="text-blue-500"
                                                                            />
                                                                            Top Drops
                                                                        </CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent className="pt-0">
                                                                        {run.results.dropsData.length > 0 ? (
                                                                            <div className="space-y-2">
                                                                                {run.results.dropsData
                                                                                    .slice(0, 5)
                                                                                    .map((drop, i) => (
                                                                                        <div
                                                                                            key={i}
                                                                                            className="flex justify-between items-center text-sm"
                                                                                        >
                                                                                            <span className="truncate flex-1 mr-2">
                                                                                                {drop.name}
                                                                                            </span>
                                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                                <span className="font-mono">
                                                                                                    {formatNumber(
                                                                                                        drop.count,
                                                                                                    )}
                                                                                                    /hr
                                                                                                </span>
                                                                                                <span className="font-mono text-green-600">
                                                                                                    {formatNumber(
                                                                                                        drop.value,
                                                                                                    )}
                                                                                                    g
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                                <BadgeAlertIcon size={16} />
                                                                                No drops recorded
                                                                            </p>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>

                                                                {/* Deaths */}
                                                                <Card className="bg-background/50">
                                                                    <CardHeader className="pb-3">
                                                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                                            <BoneIcon
                                                                                size={20}
                                                                                className="text-destructive"
                                                                            />
                                                                            Deaths per Hour
                                                                        </CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent className="pt-0">
                                                                        {Object.entries(run.results.deathsPerHour)
                                                                            .length > 0 ? (
                                                                            <div className="space-y-2">
                                                                                {Object.entries(
                                                                                    run.results.deathsPerHour,
                                                                                ).map(([player, deaths]) => (
                                                                                    <div
                                                                                        key={player}
                                                                                        className="flex justify-between items-center text-sm"
                                                                                    >
                                                                                        <span>{player}</span>
                                                                                        <Badge
                                                                                            variant={
                                                                                                deaths > 0
                                                                                                    ? "destructive"
                                                                                                    : "secondary"
                                                                                            }
                                                                                            className="font-mono text-xs"
                                                                                        >
                                                                                            {deaths.toFixed(2)}
                                                                                        </Badge>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                                <BadgeAlertIcon size={16} />
                                                                                No death data available
                                                                            </p>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}
