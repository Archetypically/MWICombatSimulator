// Reusable UI components for character display

import React, { useState } from "react";

// Skill Icon component
export const SkillIcon = ({ skill, size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8",
        "2xl": "w-10 h-10",
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    let skillName = skill;
    if (skill.includes("/")) {
        const parts = skill.split("/");
        skillName = parts[parts.length - 1];
    }

    const normalizedSkill = skillName
        .replace(/Level$/, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

    const src = `/assets/skills/${normalizedSkill}.svg`;

    return (
        <img
            src={src}
            alt={normalizedSkill}
            className={`${sizeClass} ${className}`}
            onError={(e) => {
                e.target.style.display = "none";
            }}
        />
    );
};
