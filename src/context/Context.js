import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [buildingInsights, setBuildingInsightsState] = useState(null);
    const [dataLayers, setDataLayersState] = useState(null);
    const [userAddress, setUserAddressState] = useState(null);
    const [completeAddress, setCompleteAddressState] = useState(null);
    const [configId, setConfigId] = useState(null);
    const [yearlyEnergy, setYearlyEnergy] = useState(null);
    const [solarInstallationSize, setSolarInstallationSize] = useState(null);
    const [installationCost, setInstallationCost] = useState(null);
    const [yearlyEnergyCover, setYearlyEnergyCover] = useState(null);
    const [withSolarCost10, setWithSolarCost10] = useState(null);
    const [withSolarCost20, setWithSolarCost20] = useState(null);
    const [withSolarCost30, setWithSolarCost30] = useState(null);
    const [withSolarCost, setWithSolarCost] = useState(null);
     const [saving, setSaving] = useState(null);

    useEffect(() => {
        const storedInsights = localStorage.getItem('buildingInsights');
        const storedLayers = localStorage.getItem('dataLayers');
        const storedAddress = localStorage.getItem('userAddress');
        const storedComplete = localStorage.getItem('completeAddress');
        const storedConfig = localStorage.getItem('conFigId');
        const storedYearlyEnergy = localStorage.getItem('yearlyEnergy');
        const storeInstallationSizeKw = localStorage.getItem('InstallationSizeKw');
        const InstallationCost = localStorage.getItem('InstallationCost');
        const yearlyEnergyCover = localStorage.getItem('yearlyEnergyCovered');
        const costwithoutsolar10 = localStorage.getItem('costWithoutsolar10');
        const costwithoutsolar20 = localStorage.getItem('costWithoutsolar20');
        const costwithoutsolar30 = localStorage.getItem('costWithoutsolar30');
        const costwithoutsolar = localStorage.getItem('costWithoutsolar');
        const savingVar = localStorage.getItem('savings');

        if (storedInsights) setBuildingInsightsState(JSON.parse(storedInsights));
        if (storedLayers) setDataLayersState(JSON.parse(storedLayers));
        if (storedAddress) setUserAddressState(JSON.parse(storedAddress));
        if (storedComplete) setCompleteAddressState(JSON.parse(storedComplete));
        if (storedConfig) setConfigId(localStorage.getItem('conFigId'));
        if (storedYearlyEnergy) setYearlyEnergy(localStorage.getItem('yearlyEnergy'));
        if (storeInstallationSizeKw) setSolarInstallationSize(localStorage.getItem('yearlyEnergy'));
        if (InstallationCost) setSolarInstallationSize(localStorage.getItem('InstallationCost'));
        if (yearlyEnergyCover) setYearlyEnergyCover(localStorage.getItem('yearlyEnergyCovered'));
        if (costwithoutsolar10) setWithSolarCost10(localStorage.getItem('costWithoutsolar10'));
        if (costwithoutsolar20) setWithSolarCost20(localStorage.getItem('costWithoutsolar20'));
        if (costwithoutsolar30) setWithSolarCost30(localStorage.getItem('costWithoutsolar30'));
        if (costwithoutsolar) setWithSolarCost(localStorage.getItem('costWithoutsolar'));
        if (savingVar) setSaving(localStorage.getItem('savings'));
    }, []);

    const setBuildingInsights = (value) => {
        setBuildingInsightsState(value);
        localStorage.setItem('buildingInsights', JSON.stringify(value));
    };

    const setDataLayers = (value) => {
        setDataLayersState(value);
        localStorage.setItem('dataLayers', JSON.stringify(value));
    };

    const setUserAddress = (value) => {
        setUserAddressState(value);
        localStorage.setItem('userAddress', JSON.stringify(value));
    };

    const setCompleteAddress = (value) => {
        setCompleteAddressState(value);
        localStorage.setItem('completeAddress', JSON.stringify(value));
    };

    const setConFigID = (value) => {
        setConfigId(value);
        console.log("value", value);
        localStorage.setItem("conFigId", JSON.stringify(value));
    }

    const storeYearlyEnergy = (value) => {
        setYearlyEnergy(value);
        localStorage.setItem("yearlyEnergy", JSON.stringify(value))
    }

    const storeInstallationSizeKw = (value) => {
        setSolarInstallationSize(value);
        localStorage.setItem("InstallationSizeKw", JSON.stringify(value))
    }

    const installCost = (value) => {
        setInstallationCost(value);
        localStorage.setItem("installationCost", JSON.stringify(value))
    }

    const yearlyEnergyCovered = (value) => {
        setYearlyEnergyCover(value);
        localStorage.setItem("yearlyEnergyCovered", JSON.stringify(value))
    }

    const totalCostwithoutSolar10 = (value) => {
        setWithSolarCost10(value);
        localStorage.setItem("costWithoutsolar10", JSON.stringify(value))
    }

    const totalCostwithoutSolar20 = (value) => {
        setWithSolarCost20(value);
        localStorage.setItem("costWithoutsolar20", JSON.stringify(value))
    }
    const totalCostwithoutSolar30 = (value) => {
        setWithSolarCost30(value);
        localStorage.setItem("costWithoutsolar30", JSON.stringify(value))
    }

    const totalCostwithoutSolar = (value) => {
        setWithSolarCost(value);
        localStorage.setItem("costWithoutsolar", JSON.stringify(value))
    }

     const savingFun = (value) => {
        setSaving(value);
        localStorage.setItem("savings", JSON.stringify(value))
    }

    return (
        <AppContext.Provider
            value={{
                buildingInsights,
                setBuildingInsights,
                dataLayers,
                setDataLayers,
                userAddress,
                setUserAddress,
                completeAddress,
                setCompleteAddress,
                setConFigID,
                configId,
                storeYearlyEnergy,
                yearlyEnergy,
                storeInstallationSizeKw,
                solarInstallationSize,
                installationCost,
                installCost,
                yearlyEnergyCovered,
                yearlyEnergyCover,
                totalCostwithoutSolar10,
                withSolarCost10,
                totalCostwithoutSolar20,
                withSolarCost20,
                totalCostwithoutSolar30,
                withSolarCost30,
                totalCostwithoutSolar,
                withSolarCost,
                savingFun,
                saving
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
