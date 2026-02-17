import React, { useState } from "react";
import { CircleHelpIcon } from "@/components/ui/circle-help";
import { ChevronDownIcon } from "@/components/ui/chevron-down";
import { ChevronUpIcon } from "@/components/ui/chevron-up";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SkillIcon } from "@/lib/uiComponents.jsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ComputedStatsCard = ({ stats }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Get skill icon based on combat style
    const getCombatStyleSkill = () => {
        if (!stats.combatStyle) return "Combat";
        const style = stats.combatStyle.toLowerCase();
        if (style.includes("ranged")) return "Ranged";
        if (style.includes("magic")) return "Magic";
        return "Combat";
    };

    // Main stats (always visible)
    const mainStats = [
        { label: "Max Hitpoints", value: stats.maxHitpoints || "-", color: "text-red-400", skill: "Stamina" },
        { label: "Max Manapoints", value: stats.maxManapoints || "-", color: "text-blue-400", skill: "Intelligence" },
        {
            label: "Combat Style",
            value: stats.combatStyle?.split("/").pop() || "Smash",
            color: "text-foreground",
            skill: getCombatStyleSkill(),
        },
        {
            label: "Damage Type",
            value: stats.damageType?.split("/").pop() || "Physical",
            color: "text-foreground",
            skill: "Combat",
        },
        {
            label: "Attack Interval",
            value: stats.attackInterval ? `${stats.attackInterval}s` : "-",
            color: "text-foreground",
            skill: "Attack",
        },
    ];

    // Expanded stats organized by category
    const statCategories = [
        {
            title: "Accuracy",
            stats: [
                { label: "Stab", value: stats.stabAccuracy || "-", color: "text-green-400" },
                { label: "Slash", value: stats.slashAccuracy || "-", color: "text-green-400" },
                { label: "Smash", value: stats.smashAccuracy || "-", color: "text-green-400" },
                { label: "Ranged", value: stats.rangedAccuracy || "-", color: "text-green-400" },
                { label: "Magic", value: stats.magicAccuracy || "-", color: "text-green-400" },
            ],
        },
        {
            title: "Damage",
            stats: [
                { label: "Stab", value: stats.stabDamage || "-", color: "text-yellow-400" },
                { label: "Slash", value: stats.slashDamage || "-", color: "text-yellow-400" },
                { label: "Smash", value: stats.smashDamage || "-", color: "text-yellow-400" },
                { label: "Defensive", value: stats.defensiveDamage || "-", color: "text-yellow-400" },
                { label: "Ranged", value: stats.rangedDamage || "-", color: "text-yellow-400" },
                { label: "Magic", value: stats.magicDamage || "-", color: "text-yellow-400" },
            ],
        },
        {
            title: "Evasion",
            stats: [
                { label: "Stab", value: stats.stabEvasion || "-", color: "text-cyan-400" },
                { label: "Slash", value: stats.slashEvasion || "-", color: "text-cyan-400" },
                { label: "Smash", value: stats.smashEvasion || "-", color: "text-cyan-400" },
                { label: "Ranged", value: stats.rangedEvasion || "-", color: "text-cyan-400" },
                { label: "Magic", value: stats.magicEvasion || "-", color: "text-cyan-400" },
            ],
        },
        {
            title: "Resistances",
            stats: [
                { label: "Armor", value: stats.armor || "-", color: "text-purple-400" },
                { label: "Water", value: stats.waterResistance || "-", color: "text-blue-400" },
                { label: "Nature", value: stats.natureResistance || "-", color: "text-green-400" },
                { label: "Fire", value: stats.fireResistance || "-", color: "text-red-400" },
            ],
        },
    ];

    // Additional stats from combatStats object
    const additionalStats = stats.combatStats
        ? [
              {
                  title: "Amplify",
                  stats: [
                      {
                          label: "Physical",
                          value: `${Math.round((stats.combatStats.physicalAmplify || 0) * 100)}%`,
                          color: "text-foreground",
                      },
                      {
                          label: "Water",
                          value: `${Math.round((stats.combatStats.waterAmplify || 0) * 100)}%`,
                          color: "text-blue-400",
                      },
                      {
                          label: "Nature",
                          value: `${Math.round((stats.combatStats.natureAmplify || 0) * 100)}%`,
                          color: "text-green-400",
                      },
                      {
                          label: "Fire",
                          value: `${Math.round((stats.combatStats.fireAmplify || 0) * 100)}%`,
                          color: "text-red-400",
                      },
                      {
                          label: "Healing",
                          value: `${Math.round((stats.combatStats.healingAmplify || 0) * 100)}%`,
                          color: "text-pink-400",
                      },
                  ],
              },
              {
                  title: "Combat",
                  stats: [
                      {
                          label: "Crit Rate",
                          value: `${Math.round((stats.combatStats.criticalRate || 0) * 100)}%`,
                          color: "text-yellow-400",
                      },
                      {
                          label: "Crit Dmg",
                          value: `${Math.round((stats.combatStats.criticalDamage || 0) * 100)}%`,
                          color: "text-orange-400",
                      },
                      {
                          label: "Life Steal",
                          value: `${Math.round((stats.combatStats.lifeSteal || 0) * 100)}%`,
                          color: "text-red-400",
                      },
                      {
                          label: "Exp",
                          value: `${Math.round((stats.combatStats.combatExperience || 0) * 100)}%`,
                          color: "text-cyan-400",
                      },
                  ],
              },
              {
                  title: "Utility",
                  stats: [
                      {
                          label: "HP Regen",
                          value: `${Math.round((stats.combatStats.hpRegenPer10 || 0.01) * 100)}%`,
                          color: "text-red-400",
                      },
                      {
                          label: "MP Regen",
                          value: `${Math.round((stats.combatStats.mpRegenPer10 || 0.01) * 100)}%`,
                          color: "text-blue-400",
                      },
                      {
                          label: "Ability Haste",
                          value: Math.round(stats.combatStats.abilityHaste || 0),
                          color: "text-foreground",
                      },
                      {
                          label: "Cast Speed",
                          value: `${Math.round(((stats.castSpeed || 1.6) - 1) * 100)}%`,
                          color: "text-purple-400",
                      },
                  ],
              },
          ]
        : [];

    return (
        <Card className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-4 px-6">
                <div className="flex items-center gap-2">
                    <SkillIcon skill="Combat" size="lg" />
                    <h3 className="text-xl font-bold text-foreground font-pixel tracking-wide text-sm">Combat Stats</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipContent>Credit to KuganDev, Vlad (mwisim) and AmVoidGuy</TooltipContent>
                        <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                            <CircleHelpIcon size={16} />
                        </TooltipTrigger>
                    </Tooltip>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {isExpanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-6">
                {mainStats.map((stat) => (
                    <div key={stat.label} className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <SkillIcon skill={stat.skill} size="sm" />
                            <p className="text-[10px] font-pixel text-muted-foreground uppercase tracking-wider">
                                {stat.label}
                            </p>
                        </div>
                        <p className={`text-lg font-bold font-pixel ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {isExpanded && (
                <>
                    <div className="border-t border-sidebar-border my-4 mx-6" />
                    <div className="px-6">
                        {/* All Stats - Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop, 7 cols large */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                            {[...statCategories, ...additionalStats].map((category) => (
                                <div key={category.title} className="flex flex-col">
                                    <h4 className="text-[10px] font-bold font-pixel text-muted-foreground uppercase tracking-wider mb-2 border-b border-sidebar-border/50 pb-1">
                                        {category.title}
                                    </h4>
                                    <div className="flex flex-col gap-1">
                                        {category.stats.map((stat) => (
                                            <div key={stat.label} className="flex items-baseline gap-2">
                                                <span className="text-[9px] font-pixel text-muted-foreground uppercase tracking-wider min-w-[45px]">
                                                    {stat.label}
                                                </span>
                                                <span className={`text-sm font-bold font-pixel ${stat.color}`}>
                                                    {stat.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
};

export default ComputedStatsCard;
