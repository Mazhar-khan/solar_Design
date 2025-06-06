import React, { useState, useContext, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

import Autocomplete from 'react-google-autocomplete';
import { AppContext } from '../../context/Context';
import { useBuildingInsights } from "../../hooks/useBuildingInsights";
import { useDataLayers } from "../../hooks/useDataLayers";
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
import CustomTooltip from "../components/CustomTooltip";

export default function Estimated() {
    const navigate = useNavigate();
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

    const {
        setBuildingInsights,
        setUserAddress,
        setCompleteAddress,
        setDataLayers
    } = useContext(AppContext);

    const [isAddressSelected, setIsAddressSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invalidAddress, setInvalidAddress] = useState("");

    const { findClosestBuilding } = useBuildingInsights(apiKey);
    const { findDataLayers } = useDataLayers(apiKey);

    const handlePlaceSelection = useCallback(async (place) => {
        const addressComponents = place?.address_components || [];
        const fullFormattedAddress = place?.formatted_address || "the entered address";

        const hasStreet = addressComponents.some(comp => comp.types.includes("route"));
        const hasStreetNumber = addressComponents.some(comp => comp.types.includes("street_number"));
        const hasLocality = addressComponents.some(comp => comp.types.includes("locality"));
        const hasGeometry = place?.geometry?.location?.lat && place?.geometry?.location?.lng;

        const isValidBuildingAddress = hasStreet && hasStreetNumber && hasLocality && hasGeometry;

        const locationData = {
            geo: [
                place?.geometry?.location.lat(),
                place?.geometry?.location.lng()
            ],
            country: getComponent(addressComponents, "country"),
            state: getComponent(addressComponents, "administrative_area_level_1"),
            city: getComponent(addressComponents, "locality"),
            postalCode: getComponent(addressComponents, "postal_code"),
            street: getComponent(addressComponents, "route"),
            streetNumber: getComponent(addressComponents, "street_number")
        };

        const fullAddress = formatFullAddress(locationData);

        if (!isValidBuildingAddress) {
            setIsAddressSelected(false);
            setInvalidAddress(fullFormattedAddress);
            alert(`${fullAddress} is not a valid building address.Please enter a valid address with a street number.`);
            return;
        }

        setIsAddressSelected(true);
        setUserAddress(fullAddress);
        setCompleteAddress(locationData);
        setInvalidAddress("");

        try {
            setLoading(true);
            const insights = await findClosestBuilding(locationData);
            if (insights) {
                setBuildingInsights(insights);
                const layers = await findDataLayers(locationData, insights);
                if (layers) setDataLayers(layers);
            }
        } catch (error) {
            console.error("Error fetching building insights or data layers:", error);
        } finally {
            setLoading(false);
        }
    }, [findClosestBuilding, findDataLayers]);

    const handleSubmit = () => {
        if (isAddressSelected) {
            navigate('/home-address');
        }
    };

    return (
        <>
            <div className="container-with-img bg-of-page">
                {/* Text Section */}
                <div className="d-flex justify-content-center align-items-center content-bg" >
                    <h1 className="fw-bold text-white">
                        {HEADLINE_TEXT}
                    </h1>
                </div>

                {/* Wrapper */}
                <div>
                    {/* Seach Input and Button Section */}
                    <div className="d-flex justify-content-center content-bg">
                        <Autocomplete
                            apiKey={apiKey}
                            onPlaceSelected={handlePlaceSelection}
                            className="form-control mb-2 mb-sm-0 me-sm-2"
                            placeholder={ADDRESS_PLACEHOLDER}
                            options={{ types: ['address'] }}
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

                    {/* Content Section */}

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
                                        <th >{TABLE_1.title[0]}</th>
                                        <th>{TABLE_1.title[1]}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="light-color">
                                                {TABLE_1.description}
                                            </div>
                                        </td>
                                        <td>
                                            <video height="auto" controls>
                                                <source src={TABLE_1.videoUrl} type="video/mp4" />
                                            </video>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className="table table-bordered  transparent-table">
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
                                                <span className="light-color" key={idx}>{item} <br /> </span>
                                            ))}
                                        </td>
                                        <td>
                                            {TABLE_2.limitations.map((item, idx) => (
                                                <span className="light-color" key={idx}>{item} <br /></span>
                                            ))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Disclaimer section */}

                    <div className="disclaimer-text content-bg">
                        <h6 className="fw-bold text-white">
                            {DISCLAIMER}
                        </h6>
                    </div>
                </div>

            </div>
        </>
    );
}
