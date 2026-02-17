"use client";

import * as React from "react";
import { ItemComboBox, ItemGroup, ItemOption } from "./ItemComboBox";
import { useCharacter, checkRequirements } from "@/contexts/CharacterContext";
import { itemDetailMap } from "@/lib/dataLoader";

// Map equipment slot hrids to equipment types
const slotToEquipmentType: Record<string, string> = {
    "/item_locations/head": "/equipment_types/head",
    "/item_locations/body": "/equipment_types/body",
    "/item_locations/legs": "/equipment_types/legs",
    "/item_locations/feet": "/equipment_types/feet",
    "/item_locations/hands": "/equipment_types/hands",
    "/item_locations/main_hand": "/equipment_types/main_hand",
    "/item_locations/off_hand": "/equipment_types/off_hand",
    "/item_locations/two_hand": "/equipment_types/two_hand",
    "/item_locations/neck": "/equipment_types/neck",
    "/item_locations/ring": "/equipment_types/ring",
    "/item_locations/earrings": "/equipment_types/earrings",
    "/item_locations/pouch": "/equipment_types/pouch",
    "/item_locations/back": "/equipment_types/back",
    "/item_locations/trinket": "/equipment_types/trinket",
    "/item_locations/charm": "/equipment_types/charm",
    "/item_locations/milking_tool": "/equipment_types/milking_tool",
    "/item_locations/foraging_tool": "/equipment_types/foraging_tool",
    "/item_locations/woodcutting_tool": "/equipment_types/woodcutting_tool",
    "/item_locations/cheesesmithing_tool": "/equipment_types/cheesesmithing_tool",
    "/item_locations/crafting_tool": "/equipment_types/crafting_tool",
    "/item_locations/tailoring_tool": "/equipment_types/tailoring_tool",
    "/item_locations/cooking_tool": "/equipment_types/cooking_tool",
    "/item_locations/brewing_tool": "/equipment_types/brewing_tool",
    "/item_locations/alchemy_tool": "/equipment_types/alchemy_tool",
    "/item_locations/enhancing_tool": "/equipment_types/enhancing_tool",
};

// Helper function to get item level requirement
function getItemLevelRequirement(item: any): number {
    if (item.equipmentDetail?.levelRequirements?.length > 0) {
        return item.equipmentDetail.levelRequirements[0].level;
    }
    return item.itemLevel || 0;
}

// Helper function to get the primary skill requirement for an item
function getPrimarySkillHrid(item: any): string | null {
    if (item.equipmentDetail?.levelRequirements?.length > 0) {
        return item.equipmentDetail.levelRequirements[0].skillHrid;
    }
    return null;
}

