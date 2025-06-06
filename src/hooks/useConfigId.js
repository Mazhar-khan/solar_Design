// src/hooks/useConfigId.js
import { useContext } from 'react';
import { findSolarConfig } from "../pages/FinalResult/Utils";
import { AppContext } from '../context/Context';
import { SOLAR_CONSTANTS } from '../constants/solarConstants';

export function useConfigId() {
    const { setConFigID, storeInstallationSizeKw, storeYearlyEnergy,
        totalCostwithoutSolar10, totalCostwithoutSolar20, savingFun, totalCostwithoutSolar30, totalCostwithoutSolar,
        yearlyEnergyCovered } = useContext(AppContext);
    const {
        panelCapacityWattsInput,
        panelCapacityWatts,
        energyCostPerKwhInput,
        installationCostPerWatt,
        dcToAcDerateInput,
        installationLifeSpan10,
        installationLifeSpan20,
        installationLifeSpan30,
        discountRate,
        costIncreaseFactor,
        installationLifeSpan,
        solarIncentives
    } = SOLAR_CONSTANTS;

    const getConfigId = ({
        averageBill,
        buildingInsights,
    }) => {
        const yearlyKwhEnergyConsumption = (averageBill / energyCostPerKwhInput) * 12;
        const defaultPanelCapacity = buildingInsights?.solarPotential?.panelCapacityWatts;
        const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacity;

        const PanelCount = findSolarConfig(
            buildingInsights?.solarPotential?.solarPanelConfigs,
            yearlyKwhEnergyConsumption,
            panelCapacityRatio,
            dcToAcDerateInput
        );

        setConFigID(PanelCount);

        //Installation Size
        // want to return value of installationSizeKw
        const installationSizeKw = (PanelCount * panelCapacityWatts) / 1000;
        storeInstallationSizeKw(installationSizeKw);
        //Annual Energy Production
        // want to return value of initialAcKwhPerYear

        const yearlyEnergyDcKwh = PanelCount * panelCapacityWatts;
        const initialAcKwhPerYear = yearlyEnergyDcKwh * dcToAcDerateInput;
        storeYearlyEnergy(initialAcKwhPerYear);

        // Household Electricity Covered
        const energyCovered = (initialAcKwhPerYear / yearlyKwhEnergyConsumption) * 100;
        yearlyEnergyCovered(energyCovered);

        ///// 10 years
        const yearlyCostWithoutSolar10 = [...Array(installationLifeSpan10).keys()].map((year) => {
            const yearlyBill = averageBill * 12 * costIncreaseFactor ** year; // bill goes up yearly
            const discountedBill = yearlyBill / discountRate ** year; // bring to today's value
            return discountedBill;
        });
        const totalCostWithoutSolar10 = yearlyCostWithoutSolar10.reduce((sum, val) => sum + val, 0);
        totalCostwithoutSolar10(totalCostWithoutSolar10);

        //// 20 years
        const yearlyCostWithoutSolar20 = [...Array(installationLifeSpan20).keys()].map((year) => {
            const yearlyBill = averageBill * 12 * costIncreaseFactor ** year; // bill goes up yearly
            const discountedBill = yearlyBill / discountRate ** year; // bring to today's value
            return discountedBill;
        });
        const totalCostWithoutSolar20 = yearlyCostWithoutSolar20.reduce((sum, val) => sum + val, 0);
        totalCostwithoutSolar20(totalCostWithoutSolar20);

        //// 30 years
        const yearlyCostWithoutSolar30 = [...Array(installationLifeSpan30).keys()].map((year) => {
            const yearlyBill = averageBill * 12 * costIncreaseFactor ** year; // bill goes up yearly
            const discountedBill = yearlyBill / discountRate ** year; // bring to today's value
            return discountedBill;
        });
        const totalCostWithoutSolar30 = yearlyCostWithoutSolar30.reduce((sum, val) => sum + val, 0);
        totalCostwithoutSolar30(totalCostWithoutSolar30)

        const totalCostwithSolar = (installationCostPerWatt * installationSizeKw) * 1000;
        console.log("totalCostwithSolar", totalCostwithSolar)
        totalCostwithoutSolar(totalCostwithSolar);

        const savingsOver20Years = totalCostWithoutSolar20 - totalCostwithSolar;
        savingFun(savingsOver20Years)

        return PanelCount;
    };

    return { getConfigId };
}
