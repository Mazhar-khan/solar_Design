import React, { useState, useContext, useEffect, useRef } from "react";

import { useNavigate } from 'react-router-dom';
import Autocomplete from 'react-google-autocomplete';
import { AppContext } from '../../context/Context';


export default function Estimated() {
    const google = window.google;
    const mapRef = useRef(null);
    const navigate = useNavigate();
    const {
        buildingInsights,
        setBuildingInsights,
        setUserAddress,
        setCompleteAddress,
        dataLayers,
        setDataLayers
    } = useContext(AppContext);
    const [isAddressSelected, setIsAddressSelected] = useState(false);
    const [address, setAddress] = useState('');
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;



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
        fetchBuildingInsights(locationData);
    };

    const fetchBuildingInsights = async (locationData) => {
        try {
            console.log("locationData",locationData)
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
        console.log("params", params)
        return fetch(`https://solar.googleapis.com/v1/dataLayers:get?${params}`).then(
            async (response) => {
                const content = await response.json();
                if (response.status != 200) {
                    console.error('getDataLayerUrls\n', content);
                    throw content;
                }
                console.log('dataLayersResponse', content);
                return content;
            },
        );
    }

    const findClosestBuilding = async (location, apiKey) => {
        const qualities = ['HIGH', 'MEDIUM', 'LOW'];
      
        for (const quality of qualities) {
          const query = `location.latitude=${location.geo[0].toFixed(5)}&location.longitude=${location.geo[1].toFixed(5)}&requiredQuality=${quality}&key=${apiKey}`;
          console.log(`🔍 Trying buildingInsights with quality: ${quality}`, query);
      
          try {
            const response = await fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${query}`);
            const content = await response.json();
      
            if (response.status === 200) {
              console.log(`✅ Success with quality: ${quality}`, content);
              return content;
            } else {
              console.warn(`⚠️ Failed with quality: ${quality}`, content);
            }
          } catch (error) {
            console.error(`❌ Error fetching with quality: ${quality}`, error);
          }
        }
      
        throw new Error("Failed to retrieve building insights for all quality levels.");
      }
      
    // const findClosestBuilding = async (location, apiKey) => {
    //     const args = {
    //         'location.latitude': location.geo[0].toFixed(5),
    //         'location.longitude': location.geo[1].toFixed(5),
    //     };

    //     const params = new URLSearchParams({ ...args, key: apiKey });
    //     const response = await fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`);
    //     const content = await response.json();
    //     if (response.status !== 200) {
    //         console.error('findClosestBuilding\n', content);
    //         throw content;
    //     }
    //     return content;
    // };

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