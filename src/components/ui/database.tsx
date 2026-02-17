"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface DatabaseIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

interface DatabaseIconProps extends HTMLAttributes<HTMLDivElement> {
    size?: number;
}

const DatabaseIcon = forwardRef<DatabaseIconHandle, DatabaseIconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
        const controls = useAnimation();
        const isControlledRef = useRef(false);

        useImperativeHandle(ref, () => {
            isControlledRef.current = true;

            return {
                startAnimation: () => controls.start("animate"),
                stopAnimation: () => controls.start("normal"),
            };
        });

        const handleMouseEnter = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (isControlledRef.current) {
                    onMouseEnter?.(e);
                } else {
                    controls.start("animate");
                }
            },
            [controls, onMouseEnter],
        );

        const handleMouseLeave = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (isControlledRef.current) {
                    onMouseLeave?.(e);
                } else {
                    controls.start("normal");
                }
            },
            [controls, onMouseLeave],
        );

        return (
            <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
                <svg
                    fill="none"
                    height={size}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width={size}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.ellipse
                        cx="12"
                        cy="5"
                        rx="9"
                        ry="3"
                        animate={controls}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        variants={{
                            normal: { scaleY: 1 },
                            animate: { scaleY: 0.8 },
                        }}
                    />
                    <motion.path
                        d="M3 5V19A9 3 0 0 0 21 19V5"
                        animate={controls}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        variants={{
                            normal: { d: "M3 5V19A9 3 0 0 0 21 19V5" },
                            animate: { d: "M3 5V19A9 3 0 0 0 21 19V5" },
                        }}
                    />
                    <motion.path
                        d="M3 12A9 3 0 0 0 21 12"
                        animate={controls}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        variants={{
                            normal: { scaleX: 1, x: 0 },
                            animate: { scaleX: 0.95, x: 0.5 },
                        }}
                    />
                </svg>
            </div>
        );
    },
);

DatabaseIcon.displayName = "DatabaseIcon";

export { DatabaseIcon };
