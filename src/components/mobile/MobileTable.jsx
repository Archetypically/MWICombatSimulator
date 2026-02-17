import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * MobileTableRow - Individual card component for mobile table rows
 * @param {Object} props
 * @param {Object} props.data - Row data object
 * @param {Array} props.columns - Column definitions [{key, title, render?, className?, valueClassName?}]
 * @param {Function} props.onRowClick - Optional click handler
 * @param {boolean} props.compact - Whether to use compact mode
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.actions - Optional actions to render
 * @param {number} props.index - Row index for alternating colors
 */
export function MobileTableRow({ data, columns, onRowClick, compact = false, className, actions, index }) {
    const clickable = !!onRowClick;

    return (
        <Card
            className={cn(
                "overflow-hidden border-border/50",
                clickable && "cursor-pointer active:scale-[0.98] transition-transform",
                compact ? "py-3" : "py-4",
                index % 2 === 0 ? "bg-card" : "bg-card/50",
                className,
            )}
            onClick={clickable ? () => onRowClick(data) : undefined}
        >
            <CardContent className={cn("px-4", compact ? "py-0" : "py-0")}>
                <div className={cn("space-y-0", compact ? "gap-2" : "gap-3")}>
                    {columns.map((column) => {
                        const value = data[column.key];
                        const displayValue = column.render ? column.render(value, data) : value;

                        // Skip empty values in compact mode unless it's the first column
                        if (compact && !value && column.key !== columns[0]?.key) {
                            return null;
                        }

                        return (
                            <div
                                key={column.key}
                                className={cn(
                                    "flex items-start justify-between",
                                    compact ? "py-1.5" : "py-2",
                                    column.key !== columns[columns.length - 1]?.key && "border-b border-border/30",
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-xs text-muted-foreground font-medium shrink-0 mr-3",
                                        compact && "text-[11px]",
                                    )}
                                >
                                    {column.title}
                                </span>
                                <div
                                    className={cn(
                                        "text-sm text-foreground text-right",
                                        column.valueClassName,
                                        compact && "text-xs",
                                    )}
                                >
                                    {displayValue}
                                </div>
                            </div>
                        );
                    })}
                    {actions && (
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/30 mt-2">
                            {actions}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * MobileTable - Card-based table replacement for mobile screens
 * @param {Object} props
 * @param {Array} props.data - Array of row data objects
 * @param {Array} props.columns - Column definitions [{key, title, render?, className?, valueClassName?}]
 * @param {Function} props.onRowClick - Optional click handler for rows
 * @param {boolean} props.compact - Whether to use compact mode for dense data
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.emptyMessage - Message to show when data is empty
 * @param {React.ReactNode} props.header - Optional header content
 * @param {Function} props.renderRow - Optional custom row renderer
 * @param {string} props.keyExtractor - Key to use as unique identifier (default: 'id')
 */
export function MobileTable({
    data,
    columns,
    onRowClick,
    compact = false,
    className,
    emptyMessage = "No data available",
    header,
    renderRow,
    keyExtractor = "id",
}) {
    if (data.length === 0) {
        return (
            <Card className={cn("border-dashed", className)}>
                <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            {header && <div className="px-1">{header}</div>}
            <div className={cn("space-y-2", compact && "space-y-1.5")}>
                {data.map((row, index) => {
                    if (renderRow) {
                        return renderRow(row, index);
                    }

                    const key = row[keyExtractor] ?? index;
                    return (
                        <MobileTableRow
                            key={key}
                            data={row}
                            columns={columns}
                            onRowClick={onRowClick}
                            compact={compact}
                            index={index}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/**
 * MobileTableHeader - Header component for mobile tables
 * @param {Object} props
 * @param {React.ReactNode} props.children - Header content
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.action - Optional action element (e.g., button, badge)
 */
export function MobileTableHeader({ children, className, action }) {
    return (
        <div className={cn("flex items-center justify-between py-2", className)}>
            <h3 className="text-sm font-semibold text-foreground">{children}</h3>
            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    );
}

/**
 * MobileTableBadge - Badge component styled for mobile tables
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant (default, secondary, destructive, outline)
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {string} props.className - Additional CSS classes
 */
export function MobileTableBadge({ children, variant = "secondary", icon, className }) {
    return (
        <Badge variant={variant} className={cn("text-xs", className)}>
            {icon && <span className="mr-1">{icon}</span>}
            {children}
        </Badge>
    );
}

export default MobileTable;
