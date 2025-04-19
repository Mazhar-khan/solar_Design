import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Autocomplete from 'react-google-autocomplete';
import { AppContext } from '../../context/Context';

export default function Estimated() {
    const navigate = useNavigate();
    const { data, setData, buildingInsights, setBuildingInsights, setUserAddress,setCompleteAddress } = useContext(AppContext);
    const [isAddressSelected, setIsAddressSelected] = useState(false);
    const [address, setAddress] = useState('');
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

    // const [resultPanelCount, setResultPanelCount] = useState('');
    // const [resultYearlyEnergy, setResultYearlyEnergy] = useState('');
    // const [resultMaxPanel, setResultMaxPanel] = useState('');
    // const [resultRoofArea, setResultRoofArea] = useState('');
    // const [resultCO2, setResultCO2] = useState('');
    // const [resultSunshine, setResultSunshine] = useState('');
    // const [sqrFeet, setSqrFeet] = useState('');

    // const handlePlaceSelected = async (place) => {
    //     debugger
    //     const addressComponents = place.address_components;
    //     const locationData = {
    //         geo: [place.geometry.location.lat(), place.geometry.location.lng()],
    //         country: addressComponents.find(component => component.types.includes("country"))?.long_name || null,
    //         state: addressComponents.find(component => component.types.includes("administrative_area_level_1"))?.long_name || null,
    //         city: addressComponents.find(component => component.types.includes("locality"))?.long_name || null,
    //         postalCode: addressComponents.find(component => component.types.includes("postal_code"))?.long_name || null,
    //         street: addressComponents.find(component => component.types.includes("route"))?.long_name || null,
    //         streetNumber: addressComponents.find(component => component.types.includes("street_number"))?.long_name || null,
    //     };


    //     setAddress(`${locationData.street} ${locationData.streetNumber}, ${locationData.city}, ${locationData.state} ${locationData.postalCode}, ${locationData.country}`);
    //     setIsAddressSelected(true);

    //     // setData(prevData => ({
    //     //     ...prevData,
    //     //     locationInfo: locationData,
    //     // }));

    //     // setting address information for later usage 
    //     setUserAddress(locationData);

    //     try {
    //         const insights = await findClosestBuilding(locationData, apiKey);
    //         console.log("insight from maz", insights.solarPotential.maxArrayPanelsCount)
    //         setData(prevData => ({
    //             ...prevData,
    //             maxPanel: insights.solarPotential.maxArrayPanelsCount,
    //         }));
    //         const solarPanels = insights.solarPotential?.solarPanels;
    //         const panelCountList = solarPanels.map(panel => ({
    //             segmentIndex: panel.segmentIndex,
    //             panelCount: panel.panelCount
    //         }));
    //         const totalPanelCount = panelCountList.reduce((sum, panel) => sum + panel.panelCount, 0);
    //         console.log("totalPanelCount", totalPanelCount)
    //         setData(prevData => ({
    //             ...prevData,
    //             buildingInsights: insights,
    //         }));
    //         // Update userInfo based on building insights
    //         updateResults(insights);
    //     } catch (error) {
    //         console.error("Error fetching building insights:", error);
    //     }
    // };

    // 1. Extract address and set context/state
    const handlePlaceSelection = (place) => {
        const addressComponents = place?.address_components || [];

        const getComponent = (type) =>
            addressComponents.find(c => c.types.includes(type))?.long_name || null;

        const locationData = {
            geo: [
                place.geometry.location.lat(),
                place.geometry.location.lng()
            ],
            country: getComponent("country"),
            state: getComponent("administrative_area_level_1"),
            city: getComponent("locality"),
            postalCode: getComponent("postal_code"),
            street: getComponent("route"),
            streetNumber: getComponent("street_number")
        };

        const fullAddress = `${locationData.street} ${locationData.streetNumber}, ${locationData.city}, ${locationData.state} ${locationData.postalCode}, ${locationData.country}`;

        setAddress(fullAddress);
        setIsAddressSelected(true);
        setUserAddress(fullAddress);
        setCompleteAddress(locationData);

        // Trigger the insights fetch separately
        fetchBuildingInsights(locationData);
    };

    const fetchBuildingInsights = async (locationData) => {
        try {
            const insights = await findClosestBuilding(locationData, apiKey);
            if (insights) {
                setBuildingInsights(insights);

            }
            console.log("insight from mazhar", insights)
            // const maxPanels = insights?.solarPotential?.maxArrayPanelsCount || 0;
            // const totalPanelCount = insights?.solarPotential?.solarPanels
            //     ?.reduce((sum, panel) => sum + (panel.panelCount || 0), 0) || 0;

            // setData(prev => ({
            //     ...prev,
            //     maxPanel: maxPanels,
            //     buildingInsights: insights,
            // }));

            // console.log("Max Panels:", maxPanels);
            // console.log("Total Panels:", totalPanelCount);

            // updateResults(insights);

        } catch (error) {
            console.error("Error fetching building insights:", error);
        }
    };


    const findClosestBuilding = async (location, apiKey) => {
        const args = {
            'location.latitude': location.geo[0].toFixed(5),
            'location.longitude': location.geo[1].toFixed(5),
        };

        // setData(prevData => ({
        //     ...prevData,
        //     userInfo: {
        //         ...prevData.userInfo,
        //         lati: location.geo[0].toFixed(5),
        //         longi: location.geo[1].toFixed(5),
        //     }
        // }));

        const params = new URLSearchParams({ ...args, key: apiKey });
        const response = await fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`);
        const content = await response.json();
        if (response.status !== 200) {
            console.error('findClosestBuilding\n', content);
            throw content;
        }
        return content;
    };

    // const updateResults = (buildingInsights) => {
    //     setData(prevData => ({
    //         ...prevData,
    //         solarPanelConfigs: buildingInsights?.solarPotential
    //     }));
    //     const solarPotential = buildingInsights.solarPotential;
    //     const maximumPanelCount = buildingInsights.solarPotential.maxArrayPanelsCount;
    //     console.log("maximumPanelCount", maximumPanelCount)

    //     let panelCapacityWattsInput = 250;
    //     let dcToAcDerateInput = 0.85;
    //     let monthlyAverageEnergyBillInput = 300;
    //     let energyCostPerKwhInput = 0.31;
    //     let yearlyKwhEnergyConsumption = (monthlyAverageEnergyBillInput / energyCostPerKwhInput) * 12;
    //     const defaultPanelCapacity = buildingInsights.solarPotential.panelCapacityWatts;
    //     const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacity;
    //     const haji = panelCapacityRatio * dcToAcDerateInput;
    //     const yearlymax = yearlyKwhEnergyConsumption / haji;
    //     let config;

    //     function findPanelsCount(buildingInsights, yearlymax) {
    //         const solarPanelConfigs = buildingInsights.solarPotential.solarPanelConfigs;
    //         for (let i = 0; i < solarPanelConfigs.length; i++) {
    //             config = solarPanelConfigs[i];
    //             if (config.yearlyEnergyDcKwh >= yearlymax) { return config.panelsCount; }
    //         }
    //     }

    //     const panelsCount = findPanelsCount(buildingInsights, yearlymax);
    //     console.log("panelsCountpanelsCount", panelsCount)

    //     // Calculate total yearly energy and other metrics
    //     const totalYearlyEnergy = solarPotential.solarPanelConfigs.reduce((acc, config) => acc + config.yearlyEnergyDcKwh, 0);
    //     const maxPanelCount = solarPotential.solarPanels.length;

    //     // Log results to console
    //     setData(prevData => ({
    //         ...prevData,
    //         panelsCount: panelsCount
    //     }));
    //     // console.log("Total Yearly Energy:", totalYearlyEnergy);
    //     // console.log("Max Panel Count:", maxPanelCount);
    //     // console.log("Roof Area:", solarPotential.wholeRoofStats.areaMeters2 + ' m²');
    //     // console.log("CO2 Offset:", solarPotential.carbonOffsetFactorKgPerMwh + ' Kg/MWh');
    //     // console.log("Sunshine Hours:", solarPotential.maxSunshineHoursPerYear);

    //     const percentageUse = (solarPotential.yearlyEnergyDcKwh / yearlyKwhEnergyConsumption) * 100;

    //     // console.log("System Details:");
    //     // console.log("Size (KW):", solarPotential.panelCapacityWatts / 1000);
    //     // console.log("Annual generation (KWh):", solarPotential.solarPanelConfigs.map(config => config.yearlyEnergyDcKwh));
    //     // console.log("Inverter: Example - Tesla Inverter, 97% efficiency"); // Static or user-defined
    //     // console.log("Percentage of Annual Electricity Use:", percentageUse.toFixed(2) + "%");

    //     // Incentives
    //     // console.log("Federal Incentive (FTC):", "Details here"); // Placeholder for federal incentives
    //     // console.log("State Incentives (over 10 years):", "Details here"); // Placeholder for state incentives

    //     // Savings
    //     // console.log("Total Avoided electric utility costs:", "Details here"); // Placeholder for savings
    //     // console.log("Net savings:", "Details here"); // Placeholder for net savings

    //     // Costs
    //     // console.log("Price Per Watt (PPW):", "Details here"); // Placeholder for price per watt
    //     // console.log("Install Cost, Solar Home System:", "Details here"); // Placeholder for install cost
    //     // console.log("EV Charger:", "Details here"); // Placeholder for EV charger cost
    //     // console.log("Total: Solar + EV Charger:", "Details here"); // Placeholder for total cost

    //     // Financing
    //     // console.log("Loan APR:", "Details here"); // Placeholder for loan APR
    //     // console.log("Monthly Payment (by 10, 15, and 20 yr term):", "Details here"); // Placeholder for monthly payments

    //     // Environmental Benefit
    //     // console.log("CO2 savings, over 20 years:", "Details here"); // Placeholder for CO2 savings
    //     // console.log("Reduction in average household carbon footprint (%):", "Details here"); // Placeholder for carbon footprint reduction

    //     // Total Electricity Cost
    //     // console.log("Total Electricity Cost Without Solar:", "Details here"); // Placeholder for total electricity cost without solar


    //     // Update state variables
    //     setResultPanelCount(panelsCount);
    //     setResultYearlyEnergy(config ? (config.yearlyEnergyDcKwh * panelCapacityRatio) + ' KWh' : 'N/A');
    //     setResultMaxPanel(maxPanelCount);
    //     setResultRoofArea(solarPotential.wholeRoofStats.areaMeters2 + ' m²');
    //     setResultCO2(solarPotential.carbonOffsetFactorKgPerMwh + ' Kg/MWh');
    //     setResultSunshine(solarPotential.maxSunshineHoursPerYear);
    //     setSqrFeet(solarPotential.wholeRoofStats.areaMeters2);

    //     // Additional data updates
    //     setData(prevData => ({
    //         ...prevData,
    //         userInfo: {
    //             ...prevData.userInfo,
    //             inputaddress: prevData.locationInfo.street,
    //             lati: buildingInsights.center.latitude,
    //             longi: buildingInsights.center.longitude,
    //             panelcount: solarPotential.solarPanelConfigs.reduce((total, config) => total + config.panelsCount, 0),
    //             roofarea: solarPotential.wholeRoofStats.areaMeters2,
    //             sunshine: solarPotential.maxSunshineHoursPerYear,
    //             system_cost: solarPotential.systemCost,
    //             // country_iso: locationInfo.country,
    //             tax_incentive: solarPotential.taxIncentives,
    //             without_solar: solarPotential.totalElectricityCostWithoutSolar,
    //             yenergy: solarPotential.yearlyEnergyDcKwh,
    //             // zip: locationInfo.postalCode
    //         }
    //     }));

    //     if (maxPanelCount > 0) {
    //         document.getElementById('gform_submit_button_1').disabled = false;
    //     } else {
    //         alert('No insight available for this address, please enter a valid address');
    //     }
    // };

    // useEffect(() => {
    //     console.log("setData12", data)
    // }, [])

    const handleSubmit = () => {
        if (isAddressSelected) {
            navigate('/home-address');
        } else {
            alert('Please select a valid address.');
        }
    };

    return (
        <>
            <div
                style={{
                    height: "120vh",
                    backgroundImage: "url(assets/img/hero-section.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
                className="position-relative w-100"
            >
                <div
                    className="position-absolute text-white d-flex flex-column align-items-center justify-content-center"
                    style={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                    <h1 className="mb-4 mt-2 font-weight-bold text-center"
                        style={{ fontWeight: '900', fontSize: '40px', boxShadow: 'rgba(0, 0, 0, 0.29)' }}>
                        Explore Solar Options <br />
                        Without Sharing Personal Info
                    </h1>
                    <div className="text-center mt-4">
                        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center">
                            <Autocomplete
                                apiKey={apiKey}
                                onPlaceSelected={handlePlaceSelection}
                                style={{ flex: '1', marginBottom: '10px' }}
                                placeholder="Enter a valid address"
                                options={{ types: ['address'] }}
                                type="text"
                                className="form-control mb-2 mb-sm-0 me-sm-2"
                            />
                            <button
                                onClick={handleSubmit}
                                className="button-elemented"
                                style={{ opacity: isAddressSelected ? 1 : 0.5, pointerEvents: isAddressSelected ? 'auto' : 'none' }}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}