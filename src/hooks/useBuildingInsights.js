import { useCallback } from 'react';

export const useBuildingInsights = (apiKey) => {
    const findClosestBuilding = useCallback(async (location) => {
        const qualities = ['HIGH', 'MEDIUM', 'LOW'];
        for (const quality of qualities) {
            const query = `location.latitude=${location?.geo[0]?.toFixed(5)}&location.longitude=${location?.geo[1]?.toFixed(5)}&requiredQuality=${quality}&key=${apiKey}`;
            try {
                const response = await fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${query}`);
                const content = await response.json();
                if (response.status === 200) {
                    return content;
                }
            } catch (error) {
                console.error(`Error with quality ${quality}:`, error);
            }
        }
        throw new Error("All quality levels failed");
    }, [apiKey]);

    return { findClosestBuilding };
};
