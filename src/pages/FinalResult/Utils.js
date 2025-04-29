 
export function showNumber(x) {
    return x.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function showMoney(amount) {
    return `$${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function findSolarConfig(solarPanelConfigs, yearlyKwhEnergyConsumption, panelCapacityRatio, dcToAcDerate) {
    return solarPanelConfigs.findIndex((config) =>
        config.yearlyEnergyDcKwh * panelCapacityRatio * dcToAcDerate >= yearlyKwhEnergyConsumption
    );
}
