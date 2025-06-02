import { useCallback } from 'react';
import { findSolarConfig } from '../pages/FinalResult/Utils';
import { findClosestBuilding } from '../pages/FinalResult/Solar';

export const useLoadBuildingInsights = ({
  completeAddress,
  apiKey,
  yearlyKwhEnergyConsumption,
  panelCapacityWattsInput,
  dcToAcDerateInput,
  renderSolarPanels,
  setBuildingInsightss,
  setPanelCapacity,
  setConfigId,
  setPanelConfig,
}) => {
  const loadBuildingInsights = useCallback(
    async (geometry, mapInstance) => {
      const building = await findClosestBuilding(completeAddress, apiKey);
      setBuildingInsightss(building);

      if (!building) return;

      const defaultPanelCapacity = building.solarPotential.panelCapacityWatts;
      setPanelCapacity(defaultPanelCapacity);

      const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacity;

      const foundConfigId = findSolarConfig(
        building.solarPotential.solarPanelConfigs,
        yearlyKwhEnergyConsumption,
        panelCapacityRatio,
        dcToAcDerateInput
      );

      await renderSolarPanels(geometry, building, mapInstance, foundConfigId);

      setConfigId(foundConfigId);
      if (foundConfigId !== undefined) {
        setPanelConfig(building.solarPotential.solarPanelConfigs[foundConfigId]);
      }
    },
    [
      completeAddress,
      apiKey,
      yearlyKwhEnergyConsumption,
      panelCapacityWattsInput,
      dcToAcDerateInput,
      renderSolarPanels,
      setBuildingInsightss,
      setPanelCapacity,
      setConfigId,
      setPanelConfig,
    ]
  );

  return { loadBuildingInsights };
};
