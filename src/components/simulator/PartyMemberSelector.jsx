import React from "react";
import { UsersIcon } from "@/components/ui/users";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import MobilePartySelector from "@/components/mobile/MobilePartySelector";

export function PartyMemberSelector({
    selectedPartyMembers,
    onChange,
    maxPartySize,
    slots,
    isLoaded,
    isSlotActive,
    warningMessage,
}) {
    const isMobile = useIsMobile();

    // Use mobile version on small screens
    if (isMobile) {
        return (
            <MobilePartySelector
                selectedPartyMembers={selectedPartyMembers}
                onChange={onChange}
                maxPartySize={maxPartySize}
                slots={slots}
                isLoaded={isLoaded}
                isSlotActive={isSlotActive}
                warningMessage={warningMessage}
            />
        );
    }

    const handleValueChange = (value) => {
        if (value.length === 0) return;
        if (value.length > maxPartySize) {
            onChange(value.slice(-maxPartySize));
        } else {
            onChange(value);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="font-pixel text-sm text-muted-foreground">
                    Party Members
                    <span className="ml-2 text-[10px] text-muted-foreground">(Max {maxPartySize})</span>
                </label>
                <span className="font-pixel text-[10px] text-muted-foreground">
                    {selectedPartyMembers.length}/{maxPartySize}
                </span>
            </div>
            {warningMessage && maxPartySize === 1 && (
                <div className="flex items-center gap-2 text-[10px] text-amber-600 font-pixel">
                    <UsersIcon size={12} />
                    <span>{warningMessage}</span>
                </div>
            )}
            <ToggleGroup
                type="multiple"
                value={selectedPartyMembers}
                onValueChange={handleValueChange}
                className="w-full"
                variant="outline"
            >
                {isLoaded &&
                    slots.map((slot) => {
                        const isActive = isSlotActive(slot.slotNumber);
                        const isSelected = selectedPartyMembers.includes(String(slot.slotNumber));
                        return (
                            <ToggleGroupItem
                                key={slot.slotNumber}
                                value={String(slot.slotNumber)}
                                aria-label={`Select ${slot.name}`}
                                className={`font-pixel text-xs flex-1 transition-all ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
                                        : ""
                                }`}
                                disabled={!isActive}
                            >
                                {slot.name}
                            </ToggleGroupItem>
                        );
                    })}
            </ToggleGroup>
        </div>
    );
}
