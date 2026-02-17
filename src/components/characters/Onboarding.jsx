import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/components/ui/download";
import { UserRoundPlusIcon } from "@/components/ui/user-round-plus";
import { useCharacterSlots } from "@/hooks/useCharacterSlots";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const Onboarding = ({ slotNumber, onComplete }) => {
    const [importData, setImportData] = useState("");
    const [status, setStatus] = useState({ type: null, message: "" });
    const { importCharacter, saveSlot } = useCharacterSlots();

    const handleImport = () => {
        if (!importData.trim()) {
            setStatus({ type: "error", message: "Please paste your character data first." });
            return;
        }

        const result = importCharacter(slotNumber, importData);
        if (result.success) {
            setStatus({ type: "success", message: "Character imported successfully!" });
            onComplete();
        } else {
            setStatus({ type: "error", message: result.error });
        }
    };

    const handleCreateManually = () => {
        const defaultCharacter = {
            name: `Slot ${slotNumber}`,
            player: {
                attackLevel: 1,
                magicLevel: 1,
                meleeLevel: 1,
                intelligenceLevel: 1,
                staminaLevel: 1,
                defenseLevel: 1,
                rangedLevel: 1,
                equipment: [],
            },
            food: {
                "/action_types/combat": [{ itemHrid: "" }, { itemHrid: "" }, { itemHrid: "" }],
            },
            drinks: {
                "/action_types/combat": [{ itemHrid: "" }, { itemHrid: "" }, { itemHrid: "" }],
            },
            abilities: [
                { abilityHrid: "", level: "1" },
                { abilityHrid: "", level: "1" },
                { abilityHrid: "", level: "1" },
                { abilityHrid: "", level: "1" },
                { abilityHrid: "", level: "1" },
            ],
            triggerMap: {},
            houseRooms: {},
            achievements: {},
        };
        saveSlot(slotNumber, defaultCharacter);
        onComplete();
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="text-center py-8 space-y-4">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto">
                        <UserRoundPlusIcon size={40} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-pixel text-foreground">Create New Character</h2>
                        <p className="text-muted-foreground font-pixel text-xs mt-1">Slot {slotNumber}</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-pixel tracking-wide text-sm">Import from MilkyWayIdle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-muted-foreground font-pixel text-xs">
                                Quickly set up your character by importing data from the game.
                            </p>

                            <div className="bg-sidebar-accent/30 border border-sidebar-border rounded-xl p-3 space-y-2">
                                <p className="font-bold font-pixel text-[10px] text-foreground">How to Import:</p>
                                <ol className="text-muted-foreground font-pixel text-[10px] list-decimal list-inside space-y-1">
                                    <li>Open MilkyWayIdle in another tab</li>
                                    <li>Go to your character profile</li>
                                    <li>Click "Export" to copy data</li>
                                    <li>Paste below and import</li>
                                </ol>
                            </div>

                            <textarea
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                                placeholder="Paste JSON data here..."
                                className="w-full h-32 bg-sidebar-accent/50 border border-sidebar-border rounded-xl p-3 font-mono text-xs text-foreground resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                            />

                            {status.message && (
                                <div
                                    className={`p-2 rounded-lg font-pixel text-xs ${
                                        status.type === "error"
                                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                            : "bg-green-500/10 text-green-500 border border-green-500/20"
                                    }`}
                                >
                                    {status.message}
                                </div>
                            )}

                            <Button
                                onClick={handleImport}
                                className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-pixel text-xs rounded-xl"
                            >
                                <DownloadIcon size={14} className="mr-2" />
                                Import Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-pixel tracking-wide text-sm">Create Manually</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-muted-foreground font-pixel text-xs">
                                Set up your character by manually entering stats and equipment.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-sidebar-accent/30 rounded-lg">
                                    <div className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center text-green-500 font-pixel text-xs font-bold">
                                        1
                                    </div>
                                    <span className="font-pixel text-xs text-foreground">Set skill levels</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-sidebar-accent/30 rounded-lg">
                                    <div className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center text-green-500 font-pixel text-xs font-bold">
                                        2
                                    </div>
                                    <span className="font-pixel text-xs text-foreground">Configure equipment</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-sidebar-accent/30 rounded-lg">
                                    <div className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center text-green-500 font-pixel text-xs font-bold">
                                        3
                                    </div>
                                    <span className="font-pixel text-xs text-foreground">Set up consumables</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleCreateManually}
                            variant="outline"
                            className="w-full h-10 border-sidebar-border font-pixel text-xs rounded-xl"
                        >
                            Start Manual Setup
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Onboarding;
