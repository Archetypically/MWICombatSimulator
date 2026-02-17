import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme-provider";
import { SunIcon } from "@/components/ui/sun";
import { MoonIcon } from "@/components/ui/moon";
import { MonitorIcon } from "@/components/ui/monitor";
import { LanguagesIcon } from "@/components/ui/languages";
import { CompassIcon } from "@/components/ui/compass";
import { DatabaseIcon } from "@/components/ui/database";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useSimulationHistory } from "@/contexts/SimulationHistoryContext";
import { DeleteIcon } from "@/components/ui/delete";

const ThemeOption = ({ value, label, icon: Icon, isSelected, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
            isSelected
                ? "border-blue-500 bg-blue-500/10 text-blue-500"
                : "border-sidebar-border bg-sidebar-accent/30 text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
        }`}
    >
        <Icon size={24} />
        <span className="font-pixel text-xs">{label}</span>
    </button>
);

export default function Settings() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { clearAllRuns } = useSimulationHistory();
    const [storageEstimate, setStorageEstimate] = useState(null);

    useEffect(() => {
        if (navigator.storage?.estimate) {
            navigator.storage.estimate().then((estimate) => {
                setStorageEstimate(estimate);
            });
        }
    }, []);

    const formatStorageSize = (bytes) => {
        if (!bytes) return "Unknown";
        const mb = bytes / (1024 * 1024);
        if (mb < 1) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }
        return `${mb.toFixed(2)} MB`;
    };

    const handlePurgeDatabase = useCallback(() => {
        if (
            window.confirm(
                "Are you sure you want to permanently delete all simulation history? This action cannot be undone.",
            )
        ) {
            clearAllRuns();
        }
    }, [clearAllRuns]);

    const themeOptions = [
        { value: "light", label: "Light", icon: SunIcon },
        { value: "dark", label: "Dark", icon: MoonIcon },
        { value: "auto", label: "Auto", icon: MonitorIcon },
    ];

    return (
        <div className="relative overflow-hidden">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <h1 className="text-3xl font-bold font-pixel text-foreground tracking-wide">Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="font-pixel">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${resolvedTheme === "dark" ? "bg-indigo-600/10" : "bg-amber-500/10"}`}
                                >
                                    {resolvedTheme === "dark" ? (
                                        <MoonIcon size={24} className="text-indigo-500" />
                                    ) : (
                                        <SunIcon size={24} className="text-amber-500" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold font-pixel text-foreground">
                                        Appearance
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground font-pixel text-xs">
                                        Current: {theme === "auto" ? `Auto (${resolvedTheme})` : theme}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <h3 className="font-bold font-pixel text-sm text-foreground">Theme</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {themeOptions.map((option) => (
                                    <ThemeOption
                                        key={option.value}
                                        value={option.value}
                                        label={option.label}
                                        icon={option.icon}
                                        isSelected={theme === option.value}
                                        onClick={setTheme}
                                    />
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="text-muted-foreground font-pixel text-[10px] leading-relaxed">
                                Auto mode automatically switches between light and dark based on your system
                                preferences.
                            </p>
                        </CardFooter>
                    </Card>

                    <Card className="font-pixel justify-between">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-600/10">
                                    <CompassIcon size={24} className="text-green-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-foreground">About</CardTitle>
                                    <CardDescription className="text-muted-foreground text-xs">
                                        MWI Combat Simulator
                                    </CardDescription>
                                </div>
                            </div>
                            <CardAction className="flex gap-2">
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://github.com/Archetypically/MWICombatSimulator"
                                >
                                    <Button variant="outline" size="sm">
                                        View on GitHub
                                    </Button>
                                </a>
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://github.com/Archetypically/MWICombatSimulator/issues/new/choose"
                                >
                                    <Button variant="outline" size="sm">
                                        Create an Issue
                                    </Button>
                                </a>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            <p>A modern combat simulator for MilkyWayIdle.</p>
                            <p>
                                You can sign up for MilkyWayIdle using{" "}
                                <a
                                    href="https://www.milkywayidle.com/?ref=561571"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    my referral link
                                </a>
                                .
                            </p>
                        </CardContent>
                        <CardFooter />
                    </Card>

                    <Card className="font-pixel">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-600/10">
                                    <LanguagesIcon size={24} className="text-purple-500" />
                                </div>

                                <div>
                                    <CardTitle className="text-lg font-bold font-pixel text-foreground">
                                        Language
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground font-pixel text-xs">
                                        Coming soon
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <h3 className="font-bold font-pixel text-sm text-foreground">Language</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-sidebar-border bg-sidebar-accent/30 text-muted-foreground cursor-not-allowed"
                                    disabled
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.536a5 5 0 0 1-2.548-1.548L5.636 13.51m6.172 6.172L13.51 21.364a5 5 0 001.414-1.414l1.528-2.88m-2.172-6.172L10.828 9.17a5 5 0 0 1 1.414 1.414l1.528 2.88m-1.528-2.88L9.172 7.11a5 5 0 0 1-1.414-1.414L5.636 5.636"
                                        />
                                    </svg>
                                    <span className="font-pixel text-xs">English</span>
                                </button>
                                <button
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-sidebar-border bg-sidebar-accent/30 text-muted-foreground cursor-not-allowed"
                                    disabled
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.536a5 5 0 0 1-2.548-1.548L5.636 13.51m6.172 6.172L13.51 21.364a5 5 0 001.414-1.414l1.528-2.88m-2.172-6.172L10.828 9.17a5 5 0 0 1 1.414 1.414l1.528 2.88m-1.528-2.88L9.172 7.11a5 5 0 0 1-1.414-1.414L5.636 5.636"
                                        />
                                    </svg>
                                    <span className="font-pixel text-xs">中文</span>
                                </button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="text-muted-foreground font-pixel text-[10px] leading-relaxed">
                                Language support coming soon.
                            </p>
                        </CardFooter>
                    </Card>

                    <Card className="font-pixel">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-600/10">
                                    <DatabaseIcon size={24} className="text-cyan-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold font-pixel text-foreground">
                                        Storage
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground font-pixel text-xs">
                                        Manage local data
                                    </CardDescription>
                                </div>
                            </div>
                            <CardAction>
                                <Button variant="destructive" size="sm" onClick={handlePurgeDatabase}>
                                    <DeleteIcon />
                                    Purge Database
                                </Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <h3 className="font-bold font-pixel text-sm text-foreground">Storage Usage</h3>
                            <div className="text-muted-foreground font-pixel text-xs">
                                {storageEstimate ? (
                                    <div className="space-y-1">
                                        <p>
                                            {formatStorageSize(storageEstimate.usage)} used
                                            {storageEstimate.quota && (
                                                <span> of {formatStorageSize(storageEstimate.quota)}</span>
                                            )}
                                        </p>
                                        {storageEstimate.quota && storageEstimate.usage > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {((storageEstimate.usage / storageEstimate.quota) * 100).toFixed(1)}%
                                                used
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p>Storage estimate unavailable</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="text-muted-foreground font-pixel text-[10px] leading-relaxed">
                                All data is stored on device. Clearing the database will permanently delete all
                                simulation history.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
