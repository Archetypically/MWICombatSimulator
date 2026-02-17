import React from "react";
import { Switch } from "@/components/ui/switch";
import { TierInput } from "@/components/ui/tier-input";
import { Label } from "@/components/ui/label";

function BuffToggle({ label, checked, onCheckedChange, tier, onTierChange, showTier = true, disabled = false }) {
    return (
        <div className="flex items-center gap-2">
            <Label className="font-pixel text-sm cursor-pointer">{label}</Label>
            <Switch checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-primary" />
            {showTier && (
                <TierInput value={tier} onChange={onTierChange} disabled={disabled || !checked} min={1} max={20} />
            )}
        </div>
    );
}

export function SettingsPanel({
    moopassEnabled,
    setMoopassEnabled,
    globalExpBuffEnabled,
    setGlobalExpBuffEnabled,
    globalExpBuffTier,
    setGlobalExpBuffTier,
    globalDropBuffEnabled,
    setGlobalDropBuffEnabled,
    globalDropBuffTier,
    setGlobalDropBuffTier,
}) {
    return (
        <div className="space-y-3">
            <Label className="font-pixel text-sm text-muted-foreground">Buffs</Label>
            <div className="flex flex-wrap items-center gap-4">
                <BuffToggle
                    label="Moopass"
                    checked={moopassEnabled}
                    onCheckedChange={setMoopassEnabled}
                    showTier={false}
                />

                <BuffToggle
                    label="Exp"
                    checked={globalExpBuffEnabled}
                    onCheckedChange={setGlobalExpBuffEnabled}
                    tier={globalExpBuffTier}
                    onTierChange={setGlobalExpBuffTier}
                />

                <BuffToggle
                    label="Drop"
                    checked={globalDropBuffEnabled}
                    onCheckedChange={setGlobalDropBuffEnabled}
                    tier={globalDropBuffTier}
                    onTierChange={setGlobalDropBuffTier}
                />
            </div>
        </div>
    );
}
