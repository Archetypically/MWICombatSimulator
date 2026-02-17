"use client";

import * as React from "react";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxSeparator,
} from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { actionDetailMap, combatMonsterDetailMap } from "@/lib/dataLoader";

export interface TargetOption {
    value: string;
    label: string;
    description?: string;
    group?: string;
    isSingleSpawn?: boolean;
    sortIndex: number;
}

export interface TargetGroup {
    label: string;
    items: TargetOption[];
}

// Shared helper functions
function formatCategoryName(categoryHrid: string): string {
    const parts = categoryHrid.split("/");
    const name = parts[parts.length - 1];
    return name
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function getMonsterExperience(monsterHrid: string): number | null {
    const monster = (combatMonsterDetailMap() as any)[monsterHrid];
    return monster?.experience || null;
}

function buildActionDescription(action: any): string | undefined {
    const isDungeon = action.combatZoneInfo?.isDungeon;

    if (isDungeon) {
        return undefined;
    }

    const fightInfo = action.combatZoneInfo?.fightInfo;
    if (!fightInfo) {
        return "";
    }

    const randomSpawnInfo = fightInfo.randomSpawnInfo;
    const maxSpawnCount = randomSpawnInfo?.maxSpawnCount;
    const spawns = randomSpawnInfo?.spawns || [];
    const maxTotalStrength = randomSpawnInfo?.maxTotalStrength;

    if (maxSpawnCount === 1 && spawns.length > 0) {
        const firstSpawn = spawns[0];
        const monsterHrid = firstSpawn?.combatMonsterHrid;
        const experience = monsterHrid ? getMonsterExperience(monsterHrid) : null;

        if (experience !== null) {
            return `${experience} XP`;
        }
    }

    const bossSpawns = fightInfo.bossSpawns || [];
    const battlesPerBoss = fightInfo.battlesPerBoss || 0;
    const numSpawns = spawns.length;
    const numBosses = bossSpawns.length;

    let details = [];

    if (maxTotalStrength !== undefined && maxTotalStrength !== null) {
        details.push(`Max Strength: ${maxTotalStrength}`);
    }

    if (numSpawns > 0) {
        details.push(`${numSpawns} possible spawn${numSpawns !== 1 ? "s" : ""}`);
    }

    if (battlesPerBoss > 0) {
        details.push(`${battlesPerBoss} battles/boss`);
    }

    if (numBosses > 0) {
        details.push(`${numBosses} possible boss${numBosses !== 1 ? "es" : ""}`);
    }

    return details.join(" • ");
}

function isSingleSpawnZone(action: any): boolean {
    if (action.combatZoneInfo?.isDungeon) return false;

    const fightInfo = action.combatZoneInfo?.fightInfo;
    if (!fightInfo) return false;

    const randomSpawnInfo = fightInfo.randomSpawnInfo;
    return randomSpawnInfo?.maxSpawnCount === 1;
}

function buildTargetGroups(): TargetGroup[] {
    const combatActions = Object.values(actionDetailMap()).filter(
        (action: any) => action.type === "/action_types/combat",
    );
    const groupedByCategory = new Map<string, { minSortIndex: number; items: TargetOption[] }>();

    combatActions.forEach((action: any) => {
        const category = action.category || "/action_categories/combat/uncategorized";
        const groupName = formatCategoryName(category);
        const isSingleSpawn = isSingleSpawnZone(action);

        const option: TargetOption = {
            value: action.hrid,
            label: action.name,
            description: buildActionDescription(action),
            isSingleSpawn,
            sortIndex: action.sortIndex,
        };

        if (!groupedByCategory.has(groupName)) {
            groupedByCategory.set(groupName, { minSortIndex: action.sortIndex, items: [] });
        } else {
            const current = groupedByCategory.get(groupName)!;
            if (action.sortIndex < current.minSortIndex) {
                current.minSortIndex = action.sortIndex;
            }
        }
        groupedByCategory.get(groupName)!.items.push(option);
    });

    const sortZones = (a: TargetOption, b: TargetOption) => {
        if (a.isSingleSpawn && !b.isSingleSpawn) return -1;
        if (!a.isSingleSpawn && b.isSingleSpawn) return 1;
        return a.sortIndex - b.sortIndex;
    };

    const groupsWithIndex = Array.from(groupedByCategory.entries())
        .map(([label, data]) => ({
            label,
            minSortIndex: data.minSortIndex,
            items: data.items.sort(sortZones),
        }))
        .sort((a, b) => a.minSortIndex - b.minSortIndex);

    return groupsWithIndex.map(({ label, items }) => ({ label, items }));
}

// Base props common to both modes
interface TargetSelectorBaseProps {
    placeholder?: string;
    disabled?: boolean;
}

// Single select mode props
interface TargetSelectorSingleProps extends TargetSelectorBaseProps {
    mode: "single";
    value: string;
    onChange: (value: string) => void;
}

// Multi select mode props
interface TargetSelectorMultiProps extends TargetSelectorBaseProps {
    mode: "multiple";
    values: string[];
    onChange: (values: string[]) => void;
}

type TargetSelectorProps = TargetSelectorSingleProps | TargetSelectorMultiProps;

export function TargetSelector(props: TargetSelectorProps) {
    const { mode, placeholder = "Select target...", disabled = false } = props;
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);

    const targetGroups = React.useMemo(() => buildTargetGroups(), []);

    const allItems = React.useMemo(() => {
        return targetGroups.flatMap((g) => g.items);
    }, [targetGroups]);

    // Get selected items based on mode
    const selectedValues = mode === "single" ? (props.value ? [props.value] : []) : props.values;

    const selectedItems = React.useMemo(() => {
        return allItems.filter((item) => selectedValues.includes(item.value));
    }, [allItems, selectedValues]);

    const filteredGroups = React.useMemo(() => {
        if (!searchQuery.trim()) return targetGroups;
        const query = searchQuery.toLowerCase();
        return targetGroups
            .map((group) => ({
                ...group,
                items: group.items.filter(
                    (item) => item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query),
                ),
            }))
            .filter((group) => group.items.length > 0);
    }, [searchQuery, targetGroups]);

    const handleValueChange = (newValue: string) => {
        if (mode === "single") {
            props.onChange(newValue);
            setSearchQuery("");
        } else {
            const currentValues = props.values;
            if (currentValues.includes(newValue)) {
                props.onChange(currentValues.filter((v) => v !== newValue));
            } else {
                props.onChange([...currentValues, newValue]);
            }
        }
    };

    const handleRemove = (valueToRemove: string) => {
        if (mode === "multiple") {
            props.onChange(props.values.filter((v) => v !== valueToRemove));
        }
    };

    const handleRemoveAll = () => {
        if (mode === "multiple") {
            props.onChange([]);
        }
    };

    // Get display value for input
    const selectedItem =
        mode === "single" && props.value ? allItems.find((item) => item.value === props.value) : undefined;

    const inputValue = isOpen ? searchQuery : selectedItem?.label || "";

    const inputPlaceholder =
        mode === "multiple" && props.values.length > 0
            ? `${props.values.length} target${props.values.length !== 1 ? "s" : ""} selected`
            : selectedItem?.label || placeholder;

    return (
        <div className={mode === "multiple" ? "space-y-2" : undefined}>
            <Combobox
                value={mode === "single" ? props.value : props.values.join(",")}
                onValueChange={handleValueChange}
                disabled={disabled}
                open={isOpen}
                onOpenChange={setIsOpen}
                autoHighlight
            >
                <ComboboxInput
                    placeholder={inputPlaceholder}
                    value={inputValue}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!isOpen) {
                            setIsOpen(true);
                        }
                    }}
                    showTrigger={true}
                    showClear={mode === "single" ? !!props.value : false}
                    className="font-pixel text-xs h-8 w-full"
                />
                <ComboboxContent>
                    <ComboboxList>
                        {filteredGroups.length === 0 ? (
                            <ComboboxEmpty>No targets found</ComboboxEmpty>
                        ) : (
                            <>
                                {mode === "multiple" && props.values.length > 0 && (
                                    <div className="px-2 py-1.5 border-b border-border">
                                        <button
                                            onClick={handleRemoveAll}
                                            className="text-xs text-muted-foreground hover:text-foreground font-pixel transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}
                                {filteredGroups.map((group, index) => (
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
                                                    className="font-pixel text-xs"
                                                >
                                                    <div className="flex flex-col flex-1">
                                                        <span>{item.label}</span>
                                                        {item.description && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {item.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {mode === "multiple" && props.values.includes(item.value) && (
                                                        <span className="ml-2 text-primary">✓</span>
                                                    )}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxGroup>
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>

            {/* Selected badges for multi-select mode */}
            {mode === "multiple" && selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedItems.map((item) => (
                        <Badge
                            key={item.value}
                            variant="secondary"
                            className="font-pixel text-xs cursor-pointer hover:bg-secondary/80"
                            onClick={() => handleRemove(item.value)}
                        >
                            {item.label}
                            <X className="w-3 h-3 ml-1 inline" />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
