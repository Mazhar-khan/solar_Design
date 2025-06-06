import { useCallback, useContext } from 'react';
import { findSolarConfig } from '../pages/FinalResult/Utils';
import { findClosestBuilding } from '../pages/FinalResult/Solar';
import { AppContext } from '../context/Context';
import { SOLAR_CONSTANTS } from '../constants/solarConstants';
import { useConfigId } from './useConfigId';

export const useLoadBuildingInsights = ({ renderSolarPanels, averageBill,hitPanelCount }) => {
  const { setConFigID, configId, storeYearlyEnergy, yearlyEnergyCovered,
    buildingInsights, storeInstallationSizeKw, installCost } = useContext(AppContext);
  const {
    panelCapacityWattsInput,
    panelCapacityWatts,
    energyCostPerKwhInput,
    installationCostPerWatt,
    dcToAcDerateInput,
  } = SOLAR_CONSTANTS;

  
  const { getConfigId } = useConfigId();


  const loadBuildingInsights = useCallback(
    async (geometry, mapInstance) => {
      if (!buildingInsights) return;

      const foundConfigId = getConfigId({
        averageBill,
        buildingInsights,
      }
      );

      console.log("foundConfigId", foundConfigId)

      // installation size

      let installationSizeKw = (foundConfigId * panelCapacityWatts) / 1000;
      storeInstallationSizeKw(installationSizeKw)
      let installationCostTotal = installationCostPerWatt * installationSizeKw * 1000;
      installCost(installationCostTotal);
      // set config id into context

      if (buildingInsights) {
        // const yearlyEnergyDcKwh = buildingInsights.solarPotential.solarPanelConfigs[configId].yearlyEnergyDcKwh;
        // const initialAcKwhPerYear = yearlyEnergyDcKwh * panelCapacityRatio * dcToAcDerateInput;
        // const energyCoveredValue = ((initialAcKwhPerYear / yearlyKwhEnergyConsumption) * 100).toFixed(2);
        // yearlyEnergyCovered(energyCoveredValue);
      }


      // panel config
      const panelConfig = buildingInsights.solarPotential.solarPanelConfigs[configId];
      // if (!panelConfig) return;
      // const yearlyEnergy = (buildingInsights.solarPotential.solarPanelConfigs[configId]?.yearlyEnergyDcKwh ?? 0) * panelCapacityRatio;
      // console.log("yearlyEnergy", yearlyEnergy.toFixed(2))
      // storeYearlyEnergy(yearlyEnergy.toFixed(2));
      // setConFigID(foundConfigId);


      await renderSolarPanels(geometry, buildingInsights, mapInstance, foundConfigId);
    }, [renderSolarPanels, averageBill,hitPanelCount]
  );

  return { loadBuildingInsights };
};