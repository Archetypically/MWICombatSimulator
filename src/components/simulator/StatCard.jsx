import React from "react";

export function StatCard({ title, value, subValue, icon: Icon, variant = "default" }) {
    const variants = {
        default: "bg-card",
        success: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200",
        danger: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200",
        warning: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200",
    };

    return (
        <div className={`p-4 rounded-lg border ${variants[variant]}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-pixel text-muted-foreground mb-1">{title}</p>
                    <p className="text-2xl font-pixel font-bold text-foreground">{value}</p>
                    {subValue && <p className="text-xs font-pixel text-muted-foreground mt-1">{subValue}</p>}
                </div>
                {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
            </div>
        </div>
    );
}
