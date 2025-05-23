import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import Autocomplete from 'react-google-autocomplete';
import { AppContext } from '../../context/Context';

export default function Estimated() {
    const google = window.google;
    const navigate = useNavigate();
    const {
        buildingInsights,
        setBuildingInsights,
        setUserAddress,
        setCompleteAddress,
        setDataLayers
    } = useContext(AppContext);

    const [isAddressSelected, setIsAddressSelected] = useState(false);
    const [address, setAddress] = useState('');
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

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

        const fullAddress = `${locationData.streetNumber} ${locationData.street}, ${locationData.city}, ${locationData.state} ${locationData.postalCode}, ${locationData.country}`;

        setAddress(fullAddress);
        setIsAddressSelected(true);
        setUserAddress(fullAddress);
        setCompleteAddress(locationData);
        fetchBuildingInsights(locationData);
    };

    const fetchBuildingInsights = async (locationData) => {
        try {
            const insights = await findClosestBuilding(locationData, apiKey);
            if (insights) {
                setBuildingInsights(insights);
                const dataLayers = await findDataLayers(locationData, insights);
                if (dataLayers) {
                    setDataLayers(dataLayers);
                }
            }
        } catch (error) {
            console.error("Error fetching building insights:", error);
        }
    };

    const findDataLayers = async (location, insights) => {
        const center = insights.center;
        const ne = insights.boundingBox.ne;
        const sw = insights.boundingBox.sw;

        const diameter = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(ne.latitude, ne.longitude),
            new google.maps.LatLng(sw.latitude, sw.longitude),
        );

        const radius = diameter / 2;
        const args = {
            'location.latitude': center.latitude.toFixed(5),
            'location.longitude': center.longitude.toFixed(5),
            radius_meters: radius,
            required_quality: 'LOW',
        };
        const params = new URLSearchParams({ ...args, key: apiKey });

        const response = await fetch(`https://solar.googleapis.com/v1/dataLayers:get?${params}`);
        const content = await response.json();

        if (response.status !== 200) {
            console.error('getDataLayerUrls\n', content);
            throw content;
        }

        return content;
    };

    const findClosestBuilding = async (location, apiKey) => {
        const qualities = ['HIGH', 'MEDIUM', 'LOW'];

        for (const quality of qualities) {
            const query = `location.latitude=${location.geo[0].toFixed(5)}&location.longitude=${location.geo[1].toFixed(5)}&requiredQuality=${quality}&key=${apiKey}`;

            try {
                const response = await fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${query}`);
                const content = await response.json();

                if (response.status === 200) {
                    return content;
                }
            } catch (error) {
                console.error(`Error fetching with quality ${quality}:`, error);
            }
        }

        throw new Error("Failed to retrieve building insights for all quality levels.");
    };

    const handleSubmit = () => {
        if (isAddressSelected) {
            navigate('/home-address');
        } else {
            alert('Please select a valid address.');
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                backgroundImage: "url(assets/img/hero-section.png)",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            <div className="position-absolute text-white d-flex flex-column justify-content-center align-items-center text-center px-3" style={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <h1 className="mb-4 mt-4 fw-bold" style={{ fontSize: '40px', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>
                    Your Solar Design Tool
                </h1>
                <div className="container mt-3 mb-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8 d-flex flex-column flex-sm-row align-items-center justify-content-center">
                            <Autocomplete
                                apiKey={apiKey}
                                onPlaceSelected={handlePlaceSelection}
                                className="form-control mb-2 mb-sm-0 me-sm-2"
                                placeholder="Enter Your Address"
                                options={{ types: ['address'] }}
                                title="Please enter a valid address."
                            />
                            <button
                                onClick={handleSubmit}
                                className="button-elemented"
                                style={{
                                    opacity: isAddressSelected ? 1 : 0.5,
                                    pointerEvents: isAddressSelected ? 'auto' : 'none'
                                }}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                    <ul className="text-start mt-3">
                        <li>Does solar make sense for you? Explore different solar configurations. Compare results.</li>
                        <li>Easy. Accurate. Practical.</li>
                        <li>Learn if solar is right for you without the requirement to provide personal contact information.</li>
                    </ul>
                    <div className="table-group">
                        <div className="table-responsive mt-4">
                            <table className="table table-bordered text-white transparent-table">
                                <thead >
                                    <tr>
                                        <th style={{ color: "aliceblue" }}>How does the solar design tool work?</th>
                                        <th style={{ color: "aliceblue" }}>See a demo of the solar design tool</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ width: '100%' }}>
                                        <td style={{ width: '60%', textAlign: 'left' }}>
                                            <div className="scrollable-hidden-scrollbar" style={{ color: "#ffffff" }}>
                                                The tool uses solar intensity data and satellite imagery data to calculate the amount of solar
                                                energy hitting your property’s roof. It accounts for several factors about your roof, including
                                                area, orientation, and pitch, among other things, to determine solar energy generation potential.
                                                It also takes into account shading from trees, nearby structures, and cloud cover. The tool
                                                allows you to customize the number of solar panels placed on your home and adjust their
                                                size/capacity. To make solar electricity generation estimates, the tool uses current data on solar
                                                module capacities, production efficiencies, and degradation rates. The tool allows you to
                                                change the amount of annual electricity your home uses to understand how much solar you
                                                need to cover 100% of your energy needs. To estimate cost savings, return-on-investment, and
                                                payback periods, the tool uses location-specific data on utility rates and a range of all-in solar
                                                home system installation costs for your area. The data sets the tool uses come from the Google
                                                Maps platform and other sources.
                                            </div>
                                        </td>

                                        <td style={{ width: '40%' }}>
                                            <video height='auto' controls>
                                                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                                                <source src="https://www.w3schools.com/html/mov_bbb.ogg" type="video/ogg" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="table-responsive mt-4">
                                <table className="table table-bordered text-white transparent-table">
                                    <thead>
                                        <tr>
                                            <th style={{ color: "aliceblue" }}>What the Solar Design Tool Provides</th>
                                            <th style={{ color: "aliceblue" }}>What the Solar Design Tool Does Not Do</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{color:'#ffffff'}} >
                                                <ul className="text-start">
                                                    <li>Estimates solar energy potential based on satellite data.</li>
                                                    <li>Allows customization of solar panel configurations.</li>
                                                    <li>Projects solar electricity generation and savings.</li>
                                                    <li>Accounts for roof shape, shading, and orientation.</li>
                                                    <li>Uses real-time location-specific utility rates.</li>
                                                </ul>
                                            </td>
                                            <td style={{color:'#ffffff'}}>
                                                <ul className="text-start">
                                                    <li>Does not initiate or finalize installation.</li>
                                                    <li>Does not guarantee financial returns.</li>
                                                    <li>Does not replace a professional site inspection.</li>
                                                    <li>Does not offer real-time weather forecasting.</li>
                                                    <li>Does not include personal financing or tax advice.</li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                    <div className="mt-2">
                        This is a placeholder for the official disclaimer.
                    </div>
                </div>
            </div>
        </div>
    );
}
