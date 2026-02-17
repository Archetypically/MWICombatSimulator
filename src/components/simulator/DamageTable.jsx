import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DamageTable({ title, data, showHitChance = true }) {
    const totalDPS = data.reduce((sum, row) => sum + (row.dps || 0), 0);

    return (
        <div className="space-y-2">
            <h4 className="font-pixel text-sm font-semibold text-foreground">{title}</h4>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-pixel text-xs">Source</TableHead>
                            {showHitChance && (
                                <TableHead className="font-pixel text-xs text-right">Hitchance</TableHead>
                            )}
                            <TableHead className="font-pixel text-xs text-right">DPS</TableHead>
                            <TableHead className="font-pixel text-xs text-right">%</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-pixel text-xs py-2">{row.source}</TableCell>
                                {showHitChance && (
                                    <TableCell className="font-pixel text-xs text-right py-2">
                                        {row.hitchance}
                                    </TableCell>
                                )}
                                <TableCell className="font-pixel text-xs text-right py-2">{row.dps}</TableCell>
                                <TableCell className="font-pixel text-xs text-right py-2">{row.percent}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
