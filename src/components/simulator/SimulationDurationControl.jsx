import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SquarePenIcon } from "lucide-react";

export function SimulationDurationControl({ value, onChange }) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(String(value));
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSliderChange = (newValue) => {
        onChange(newValue[0]);
    };

    const handleSubmit = () => {
        const numValue = parseInt(inputValue, 10);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 48) {
            onChange(numValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSubmit();
        } else if (e.key === "Escape") {
            setInputValue(String(value));
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        handleSubmit();
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="font-pixel text-sm text-muted-foreground">Simulation Duration</label>
                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <Input
                            ref={inputRef}
                            type="number"
                            min={1}
                            max={48}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            className="w-16 h-6 text-xs font-pixel text-right"
                        />
                        <span className="font-pixel text-xs text-foreground">hrs</span>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="font-pixel text-xs text-foreground hover:text-primary cursor-pointer transition-colors flex items-center gap-1 group"
                    >
                        {value} hours
                        <SquarePenIcon size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-muted-foreground">1</span>
                <Slider
                    min={1}
                    max={48}
                    step={1}
                    value={[value]}
                    onValueChange={handleSliderChange}
                    className="flex-1"
                />
                <span className="font-pixel text-xs text-muted-foreground">48</span>
            </div>
        </div>
    );
}
