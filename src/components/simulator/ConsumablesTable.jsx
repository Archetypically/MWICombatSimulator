import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export function ConsumablesTable({ data }) {
    return (
        <div className="space-y-2">
            <h4 className="font-pixel text-sm font-semibold text-foreground">Consumables Used Per Hour</h4>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-pixel text-xs py-1.5">{row.name}</TableCell>
                                <TableCell className="font-pixel text-xs text-right py-1.5">{row.count}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
