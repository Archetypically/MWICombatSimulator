import React, { useState, useEffect } from "react";
import { useCombatSimulator } from "@/hooks/useCombatSimulator";
import { useCharacterSlots } from "@/hooks/useCharacterSlots";
import { useSimulationHistory } from "@/contexts/SimulationHistoryContext";
import { convertSlotsToPlayerDTOs } from "@/lib/playerDtoConverter";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayIcon } from "@/components/ui/play";
import { TargetSelector } from "@/components/simulator/TargetSelector";
import { SimulationDurationControl } from "@/components/simulator/SimulationDurationControl";
import { SettingsPanel } from "@/components/simulator/SettingsPanel";
import { PartyMemberSelector } from "@/components/simulator";
import { EmptyState } from "@/components/simulator/EmptyState";
import { ResultsDashboard } from "@/components/simulator/ResultsDashboard";
import { SquareIcon } from "@/components/ui/square";
import { useNavigate } from "react-router-dom";
import { actionDetailMap } from "@/lib/dataLoader";

export default function Simulator() {
    const { isSimulating, progress, result, error, startSimulation, stopSimulation, marketplaceData } =
        useCombatSimulator();
    const { slots, isLoaded, isSlotActive } = useCharacterSlots();
    const { addRun } = useSimulationHistory();
    const navigate = useNavigate();
    const [hasResults, setHasResults] = useState(false);

    // Settings state - all default to enabled
    const [moopassEnabled, setMoopassEnabled] = useState(true);
    const [globalExpBuffEnabled, setGlobalExpBuffEnabled] = useState(true);
    const [globalExpBuffTier, setGlobalExpBuffTier] = useState(20);
    const [globalDropBuffEnabled, setGlobalDropBuffEnabled] = useState(true);
    const [globalDropBuffTier, setGlobalDropBuffTier] = useState(20);

    // Target selection state
    const [selectedTarget, setSelectedTarget] = useState("");
    const [targetDifficulty, setTargetDifficulty] = useState(0);

    // Simulation duration state (in hours) - default 24, min 1, max 48
    const [simulationDuration, setSimulationDuration] = useState(24);

    // Party member selection - max 3 members
    const [selectedPartyMembers, setSelectedPartyMembers] = useState([]);

    // Get max party size for selected target (1 for single monsters, 3 for zones, 5 for dungeons)
    const targetMaxPartySize = React.useMemo(() => {
        if (!selectedTarget) return 1;
        const action = actionDetailMap()[selectedTarget];
        if (!action) return 1;
        // Use the maxPartySize field from the action data (1, 3, or 5)
        return action.maxPartySize || 1;
    }, [selectedTarget]);

    const targetAllowsMultiplePlayers = targetMaxPartySize > 1;

    // Update party members when slots load - only set initial selection once
    useEffect(() => {
        if (isLoaded && selectedPartyMembers.length === 0) {
            // Find first active slot to select by default
            const firstActiveSlot = slots.find((slot) => isSlotActive(slot.slotNumber));
            if (firstActiveSlot) {
                setSelectedPartyMembers([String(firstActiveSlot.slotNumber)]);
            }
        }
    }, [isLoaded, slots, isSlotActive, selectedPartyMembers.length]);

    // Update hasResults when result changes
    useEffect(() => {
        if (result) {
            setHasResults(true);
        }
    }, [result]);

    // Save simulation to history when results come in
    const simulationConfigRef = React.useRef(null);

    useEffect(() => {
        const saveAndNavigate = async () => {
            if (result && simulationConfigRef.current) {
                const id = await addRun(simulationConfigRef.current, result);
                simulationConfigRef.current = null;
                // Navigate to the UUID route
                navigate(`/simulator/${id}`);
            }
        };
        saveAndNavigate();
    }, [result, addRun, navigate]);

    const handleStartSimulation = () => {
        if (!selectedTarget || selectedPartyMembers.length === 0) {
            return;
        }

        // Build player DTOs from selected party members using utility function
        const playerDTOs = convertSlotsToPlayerDTOs(slots, selectedPartyMembers);

        // Build config for history
        const config = {
            players: playerDTOs,
            zoneHrid: selectedTarget,
            difficultyTier: targetDifficulty,
            simulationDuration,
            settings: {
                moopassEnabled,
                comExpBuffEnabled: globalExpBuffEnabled,
                comExpBuffTier: globalExpBuffTier,
                comDropBuffEnabled: globalDropBuffEnabled,
                comDropBuffTier: globalDropBuffTier,
            },
        };

        // Store config to be saved when results come back
        simulationConfigRef.current = config;

        // Start the simulation
        startSimulation(config);
    };

    const handleTargetChange = (target) => {
        setSelectedTarget(target);
        // Parse difficulty from target if included
        // Target could be "zone_hrid/difficulty" format
        if (target.includes("/difficulty-")) {
            const parts = target.split("/difficulty-");
            setSelectedTarget(parts[0]);
            setTargetDifficulty(parseInt(parts[1], 10) || 0);
        } else {
            setTargetDifficulty(0);
        }

        // Check if new target allows multiple players and reset party if needed
        const action = actionDetailMap[target];
        const maxPartySize = action?.maxPartySize || 1;
        if (selectedPartyMembers.length > maxPartySize) {
            // Trim party to fit new max size
            setSelectedPartyMembers(selectedPartyMembers.slice(0, maxPartySize));
        }
    };

    // Check if we can start simulation
    const canStart = selectedTarget && selectedPartyMembers.length > 0 && !isSimulating && marketplaceData;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-pixel text-foreground tracking-wide">Simulator</h1>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg font-pixel text-sm">
                    Error: {error}
                </div>
            )}

            {/* Settings Row */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-pixel text-lg">Settings</CardTitle>
                    <CardAction>
                        {/* Run Button Row */}
                        <div className="flex items-center justify-end">
                            {isSimulating ? (
                                <div className="flex items-center gap-4 w-full max-w-md">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-pixel text-xs text-muted-foreground">Progress</span>
                                            <span className="font-pixel text-xs">{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                    <Button
                                        onClick={stopSimulation}
                                        variant="destructive"
                                        className="font-pixel"
                                        size="sm"
                                    >
                                        <SquareIcon size={16} className="mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleStartSimulation}
                                    className="font-pixel"
                                    size="sm"
                                    disabled={!canStart}
                                >
                                    <PlayIcon size={16} />
                                    Run Simulation
                                </Button>
                            )}
                        </div>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Top Row - 4 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Target Selection */}
                        <div className="flex flex-col gap-2">
                            <label className="font-pixel text-sm text-muted-foreground">Target</label>
                            <TargetSelector
                                mode="single"
                                value={selectedTarget}
                                onChange={handleTargetChange}
                                placeholder="Select target..."
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

                    {/* Party Members - Full Width */}
                    <PartyMemberSelector
                        selectedPartyMembers={selectedPartyMembers}
                        onChange={setSelectedPartyMembers}
                        maxPartySize={targetMaxPartySize}
                        slots={slots}
                        isLoaded={isLoaded}
                        isSlotActive={isSlotActive}
                        warningMessage={selectedTarget ? "This target only supports single player" : ""}
                    />
                </CardContent>
            </Card>

            {/* Results Dashboard - Bento Grid */}
            {!hasResults ? (
                <Card>
                    <CardContent className="py-12">
                        <EmptyState onStart={handleStartSimulation} isLoading={isSimulating} progress={progress} />
                    </CardContent>
                </Card>
            ) : (
                <ResultsDashboard result={result} />
            )}
        </div>
    );
}
