"use client";

import * as React from "react";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxValue,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxSeparator,
} from "@/components/ui/combobox";
import { itemDetailMap } from "@/lib/dataLoader";

export interface ItemOption {
    value: string;
    label: string;
    description?: string;
    group?: string;
    /** If true, item is selectable but shown with warning styling */
    disabled?: boolean;
    /** Warning message shown when disabled (e.g., "⚠ Requires Ranged 95") */
    disabledReason?: string;
}

export interface ItemGroup {
    label: string;
    items: ItemOption[];
}

interface ItemComboBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    items?: ItemOption[];
    groups?: ItemGroup[];
    disabled?: boolean;
}

export function ItemComboBox({
    value,
    onChange,
    placeholder = "Select item...",
    items,
    groups,
    disabled = false,
}: ItemComboBoxProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);

    // Flatten items for finding selected label
    const allItems = React.useMemo(() => {
        if (groups) {
            return groups.flatMap((g) => g.items);
        }
        return items || [];
    }, [groups, items]);

    // Get the selected item's label for display
    const selectedItem = allItems.find((item) => item.value === value);

    // Filter groups/items based on search query
    const filteredGroups = React.useMemo(() => {
        if (!groups) {
            if (!searchQuery.trim()) return items || [];
            const query = searchQuery.toLowerCase();
            return (items || []).filter(
                (item) => item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query),
            );
        }

        if (!searchQuery.trim()) return groups;
        const query = searchQuery.toLowerCase();
        return groups
            .map((group) => ({
                ...group,
                items: group.items.filter(
                    (item) => item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query),
                ),
            }))
            .filter((group) => group.items.length > 0);
    }, [groups, items, searchQuery]);

    // Handle selection change
    const handleValueChange = (newValue: string) => {
        onChange(newValue);
        setSearchQuery("");
    };

    // When closed, show selected label; when open, show search query
    const inputValue = isOpen ? searchQuery : selectedItem?.label || "";

    const hasGroups = groups !== undefined;

    return (
        <Combobox
            value={value}
            onValueChange={handleValueChange}
            disabled={disabled}
            open={isOpen}
            onOpenChange={setIsOpen}
            autoHighlight
        >
            <ComboboxInput
                placeholder={selectedItem?.label || placeholder}
                value={inputValue}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isOpen) {
                        setIsOpen(true);
                    }
                }}
                showTrigger={true}
                showClear={!!value}
                className="font-pixel text-xs h-8 w-full"
            />
            <ComboboxContent>
                <ComboboxList>
                    {hasGroups ? (
                        (filteredGroups as ItemGroup[]).length === 0 ? (
                            <ComboboxEmpty>No items found</ComboboxEmpty>
                        ) : (
                            (filteredGroups as ItemGroup[]).map((group, index) => (
                                <React.Fragment key={group.label}>
                                    {index > 0 && <ComboboxSeparator />}
                                    <ComboboxGroup>
                                        <ComboboxLabel className="font-pixel text-xs font-semibold">
                                            {group.label}
                                        </ComboboxLabel>
                                        {group.items.map((item) => (
                                            <ComboboxItem
                                                key={item.value}
                                                value={item.value}
                                                className={`font-pixel text-xs ${item.disabled ? "text-amber-600 dark:text-amber-400" : ""}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{item.label}</span>
                                                    {item.disabled && item.disabledReason ? (
                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                                            {item.disabledReason}
                                                        </span>
                                                    ) : item.description ? (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {item.description}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </ComboboxItem>
                                        ))}
                                    </ComboboxGroup>
                                </React.Fragment>
                            ))
                        )
                    ) : (filteredGroups as ItemOption[]).length === 0 ? (
                        <ComboboxEmpty>No items found</ComboboxEmpty>
                    ) : (
                        (filteredGroups as ItemOption[]).map((item) => (
                            <ComboboxItem
                                key={item.value}
                                value={item.value}
                                className={`font-pixel text-xs ${item.disabled ? "text-amber-600 dark:text-amber-400" : ""}`}
                            >
                                <div className="flex flex-col">
                                    <span>{item.label}</span>
                                    {item.disabled && item.disabledReason ? (
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                            {item.disabledReason}
                                        </span>
                                    ) : item.description ? (
                                        <span className="text-[10px] text-muted-foreground">{item.description}</span>
                                    ) : null}
                                </div>
                            </ComboboxItem>
                        ))
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

// Helper function to get item level requirement
function getItemLevelRequirement(item: any): number {
    // For equipment, use the first level requirement if available
    if (item.equipmentDetail?.levelRequirements?.length > 0) {
        return item.equipmentDetail.levelRequirements[0].level;
    }
    // Fall back to itemLevel for all items
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

// Helper function to build item options from itemDetailMap
export function buildItemOptions(filterFn: (item: any) => boolean): ItemOption[] {
    return Object.values(itemDetailMap())
        .filter(filterFn)
        .map((item: any) => ({
            value: item.hrid,
            label: item.name,
            description: `Level ${getItemLevelRequirement(item)}`,
            _sortLevel: getItemLevelRequirement(item),
        }))
        .sort((a: any, b: any) => a._sortLevel - b._sortLevel)
        .map(({ _sortLevel, ...rest }) => rest as ItemOption);
}

// Helper function to build grouped item options from itemDetailMap, grouped by skill requirement
export function buildGroupedItemOptions(filterFn: (item: any) => boolean): ItemGroup[] {
    const items = Object.values(itemDetailMap()).filter(filterFn) as any[];

    // Group items by their primary skill requirement
    const grouped = new Map<string, any[]>();

    items.forEach((item) => {
        const skillHrid = getPrimarySkillHrid(item) || "other";
        if (!grouped.has(skillHrid)) {
            grouped.set(skillHrid, []);
        }
        grouped.get(skillHrid)!.push(item);
    });

    // Convert to ItemGroup array, sorted by skill name
    return Array.from(grouped.entries())
        .map(([skillHrid, groupItems]) => ({
            label: skillHrid === "other" ? "Other" : formatSkillHrid(skillHrid),
            items: groupItems
                .map((item: any) => ({
                    value: item.hrid,
                    label: item.name,
                    description: `Level ${getItemLevelRequirement(item)}`,
                    _sortLevel: getItemLevelRequirement(item),
                }))
                .sort((a: any, b: any) => a._sortLevel - b._sortLevel)
                .map(({ _sortLevel, ...rest }) => rest as ItemOption),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
}
