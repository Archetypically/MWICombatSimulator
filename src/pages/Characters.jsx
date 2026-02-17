import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCharacterSlots } from "@/hooks/useCharacterSlots";
import { CharacterEditor, Onboarding } from "@/components/characters";

export default function Characters() {
    const { slotNumber } = useParams();
    const { isLoaded, getSlot, isSlotActive } = useCharacterSlots();
    const selectedSlot = parseInt(slotNumber) || 1;
    const [showOnboarding, setShowOnboarding] = useState(false);

    const currentSlot = getSlot(selectedSlot);
    const slotActive = isSlotActive(selectedSlot);

    useEffect(() => {
        if (isLoaded && currentSlot && !slotActive) {
            setShowOnboarding(true);
        } else {
            setShowOnboarding(false);
        }
    }, [isLoaded, currentSlot, slotActive]);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        window.location.reload();
    };

    if (!isLoaded) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-bold font-pixel text-foreground tracking-wide">Characters</h1>
                <div className="bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                    <p className="text-muted-foreground font-pixel text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold font-pixel text-foreground tracking-wide">Characters</h1>
            {showOnboarding ? (
                <Onboarding slotNumber={selectedSlot} onComplete={handleOnboardingComplete} />
            ) : (
                <CharacterEditor slotNumber={selectedSlot} slotData={currentSlot} onUpdate={() => {}} />
            )}
        </div>
    );
}
