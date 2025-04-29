import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

import { findClosestBuilding, getDataLayerUrls } from './Solar';
import { createPalette, normalize, rgbToColor } from './Visualize';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { panelsPalette } from './Colors';
import { AppContext } from '../../context/Context';
import { getLayer } from './Layer';
import { findSolarConfig } from './Utils';

const GOOGLE_MAPS_API_KEY = "AIzaSyAz5z8de2mOowIGRREyHc3gT1GgmJ3whDg";

// const completeAddress = {
//   geo: [38.87805, -94.30454],
//   country: 'United States',
//   state: 'Missouri',
//   city: "Lee's Summit",
//   postalCode: '64086',
//   street: 'Smart Road',
//   streetNumber: '13118',
// };

export default function DataLayers() {
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);

  const [map, setMap] = useState(null);
  const {completeAddress } = useContext(AppContext);

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

  // Initialize Map and Libraries
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

  // Load Building Insights and Solar Panels
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

    console.log("id", id)

    const solarPotential = buildingInsights.solarPotential;
    const palette = createPalette(panelsPalette).map(rgbToColor);

    const minEnergy = solarPotential.solarPanels.slice(-1)[0].yearlyEnergyDcKwh;
    const maxEnergy = solarPotential.solarPanels[0].yearlyEnergyDcKwh;

    // const PANEL_COUNT = id;
    console.log("configId", configId)
    let panelCountToRender = panelRange ?? panelConfig?.panelCount ?? id;
    let panelsToRender = solarPotential.solarPanels.slice(0, panelCountToRender);

    // let panelsToRender = solarPotential.solarPanels.slice(0, id);

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
    // Clear existing solar panels
    solarPanels.forEach(panel => panel.setMap(null));
    setSolarPanels([]);

    panels.forEach(panel => panel.setMap(mapInstance));
    setSolarPanels(panels);
  };

  // Handle Layer Changes
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


        console.log("diameter", diameter)
        const radius = Math.ceil(diameter / 2);
        // const radius = 42;
        console.log("radius", radius)

        if (center && Array.isArray(center)) {
          map.setCenter({ lat: center[0], lng: center[1] });
        }

        const response = await getDataLayerUrls(center, radius, GOOGLE_MAPS_API_KEY);
        const loadedLayer = await getLayer(layerId, response, GOOGLE_MAPS_API_KEY);

        setLayer(loadedLayer);
      } catch (error) {
        console.error('❌ Data layer fetch error:', error);
      }
    }

    fetchLayer();
  }, [map, layerId, clearOverlays]);

  // Render Layer Overlays
  useEffect(() => {
    if (!map || !layer) return;

    clearOverlays();

    const bounds = layer.bounds;
    const newOverlays = layer.render(showRoofOnly, 0, 0).map(canvas => {
      return new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
    });

    newOverlays.forEach(overlay => overlay.setMap(map));
    overlaysRef.current = newOverlays;
  }, [map, layer, showRoofOnly, clearOverlays]);

  const updateRangeFunc = (event) => {
    let val = Number(event.target.value);
    setConfigId(val)
    setPanelRange(val);
  }

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
        setShowSolarCard(true); // Show solar card for section 3
        setShowChart(true);
        setSolarPotential(false); // Show chart for section 3
      }
    }
  };

  const handleChange = (event) => {
    const newPanelCapacity = Number(event.target.value);
    setPanelCapacity(newPanelCapacity);

    // yearlyEnergyConsumption(newPanelCapacity);
  };

  // useEffect(() => {
  //   if (panelRange !== undefined && buildingInsights && libraries.geometry && map) {
  //     clearOverlays();
  //     renderSolarPanels(libraries.geometry, buildingInsights, map, panelRange);
  //   }
  // }, [panelRange]);

  useEffect(() => {
    if (panelRange !== undefined && buildingInsights && libraries.geometry && map) {
      // Clear existing solar panels only
      solarPanels.forEach(panel => panel.setMap(null));
      setSolarPanels([]);

      renderSolarPanels(libraries.geometry, buildingInsights, map, panelRange);
    }
  }, [panelRange]);



  {/* <div ref={mapRef} id="map" style={{ width: "100vw", height: "100vh" }} /> */ }
  return (
    <>
      <section className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-md-8 position-relative">
            <div ref={mapRef} id="map" style={{ height: "100vh" }} />
            {showProfileCard && (
              <div className="insights-card position-absolute" style={{ top: "20px", left: "20px", zIndex: 1000 }}>
                <div className="card-header">
                  <i className="fas fa-home home-icon"></i>
                  <span className="title">Building Insights endpoint</span>
                </div>
                <hr />
                <div className="card-body">
                  <div className="data-row">
                    <span>Annual sunshine</span>
                    <span className="value">
                      {buildingInsights?.solarPotential?.maxSunshineHoursPerYear
                        ? `${buildingInsights.solarPotential.maxSunshineHoursPerYear.toFixed(1)} hr`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="data-row">
                    <span>Roof area</span>
                    <span className="value">
                      {buildingInsights?.solarPotential?.wholeRoofStats?.areaMeters2?.toFixed(2) || 'N/A'} m²
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
            )}
            {showSolarPotential && (
              <div className="insights-card position-absolute" style={{ top: "20px", left: "20px", zIndex: 1000 }}>
                <div className="card-header">
                  <i className="fas fa-layer-group icon"></i>
                  <span className="title">Data Layers endpoint</span>
                </div>
                <hr />
                <div className="card-body">
                  <div className="data-row">
                    <p style={{ textAlign: 'center' }}>We’ve helped THOUSANDS of homeowners like you, switch to save money & save the environment.</p>
                  </div>
                </div>
              </div>
            )}
            {showSolarCard && (
              <div className="solar-card position-absolute" style={{ top: "20px", left: "20px", zIndex: 1000 }}>
                <div className="card-header">
                  <i className="fas fa-money-check  header-icon"></i>
                  <span className="title">Solar Potential analysis</span>
                </div>
                <hr />
                <div className="card-body">
                  <div className="data-row">
                    <span>Yearly energy</span>
                    <span className="value">in-progress</span>
                  </div>
                  <div className="data-row">
                    <span>Installation size</span>
                    <span className="value">in-progress</span>
                  </div>
                  <div className="data-row">
                    <span>Installation cost</span>
                    <span className="value">in-progress</span>
                  </div>
                  <div className="data-row">
                    <span>Energy covered</span>
                    <span className="value">in-progress</span>
                  </div>
                </div>
              </div>
            )}
            {showChart && (
              <div className="chart-container position-absolute" style={{ top: "250px", left: "20px", zIndex: 1000 }}>
                <h4 className="chart-title">Cost analysis for 20 years</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="solar" stroke="#007bff" name="Solar" />
                    <Line type="monotone" dataKey="noSolar" stroke="#ff4d4d" name="No solar" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="summary">
                  <div className="summary-row">
                    <span>Cost without solar</span>
                    <span className="value">in-progress</span>
                  </div>
                  <div className="summary-row">
                    <span>Cost with solar</span>
                    <span className="value">in-progress</span>
                  </div>
                  <div className="summary-row">
                    <span>Savings</span>
                    <span className="value">in-progress</span>
                  </div>
                  <div className="summary-row">
                    <span>Break even</span>
                    <span className="value">in-progress</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-4 d-flex align-items-start" style={{ background: "#f8f8f8", height: "100vh", overflowY: "auto" }}>
            <div className="container">

              <p className="text-muted text-center mt-4">
                Click an area below to see what type of information the Solar API can provide.
              </p>

              <div className="custom-card p-3 shadow rounded mt-4">
                <div>
                  <div
                    className="section-title d-flex justify-content-between align-items-center"
                    onClick={() => toggleSection("section1")}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      <i className="fas fa-home icon text-warning me-2"></i> <b>Building Insights endpoint</b>
                      <p style={{ color: "black", marginLeft: "14%", fontSize: "13px" }}>Yearly energy: {buildingInsights?.solarPotential?.maxSunshineHoursPerYear} Wh </p>
                    </span>
                    <i className={` fas fa-chevron-${openSection === "section1" ? "up" : "down"}`}></i>
                  </div>
                  {openSection === "section1" && (
                    <div className="section-content ps-4 text-secondary">
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
                          {/* <div className="checkbox-group">
                            <label className="toggle2">
                              <input
                                type="checkbox"
                                checked={showHeatmap}
                                onChange={handleChangeHeatMap}
                              />
                              <i></i></label>
                            <label htmlFor="toggle" style={{ marginLeft: '5px' }}>
                              Heat Map{" "}
                            </label>

                          </div> */}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <hr />
                <div>
                  <div
                    className="section-title d-flex justify-content-between align-items-center"
                    onClick={() => toggleSection("section2")}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      <i className="fas fa-layer-group icon text-warning me-2"></i> <b>Data Layers endpoint</b>
                    </span>
                    <i className={`fas fa-chevron-${openSection === "section2" ? "up" : "down"}`}></i>
                  </div>
                  {openSection === "section2" && (
                    <div className="section-content ps-4 text-secondary">Monthly sunshine</div>
                  )}
                </div>
                <hr />
                <div>
                  <div
                    className="section-title d-flex justify-content-between align-items-center"
                    onClick={() => toggleSection("section3")}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      <i className="fas fa-money-check icon text-warning me-2"></i> <b>Solar Potential analysis</b>
                    </span>
                    <i className={`fas fa-chevron-${openSection === "section3" ? "up" : "down"}`}></i>
                  </div>
                  {openSection === "section3" && (
                    <div className="section-content ps-4 text-secondary">
                      Values are only placeholders. Update with your own values.
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex flex-row justify-content-center align-items-center text-center" style={{ marginTop: '8%' }}>
                <div className="me-2">
                  <a
                    className="group-btn"

                  >
                    Show Proposal
                  </a>
                </div>
                <div>
                  <a
                    className="group-btn"

                  >
                    Contact Me
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}