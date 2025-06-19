import React, { useState, useContext, useCallback, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { bill } from "../../constants/defaultBill";

import { AppContext } from '../../context/Context';
import { useBuildingInsights } from "../../hooks/useBuildingInsights";
import { useDataLayerUrls } from "../../hooks/useDataLayers";
import { getComponent, formatFullAddress } from "../../utils/addressUtils";
import {
    HEADLINE_TEXT,
    TOOL_TIPS,
    ADDRESS_PLACEHOLDER,
    INTRO_LIST,
    TABLE_1,
    TABLE_2,
    DISCLAIMER
} from "../../constants/estimatedText";
import CustomTooltip from "../../components/CustomTooltip";
import { useConfigId } from "../../hooks/useConfigId";
import { SOLAR_CONSTANTS } from "../../constants/solarConstants";

export default function AddressInputPage() {
    const navigate = useNavigate();
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    const {
        panelCapacityWattsInput,
        panelCapacityWatts,
        energyCostPerKwhInput,
        installationCostPerWatt,
        dcToAcDerateInput,
    } = SOLAR_CONSTANTS;


    const {
        setBuildingInsights,
        setUserAddress,
        setCompleteAddress,
        setDataLayers,
        storeBill,
        defaultBill,
        setConFigID,
        storeInstallationSizeKw, installCost
    } = useContext(AppContext);

    const [isAddressSelected, setIsAddressSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invalidAddress, setInvalidAddress] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const autocompleteServiceRef = useRef(null);
    const placesServiceRef = useRef(null);
    const inputRef = useRef(null);
    const manualSelectionRef = useRef(false);


    const { findClosestBuilding } = useBuildingInsights(apiKey);
    const { getDataLayerUrls } = useDataLayerUrls(apiKey);
    const { getConfigId } = useConfigId();

    useEffect(() => {
        if (!autocompleteServiceRef.current && window.google) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            const dummyDiv = document.createElement("div");
            placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (inputValue && autocompleteServiceRef.current && !manualSelectionRef.current) {
                autocompleteServiceRef.current.getPlacePredictions(
                    {
                        input: inputValue,
                        types: ['address'],
                        componentRestrictions: { country: 'us' },
                    },
                    (predictions) => {
                        if (predictions) {
                            setSuggestions(predictions);
                        }
                    }
                );
            } else {
                setSuggestions([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue]);

    const isValidBuildingAddress = (place) => {
        const components = place?.address_components || [];
        return (
            components.some(comp => comp.types.includes("route")) &&
            components.some(comp => comp.types.includes("street_number")) &&
            components.some(comp => comp.types.includes("locality")) &&
            place?.geometry?.location?.lat && place?.geometry?.location?.lng
        );
    };

    const extractLocationData = (place) => {
        const components = place?.address_components || [];
        return {
            geo: [place.geometry.location.lat(), place.geometry.location.lng()],
            country: getComponent(components, "country"),
            state: getComponent(components, "administrative_area_level_1"),
            city: getComponent(components, "locality"),
            postalCode: getComponent(components, "postal_code"),
            street: getComponent(components, "route"),
            streetNumber: getComponent(components, "street_number")
        };
    };

    const getStateName = (place) => {
        return place?.formatted_address?.split(",")[2]?.split(" ")[1];
    };

    const setDefaultBillFromState = (place) => {
        const stateName = getStateName(place);
        const matchedBill = bill.find(item => item.State === stateName);
        const energyprice = matchedBill.perkWhperkWh;
        storeBill(Math.round(matchedBill?.defaultBill));
    };

    const fetchInsightsAndLayers = async (locationData) => {
        try {
            setLoading(true);
            const insights = await findClosestBuilding(locationData);
            if (insights) {
                setBuildingInsights(insights);
                console.log("defaultBill", defaultBill);
                const averageBill = defaultBill
                const foundConfigId = getConfigId({ averageBill });
                console.log("foundConfigId", foundConfigId);
                if (foundConfigId) {
                    setConFigID(foundConfigId);
                    let installationSizeKw = (foundConfigId * panelCapacityWatts) / 1000;
                    storeInstallationSizeKw(installationSizeKw)
                    let installationCostTotal = installationCostPerWatt * installationSizeKw * 1000;
                    installCost(installationCostTotal);
                }

                // const layers = await getDataLayerUrls(locationData, insights);
                // if (layers) {
                //     const imageryQuality = layers.imageryQuality;
                //     localStorage.setItem("LayersImageQuality",imageryQuality)
                // }
                // // getLayer
                // // useGetLayer
                // console.log("layers", layers)
                // if (layers) setDataLayers(layers);
            }
        } catch (error) {
            console.error("Error fetching building insights or data layers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceSelection = useCallback(async (placeId, description) => {
        manualSelectionRef.current = true;
        setSuggestions([]);
        setInputValue(description);
        if (placesServiceRef.current) {
            placesServiceRef.current.getDetails({ placeId }, async (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    const fullFormattedAddress = place?.formatted_address || "the entered address";

                    if (!isValidBuildingAddress(place)) {
                        setIsAddressSelected(false);
                        setInvalidAddress(fullFormattedAddress);
                        return;
                    }

                    const locationData = extractLocationData(place);
                    const fullAddress = formatFullAddress(locationData);

                    setIsAddressSelected(true);
                    setInvalidAddress("");
                    setUserAddress(fullAddress);
                    setCompleteAddress(locationData);
                    setDefaultBillFromState(place);

                    await fetchInsightsAndLayers(locationData);
                }
            });
        }
        setTimeout(() => {
            manualSelectionRef.current = false;
        }, 1000);
    }, [findClosestBuilding, getDataLayerUrls]);

    const handleSubmit = () => {
        if (isAddressSelected) navigate('/confirm-address');
    };

    return (
        <div className="container-with-img bg-of-page">
            <div className="d-flex justify-content-center align-items-center content-bg">
                <h1 className="fw-bold text-white">{HEADLINE_TEXT}</h1>
            </div>

            <div>
                <div className="d-flex flex-column align-items-center content-bg position-relative w-100" style={{ maxWidth: 600, margin: "0 auto" }}>
                    <div className="d-flex w-100 gap-2 position-relative" style={{ zIndex: 5 }}>
                        <input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="form-control"
                            placeholder={ADDRESS_PLACEHOLDER}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') e.preventDefault();
                            }}
                        />

                        <CustomTooltip title={TOOL_TIPS.getStarted} arrow>
                            <span style={{ display: 'inline-block' }}>
                                <button
                                    onClick={handleSubmit}
                                    className="button-elemented"
                                    disabled={!isAddressSelected || loading}
                                    style={{
                                        opacity: isAddressSelected ? 1 : 0.5,
                                        pointerEvents: isAddressSelected ? 'auto' : 'none',
                                        cursor: isAddressSelected ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {loading ? "Loading..." : "Get Started"}
                                </button>
                            </span>
                        </CustomTooltip>
                    </div>

                    {/* Suggestions dropdown */}
                    {suggestions.length > 0 && (
                        <ul
                            className="list-group position-absolute mt-1"
                            style={{
                                width: '100%',
                                maxWidth: 600,
                                top: '100%',
                                zIndex: 10,
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        >
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.place_id}
                                    className="list-group-item list-group-item-action"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handlePlaceSelection(suggestion.place_id, suggestion.description)}
                                >
                                    {suggestion.description}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {invalidAddress && (
                    <div className="text-center text-danger mt-2" style={{
                        backgroundColor: '#ffffff',
                        fontSize: '1.5rem',
                        fontFamily: 'bold',
                        fontWeight: "bolder"
                    }}>
                        Please enter a valid address with a street number.
                    </div>
                )}

                {/* Original content below remains untouched */}
                <div className="w-100 content-bg">
                    <ol className="list-items light-color">
                        {INTRO_LIST.map((item, index) => (
                            <li key={index}> {item}</li>
                        ))}
                    </ol>
                    <div className="table-section table-responsive">
                        <table className="table table-bordered transparent-table">
                            <thead>
                                <tr>
                                    <th>{TABLE_1.title[0]}</th>
                                    <th>{TABLE_1.title[1]}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="light-color">{TABLE_1.description}</div></td>
                                    <td>
                                        <video height="auto" controls>
                                            <source src={TABLE_1.videoUrl} type="video/mp4" />
                                        </video>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className="table table-bordered transparent-table">
                            <thead>
                                <tr className="light-color">
                                    <th>{TABLE_2.title[0]}</th>
                                    <th>{TABLE_2.title[1]}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        {TABLE_2.provides.map((item, idx) => (
                                            <span className="light-color" key={idx}>{item}<br /></span>
                                        ))}
                                    </td>
                                    <td>
                                        {TABLE_2.limitations.map((item, idx) => (
                                            <span className="light-color" key={idx}>{item}<br /></span>
                                        ))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="disclaimer-text content-bg">
                    <h6 className="fw-bold text-white">{DISCLAIMER}</h6>
                </div>
            </div>
        </div>
    );
}


// import React, { useState, useContext, useCallback } from "react";
// import { useNavigate } from 'react-router-dom';
// import { bill } from "../../constants/defaultBill";

// import Autocomplete from 'react-google-autocomplete';
// import { AppContext } from '../../context/Context';
// import { useBuildingInsights } from "../../hooks/useBuildingInsights";
// import { useDataLayerUrls } from "../../hooks/useDataLayers";
// import { getComponent, formatFullAddress } from "../../utils/addressUtils";
// import {
//     HEADLINE_TEXT,
//     TOOL_TIPS,
//     ADDRESS_PLACEHOLDER,
//     INTRO_LIST,
//     TABLE_1,
//     TABLE_2,
//     DISCLAIMER
// } from "../../constants/estimatedText";
// import CustomTooltip from "../../components/CustomTooltip";

// export default function AddressInputPage() {
//     const navigate = useNavigate();
//     const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

//     const {
//         setBuildingInsights,
//         setUserAddress,
//         setCompleteAddress,
//         setDataLayers,
//         storeBill
//     } = useContext(AppContext);

//     const [isAddressSelected, setIsAddressSelected] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [invalidAddress, setInvalidAddress] = useState("");

//     const { findClosestBuilding } = useBuildingInsights(apiKey);
//     const { getDataLayerUrls } = useDataLayerUrls(apiKey);

//     const isValidBuildingAddress = (place) => {
//         const components = place?.address_components || [];
//         return (
//             components.some(comp => comp.types.includes("route")) &&
//             components.some(comp => comp.types.includes("street_number")) &&
//             components.some(comp => comp.types.includes("locality")) &&
//             place?.geometry?.location?.lat && place?.geometry?.location?.lng
//         );
//     };

//     const extractLocationData = (place) => {
//         const components = place?.address_components || [];
//         return {
//             geo: [place.geometry.location.lat(), place.geometry.location.lng()],
//             country: getComponent(components, "country"),
//             state: getComponent(components, "administrative_area_level_1"),
//             city: getComponent(components, "locality"),
//             postalCode: getComponent(components, "postal_code"),
//             street: getComponent(components, "route"),
//             streetNumber: getComponent(components, "street_number")
//         };
//     };

//     const getStateName = (place) => {
//         return place?.formatted_address?.split(",")[2]?.split(" ")[1];
//     };

//     const setDefaultBillFromState = (place) => {
//         const stateName = getStateName(place);
//         const matchedBill = bill.find(item => item.State === stateName);
//         storeBill(Math.round(matchedBill?.defaultBill));
//     };

//     const fetchInsightsAndLayers = async (locationData) => {
//         try {
//             setLoading(true);
//             const insights = await findClosestBuilding(locationData);
//             if (insights) {
//                 setBuildingInsights(insights);
//                 const layers = await getDataLayerUrls(locationData, insights);
//                 if (layers) setDataLayers(layers);
//             }
//         } catch (error) {
//             console.error("Error fetching building insights or data layers:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handlePlaceSelection = useCallback(async (place) => {
//         const fullFormattedAddress = place?.formatted_address || "the entered address";

//         if (!isValidBuildingAddress(place)) {
//             setIsAddressSelected(false);
//             setInvalidAddress(fullFormattedAddress);
//             return;
//         }

//         const locationData = extractLocationData(place);
//         const fullAddress = formatFullAddress(locationData);

//         setIsAddressSelected(true);
//         setInvalidAddress("");
//         setUserAddress(fullAddress);
//         setCompleteAddress(locationData);
//         setDefaultBillFromState(place);

//         await fetchInsightsAndLayers(locationData);
//     }, [findClosestBuilding, getDataLayerUrls]);

//     const handleSubmit = () => {
//         if (isAddressSelected) navigate('/confirm-address');
//     };

//     return (
//         <>
//             <div className="container-with-img bg-of-page">
//                 {/* Text Section */}
//                 <div className="d-flex justify-content-center align-items-center content-bg" >
//                     <h1 className="fw-bold text-white">
//                         {HEADLINE_TEXT}
//                     </h1>
//                 </div>

//                 {/* Wrapper */}
//                 <div>
//                     {/* Seach Input and Button Section */}
//                     <div className="d-flex justify-content-center content-bg">
//                         <Autocomplete
//                             apiKey={apiKey}
//                             onPlaceSelected={handlePlaceSelection}
//                             className="form-control mb-2 mb-sm-0 me-sm-2"
//                             placeholder={ADDRESS_PLACEHOLDER}
//                             options={{ types: ['address'] }}
//                             onKeyDown={(e) => {
//                                 if (e.key === 'Enter') e.preventDefault();
//                             }}
//                         />



//                         <CustomTooltip title={TOOL_TIPS.getStarted} arrow>
//                             <span style={{ display: 'inline-block' }}>
//                                 <button
//                                     onClick={handleSubmit}
//                                     className="button-elemented"
//                                     disabled={!isAddressSelected || loading}
//                                     style={{
//                                         opacity: isAddressSelected ? 1 : 0.5,
//                                         pointerEvents: isAddressSelected ? 'auto' : 'none',
//                                         cursor: isAddressSelected ? 'pointer' : 'not-allowed'
//                                     }}
//                                 >
//                                     {loading ? "Loading..." : "Get Started"}
//                                 </button>
//                             </span>
//                         </CustomTooltip>

//                     </div>
//                     {invalidAddress && (
//                         <div className="text-danger mt-2" style={{ fontSize: '0.9rem', marginLeft: "24%" }}>
//                             Please enter a valid address with a street number.
//                         </div>
//                     )}


//                     {/* Content Section */}

//                     <div className="w-100 content-bg">
//                         <ol className="list-items light-color">
//                             {INTRO_LIST.map((item, index) => (
//                                 <li key={index}> {item}</li>
//                             ))}
//                         </ol>
//                         <div className="table-section table-responsive">
//                             <table className="table table-bordered transparent-table">
//                                 <thead>
//                                     <tr>
//                                         <th >{TABLE_1.title[0]}</th>
//                                         <th>{TABLE_1.title[1]}</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr>
//                                         <td>
//                                             <div className="light-color">
//                                                 {TABLE_1.description}
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <video height="auto" controls>
//                                                 <source src={TABLE_1.videoUrl} type="video/mp4" />
//                                             </video>
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>

//                             <table className="table table-bordered  transparent-table">
//                                 <thead>
//                                     <tr className="light-color">
//                                         <th>{TABLE_2.title[0]}</th>
//                                         <th>{TABLE_2.title[1]}</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr>
//                                         <td>
//                                             {TABLE_2.provides.map((item, idx) => (
//                                                 <span className="light-color" key={idx}>{item} <br /> </span>
//                                             ))}
//                                         </td>
//                                         <td>
//                                             {TABLE_2.limitations.map((item, idx) => (
//                                                 <span className="light-color" key={idx}>{item} <br /></span>
//                                             ))}
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Disclaimer section */}

//                     <div className="disclaimer-text content-bg">
//                         <h6 className="fw-bold text-white">
//                             {DISCLAIMER}
//                         </h6>
//                     </div>
//                 </div>

//             </div>
//         </>
//     );
// }
