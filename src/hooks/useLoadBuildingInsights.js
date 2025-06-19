import { useCallback, useContext } from 'react';
import { AppContext } from '../context/Context';
import { SOLAR_CONSTANTS } from '../constants/solarConstants';
import { useConfigId } from './useConfigId';

export const useLoadBuildingInsights = ({ renderSolarPanels, averageBill, hitPanelCount }) => {
  const { configId, buildingInsights, storeInstallationSizeKw, installCost } = useContext(AppContext);
  const { panelCapacityWatts, installationCostPerWatt } = SOLAR_CONSTANTS;

  const { getConfigId } = useConfigId();

  const loadBuildingInsights = useCallback(
    async (geometry, mapInstance) => {
      if (!buildingInsights) return;
      // console.log("configIdconfigId", configId)
      // const foundConfigId = getConfigId({ averageBill });
      // console.log("foundConfigId", foundConfigId)
      // let installationSizeKw = (foundConfigId * panelCapacityWatts) / 1000;
      // storeInstallationSizeKw(installationSizeKw)
      // let installationCostTotal = installationCostPerWatt * installationSizeKw * 1000;
      // installCost(installationCostTotal);

      // const panelConfig = buildingInsights.solarPotential.solarPanelConfigs[configId];
      // await renderSolarPanels(geometry, buildingInsights, mapInstance, foundConfigId);
    }, [renderSolarPanels, averageBill, hitPanelCount]
  );

  return { loadBuildingInsights };
};