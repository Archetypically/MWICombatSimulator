"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface TrophyIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

interface TrophyIconProps extends HTMLAttributes<HTMLDivElement> {
    size?: number;
}

const VARIANTS: Variants = {
    normal: {
        pathLength: 1,
        opacity: 1,
    },
    animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: {
            delay: 0.15,
            duration: 0.3,
            opacity: { delay: 0.1 },
        },
    },
};

const TrophyIcon = forwardRef<TrophyIconHandle, TrophyIconProps>(
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
                    <motion.path animate={controls} d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" variants={VARIANTS} />
                    <motion.path animate={controls} d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" variants={VARIANTS} />
                    <motion.path animate={controls} d="M4 22h16" variants={VARIANTS} />
                    <motion.path
                        animate={controls}
                        d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
                        variants={VARIANTS}
                    />
                    <motion.path
                        animate={controls}
                        d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
                        variants={VARIANTS}
                    />
                    <motion.path animate={controls} d="M18 2H6v7a6 6 0 0 0 12 0V2Z" variants={VARIANTS} />
                </svg>
            </div>
        );
    },
);

TrophyIcon.displayName = "TrophyIcon";

export { TrophyIcon };
