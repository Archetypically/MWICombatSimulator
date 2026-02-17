"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface StarIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

interface StarIconProps extends HTMLAttributes<HTMLDivElement> {
    size?: number;
    filled?: boolean;
}

const STAR_VARIANTS: Variants = {
    normal: {
        scale: 1,
        rotate: 0,
    },
    animate: {
        scale: [1, 1.2, 1],
        rotate: [0, 15, -15, 0],
        transition: {
            duration: 0.5,
            ease: "easeInOut",
        },
    },
};

const StarIcon = forwardRef<StarIconHandle, StarIconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, filled = false, ...props }, ref) => {
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
                <motion.svg
                    animate={controls}
                    fill={filled ? "currentColor" : "none"}
                    height={size}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    variants={STAR_VARIANTS}
                    viewBox="0 0 24 24"
                    width={size}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </motion.svg>
            </div>
        );
    },
);

StarIcon.displayName = "StarIcon";

export { StarIcon };
