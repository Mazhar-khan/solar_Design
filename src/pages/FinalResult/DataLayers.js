import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

import { findClosestBuilding, getDataLayerUrls } from './Solar';
import { createPalette, normalize, rgbToColor } from './Visualize';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { panelsPalette } from './Colors';
import { AppContext } from '../../context/Context';
import { getLayer } from './Layer';
import { findSolarConfig } from './Utils';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

export default function DataLayers() {
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);
  const [isMonthlyFlux, setIsMonthlyFlux] = useState(true);

  const [showMonthlyHeatMap, setShowMonthlyHeatMap] = useState(true);
  const [showAnnualHeatMap, setShowAnnualHeatMap] = useState(false);
  const [averageBill, setAverageBill] = useState(125); // default from U.S. Dept of Energy


  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonthIndex]);

  const [map, setMap] = useState(null);
  const { completeAddress } = useContext(AppContext);
  console.log("completeAddress",completeAddress)
  const [yearlyEnergy, setYearlyEnergy] = useState(0);

  const [showSolarPanels, setShowSolarPanels] = useState(false);

  const [libraries, setLibraries] = useState({});
  const [layerId, setLayerId] = useState('annualFlux');
  const [layer, setLayer] = useState(null);
  const [solarPanels, setSolarPanels] = useState([]);
  const [openSection, setOpenSection] = useState(null);
  const [imageSrc, setImageSrc] = useState("assets/img/solar_api.png");
  const [showProfileCard, setShowProfileCard] = useState(true);
  const [showSolarCard, setShowSolarCard] = useState(false);
  const [panelCapacity, setPanelCapacity] = useState();
  const [showChart, setShowChart] = useState(false);
  const [showSolarPotential, setSolarPotential] = useState(false);
  const [showRoofOnly, setShowRoofOnly] = useState(false);
  const [panelConfig, setPanelConfig] = useState(undefined);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');

  const [monthlyAverageEnergyBillInput] = useState(300);
  const [panelCapacityWattsInput] = useState(250);
  const [energyCostPerKwhInput] = useState(0.31);
  const [dcToAcDerateInput] = useState(0.85);
  const [configId, setConfigId] = useState(undefined);
  const [buildingInsights, setBuildingInsights] = useState();
  const [panelRange, setPanelRange] = useState();

  const yearlyKwhEnergyConsumption = (monthlyAverageEnergyBillInput / energyCostPerKwhInput) * 12;

  const clearOverlays = useCallback(() => {
    overlaysRef.current.forEach(overlay => overlay.setMap(null));
    overlaysRef.current = [];
  }, []);

  useEffect(() => {
    async function initialize() {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
      });

      const [geometry, maps, places] = await Promise.all([
        loader.importLibrary('geometry'),
        loader.importLibrary('maps'),
        loader.importLibrary('places'),
      ]);

      const mapInstance = new maps.Map(mapRef.current, {
        center: { lat: completeAddress?.geo[0], lng: completeAddress?.geo[1] },
        zoom: 20,
        tilt: 0,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        streetViewControl: false,
        zoomControl: true,
      });

      setLibraries({ geometry, maps, places });
      setMap(mapInstance);

      await loadBuildingInsights(geometry, mapInstance);
    }

    initialize();
  }, []);

  const loadBuildingInsights = async (geometry, mapInstance) => {
    const buildingInsights = await findClosestBuilding(completeAddress, GOOGLE_MAPS_API_KEY);
    setBuildingInsights(buildingInsights)
    setPanelCapacity(buildingInsights?.solarPotential.panelCapacityWatts)

    if (!buildingInsights) return;

    const defaultPanelCapacity = buildingInsights.solarPotential.panelCapacityWatts;
    const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacity;

    const foundConfigId = findSolarConfig(
      buildingInsights.solarPotential.solarPanelConfigs,
      yearlyKwhEnergyConsumption,
      panelCapacityRatio,
      dcToAcDerateInput
    );

    await renderSolarPanels(geometry, buildingInsights, mapInstance, foundConfigId);
    setConfigId(foundConfigId);

    if (foundConfigId !== undefined) {
      setPanelConfig(buildingInsights.solarPotential.solarPanelConfigs[foundConfigId]);
    }
  };

  const renderSolarPanels = async (geometry, buildingInsights, mapInstance, id) => {
    if (!geometry?.spherical) {
      console.error("Geometry library is missing.");
      return;
    }

    const solarPotential = buildingInsights.solarPotential;
    const palette = createPalette(panelsPalette).map(rgbToColor);

    const minEnergy = solarPotential.solarPanels.slice(-1)[0].yearlyEnergyDcKwh;
    const maxEnergy = solarPotential.solarPanels[0].yearlyEnergyDcKwh;

    let panelCountToRender = panelRange ?? panelConfig?.panelCount ?? id;
    let panelsToRender = solarPotential.solarPanels.slice(0, panelCountToRender);

    const panels = panelsToRender.map(panel => {
      const [w, h] = [solarPotential.panelWidthMeters / 2, solarPotential.panelHeightMeters / 2];
      const points = [
        { x: +w, y: +h },
        { x: +w, y: -h },
        { x: -w, y: -h },
        { x: -w, y: +h },
        { x: +w, y: +h },
      ];
      const orientation = panel.orientation === 'PORTRAIT' ? 90 : 0;
      const azimuth = solarPotential.roofSegmentStats[panel.segmentIndex].azimuthDegrees;
      const colorIndex = Math.round(normalize(panel.yearlyEnergyDcKwh, maxEnergy, minEnergy) * 255);

      const panelCoords = points.map(({ x, y }) =>
        geometry.spherical.computeOffset(
          { lat: panel.center.latitude, lng: panel.center.longitude },
          Math.sqrt(x * x + y * y),
          Math.atan2(y, x) * (180 / Math.PI) + orientation + azimuth,
        )
      );

      return new window.google.maps.Polygon({
        paths: panelCoords,
        strokeColor: '#B0BEC5',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: palette[colorIndex],
        fillOpacity: 0.9,
      });
    });

    solarPanels.forEach(panel => panel.setMap(null));
    setSolarPanels([]);

    panels.forEach(panel => panel.setMap(showSolarPanels ? mapInstance : null));

    setSolarPanels(panels);
  };



  useEffect(() => {
    if (!map) return;

    async function fetchLayer() {
      try {
        clearOverlays();
        setLayer(null);

        setShowRoofOnly(['annualFlux', 'monthlyFlux', 'hourlyShade'].includes(layerId));
        map.setMapTypeId(layerId === 'rgb' ? 'roadmap' : 'satellite');

        if (layerId === 'none') return;

        const buildingInsights = await findClosestBuilding(completeAddress, GOOGLE_MAPS_API_KEY);
        const center = buildingInsights?.center;
        const ne = buildingInsights.boundingBox.ne;
        const sw = buildingInsights.boundingBox.sw;

        const diameter = libraries.geometry.spherical.computeDistanceBetween(
          { lat: ne.latitude, lng: ne.longitude },
          { lat: sw.latitude, lng: sw.longitude }
        );

        const radius = Math.ceil(diameter / 2);
        // const radius = 12;

        if (center && Array.isArray(center)) {
          map.setCenter({ lat: center[0], lng: center[1] });
        }
        const selectedMonthIndex = monthNames.indexOf(selectedMonth); // 0-based
        const response = await getDataLayerUrls(center, radius, GOOGLE_MAPS_API_KEY);
        let loadedLayer;

        if (isMonthlyFlux) {
          const monthKey = `monthlyFlux-${selectedMonthIndex}-${Date.now()}`;
          loadedLayer = await getLayer('monthlyFlux', response, GOOGLE_MAPS_API_KEY, selectedMonthIndex);
        } else {
          loadedLayer = await getLayer('annualFlux', response, GOOGLE_MAPS_API_KEY);
        }
        // const loadedLayer = await getLayer(layerId, response, GOOGLE_MAPS_API_KEY);
        const defaultEnergy = buildingInsights.solarPotential.maxSunshineHoursPerYear;
        setYearlyEnergy(defaultEnergy);
        setLayer(loadedLayer);
      } catch (error) {
        console.error('❌ Data layer fetch error:', error);
      }
    }

    fetchLayer();
  }, [map, layerId, clearOverlays, isMonthlyFlux, selectedMonth]);

  useEffect(() => {
    if (!map || !layer) return;

    clearOverlays();
    const bounds = layer.bounds;
    const selectedMonthIndex = monthNames.indexOf(selectedMonth);

    let newOverlays;
    if (showMonthlyHeatMap) {
      newOverlays = layer.render(showRoofOnly, selectedMonthIndex, 0).map(canvas => {
        return new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
      });

    } else if (showAnnualHeatMap) {
      newOverlays = layer.render(showRoofOnly, 0, 0).map(canvas => {
        return new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
      });
    }

    newOverlays?.forEach((overlay, i) => overlay.setMap(i == selectedMonthIndex ? map : null));
    overlaysRef.current = newOverlays;
  }, [map, layer, showRoofOnly, clearOverlays, selectedMonth, isMonthlyFlux, showMonthlyHeatMap]);

  const updateRangeFunc = (event) => {
    const val = Number(event.target.value);
    setConfigId(val);
    setPanelRange(val);

    if (buildingInsights && buildingInsights.solarPotential?.solarPanels) {
      const panelsToRender = buildingInsights.solarPotential.solarPanels.slice(0, val);
      const totalEnergy = panelsToRender.reduce((sum, panel) => sum + panel.yearlyEnergyDcKwh, 0);
      setYearlyEnergy(totalEnergy);
    }
  };

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
      setImageSrc("assets/img/solar_api.png");
      setShowProfileCard(false);
      setShowSolarCard(false);
      setSolarPotential(false);
      setShowChart(false);
    } else {
      setOpenSection(section);
      setImageSrc("assets/img/solar_api.png");
      if (section === "section1") {
        setShowProfileCard(true);
        setShowSolarCard(false);
        setSolarPotential(false);
        setShowChart(false);
      } else if (section === "section2") {
        setSolarPotential(true);
        setShowProfileCard(false);
        setShowSolarCard(false);
        setShowChart(false);
      } else if (section === "section3") {
        setShowProfileCard(false);
        setShowSolarCard(true);
        setShowChart(true);
        setSolarPotential(false);
      }
    }
  };

  const handleSubmitVisitorInfo = () => {
    const data = {
      name: visitorName,
      email: visitorEmail,
      phone: visitorPhone,
    };
    console.log("Visitor submitted info:", data);
    // TODO: Send to server/API
  };

  const handleMonthlyToggle = (checked) => {
    clearOverlays()
    if (checked) {
      setIsMonthlyFlux(true);
      setShowMonthlyHeatMap(true);
      setShowAnnualHeatMap(false);
      setLayerId('monthlyFlux');
    } else if (checked == false) {
      setIsMonthlyFlux(false);
      setShowMonthlyHeatMap(false);
      clearOverlays();
    }
  };

  const toggleAnnualHeatMap = () => {
    clearOverlays()
    if (showAnnualHeatMap) {
      setShowAnnualHeatMap(false);
    } else if (!showAnnualHeatMap) {
      setShowAnnualHeatMap(true);
      setShowMonthlyHeatMap(false);
      setLayerId('annualFlux');
    }
  };



  const handleChange = (event) => {
    const newPanelCapacity = Number(event.target.value);
    setPanelCapacity(newPanelCapacity);

    if (buildingInsights) {
      const defaultCapacity = buildingInsights.solarPotential.panelCapacityWatts;
      const defaultEnergy = buildingInsights.solarPotential.maxSunshineHoursPerYear;

      const newYearlyEnergy = (newPanelCapacity / defaultCapacity) * defaultEnergy;
      setYearlyEnergy(newYearlyEnergy);
    }
  };

  useEffect(() => {
    if (panelRange !== undefined && buildingInsights && libraries.geometry && map) {
      solarPanels.forEach(panel => panel.setMap(null));
      setSolarPanels([]);

      renderSolarPanels(libraries.geometry, buildingInsights, map, panelRange);
    }
  }, [panelRange]);

  const toggleSolarPanels = () => {
    setShowSolarPanels(prev => {
      const newState = !prev;
      solarPanels.forEach(panel => panel.setMap(newState ? map : null));
      return newState;
    });
  };

  return (
    <>
      <section className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-md-8 position-relative">
            <div ref={mapRef} id="map" style={{ height: "100vh" }} />
            {showProfileCard && (
              <>
                <div className="insights-card position-absolute" style={{ top: "20px", left: "10px", zIndex: 1000 }}>
                  <div className="card-header">
                    <i className="fas fa-home home-icon"></i>
                    <span className="title mt-1">
                      {
                        completeAddress?.streetNumber + " " + completeAddress?.street
                      }
                    </span>
                  </div>
                  <hr />
                  <div className="card-body">
                    <div className="info-text text-muted mb-2" style={{ fontSize: "12px" }}>
                      Based on daily readings of solar energy for your location, accounting for cloud cover, and shading from trees and other structures.
                      <br />
                      To be revised. Also, this value factors in the azimuth of the property’s roof-faces/segments, right? Does it also factor in roof area?
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
                      <span>Roof Area Apprx</span>
                      <span className="value">
                        {/* {buildingInsights?.solarPotential?.wholeRoofStats?.areaMeters2?.toFixed(2) || 'N/A'} m² */}
                        {Math.round(buildingInsights?.solarPotential?.wholeRoofStats?.areaMeters2?.toFixed(2)) || 'N/A'} m²
                      </span>
                    </div>
                    <div className="data-row">
                      <span>Max panel count</span>
                      <span className="value">{buildingInsights?.solarPotential?.maxArrayPanelsCount || 'N/A'}</span>
                    </div>
                    <div className="data-row">
                      <span>CO₂ savings</span>
                      <span className="value">
                        {buildingInsights?.solarPotential?.carbonOffsetFactorKgPerMwh
                          ? `${buildingInsights?.solarPotential?.carbonOffsetFactorKgPerMwh.toFixed(1)} Kg/MWh`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='mt-4'>
                  <div className="insights-card position-absolute" style={{ bottom: "30px", left: "300px", zIndex: 1000 }}>
                    <div className="card-header">
                      <i className="fas fa-layer-group icon"></i>
                      <span className="title">Solar Intensity Key</span>
                    </div>

                    <hr />
                    <div className="card-body" style={{ width: '100%' }} >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px" }} >Shaday</span>
                        <div class="sun-gradient" style={{ flex: 1, height: '30px' }} ></div>
                        <span style={{ marginLeft: '30px' }}>Sunny</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="col-md-4 d-flex align-items-start" style={{ background: "#f8f8f8", height: "100vh", overflowY: "auto" }}>
            <div className="container">
              <p className="text-muted text-center mt-4">
                See What Solar Can Do For You
              </p>
              <div className="custom-card p-3 shadow rounded mt-4">
                <div>
                  <div
                    className="section-title d-flex justify-content-between align-items-center"
                    onClick={() => toggleSection("section1")}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      <i className="fas fa-home icon text-warning me-2"></i> <b>Your Solar Home System</b>
                      <p style={{ color: "black", marginLeft: "14%", fontSize: "13px" }}>
                        {/* Yearly energy: {Math.round(yearlyEnergy / 1000)} KWh  */}
                      </p>
                    </span>
                    <i className={` fas fa-chevron-${openSection === "section1" ? "up" : "down"}`}></i>
                  </div>
                  {openSection === "section1" && (
                    <div className="section-content ps-4 text-secondary">
                      <div className="mt-4">
                        <fieldset className="border p-2 rounded">
                          <legend className="fs-6 text-muted">Average Monthly Electricity Bill</legend>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              value={averageBill}
                              onChange={(e) => setAverageBill(Number(e.target.value))}
                              placeholder="Enter your average monthly bill"
                            />
                            <span style={{ height: '54px' }} className="input-group-text">$</span>
                          </div>
                          <small className="text-muted mt-1 d-block">
                            Source: U.S. Dept of Energy, residential average
                          </small>
                        </fieldset>
                      </div>

                      <div className="row">
                        <div className="col-6 text-start">
                          <p><strong>Panel count</strong> </p>
                        </div>
                        <div className="col-6 text-end">
                          <p>{configId} Panels</p>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max={buildingInsights?.solarPotential?.maxArrayPanelsCount}
                        value={configId}
                        onChange={updateRangeFunc}
                      />

                      <fieldset className="border p-2 rounded">
                        <legend className="fs-6 text-muted">Panel Capacity</legend>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={panelCapacity}
                            onChange={handleChange}
                          />
                          <span style={{ height: '54px' }} className="input-group-text">Watts</span>
                        </div>
                      </fieldset>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="content">
                          <div>
                            <label class="switch">
                              <input type="checkbox" checked={showSolarPanels} value={showSolarPanels} onClick={() => toggleSolarPanels()} />
                              <span class="slider round"></span>
                            </label>
                            <span style={{ marginLeft: "10px" }}>
                              Solar Panels
                            </span>
                          </div>

                          <div>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={showMonthlyHeatMap}
                                onChange={(e) => handleMonthlyToggle(e.target.checked)}
                              />
                              <span className="slider round"></span>
                            </label>
                            <span style={{ marginLeft: "10px" }}>
                              Average monthly solar intensity
                            </span>

                          </div>

                          {isMonthlyFlux && (
                            <div className="mt-3">
                              <label htmlFor="monthDropdown">Month:</label>
                              <select
                                id="monthDropdown"
                                className="form-select mt-1"
                                value={selectedMonth}
                                onChange={(e) => {
                                  clearOverlays();
                                  setSelectedMonth(e.target.value);
                                }}
                              >
                                {monthNames.map((month) => (
                                  <option key={month} value={month}>
                                    {month}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div style={{ marginTop: '5px' }}>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={showAnnualHeatMap}
                                onChange={toggleAnnualHeatMap}
                              />
                              <span className="slider round"></span>
                            </label>
                            <span style={{ marginLeft: "10px" }}>
                              Average annual solar intensity
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>

                  <div
                    className="section-title d-flex justify-content-between align-items-center"
                    onClick={() => toggleSection("visitorInfo")}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      <i className="fas fa-user icon text-warning me-2"></i> <b>Get a Free Solar Quote</b>
                      <p style={{ color: "black", marginLeft: "14%", fontSize: "13px" }}>
                        Help us reach out to you
                      </p>
                    </span>
                    <i className={`fas fa-chevron-${openSection === "visitorInfo" ? "up" : "down"}`}></i>
                  </div>

                  {openSection === "visitorInfo" && (
                    <div className="section-content ps-4 text-secondary">
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={visitorName}
                            onChange={(e) => setVisitorName(e.target.value)}
                            placeholder="Enter your name"
                          />
                        </div>
                        <div className="col-md-12 mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={visitorEmail}
                            onChange={(e) => setVisitorEmail(e.target.value)}
                            placeholder="Enter your email"
                          />
                        </div>
                        <div className="col-md-12 mb-3">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={visitorPhone}
                            onChange={(e) => setVisitorPhone(e.target.value)}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="col-12 mt-3">
                          <button className="btn btn-success" style={{ backgroundColor: '#ff9800', border: 'none' }} onClick={handleSubmitVisitorInfo}>
                            Show Proposal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}