"use client";

import * as React from "react";
import { ItemComboBox, ItemGroup, ItemOption } from "./ItemComboBox";
import { useCharacter, checkRequirements } from "@/contexts/CharacterContext";
import { abilityDetailMap, itemDetailMap } from "@/lib/dataLoader";

// Helper function to format combat style hrid to readable name
function formatCombatStyleHrid(styleHrid: string): string {
    if (!styleHrid) return "Other";
    const parts = styleHrid.split("/");
    const styleName = parts[parts.length - 1];
    return styleName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Helper function to get combat style for an ability book
function getAbilityCombatStyle(itemHrid: string): string | null {
    const abilityHrid = itemHrid.replace("/items/", "/abilities/");
    const ability = (abilityDetailMap() as any)[abilityHrid];
    if (ability && ability.abilityEffects && ability.abilityEffects.length > 0) {
        return ability.abilityEffects[0].combatStyleHrid || null;
    }
    return null;
}

// Helper function to convert abilityHrid to itemHrid
function abilityHridToItemHrid(abilityHrid: string): string | null {
    if (!abilityHrid) return null;
    // Find the ability book item that has this abilityHrid
    const abilityBook = Object.values(itemDetailMap()).find(
        (item: any) =>
            item.categoryHrid === "/item_categories/ability_book" &&
            item.abilityBookDetail?.abilityHrid === abilityHrid,
    ) as any;
    return abilityBook?.hrid || null;
}

// Helper function to convert itemHrid to abilityHrid
function itemHridToAbilityHrid(itemHrid: string): string | null {
    if (!itemHrid) return null;
    const item = (itemDetailMap() as any)[itemHrid];
    return item?.abilityBookDetail?.abilityHrid || null;
}

// Helper function to get item level
function getItemLevel(item: any): number {
    return item.itemLevel || 0;
}

// Build ability options with disabled states
function buildAbilityOptions(skillLevels: Record<string, number>): ItemGroup[] {
    const abilityBooks = Object.values(itemDetailMap()).filter(
        (item: any) => item.categoryHrid === "/item_categories/ability_book",
    ) as any[];

    // Group by combat style
    const grouped = new Map<string, any[]>();

    abilityBooks.forEach((item) => {
        const combatStyle = getAbilityCombatStyle(item.hrid) || "other";
        if (!grouped.has(combatStyle)) {
            grouped.set(combatStyle, []);
        }
        grouped.get(combatStyle)!.push(item);
    });

    // Convert to ItemGroup array with disabled states
    return Array.from(grouped.entries())
        .map(([combatStyle, groupItems]) => ({
            label: formatCombatStyleHrid(combatStyle),
            items: groupItems
                .map((item: any) => {
                    const requirements = item.abilityBookDetail?.levelRequirements;
                    const disabledReason = checkRequirements(requirements, skillLevels);

                    return {
                        value: item.hrid,
                        label: item.name,
                        description: disabledReason ? undefined : `Level ${getItemLevel(item)}`,
                        disabled: !!disabledReason,
                        disabledReason: disabledReason || undefined,
                        _sortLevel: getItemLevel(item),
                    };
                })
                .sort((a: any, b: any) => a._sortLevel - b._sortLevel)
                .map(({ _sortLevel, ...rest }) => rest as ItemOption),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

interface AbilityComboBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function AbilityComboBox({
    value,
    onChange,
    placeholder = "Select ability...",
    disabled = false,
}: AbilityComboBoxProps) {
    const character = useCharacter();
    const skillLevels = character?.skillLevels || {};

    const groups = React.useMemo(() => {
        return buildAbilityOptions(skillLevels);
    }, [skillLevels]);

    // Convert abilityHrid (from user data) to itemHrid (for combobox display)
    const itemValue = React.useMemo(() => {
        return abilityHridToItemHrid(value) || "";
    }, [value]);

    // Handle selection change - convert itemHrid back to abilityHrid
    const handleChange = React.useCallback(
        (selectedItemHrid: string) => {
            const abilityHrid = itemHridToAbilityHrid(selectedItemHrid);
            onChange(abilityHrid || "");
        },
        [onChange],
    );

    return (
        <ItemComboBox
            value={itemValue}
            onChange={handleChange}
            placeholder={placeholder}
            groups={groups}
            disabled={disabled}
        />
    );
}
