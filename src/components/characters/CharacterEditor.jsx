import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadIcon } from "@/components/ui/download";
import { UserIcon } from "@/components/ui/user";
import { SaveIcon } from "@/components/ui/save";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { toast } from "sonner";
import { useCharacterSlots } from "@/hooks/useCharacterSlots";
import { EQUIPMENT_SLOTS, HOUSE_ROOMS, SKILLS, ACHIEVEMENT_TIERS } from "@/lib/characterData";
import { achievementDetailMap, itemDetailMap } from "@/lib/dataLoader";
import { calculateCombatStats } from "@/lib/combatStats";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SkillIcon } from "@/lib/uiComponents.jsx";
import { ImportModal } from "./ImportModal";
import { ComputedStatsCard } from "./ComputedStatsCard";
import { FoodComboBox, DrinkComboBox, AbilityComboBox, EquipmentComboBox } from "@/components/items";
import { CharacterProvider } from "@/contexts/CharacterContext";

// Define tier order for consistent sorting
const TIER_ORDER = ["beginner", "novice", "adept", "veteran", "elite", "champion"];

// Lazy-load achievements data
let achievementsByTierCache = null;
function getAchievementsByTier() {
    if (!achievementsByTierCache) {
        achievementsByTierCache = Object.values(achievementDetailMap()).reduce((acc, achievement) => {
            const tierKey = achievement.tierHrid.replace("/achievement_tiers/", "");
            if (!acc[tierKey]) {
                acc[tierKey] = [];
            }
            acc[tierKey].push({
                hrid: achievement.hrid,
                label: achievement.name,
                description: achievement.description,
                tier: tierKey,
            });
            return acc;
        }, {});
    }
    return achievementsByTierCache;
}

