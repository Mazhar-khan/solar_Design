import { useCallback, useContext } from 'react';
import { Tooltip, IconButton, Chip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import getSolarSuitabilityRating from "../../utils/getSolarSuitabilityRating";
import { AppContext } from '../../context/Context';

export default function First({ completeAddress, buildingInsights }) {
    const { configId } = useContext(AppContext);
    const getSolarSuitabilityRating = () => {
        // debugger
        const sunshineHours = buildingInsights?.solarPotential?.maxSunshineHoursPerYear || 0;
        const roofArea = buildingInsights?.solarPotential?.wholeRoofStats?.areaMeters2 || 0;
        const irradiance = buildingInsights?.solarPotential?.wholeRoofStats?.sunshineQuantiles|| 0; // kWh/m²/year

        if (sunshineHours > 2000 && roofArea > 100 && irradiance > 1800) {
            return 'Great';
        } else if (sunshineHours > 1500 && roofArea > 70 && irradiance > 1500) {
            return 'Good';
        } else {
            return 'OK';
        }
    }

    // const get = getSolarSuitabilityRating(buildingInsights);
    const get = getSolarSuitabilityRating();

    const getSystemSizeCategory = () => {
        const maxPanelCount = configId;
        if (!maxPanelCount) return 'N/A';
        if (maxPanelCount <= 12) return 'Small';
        if (maxPanelCount <= 28) return 'Medium';
        if (maxPanelCount <= 60) return 'Large';
        return 'Very Large';
    };
    return (
        <>
            <div className="insights-card position-absolute shadow rounded-4 bg-white"
                style={{
                    top: "20px",
                    left: "10px",
                    maxHeight: "520px",
                    width: "330px",
                    zIndex: 1000,
                    overflow: "auto",
                    padding: "16px",
                    scrollbarWidth: "none", // for Firefox
                    msOverflowStyle: "none", // for IE/Edge
                }}
            >
                <div className="card-header">
                    <i className="fas fa-home home-icon text-warning"></i>
                    <span className="title mt-1 text-warning ">
                        {
                            completeAddress?.streetNumber + " " + completeAddress?.street
                        }
                    </span> <br />
                </div>
                <span className="value" style={{ fontWeight:"400",}} >Your Home is {get} candidate</span>
                <hr />
                <div className="card-body">
                      <div className="info-icon data-row" style={{ display: "flex", flexDirection: "row" }}>
                        <span>About this data</span>
                        <span>
                            <Tooltip
                                title={
                                    <span style={{ fontSize: '12px' }}>
                                        Based on daily readings of solar energy for your location, accounting for cloud cover and shading from trees and other structures.<br />
                                        To be revised. Also, this value factors in the azimuth of the property’s roof-faces/segments, right? Does it also factor in roof area?
                                    </span>
                                }
                                arrow
                                placement="top-start"
                            >
                                <IconButton size="small" style={{ marginTop: "-5px", color: 'black' }} >
                                    <InfoOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                        </span>
                    </div>
                    <div className="data-row">
                        <span>Annual Solar Intensity</span>
                        <span className="value">
                            {buildingInsights?.solarPotential?.maxSunshineHoursPerYear
                                ? `${Math.round(buildingInsights.solarPotential.maxSunshineHoursPerYear.toFixed(1))} hr`
                                : 'N/A'}
                        </span>
                    </div>
                    <div className="data-row">
                        <span>Total Roof Area Approx</span>
                        <span className="value">
                            {Math.round(buildingInsights?.solarPotential?.wholeRoofStats?.areaMeters2?.toFixed(2)) || 'N/A'} m²
                        </span>
                    </div>
                    <div className="data-row">
                        <span>Small system</span>
                        <span className="value">6kW</span>
                    </div>

                    <div className="data-row">
                        <span>Medium system</span>
                        <span className="value">12kW</span>
                    </div>

                    <div className="data-row">
                        <span>Large system</span>
                        <span className="value">18kW</span>
                    </div>

                    <div className="data-row">
                        <span>Large system</span>
                        <span className="value">18kW</span>
                    </div>
                    {/* <div className="info-icon data-row" style={{ display: "flex", flexDirection: "row" }}>
                        <span>About this data</span>
                        <span>
                            <Tooltip
                                title={
                                    <span style={{ fontSize: '12px' }}>
                                        Based on daily readings of solar energy for your location, accounting for cloud cover and shading from trees and other structures.<br />
                                        To be revised. Also, this value factors in the azimuth of the property’s roof-faces/segments, right? Does it also factor in roof area?
                                    </span>
                                }
                                arrow
                                placement="top-start"
                            >
                                <IconButton size="small" style={{ marginTop: "-5px", color: 'black' }} >
                                    <InfoOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                        </span>
                    </div> */}

                    {/* <div className="data-row">
                        <span>Max panel count</span>
                        <span className="value">{buildingInsights?.solarPotential?.maxArrayPanelsCount || 'N/A'}</span>
                    </div> */}
                    {/* <div className="data-row">
                        <span>CO₂ savings</span>
                        <span className="value">
                            {buildingInsights?.solarPotential?.carbonOffsetFactorKgPerMwh
                                ? `${buildingInsights?.solarPotential?.carbonOffsetFactorKgPerMwh.toFixed(1)} Kg/MWh`
                                : 'N/A'}
                        </span>
                    </div> */}
                    {/* <div className="data-row">
                        <span>Solar Potential</span>
                        <span className="value">{buildingInsights?.solarPotential?.maxArrayPanelsCount || 'N/A'}</span>
                    </div>
                    <div className="data-row">
                        <span>Yearly Energy</span>
                        <span className="value">{buildingInsights?.solarPotential?.maxArrayPanelsCount || 'N/A'}</span>
                    </div> */}
                </div>
            </div>
            <div className="insights-card position-absolute bg-white" 
            style={{ bottom: "15px", left: "300px", zIndex: 1000, padding:'20px',borderRadius:'10px' }}>
                <div className="card-header">
                    <i className="fas fa-layer-group icon"></i>
                    <span className="title">Solar Intensity Key</span>
                </div>
                <hr />
                <div className="card-body bg-white" style={{ width: '100%' }} >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px" }} >Shaday</span>
                        <div class="sun-gradient" style={{ flex: 1, height: '10px' }} ></div>
                        <span style={{ marginLeft: '30px' }}>Sunny</span>
                    </div>
                </div>
            </div>
        </>
    )
}