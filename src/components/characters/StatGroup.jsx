import React from "react";

export const StatGroup = ({ title, stats }) => (
    <div className="mb-4">
        <h4 className="text-[10px] font-bold font-pixel text-muted-foreground uppercase tracking-wider mb-2 border-b border-sidebar-border/50 pb-1">
            {title}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {stats.map((stat) => (
                <div key={stat.label} className="text-left">
                    <p className="text-[9px] font-pixel text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-sm font-bold font-pixel ${stat.color}`}>{stat.value}</p>
                </div>
            ))}
        </div>
    </div>
);

export default StatGroup;