// Helper to compare objects deeply
const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const CharacterEditor = ({ slotNumber, slotData, onUpdate }) => {
    const [characterName, setCharacterName] = useState(slotData?.name || `Slot ${slotNumber}`);
    const [isEditingName, setIsEditingName] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const nameInputRef = useRef(null);

    const {
        updateCharacterName,
        updatePlayerStats,
        updateEquipment,
        updateFood,
        updateDrinks,
        updateAbilities,
        updateHouseRooms,
        updateAchievements,
    } = useCharacterSlots();

    // Initialize equipment with all predefined slots
    const initializeEquipment = (existingEquipment = []) => {
        const equipmentMap = new Map();
        existingEquipment.forEach((item) => {
            if (item.itemLocationHrid) {
                equipmentMap.set(item.itemLocationHrid, item);
            }
        });
        return EQUIPMENT_SLOTS.map(
            (slot) =>
                equipmentMap.get(slot.hrid) || {
                    itemLocationHrid: slot.hrid,
                    itemHrid: "",
                    enhancementLevel: 0,
                },
        );
    };

    // Form state - initialize from slotData
    const [formData, setFormData] = useState({
        attackLevel: 1,
        magicLevel: 1,
        meleeLevel: 1,
        intelligenceLevel: 1,
        staminaLevel: 1,
        defenseLevel: 1,
        rangedLevel: 1,
    });

    const [equipment, setEquipment] = useState([]);
    const [food, setFood] = useState([{ itemHrid: "" }, { itemHrid: "" }, { itemHrid: "" }]);
    const [drinks, setDrinks] = useState([{ itemHrid: "" }, { itemHrid: "" }, { itemHrid: "" }]);
    const [abilities, setAbilities] = useState([
        { abilityHrid: "", level: "1" },
        { abilityHrid: "", level: "1" },
        { abilityHrid: "", level: "1" },
        { abilityHrid: "", level: "1" },
        { abilityHrid: "", level: "1" },
    ]);
    const [houseRooms, setHouseRooms] = useState({});
    const [achievements, setAchievements] = useState({});
    const [collapsedTiers, setCollapsedTiers] = useState(() => {
        return TIER_ORDER.reduce((acc, tier) => ({ ...acc, [tier]: true }), {});
    });
    const [saveVersion, setSaveVersion] = useState(0);

    const handleSave = () => {
        if (dirtyState.name) {
            updateCharacterName(slotNumber, characterName);
            window.dispatchEvent(
                new CustomEvent("characterNameChanged", { detail: { slotNumber, name: characterName } }),
            );
        }
        if (dirtyState.skills) updatePlayerStats(slotNumber, formData);
        if (dirtyState.equipment) updateEquipment(slotNumber, equipment);
        if (dirtyState.food) updateFood(slotNumber, { "/action_types/combat": food });
        if (dirtyState.drinks) updateDrinks(slotNumber, { "/action_types/combat": drinks });
        if (dirtyState.abilities) updateAbilities(slotNumber, abilities);
        if (dirtyState.houseRooms) updateHouseRooms(slotNumber, houseRooms);
        if (dirtyState.achievements) updateAchievements(slotNumber, achievements);

        // Update original values to reset dirty state (use deep copies)
        originalValuesRef.current = {
            formData: JSON.parse(JSON.stringify(formData)),
            equipment: JSON.parse(JSON.stringify(equipment)),
            food: JSON.parse(JSON.stringify(food)),
            drinks: JSON.parse(JSON.stringify(drinks)),
            abilities: JSON.parse(JSON.stringify(abilities)),
            houseRooms: JSON.parse(JSON.stringify(houseRooms)),
            achievements: JSON.parse(JSON.stringify(achievements)),
            name: characterName,
        };

        // Increment save version to force dirty state recalculation
        setSaveVersion((v) => v + 1);

        toast.success("Character saved");
    };

    // Store original values for dirty checking - only update when slotNumber changes
    const originalValuesRef = useRef(null);

    // Initialize from slotData when slotNumber changes
    useEffect(() => {
        if (slotData) {
            const initialFormData = {
                attackLevel: slotData.player?.attackLevel || 1,
                magicLevel: slotData.player?.magicLevel || 1,
                meleeLevel: slotData.player?.meleeLevel || 1,
                intelligenceLevel: slotData.player?.intelligenceLevel || 1,
                staminaLevel: slotData.player?.staminaLevel || 1,
                defenseLevel: slotData.player?.defenseLevel || 1,
                rangedLevel: slotData.player?.rangedLevel || 1,
            };
            const initialEquipment = initializeEquipment(slotData.player?.equipment);
            const foodData = slotData.food?.["/action_types/combat"] || [];
            const initialFood = [
                foodData[0] || { itemHrid: "" },
                foodData[1] || { itemHrid: "" },
                foodData[2] || { itemHrid: "" },
            ];
            const drinkData = slotData.drinks?.["/action_types/combat"] || [];
            const initialDrinks = [
                drinkData[0] || { itemHrid: "" },
                drinkData[1] || { itemHrid: "" },
                drinkData[2] || { itemHrid: "" },
            ];
            const abilitiesData = slotData.abilities || [];
            const initialAbilities = [
                abilitiesData[0] || { abilityHrid: "", level: "1" },
                abilitiesData[1] || { abilityHrid: "", level: "1" },
                abilitiesData[2] || { abilityHrid: "", level: "1" },
                abilitiesData[3] || { abilityHrid: "", level: "1" },
                abilitiesData[4] || { abilityHrid: "", level: "1" },
            ];
            const initialHouseRooms = slotData.houseRooms || {};
            const initialAchievements = slotData.achievements || {};
            const initialName = slotData.name || `Slot ${slotNumber}`;

            // Store deep copies of original values for dirty checking
            originalValuesRef.current = {
                formData: JSON.parse(JSON.stringify(initialFormData)),
                equipment: JSON.parse(JSON.stringify(initialEquipment)),
                food: JSON.parse(JSON.stringify(initialFood)),
                drinks: JSON.parse(JSON.stringify(initialDrinks)),
                abilities: JSON.parse(JSON.stringify(initialAbilities)),
                houseRooms: JSON.parse(JSON.stringify(initialHouseRooms)),
                achievements: JSON.parse(JSON.stringify(initialAchievements)),
                name: initialName,
            };

            setCharacterName(initialName);
            setFormData(initialFormData);
            setEquipment(initialEquipment);
            setFood(initialFood);
            setDrinks(initialDrinks);
            setAbilities(initialAbilities);
            setHouseRooms(initialHouseRooms);
            setAchievements(initialAchievements);
            setIsInitialized(true);
        }
    }, [slotNumber]);

    // Calculate combat stats
    const computedStats = useMemo(() => {
        return calculateCombatStats(formData, equipment, houseRooms, achievements);
    }, [formData, equipment, houseRooms, achievements]);

    // Track dirty state for each section
    const dirtyState = useMemo(() => {
        if (!isInitialized || !originalValuesRef.current) {
            return {
                skills: false,
                equipment: false,
                food: false,
                drinks: false,
                abilities: false,
                houseRooms: false,
                achievements: false,
                name: false,
            };
        }

        const original = originalValuesRef.current;

        return {
            skills: !isEqual(formData, original.formData),
            equipment: !isEqual(equipment, original.equipment),
            food: !isEqual(food, original.food),
            drinks: !isEqual(drinks, original.drinks),
            abilities: !isEqual(abilities, original.abilities),
            houseRooms: !isEqual(houseRooms, original.houseRooms),
            achievements: !isEqual(achievements, original.achievements),
            name: characterName !== original.name,
        };
    }, [
        formData,
        equipment,
        food,
        drinks,
        abilities,
        houseRooms,
        achievements,
        characterName,
        isInitialized,
        saveVersion,
    ]);

    const hasChanges = Object.values(dirtyState).some(Boolean);

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setCharacterName(newName);
    };

    const handleNameBlur = () => {
        setIsEditingName(false);
    };

    const handleNameKeyDown = (e) => {
        if (e.key === "Enter") {
            setIsEditingName(false);
        }
    };

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    const handleStatChange = (field, value) => {
        const numValue = parseInt(value) || 0;
        setFormData((prev) => ({ ...prev, [field]: numValue }));
    };

    const handleEquipmentChange = (index, field, value) => {
        const newEquipment = [...equipment];
        if (!newEquipment[index]) {
            newEquipment[index] = { itemLocationHrid: EQUIPMENT_SLOTS[index].hrid, itemHrid: "", enhancementLevel: 0 };
        }
        newEquipment[index][field] = field === "enhancementLevel" ? parseInt(value) || 0 : value;
        setEquipment(newEquipment);
    };

    const handleFoodChange = (index, value) => {
        const newFood = [...food];
        newFood[index] = { itemHrid: value };
        setFood(newFood);
    };

    const handleDrinkChange = (index, value) => {
        const newDrinks = [...drinks];
        newDrinks[index] = { itemHrid: value };
        setDrinks(newDrinks);
    };

    const handleAbilityChange = (index, field, value) => {
        const newAbilities = [...abilities];
        newAbilities[index] = { ...newAbilities[index], [field]: field === "level" ? parseInt(value) || 1 : value };
        setAbilities(newAbilities);
    };

    const handleHouseRoomChange = (roomHrid, value) => {
        const level = parseInt(value) || 0;
        setHouseRooms((prev) => ({ ...prev, [roomHrid]: level }));
    };

    const handleAchievementChange = (achievementHrid, value) => {
        setAchievements((prev) => ({ ...prev, [achievementHrid]: value }));
    };

    const toggleTierCollapse = (tierKey) => {
        setCollapsedTiers((prev) => ({ ...prev, [tierKey]: !prev[tierKey] }));
    };

    return (
        <CharacterProvider playerData={formData}>
            <div className="space-y-6">
                {/* Header with Editable Title and Import Button */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center overflow-hidden">
                            <UserIcon />
                        </div>
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={characterName}
                                onChange={handleNameChange}
                                onBlur={handleNameBlur}
                                onKeyDown={handleNameKeyDown}
                                className="text-3xl font-bold font-pixel text-foreground tracking-wide bg-transparent border-b-2 border-blue-500 outline-none flex-1"
                                placeholder={`Slot ${slotNumber}`}
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingName(true)}
                                className="group flex items-center gap-2 cursor-pointer"
                            >
                                <h1 className="text-3xl font-bold font-pixel text-foreground tracking-wide group-hover:text-blue-500 transition-colors">
                                    {characterName || `Slot ${slotNumber}`}
                                </h1>
                                <svg
                                    className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <ButtonGroup>
                        <Button
                            onClick={() => setShowImportModal(true)}
                            variant="outline"
                            className="h-10 px-4 border-sidebar-border font-pixel text-xs rounded-xl flex items-center gap-2"
                        >
                            <DownloadIcon size={14} />
                            Import
                        </Button>
                        <ButtonGroupSeparator />
                        <Button
                            onClick={handleSave}
                            variant="outline"
                            className="h-10 px-4 border-sidebar-border font-pixel text-xs rounded-xl flex items-center gap-2"
                        >
                            {hasChanges && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                            <SaveIcon size={14} />
                            Save
                        </Button>
                    </ButtonGroup>
                </div>

                {/* Computed Stats Card */}
                <ComputedStatsCard stats={computedStats} />

                {/* Three Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Skills, Food, Drinks */}
                    <div className="space-y-6">
                        {/* Skills Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-pixel tracking-wide text-sm">Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {SKILLS.map((field) => (
                                        <div key={field.key} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <SkillIcon skill={field.skill} size="md" />
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-pixel">
                                                    {field.label}
                                                </label>
                                            </div>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="120"
                                                value={formData[field.key]}
                                                onChange={(e) => handleStatChange(field.key, e.target.value)}
                                                className="font-pixel w-24 text-right"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Food & Drink Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-pixel tracking-wide text-sm">Food & Drink</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Food Column */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold font-pixel text-muted-foreground uppercase tracking-widest">
                                            Food
                                        </h4>
                                        {food.slice(0, 3).map((item, index) => (
                                            <div key={`food-${index}`} className="flex items-center gap-2">
                                                <span className="text-[10px] font-pixel text-muted-foreground w-10">
                                                    Slot {index + 1}
                                                </span>
                                                <FoodComboBox
                                                    value={item.itemHrid || ""}
                                                    onChange={(value) => handleFoodChange(index, value)}
                                                    placeholder="Select food..."
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Drink Column */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold font-pixel text-muted-foreground uppercase tracking-widest">
                                            Drink
                                        </h4>
                                        {drinks.slice(0, 3).map((item, index) => (
                                            <div key={`drink-${index}`} className="flex items-center gap-2">
                                                <span className="text-[10px] font-pixel text-muted-foreground w-10">
                                                    Slot {index + 1}
                                                </span>
                                                <DrinkComboBox
                                                    value={item.itemHrid || ""}
                                                    onChange={(value) => handleDrinkChange(index, value)}
                                                    placeholder="Select drink..."
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Abilities Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-pixel tracking-wide text-sm">Abilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {abilities.map((ability, index) => (
                                        <div key={index} className="p-2 bg-sidebar-accent/30 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold font-pixel text-foreground">
                                                    Slot {index + 1} {index === 0 && "(Special)"}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="col-span-3">
                                                    <AbilityComboBox
                                                        value={ability.abilityHrid || ""}
                                                        onChange={(value) =>
                                                            handleAbilityChange(index, "abilityHrid", value)
                                                        }
                                                        placeholder="Select ability..."
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute -top-3 left-0 text-[8px] font-pixel text-muted-foreground">
                                                        Lvl
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="99"
                                                        placeholder="1"
                                                        value={ability.level || 1}
                                                        onChange={(e) =>
                                                            handleAbilityChange(index, "level", e.target.value)
                                                        }
                                                        className="font-pixel text-[10px] h-7 text-center"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 2: Equipment */}
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-pixel tracking-wide text-sm">Equipment</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                {EQUIPMENT_SLOTS.map((slot, index) => {
                                    const item = equipment[index] || {
                                        itemLocationHrid: slot.hrid,
                                        itemHrid: "",
                                        enhancementLevel: 0,
                                    };
                                    return (
                                        <div
                                            key={slot.hrid}
                                            className="p-2 bg-sidebar-accent/30 rounded-lg space-y-1.5"
                                        >
                                            <span className="font-pixel text-[10px] font-bold text-foreground">
                                                {slot.label}
                                            </span>
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="col-span-3">
                                                    <EquipmentComboBox
                                                        slotHrid={slot.hrid}
                                                        value={item.itemHrid || ""}
                                                        onChange={(value) =>
                                                            handleEquipmentChange(index, "itemHrid", value)
                                                        }
                                                        placeholder="Select equipment..."
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute -top-3 left-0 text-[8px] font-pixel text-muted-foreground">
                                                        Enh
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        placeholder="0"
                                                        value={item.enhancementLevel || 0}
                                                        onChange={(e) =>
                                                            handleEquipmentChange(
                                                                index,
                                                                "enhancementLevel",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="font-pixel text-[10px] h-7 text-center"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Column 3: House & Achievements */}
                    <div className="space-y-6">
                        {/* House Rooms Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-pixel tracking-wide text-sm">House Rooms</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {HOUSE_ROOMS.map((room) => (
                                        <div key={room.hrid} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <SkillIcon skill={room.skill} size="md" />
                                                <label className="text-xs font-bold text-muted-foreground font-pixel truncate">
                                                    {room.label}
                                                </label>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={houseRooms[room.hrid] || 0}
                                                onChange={(e) => handleHouseRoomChange(room.hrid, e.target.value)}
                                                className="font-pixel w-16 text-right flex-shrink-0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievements Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-pixel tracking-wide text-sm">Achievements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {TIER_ORDER.map((tierKey) => {
                                        const tierAchievements = getAchievementsByTier()[tierKey] || [];
                                        const tierInfo = ACHIEVEMENT_TIERS[tierKey];
                                        if (!tierInfo) return null;

                                        const isTierUnlocked = tierAchievements.some((ach) => achievements[ach.hrid]);
                                        const allTierCompleted = tierAchievements.every(
                                            (ach) => achievements[ach.hrid],
                                        );
                                        const isCollapsed = collapsedTiers[tierKey];

                                        return (
                                            <div
                                                key={tierKey}
                                                className={`rounded-lg border ${
                                                    allTierCompleted
                                                        ? "border-yellow-500/50 bg-yellow-500/10"
                                                        : isTierUnlocked
                                                          ? "border-green-500/30 bg-green-500/5"
                                                          : "border-sidebar-border bg-sidebar-accent/20"
                                                }`}
                                            >
                                                <button
                                                    onClick={() => toggleTierCollapse(tierKey)}
                                                    className="w-full p-3 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className={`w-4 h-4 text-muted-foreground transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                        <span
                                                            className={`text-xs font-bold font-pixel ${
                                                                allTierCompleted ? "text-yellow-400" : "text-foreground"
                                                            }`}
                                                        >
                                                            {tierInfo.name}
                                                        </span>
                                                        {allTierCompleted && (
                                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-pixel">
                                                                Complete
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground font-pixel">
                                                        {
                                                            tierAchievements.filter((ach) => achievements[ach.hrid])
                                                                .length
                                                        }
                                                        /{tierAchievements.length}
                                                    </div>
                                                </button>

                                                {!isCollapsed && (
                                                    <div className="px-3 pb-3">
                                                        <div className="text-[10px] text-muted-foreground font-pixel mb-2">
                                                            <span className="text-blue-400">{tierInfo.buff.name}:</span>{" "}
                                                            {tierInfo.buff.description}
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            {tierAchievements.map((achievement) => (
                                                                <div
                                                                    key={achievement.hrid}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            achievements[achievement.hrid] || false
                                                                        }
                                                                        onChange={(e) =>
                                                                            handleAchievementChange(
                                                                                achievement.hrid,
                                                                                e.target.checked,
                                                                            )
                                                                        }
                                                                        className="w-3.5 h-3.5 rounded border-sidebar-border flex-shrink-0"
                                                                    />
                                                                    <span
                                                                        className={`text-[11px] font-pixel ${
                                                                            achievements[achievement.hrid]
                                                                                ? "text-foreground"
                                                                                : "text-muted-foreground"
                                                                        }`}
                                                                    >
                                                                        {achievement.label}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Import Modal */}
                {showImportModal && (
                    <ImportModal
                        slotNumber={slotNumber}
                        onClose={() => setShowImportModal(false)}
                        onSuccess={() => window.location.reload()}
                    />
                )}
            </div>
        </CharacterProvider>
    );
};

export default CharacterEditor;
