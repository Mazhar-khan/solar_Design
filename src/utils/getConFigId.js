// import { useContext } from 'react';
// import { findSolarConfig } from "../pages/FinalResult/Utils";

// export function getConFigId({
//     enterAverageBill, energyCostPerKwhInput, panelConfigs, panelCapacityRatio, dcToAcDerateInput
// }) {
//     const monthlyKwhEnergyConsumption = enterAverageBill / energyCostPerKwhInput;
//     const nowYearlyKwhEnergyConsumption = monthlyKwhEnergyConsumption * 12
//     const nowConfigId = findSolarConfig(
//         panelConfigs,
//         nowYearlyKwhEnergyConsumption,
//         panelCapacityRatio,
//         dcToAcDerateInput
//     )
//     setConFigID(nowConfigId)
//     return nowConfigId;
// }