// Helper function to format skill hrid to readable name
function formatSkillHrid(skillHrid: string): string {
    const parts = skillHrid.split("/");
    const skillName = parts[parts.length - 1];
    return skillName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Build equipment options with disabled states
function buildEquipmentOptions(equipmentType: string, skillLevels: Record<string, number>): ItemGroup[] {
    const items = Object.values(itemDetailMap()).filter(
        (item: any) =>
            item.categoryHrid === "/item_categories/equipment" && item.equipmentDetail?.type === equipmentType,
    ) as any[];

    // Group items by their primary skill requirement
    const grouped = new Map<string, any[]>();

    items.forEach((item) => {
        const skillHrid = getPrimarySkillHrid(item) || "other";
        if (!grouped.has(skillHrid)) {
            grouped.set(skillHrid, []);
        }
        grouped.get(skillHrid)!.push(item);
    });

    // Convert to ItemGroup array with disabled states
    return Array.from(grouped.entries())
        .map(([skillHrid, groupItems]) => ({
            label: skillHrid === "other" ? "Other" : formatSkillHrid(skillHrid),
            items: groupItems
                .map((item: any) => {
                    const requirements = item.equipmentDetail?.levelRequirements;
                    const disabledReason = checkRequirements(requirements, skillLevels);

                    return {
                        value: item.hrid,
                        label: item.name,
                        description: disabledReason ? undefined : `Level ${getItemLevelRequirement(item)}`,
                        disabled: !!disabledReason,
                        disabledReason: disabledReason || undefined,
                        _sortLevel: getItemLevelRequirement(item),
                    };
                })
                .sort((a: any, b: any) => a._sortLevel - b._sortLevel)
                .map(({ _sortLevel, ...rest }) => rest as ItemOption),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

// Cache for base equipment options (without disabled states)
const equipmentItemsCache: Record<string, any[]> = {};

function getEquipmentItems(equipmentType: string): any[] {
    if (!equipmentItemsCache[equipmentType]) {
        equipmentItemsCache[equipmentType] = Object.values(itemDetailMap()).filter(
            (item: any) =>
                item.categoryHrid === "/item_categories/equipment" && item.equipmentDetail?.type === equipmentType,
        );
    }
    return equipmentItemsCache[equipmentType];
}

// Base interface for all equipment combo box props
interface EquipmentComboBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

// Generic Equipment ComboBox (for custom slots)
export function EquipmentComboBox({
    slotHrid,
    value,
    onChange,
    placeholder = "Select equipment...",
    disabled = false,
}: EquipmentComboBoxProps & { slotHrid: string }) {
    const equipmentType = slotToEquipmentType[slotHrid];
    const character = useCharacter();
    const skillLevels = character?.skillLevels || {};

    const groups = React.useMemo(() => {
        if (!equipmentType) return [];
        return buildEquipmentOptions(equipmentType, skillLevels);
    }, [equipmentType, skillLevels]);

    return (
        <ItemComboBox value={value} onChange={onChange} placeholder={placeholder} groups={groups} disabled={disabled} />
    );
}

// Helper to create equipment combo box component
function createEquipmentComboBox(equipmentType: string, placeholder: string) {
    return function EquipmentComboBoxComponent({ value, onChange, disabled }: EquipmentComboBoxProps) {
        const character = useCharacter();
        const skillLevels = character?.skillLevels || {};

        const groups = React.useMemo(() => {
            return buildEquipmentOptions(equipmentType, skillLevels);
        }, [skillLevels]);

        return (
            <ItemComboBox
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                groups={groups}
                disabled={disabled}
            />
        );
    };
}

// Charm ComboBox
export const CharmComboBox = createEquipmentComboBox("/equipment_types/charm", "Select charm...");

// Pouch ComboBox
export const PouchComboBox = createEquipmentComboBox("/equipment_types/pouch", "Select pouch...");

// Head ComboBox
export const HeadComboBox = createEquipmentComboBox("/equipment_types/head", "Select head...");

// Body ComboBox
export const BodyComboBox = createEquipmentComboBox("/equipment_types/body", "Select body...");

// Legs ComboBox
export const LegsComboBox = createEquipmentComboBox("/equipment_types/legs", "Select legs...");

// Feet ComboBox
export const FeetComboBox = createEquipmentComboBox("/equipment_types/feet", "Select feet...");

// Hands ComboBox
export const HandsComboBox = createEquipmentComboBox("/equipment_types/hands", "Select hands...");

// Main Hand ComboBox
export const MainHandComboBox = createEquipmentComboBox("/equipment_types/main_hand", "Select main hand...");

// Off Hand ComboBox
export const OffHandComboBox = createEquipmentComboBox("/equipment_types/off_hand", "Select off hand...");

// Two Hand ComboBox
export const TwoHandComboBox = createEquipmentComboBox("/equipment_types/two_hand", "Select two hand...");

// Neck ComboBox
export const NeckComboBox = createEquipmentComboBox("/equipment_types/neck", "Select neck...");

// Ring ComboBox
export const RingComboBox = createEquipmentComboBox("/equipment_types/ring", "Select ring...");

// Earrings ComboBox
export const EarringsComboBox = createEquipmentComboBox("/equipment_types/earrings", "Select earrings...");

// Back ComboBox
export const BackComboBox = createEquipmentComboBox("/equipment_types/back", "Select back...");

// Trinket ComboBox
export const TrinketComboBox = createEquipmentComboBox("/equipment_types/trinket", "Select trinket...");

// Tool ComboBoxes
export const MilkingToolComboBox = createEquipmentComboBox("/equipment_types/milking_tool", "Select milking tool...");
export const ForagingToolComboBox = createEquipmentComboBox(
    "/equipment_types/foraging_tool",
    "Select foraging tool...",
);
export const WoodcuttingToolComboBox = createEquipmentComboBox(
    "/equipment_types/woodcutting_tool",
    "Select woodcutting tool...",
);
export const CheesesmithingToolComboBox = createEquipmentComboBox(
    "/equipment_types/cheesesmithing_tool",
    "Select cheesesmithing tool...",
);
export const CraftingToolComboBox = createEquipmentComboBox(
    "/equipment_types/crafting_tool",
    "Select crafting tool...",
);
export const TailoringToolComboBox = createEquipmentComboBox(
    "/equipment_types/tailoring_tool",
    "Select tailoring tool...",
);
export const CookingToolComboBox = createEquipmentComboBox("/equipment_types/cooking_tool", "Select cooking tool...");
export const BrewingToolComboBox = createEquipmentComboBox("/equipment_types/brewing_tool", "Select brewing tool...");
export const AlchemyToolComboBox = createEquipmentComboBox("/equipment_types/alchemy_tool", "Select alchemy tool...");
export const EnhancingToolComboBox = createEquipmentComboBox(
    "/equipment_types/enhancing_tool",
    "Select enhancing tool...",
);
