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

        const placeTypes = place

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
            {/* <div className="container-with-img">
            <div className="position-absolute text-white d-flex flex-column  align-items-center text-center px-3" style={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <h1 className="mb-2 mt-2 fw-bold" style={{ fontSize: '40px', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>
                    {HEADLINE_TEXT}
                </h1>
                <div className="container mt-3 mb-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8 d-flex flex-column flex-sm-row align-items-center justify-content-center">
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
                            <div className="tooltip-wrapper">
                                <button
                                    onClick={handleSubmit}
                                    className="button-elemented"
                                    disabled={!isAddressSelected || loading}
                                    style={{
                                        opacity: isAddressSelected ? 1 : 0.5,
                                        pointerEvents: isAddressSelected ? 'auto' : 'none'
                                    }}
                                >
                                    {loading ? "Loading..." : "Get Started"}
                                </button>
                                <div className="tooltip-text">
                                    {TOOL_TIPS.getStarted}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="transparent-box mt-3">
                        <ul className="text-start">
                            {INTRO_LIST.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="transparent-box table-group mt-1">
                        <div className="table-responsive">
                            <table className="table table-bordered text-white transparent-table">
                                <thead>
                                    <tr>
                                        <th style={{ color: "aliceblue" }}>{TABLE_1.title[0]}</th>
                                        <th style={{ color: "aliceblue" }}>{TABLE_1.title[1]}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ width: '100%' }}>
                                        <td style={{ width: '60%', textAlign: 'left' }}>
                                            <div className="scrollable-hidden-scrollbar" style={{ color: "#ffffff" }}>
                                                {TABLE_1.description}
                                            </div>
                                        </td>
                                        <td style={{ width: '40%' }}>
                                            <video height='auto' controls>
                                                <source src={TABLE_1.videoUrl} type="video/mp4" />
                                            </video>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="table-responsive">
                                <table className="table table-bordered text-white transparent-table">
                                    <thead>
                                        <tr>
                                            <th style={{ color: "aliceblue" }}>{TABLE_2.title[0]}</th>
                                            <th style={{ color: "aliceblue" }}>{TABLE_2.title[1]}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ color: '#ffffff' }}>
                                                <ul className="text-start">
                                                    {TABLE_2.provides.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td style={{ color: '#ffffff' }}>
                                                <ul className="text-start">
                                                    {TABLE_2.limitations.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        {DISCLAIMER}
                    </div>
                </div>
            </div>
        </div> */}
            <div className="container-with-img">
                <div className="full-overlay text-white d-flex flex-column align-items-center text-center px-3">
                    <h1 className="headline-text mb-2 mt-2 fw-bold">
                        {HEADLINE_TEXT}
                    </h1>
                    <div className="container mt-3 mb-4">
                        <div className="row justify-content-center">
                            <div className="col-md-8 d-flex flex-column flex-sm-row align-items-center justify-content-center">
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
                                <div className="tooltip-wrapper">
                                    <button
                                        onClick={handleSubmit}
                                        className={`button-elemented ${isAddressSelected ? '' : 'disabled-button'}`}
                                        disabled={!isAddressSelected || loading}
                                    >
                                        {loading ? "Loading..." : "Get Started"}
                                    </button>
                                    <div className="tooltip-text">
                                        {TOOL_TIPS.getStarted}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Wrapper */}
                        <div style={{ width:'50vw' }} >
                        <div className="transparent-box mt-3">
                            <ul className="text-start">
                                {INTRO_LIST.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="transparent-box table-group mt-1">
                            <div className="table-responsive">
                                <table className="table table-bordered text-white transparent-table">
                                    <thead>
                                        <tr>
                                            <th className="table-header">{TABLE_1.title[0]}</th>
                                            <th className="table-header">{TABLE_1.title[1]}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="table-text">
                                                <div className="scrollable-hidden-scrollbar table-description">
                                                    {TABLE_1.description}
                                                </div>
                                            </td>
                                            <td className="video-cell">
                                                <video height="auto" controls>
                                                    <source src={TABLE_1.videoUrl} type="video/mp4" />
                                                </video>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table className="table table-bordered text-white transparent-table">
                                    <thead>
                                        <tr>
                                            <th className="table-header">{TABLE_2.title[0]}</th>
                                            <th className="table-header">{TABLE_2.title[1]}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="table-text">
                                                <ul className="text-start">
                                                    {TABLE_2.provides.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="table-text">
                                                <ul className="text-start">
                                                    {TABLE_2.limitations.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="disclaimer-text">
                            {DISCLAIMER}
                        </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
