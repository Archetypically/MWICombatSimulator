import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/components/ui/download";
import { useCharacterSlots } from "@/hooks/useCharacterSlots";

export const ImportModal = ({ slotNumber, onClose, onSuccess }) => {
    const [importData, setImportData] = useState("");
    const [status, setStatus] = useState({ type: null, message: "" });
    const { importCharacter } = useCharacterSlots();

    const handleImport = () => {
        if (!importData.trim()) {
            setStatus({ type: "error", message: "Please paste your character data first." });
            return;
        }

        const result = importCharacter(slotNumber, importData);
        if (result.success) {
            setStatus({ type: "success", message: "Character data imported successfully!" });
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } else {
            setStatus({ type: "error", message: result.error });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-sidebar border border-sidebar-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-pixel text-foreground">Import Character</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <DownloadIcon />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-sidebar-accent/30 border border-sidebar-border rounded-xl p-4 space-y-3">
                        <h3 className="font-bold font-pixel text-sm text-foreground">How to Import:</h3>
                        <ol className="space-y-2 text-muted-foreground font-pixel text-xs list-decimal list-inside">
                            <li>Open MilkyWayIdle in another tab</li>
                            <li>Go to your character profile</li>
                            <li>Click "Export" to copy your character data</li>
                            <li>Paste the JSON data below</li>
                            <li>Click Import to save</li>
                        </ol>
                    </div>

                    <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Paste your character JSON data here..."
                        className="w-full h-48 bg-sidebar-accent/50 border border-sidebar-border rounded-xl p-4 font-mono text-xs text-foreground resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    />

                    {status.message && (
                        <div
                            className={`p-3 rounded-lg font-pixel text-xs ${
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
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-pixel text-sm rounded-xl"
                    >
                        <DownloadIcon size={16} className="mr-2" />
                        Import Character Data
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
