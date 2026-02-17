import { useState, useCallback } from "react";

export const useSimulator = () => {
    const [stats, setStats] = useState({
        maxHitpoints: 110,
        maxManapoints: 110,
        attackInterval: 2.99,
        combatStyle: "Smash",
        damageType: "Physical",
    });

    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);

    const startSimulation = useCallback(() => {
        setIsSimulating(true);
        setProgress(0);

        // This is a placeholder for the actual worker logic
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setIsSimulating(false);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    }, []);

    const stopSimulation = useCallback(() => {
        setIsSimulating(false);
        setProgress(0);
    }, []);

    return {
        stats,
        isSimulating,
        progress,
        startSimulation,
        stopSimulation,
    };
};
