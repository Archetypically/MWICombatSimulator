import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ResourceTable({ title, data }) {
    return (
        <div className="space-y-2">
            <h4 className="font-pixel text-sm font-semibold text-foreground">{title}</h4>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-pixel text-xs">Source</TableHead>
                            <TableHead className="font-pixel text-xs text-right">Amount</TableHead>
                            <TableHead className="font-pixel text-xs text-right">%</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-pixel text-xs py-1.5">{row.source}</TableCell>
                                <TableCell className="font-pixel text-xs text-right py-1.5">{row.amount}</TableCell>
                                <TableCell className="font-pixel text-xs text-right py-1.5">{row.percent}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
