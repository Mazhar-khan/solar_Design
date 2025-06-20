// // src/hooks/useConfigId.js
// import { useContext } from 'react';
// import { findSolarConfig } from "../utils/findSolarConfig";
// import { AppContext } from '../context/Context';
// import { SOLAR_CONSTANTS } from '../constants/solarConstants';

// export function useConfigId() {
//     const { setConFigID, storeInstallationSizeKw, storeYearlyEnergy,
//         totalCostwithoutSolar10, totalCostwithoutSolar20, savingFun,
//         totalCostwithoutSolar30, totalCostwithoutSolar, buildingInsights, configId, energypriceperKW,
//         yearlyEnergyCovered } = useContext(AppContext);
//     const {
//         panelCapacityWattsInput,
//         panelCapacityWatts,
//         energyCostPerKwhInput,
//         installationCostPerWatt,
//         dcToAcDerateInput,
//         installationLifeSpan10,
//         installationLifeSpan20,
//         installationLifeSpan30,
//         discountRate,
//         costIncreaseFactor,
//         installationLifeSpan,
//         solarIncentives
//     } = SOLAR_CONSTANTS;

//     const getConfigId = ({ averageBill }) => {
//         console.log("averageBill", averageBill)
//         console.log("configId", configId);
//         console.log("energypriceperKW", energypriceperKW)

//         const yearlyKwhEnergyConsumption = (averageBill / energyCostPerKwhInput) * 12;
//         const defaultPanelCapacity = buildingInsights?.solarPotential?.panelCapacityWatts;
//         const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacity;

//         const monthlyKwhEnergyConsumption = averageBill / energyCostPerKwhInput;


//         const PanelCount = findSolarConfig(
//             buildingInsights?.solarPotential?.solarPanelConfigs,
//             yearlyKwhEnergyConsumption,
//             panelCapacityRatio,
//             dcToAcDerateInput
//         );

//         setConFigID(PanelCount);

//         //Installation Size
//         // want to return value of installationSizeKw
//         const installationSizeKw = (PanelCount * panelCapacityWatts) / 1000;
//         storeInstallationSizeKw(installationSizeKw);
//         //Annual Energy Production
//         // want to return value of initialAcKwhPerYear

//         const yearlyEnergyDcKwh = PanelCount * panelCapacityWatts;
//         const initialAcKwhPerYear = yearlyEnergyDcKwh * dcToAcDerateInput;
//         storeYearlyEnergy(initialAcKwhPerYear);

//         // Household Electricity Covered
//         const energyCovered = (initialAcKwhPerYear / yearlyKwhEnergyConsumption) * 100;
//         yearlyEnergyCovered(energyCovered);

//         ///// Cost Without Solar 10 years
//         const yearlyCostWithoutSolar10 = [...Array(installationLifeSpan10).keys()].map((year) => {
//             const yearlyBill = averageBill * 12 * costIncreaseFactor ** year; // bill goes up yearly
//             const discountedBill = yearlyBill / discountRate ** year; // bring to today's value
//             return discountedBill;
//         });
//         const totalCostWithoutSolar10 = yearlyCostWithoutSolar10.reduce((sum, val) => sum + val, 0);
//         totalCostwithoutSolar10(totalCostWithoutSolar10);

//         //// Cost Without Solar 20 years
//         const yearlyCostWithoutSolar20 = [...Array(installationLifeSpan20).keys()].map((year) => {
//             const yearlyBill = averageBill * 12 * costIncreaseFactor ** year; // bill goes up yearly
//             const discountedBill = yearlyBill / discountRate ** year; // bring to today's value
//             return discountedBill;
//         });
//         const totalCostWithoutSolar20 = yearlyCostWithoutSolar20.reduce((sum, val) => sum + val, 0);
//         totalCostwithoutSolar20(totalCostWithoutSolar20);

