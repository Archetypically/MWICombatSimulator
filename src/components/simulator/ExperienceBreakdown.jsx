import React from "react";
import { Zap } from "lucide-react";
import { ParticleCard } from "@/components/MagicBento";

const GLOW_COLOR = "132, 0, 255";

// Skill configuration with display names and icon paths
const SKILL_CONFIG = {
    stamina: { name: "Stamina", icon: "/assets/skills/Stamina.svg" },
    intelligence: { name: "Intelligence", icon: "/assets/skills/Intelligence.svg" },
    attack: { name: "Attack", icon: "/assets/skills/Attack.svg" },
    melee: { name: "Melee", icon: "/assets/skills/Melee.svg" },
    defense: { name: "Defense", icon: "/assets/skills/Defense.svg" },
    ranged: { name: "Ranged", icon: "/assets/skills/Ranged.svg" },
    magic: { name: "Magic", icon: "/assets/skills/Magic.svg" },
};

// Order skills for display (most common combat skills first)
const SKILL_ORDER = ["stamina", "attack", "defense", "melee", "ranged", "magic", "intelligence"];

function BentoCard({ children, className = "" }) {
    return (
        <ParticleCard
            className={`relative overflow-hidden rounded-[20px] border border-solid border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] ${className}`}
            glowColor={GLOW_COLOR}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={true}
            particleCount={8}
        >
            <div className="p-4">{children}</div>
        </ParticleCard>
    );
}

/**
 * ExperienceBreakdown component displays total XP and breakdown by skill
 * @param {Object} props
 * @param {Object} props.xpData - Object with skill keys and XP values (e.g., { stamina: 1000, attack: 500 })
 * @param {string} props.title - Optional title (defaults to "XP Per Hour")
 * @param {boolean} props.compact - If true, shows a more compact layout
 */
export function ExperienceBreakdown({ xpData, title = "XP Per Hour", compact = false }) {
    // Calculate total XP
    const totalXp = Object.values(xpData || {}).reduce((sum, val) => sum + (val || 0), 0);

    // Filter to skills with XP gained and sort by order
    const skillsWithXp = SKILL_ORDER.filter((skill) => (xpData?.[skill] || 0) > 0).map((skill) => ({
        key: skill,
        ...SKILL_CONFIG[skill],
        value: xpData[skill] || 0,
    }));

    // If no XP data, show placeholder
    if (skillsWithXp.length === 0) {
        return (
            <BentoCard>
                <div className="flex items-start justify-between h-full">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-pixel">{title}</p>
                        <p className="text-2xl font-bold tracking-tight font-pixel">0</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </BentoCard>
        );
    }

    if (compact) {
        return (
            <BentoCard>
                <div className="space-y-3">
                    {/* Total XP */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-pixel">{title}</p>
                            <p className="text-2xl font-bold tracking-tight font-pixel text-emerald-600 dark:text-emerald-400">
                                {Math.round(totalXp).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                            <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>

                    {/* Skill Breakdown */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        {skillsWithXp.map((skill) => (
                            <div key={skill.key} className="flex items-center gap-2">
                                <img
                                    src={skill.icon}
                                    alt={skill.name}
                                    className="w-4 h-4"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                                <span className="text-xs text-muted-foreground font-pixel truncate">{skill.name}:</span>
                                <span className="text-xs font-medium font-pixel">
                                    {Math.round(skill.value).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </BentoCard>
        );
    }

    return (
        <BentoCard>
            <div className="space-y-4">
                {/* Total XP Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-pixel">{title}</p>
                        <p className="text-2xl font-bold tracking-tight font-pixel text-emerald-600 dark:text-emerald-400">
                            {Math.round(totalXp).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground font-pixel">Total across all skills</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                {/* Skill Breakdown */}
                <div className="space-y-2 pt-3 border-t border-border">
                    <p className="text-xs font-semibold font-pixel text-muted-foreground uppercase tracking-wider">
                        Breakdown by Skill
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {skillsWithXp.map((skill) => (
                            <div
                                key={skill.key}
                                className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/50"
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src={skill.icon}
                                        alt={skill.name}
                                        className="w-5 h-5"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                    <span className="text-sm font-medium font-pixel">{skill.name}</span>
                                </div>
                                <span className="text-sm font-bold font-pixel">
                                    {Math.round(skill.value).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </BentoCard>
    );
}

/**
 * CompactExperienceRow - A compact row view for party overview
 * @param {Object} props
 * @param {Object} props.xpData - Object with skill keys and XP values
 */
export function CompactExperienceRow({ xpData }) {
    const totalXp = Object.values(xpData || {}).reduce((sum, val) => sum + (val || 0), 0);

    const skillsWithXp = SKILL_ORDER.filter((skill) => (xpData?.[skill] || 0) > 0).map((skill) => ({
        key: skill,
        ...SKILL_CONFIG[skill],
        value: xpData[skill] || 0,
    }));

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold font-pixel text-emerald-600 dark:text-emerald-400">
                {Math.round(totalXp).toLocaleString()} XP/hr
            </span>
            {skillsWithXp.length > 0 && <span className="text-xs text-muted-foreground font-pixel">|</span>}
            {skillsWithXp.map((skill, index) => (
                <React.Fragment key={skill.key}>
                    <div className="flex items-center gap-1">
                        <img
                            src={skill.icon}
                            alt={skill.name}
                            className="w-3 h-3"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                        <span className="text-xs text-muted-foreground font-pixel">
                            {Math.round(skill.value).toLocaleString()}
                        </span>
                    </div>
                    {index < skillsWithXp.length - 1 && (
                        <span className="text-xs text-muted-foreground font-pixel">·</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

export default ExperienceBreakdown;
