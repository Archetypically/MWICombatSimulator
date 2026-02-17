import React, { useState } from "react";
import { UsersIcon } from "@/components/ui/users";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";

// Placeholder for bottom sheet component - replace with actual import when available
// import { BottomSheet } from "@/components/ui/bottom-sheet";

export default function MobilePartySelector({
    selectedPartyMembers,
    onChange,
    maxPartySize,
    slots,
    isLoaded,
    isSlotActive,
    warningMessage,
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggleMember = (slotNumber) => {
        const slotString = String(slotNumber);
        const isSelected = selectedPartyMembers.includes(slotString);

        if (isSelected) {
            // Remove from selection
            const newSelection = selectedPartyMembers.filter((id) => id !== slotString);
            if (newSelection.length > 0) {
                onChange(newSelection);
            }
        } else {
            // Add to selection, respecting max party size
            if (selectedPartyMembers.length >= maxPartySize) {
                // Replace oldest selection
                const newSelection = [...selectedPartyMembers.slice(1), slotString];
                onChange(newSelection);
            } else {
                onChange([...selectedPartyMembers, slotString]);
            }
        }
    };

    const selectedCount = selectedPartyMembers.length;

    return (
        <div className="space-y-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="w-full font-pixel text-xs justify-between">
                        <span className="flex items-center gap-2">
                            <UsersIcon size={14} />
                            Select Party Members
                        </span>
                        <span className="text-muted-foreground">
                            ({selectedCount}/{maxPartySize})
                        </span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                    <SheetHeader>
                        <SheetTitle className="font-pixel text-sm">Select Party Members</SheetTitle>
                        <SheetDescription className="font-pixel text-xs">
                            Choose up to {maxPartySize} party members for the simulation.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-4 space-y-3">
                        {warningMessage && maxPartySize === 1 && (
                            <div className="flex items-center gap-2 text-[10px] text-amber-600 font-pixel px-1">
                                <UsersIcon size={12} />
                                <span>{warningMessage}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            {isLoaded &&
                                slots.map((slot) => {
                                    const isActive = isSlotActive(slot.slotNumber);
                                    const isSelected = selectedPartyMembers.includes(String(slot.slotNumber));

                                    return (
                                        <div
                                            key={slot.slotNumber}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                                isActive
                                                    ? isSelected
                                                        ? "bg-primary/10 border-primary"
                                                        : "bg-background border-border"
                                                    : "bg-muted/50 border-border opacity-60"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${
                                                        isActive ? "bg-green-500" : "bg-gray-400"
                                                    }`}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-pixel text-xs">{slot.name}</span>
                                                    <span className="font-pixel text-[10px] text-muted-foreground">
                                                        Slot {slot.slotNumber}
                                                        {!isActive && " (Inactive)"}
                                                    </span>
                                                </div>
                                            </div>

                                            <Switch
                                                checked={isSelected}
                                                onCheckedChange={() => handleToggleMember(slot.slotNumber)}
                                                disabled={!isActive}
                                                size="sm"
                                            />
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="flex items-center justify-between px-1 pt-2">
                            <span className="font-pixel text-xs text-muted-foreground">
                                Selected: {selectedCount}/{maxPartySize}
                            </span>
                            {selectedCount >= maxPartySize && (
                                <span className="font-pixel text-[10px] text-amber-600">Max party size reached</span>
                            )}
                        </div>
                    </div>

                    <SheetFooter className="flex-row gap-2">
                        <SheetClose asChild>
                            <Button variant="outline" className="flex-1 font-pixel text-xs">
                                Cancel
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                            <Button className="flex-1 font-pixel text-xs">Done ({selectedCount})</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {warningMessage && maxPartySize === 1 && (
                <div className="flex items-center gap-2 text-[10px] text-amber-600 font-pixel">
                    <UsersIcon size={12} />
                    <span>{warningMessage}</span>
                </div>
            )}
        </div>
    );
}
