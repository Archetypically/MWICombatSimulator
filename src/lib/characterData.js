// Equipment slot definitions and mappings

export const EQUIPMENT_SLOTS = [
    { hrid: "/item_locations/head", label: "Head" },
    { hrid: "/item_locations/neck", label: "Necklace" },
    { hrid: "/item_locations/earrings", label: "Earrings" },
    { hrid: "/item_locations/body", label: "Body" },
    { hrid: "/item_locations/legs", label: "Legs" },
    { hrid: "/item_locations/feet", label: "Feet" },
    { hrid: "/item_locations/hands", label: "Hands" },
    { hrid: "/item_locations/ring", label: "Ring" },
    { hrid: "/item_locations/main_hand", label: "Main Hand" },
    { hrid: "/item_locations/off_hand", label: "Off Hand" },
    { hrid: "/item_locations/pouch", label: "Pouch" },
    { hrid: "/item_locations/back", label: "Back" },
    { hrid: "/item_locations/charm", label: "Charm" },
];

export const EQUIPMENT_TYPE_TO_LOCATION = {
    "/equipment_types/head": "/item_locations/head",
    "/equipment_types/body": "/item_locations/body",
    "/equipment_types/legs": "/item_locations/legs",
    "/equipment_types/feet": "/item_locations/feet",
    "/equipment_types/hands": "/item_locations/hands",
    "/equipment_types/main_hand": "/item_locations/main_hand",
    "/equipment_types/two_hand": "/item_locations/main_hand",
    "/equipment_types/off_hand": "/item_locations/off_hand",
    "/equipment_types/pouch": "/item_locations/pouch",
    "/equipment_types/back": "/item_locations/back",
    "/equipment_types/neck": "/item_locations/neck",
    "/equipment_types/ring": "/item_locations/ring",
    "/equipment_types/earrings": "/item_locations/earrings",
    "/equipment_types/charm": "/item_locations/charm",
};

export const HOUSE_ROOMS = [
    { hrid: "/house_rooms/dairy_barn", label: "Dairy Barn", skill: "Milking" },
    { hrid: "/house_rooms/garden", label: "Garden", skill: "Foraging" },
    { hrid: "/house_rooms/log_shed", label: "Log Shed", skill: "Woodcutting" },
    { hrid: "/house_rooms/forge", label: "Forge", skill: "Cheesesmithing" },
    { hrid: "/house_rooms/workshop", label: "Workshop", skill: "Crafting" },
    { hrid: "/house_rooms/sewing_parlor", label: "Sewing Parlor", skill: "Tailoring" },
    { hrid: "/house_rooms/kitchen", label: "Kitchen", skill: "Cooking" },
    { hrid: "/house_rooms/brewery", label: "Brewery", skill: "Brewing" },
    { hrid: "/house_rooms/laboratory", label: "Laboratory", skill: "Alchemy" },
    { hrid: "/house_rooms/observatory", label: "Observatory", skill: "Enhancing" },
    { hrid: "/house_rooms/dining_room", label: "Dining Room", skill: "Stamina" },
    { hrid: "/house_rooms/library", label: "Library", skill: "Intelligence" },
    { hrid: "/house_rooms/dojo", label: "Dojo", skill: "Attack" },
    { hrid: "/house_rooms/armory", label: "Armory", skill: "Defense" },
    { hrid: "/house_rooms/gym", label: "Gym", skill: "Melee" },
    { hrid: "/house_rooms/archery_range", label: "Archery Range", skill: "Ranged" },
    { hrid: "/house_rooms/mystical_study", label: "Mystical Study", skill: "Magic" },
];

export const SKILLS = [
    { key: "attackLevel", label: "Attack", skill: "Attack" },
    { key: "magicLevel", label: "Magic", skill: "Magic" },
    { key: "meleeLevel", label: "Melee", skill: "Melee" },
    { key: "intelligenceLevel", label: "Intelligence", skill: "Intelligence" },
    { key: "staminaLevel", label: "Stamina", skill: "Stamina" },
    { key: "defenseLevel", label: "Defense", skill: "Defense" },
    { key: "rangedLevel", label: "Ranged", skill: "Ranged" },
];

// Achievement tiers with their buffs
export const ACHIEVEMENT_TIERS = {
    beginner: {
        hrid: "/achievement_tiers/beginner",
        name: "Beginner",
        sortIndex: 1,
        buff: {
            name: "Gathering",
            description: "+2% Gathering XP",
            appliesTo: ["Foraging", "Milking", "Woodcutting"],
        },
    },
    novice: {
        hrid: "/achievement_tiers/novice",
        name: "Novice",
        sortIndex: 2,
        buff: {
            name: "Wisdom",
            description: "+2% All XP",
            appliesTo: ["All Skills"],
        },
    },
    adept: {
        hrid: "/achievement_tiers/adept",
        name: "Adept",
        sortIndex: 3,
        buff: {
            name: "Efficiency",
            description: "+2% Non-Combat Efficiency",
            appliesTo: [
                "Alchemy",
                "Brewing",
                "Cheesesmithing",
                "Cooking",
                "Crafting",
                "Foraging",
                "Milking",
                "Tailoring",
                "Woodcutting",
            ],
        },
    },
    veteran: {
        hrid: "/achievement_tiers/veteran",
        name: "Veteran",
        sortIndex: 4,
        buff: {
            name: "Rare Find",
            description: "+2% Rare Find",
            appliesTo: ["All Skills"],
        },
    },
    elite: {
        hrid: "/achievement_tiers/elite",
        name: "Elite",
        sortIndex: 5,
        buff: {
            name: "Damage",
            description: "+2% Combat Damage",
            appliesTo: ["Combat"],
        },
    },
    champion: {
        hrid: "/achievement_tiers/champion",
        name: "Champion",
        sortIndex: 6,
        buff: {
            name: "Enhancing Success",
            description: "+0.2% Enhancing Success",
            appliesTo: ["Enhancing"],
        },
    },
};

// Achievements organized by tier
export const ACHIEVEMENTS_BY_TIER = {
    beginner: [
        { hrid: "/achievements/complete_tutorial", label: "Complete Tutorial", tier: "beginner" },
        { hrid: "/achievements/total_level_100", label: "Total Level 100", tier: "beginner" },
    ],
    novice: [
        { hrid: "/achievements/total_level_250", label: "Total Level 250", tier: "novice" },
        { hrid: "/achievements/bestiary_points_20", label: "Bestiary 20 Points", tier: "novice" },
    ],
    adept: [
        { hrid: "/achievements/total_level_500", label: "Total Level 500", tier: "adept" },
        { hrid: "/achievements/bestiary_points_40", label: "Bestiary 40 Points", tier: "adept" },
    ],
    veteran: [
        { hrid: "/achievements/total_level_1000", label: "Total Level 1000", tier: "veteran" },
        { hrid: "/achievements/bestiary_points_100", label: "Bestiary 100 Points", tier: "veteran" },
    ],
    elite: [
        { hrid: "/achievements/total_level_1500", label: "Total Level 1500", tier: "elite" },
        { hrid: "/achievements/bestiary_points_200", label: "Bestiary 200 Points", tier: "elite" },
    ],
    champion: [
        { hrid: "/achievements/total_level_1800", label: "Total Level 1800", tier: "champion" },
        { hrid: "/achievements/bestiary_points_400", label: "Bestiary 400 Points", tier: "champion" },
    ],
};

// Flattened list for backward compatibility
export const ACHIEVEMENTS = Object.values(ACHIEVEMENTS_BY_TIER).flat();
