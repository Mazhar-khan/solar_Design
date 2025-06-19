export function findSolarConfig(solarPanelConfigs, yearlyKwhEnergyConsumption, panelCapacityRatio, dcToAcDerate) {
    return solarPanelConfigs.findIndex((config) =>
        config.yearlyEnergyDcKwh * panelCapacityRatio * dcToAcDerate >= yearlyKwhEnergyConsumption
    );
}