//         //// Cost Without Solar 30 years
//         const yearlyCostWithoutSolar30 = [...Array(installationLifeSpan30).keys()].map((year) => {
//             const yearlyBill = averageBill * 12 * costIncreaseFactor ** year; // bill goes up yearly
//             const discountedBill = yearlyBill / discountRate ** year; // bring to today's value
//             return discountedBill;
//         });

//         const totalCostWithoutSolar30 = yearlyCostWithoutSolar30.reduce((sum, val) => sum + val, 0);
//         totalCostwithoutSolar30(totalCostWithoutSolar30)
//         // Total Cost With Solar
//         const totalCostwithSolar = (installationCostPerWatt * installationSizeKw) * 1000;
//         console.log("totalCostwithSolar", totalCostwithSolar)
//         totalCostwithoutSolar(totalCostwithSolar);
//         //Savings
//         const savingsOver20Years = totalCostWithoutSolar20 - totalCostwithSolar;
//         savingFun(savingsOver20Years)

//         return PanelCount;
//     };

//     return { getConfigId };
// }
import { useContext, useCallback } from 'react';
import { findSolarConfig } from "../utils/findSolarConfig";
import { AppContext } from '../context/Context';
import { SOLAR_CONSTANTS } from '../constants/solarConstants';

export function useConfigId() {
    const {
        setConFigID, storeInstallationSizeKw, storeYearlyEnergy,
        totalCostwithoutSolar10, totalCostwithoutSolar20, savingFun,
        totalCostwithoutSolar30, totalCostwithoutSolar, buildingInsights,
        configId, energypriceperKW, yearlyEnergyCovered,installCost
    } = useContext(AppContext);

    const {
        panelCapacityWattsInput, panelCapacityWatts, energyCostPerKwhInput,
        installationCostPerWatt, dcToAcDerateInput,
        installationLifeSpan10, installationLifeSpan20, installationLifeSpan30,
        discountRate, costIncreaseFactor
    } = SOLAR_CONSTANTS;

    const getConfigId = useCallback(({ averageBill, customPanelCount = null }) => {

        const yearlyKwhEnergyConsumption = (averageBill / energyCostPerKwhInput) * 12;
        const defaultPanelCapacity = buildingInsights?.solarPotential?.panelCapacityWatts;
        const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacity;

        const PanelCount = customPanelCount ?? findSolarConfig(
            buildingInsights?.solarPotential?.solarPanelConfigs,
            yearlyKwhEnergyConsumption,
            panelCapacityRatio,
            dcToAcDerateInput
        );

        setConFigID(PanelCount);

        const installationSizeKw = (PanelCount * panelCapacityWatts) / 1000;
        storeInstallationSizeKw(installationSizeKw);

        const yearlyEnergyDcKwh = PanelCount * panelCapacityWatts;
        const initialAcKwhPerYear = yearlyEnergyDcKwh * dcToAcDerateInput;
        storeYearlyEnergy(initialAcKwhPerYear);

        const energyCovered = (initialAcKwhPerYear / yearlyKwhEnergyConsumption) * 100;
        yearlyEnergyCovered(energyCovered);

        const calculateCostWithoutSolar = (years) => {
            return [...Array(years).keys()].map((year) => {
                const yearlyBill = averageBill * 12 * costIncreaseFactor ** year;
                const discounted = yearlyBill / discountRate ** year;
                return discounted;
            }).reduce((sum, val) => sum + val, 0);
        };

        totalCostwithoutSolar10(calculateCostWithoutSolar(installationLifeSpan10));
        totalCostwithoutSolar20(calculateCostWithoutSolar(installationLifeSpan20));
        totalCostwithoutSolar30(calculateCostWithoutSolar(installationLifeSpan30));

        const totalCostWithSolar = installationCostPerWatt * installationSizeKw * 1000;
        totalCostwithoutSolar(totalCostWithSolar);

        let installationCostTotal = installationCostPerWatt * installationSizeKw * 1000;
        installCost(installationCostTotal);

        const savings = calculateCostWithoutSolar(installationLifeSpan20) - totalCostWithSolar;
        savingFun(savings);

        return PanelCount;
    }, []);

    return { getConfigId };
}
