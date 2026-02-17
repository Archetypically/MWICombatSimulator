"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { XIcon } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
    /** Whether the bottom sheet is open */
    isOpen: boolean;
    /** Callback when the bottom sheet should close */
    onClose: () => void;
    /** Title displayed in the header */
    title: string;
    /** Optional description displayed below the title */
    description?: string;
    /** Content to display in the body */
    children: React.ReactNode;
    /** Optional footer content (e.g., action buttons) */
    footer?: React.ReactNode;
    /** Additional CSS classes for the content */
    className?: string;
    /** Whether to show the close button (default: true) */
    showCloseButton?: boolean;
}

/**
 * A mobile-first bottom sheet component based on shadcn/ui Sheet.
 * Features:
 * - Full width on mobile, max-w-lg on larger screens
 * - Drag handle visual indicator
 * - Smooth animations using framer-motion
 * - Optional header, description, and footer
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Sheet Title"
 *   description="Optional description"
 *   footer={<Button>Action</Button>}
 * >
 *   <div>Content goes here</div>
 * </BottomSheet>
 * ```
 */
function BottomSheet({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    className,
    showCloseButton = true,
}: BottomSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="bottom"
                showCloseButton={false}
                className={cn("w-full max-w-lg mx-auto rounded-t-xl p-0 gap-0", className)}
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <motion.div
                        className="h-1.5 w-12 rounded-full bg-muted-foreground/30"
                        initial={{ scaleX: 0.8 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                    />
                </div>

                {/* Header */}
                <SheetHeader className="px-4 pt-2 pb-4 space-y-1">
                    <div className="flex items-start justify-between">
                        <SheetTitle className="text-lg font-semibold leading-none tracking-tight">{title}</SheetTitle>
                        {showCloseButton && (
                            <motion.button
                                onClick={onClose}
                                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <XIcon className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </motion.button>
                        )}
                    </div>
                    {description && (
                        <SheetDescription className="text-sm text-muted-foreground">{description}</SheetDescription>
                    )}
                </SheetHeader>

                {/* Body */}
                <motion.div
                    className="px-4 py-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        delay: 0.1,
                    }}
                >
                    {children}
                </motion.div>

                {/* Footer */}
                <AnimatePresence>
                    {footer && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                delay: 0.15,
                            }}
                        >
                            <SheetFooter className="px-4 py-4 sm:flex-col sm:space-x-0 gap-2">{footer}</SheetFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    );
}

export default BottomSheet;
export type { BottomSheetProps };
