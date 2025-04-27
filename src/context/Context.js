import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [data, setData] = useState({
        locationInfo: null,
        buildingInsights: null,
        panelsCount: null,
        solarPanelConfigs: null,
        userInfo: {
            inputaddress: '',
            lati: null,
            longi: null,
            monthly: 0,
            panelcount: 0,
            roofarea: 0,
            savings: 0,
            sqfeet: 0,
            maxPanelCount: 0,
            state: '',
            sunshine: 0,
            system_cost: 0,
            system_size: 0,
            country_iso: null,
            tax_incentive: 0,
            without_solar: 0,
            yenergy: 0,
            zip: '',
        },
        maxPanel: null
    });

    const [buildingInsights, setBuildingInsights] = useState(null);
    const [dataLayers, setDataLayers] = useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [completeAddress, setCompleteAddress] = useState(null);

    // useEffect(() => {
    //     if (userData !== null) {
    //         localStorage.setItem("userData", JSON.stringify(userData));
    //     } else {
    //         localStorage.removeItem("userData"); // optional: clear on null
    //     }
    // }, [userData]);

    return (
        <AppContext.Provider 
        value={{ 
            data, 
            setData, 
            buildingInsights, 
            setBuildingInsights, 
            userAddress, 
            setUserAddress, 
            setCompleteAddress, 
            completeAddress,
            dataLayers,
            setDataLayers
            }}>
            {children}
        </AppContext.Provider>
    );
};


