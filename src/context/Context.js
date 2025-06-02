import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [buildingInsights, setBuildingInsightsState] = useState(null);
    const [dataLayers, setDataLayersState] = useState(null);
    const [userAddress, setUserAddressState] = useState(null);
    const [completeAddress, setCompleteAddressState] = useState(null);

    useEffect(() => {
        const storedInsights = localStorage.getItem('buildingInsights');
        const storedLayers = localStorage.getItem('dataLayers');
        const storedAddress = localStorage.getItem('userAddress');
        const storedComplete = localStorage.getItem('completeAddress');

        if (storedInsights) setBuildingInsightsState(JSON.parse(storedInsights));
        if (storedLayers) setDataLayersState(JSON.parse(storedLayers));
        if (storedAddress) setUserAddressState(JSON.parse(storedAddress));
        if (storedComplete) setCompleteAddressState(JSON.parse(storedComplete));
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
                setCompleteAddress
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
