import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useRenderSolarPanels } from '../../hooks/useRenderSolarPanels';
import { useLoadBuildingInsights } from '../../hooks/useLoadBuildingInsights';
import { useFetchLayer } from '../../hooks/useFetchLayer';
import { AppContext } from '../../context/Context';
import { useRenderOverlays } from '../../hooks/useRenderOverlays';
import Slider from '@mui/material/Slider';
import { Tooltip, IconButton, Chip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Chart } from "react-google-charts";


const data = [
  ["Year", "Solar", "No Solar"],
  ["2019", 1000, 400],
  ["2020", 1170, 460],
  ["2021", 660, 1120],
  ["2022", 1030, 540],
];

const options = {
  chart: {
    title: "Company Performance",
    subtitle: "Sales and Expenses over years",
  },
  colors: ["#f9a825", "#6d4c41"],
};

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

export default function DataLayers() {
  let viabilityStatus = 'Unknown';
  let statusColor = 'default';

  const mapRef = useRef(null);
  const [value1, setValue1] = useState(70);
  const [value2, setValue2] = useState("Jan");
  const overlaysRef = useRef([]);
  const [yearlyEnergyDcKwh, setYearlyEnergyDcKwh] = useState(12000);
  const [monthlyAverageEnergyBill, setMonthlyAverageEnergyBill] = useState(300);
  const [energyCostPerKwh, setEnergyCostPerKwh] = useState(0.31);
  const [panelCapacityWatts, setPanelCapacityWatts] = useState(400);
  const [solarIncentives, setSolarIncentives] = useState(7000);
  const [installationCostPerWatt, setInstallationCostPerWatt] = useState(4.0);
  const [installationLifeSpan, setInstallationLifeSpan] = useState(20);

  const [dcToAcDerate, setDcToAcDerate] = useState(0.85);
  const [efficiencyDepreciationFactor, setEfficiencyDepreciationFactor] = useState(0.995);
  const [costIncreaseFactor, setCostIncreaseFactor] = useState(1.022);
  const [discountRate, setDiscountRate] = useState(1.04);

  const [isMonthlyFlux, setIsMonthlyFlux] = useState(true);
  const [showMonthlyHeatMap, setShowMonthlyHeatMap] = useState(true);
  const [showAnnualHeatMap, setShowAnnualHeatMap] = useState(false);
  const [averageBill, setAverageBill] = useState(130);
  const [installationSizeKw, setInstallationSizeKw] = useState(0);
  const [monthlyKwhEnergyConsumption, setMonthlyKwhEnergyConsumption] = useState(0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();
  const [monthIndex, setMonthIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonthIndex]);
  const [map, setMap] = useState(null);
  const { completeAddress } = useContext(AppContext);
  const [yearlyEnergy, setYearlyEnergy] = useState(0);
  const [showSolarPanels, setShowSolarPanels] = useState(false);

  const [libraries, setLibraries] = useState({});
  const [layerId, setLayerId] = useState('annualFlux');
  const [layer, setLayer] = useState(null);
  const [solarPanels, setSolarPanels] = useState([]);
  const [openSection, setOpenSection] = useState("section1");

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
  const [buildingInsightss, setBuildingInsightss] = useState();
  const [panelRange, setPanelRange] = useState();
  const [generateReport, setGenerateReport] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [yearlyEngeryConsumption, setYearlyEngeryConsumption] = useState(0)

  const isFormComplete = Object.values(formData).every((val) => val.trim() !== "");

  const { renderSolarPanels } = useRenderSolarPanels({
    solarPanelsState: solarPanels,
    setSolarPanels,
    showSolarPanels,
  });

  // const handleChange1 = (_, newValue) => setValue1(newValue);
  // const handleChange2 = (_, newValue) => setValue2(newValue);

  const handleChange2 = (_, newValue) => {
    setMonthIndex(newValue);
  };

  const yearlyKwhEnergyConsumption = (monthlyAverageEnergyBillInput / energyCostPerKwhInput) * 12;

  const clearOverlays = useCallback(() => {
    overlaysRef.current?.forEach(overlay => overlay.setMap(null));
    overlaysRef.current = [];
  }, []);

  const { loadBuildingInsights } = useLoadBuildingInsights({
    completeAddress,
    apiKey: GOOGLE_MAPS_API_KEY,
    yearlyKwhEnergyConsumption,
    panelCapacityWattsInput,
    dcToAcDerateInput,
    renderSolarPanels,
    setBuildingInsightss,
    setPanelCapacity,
    setConfigId,
    setPanelConfig,
  });

  useFetchLayer({
    map,
    layerId,
    clearOverlays,
    isMonthlyFlux,
    selectedMonth,
    completeAddress,
    geometryLib: libraries.geometry,
    setLayer,
    setShowRoofOnly,
    setYearlyEnergy,
  });

  useRenderOverlays({
    map,
    layer,
    showRoofOnly,
    selectedMonth,
    showMonthlyHeatMap,
    showAnnualHeatMap,
    overlaysRef,
    clearOverlays,
  });

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

  const updateRangeFunc = (event) => {
    const val = Number(event.target.value);
    setConfigId(val);
    setPanelRange(val);

    if (buildingInsightss && buildingInsightss.solarPotential?.solarPanels) {
      const panelsToRender = buildingInsightss.solarPotential.solarPanels.slice(0, val);
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

    if (buildingInsightss) {
      const defaultCapacity = buildingInsightss.solarPotential.panelCapacityWatts;
      const defaultEnergy = buildingInsightss.solarPotential.maxSunshineHoursPerYear;

      const newYearlyEnergy = (newPanelCapacity / defaultCapacity) * defaultEnergy;
      setYearlyEnergy(newYearlyEnergy);
    }
  };

  const toggleSolarPanels = () => {
    setShowSolarPanels(prev => {
      const newState = !prev;
      solarPanels.forEach(panel => panel.setMap(newState ? map : null));
      return newState;
    });
  };

  const handleIncrement = () => {
    setAverageBill(prev => Math.min(prev + 10, 500));
  };

  const handleDecrement = () => {
    setAverageBill(prev => Math.max(prev - 10, 50));
  };

  const handleInputChange = (e) => {
    let value = Number(e.target.value);
    if (value >= 50 && value <= 500) {
      setAverageBill(value);
    }
  };

  useEffect(() => {
    if (!map || !layer) return;

    clearOverlays();
    const bounds = layer.bounds;
    const selectedMonthIndex = monthNames.indexOf(selectedMonth);
    let newOverlays = [];

    if (showMonthlyHeatMap && !showAnnualHeatMap) {
      const canvases = layer.render(showRoofOnly, selectedMonthIndex, 0); // Monthly
      newOverlays = canvases.map((canvas, i) => {
        const overlay = new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
        overlay.setMap(i === selectedMonthIndex ? map : null);
        return overlay;
      });
    }

    if (showAnnualHeatMap && !showMonthlyHeatMap) {
      const canvases = layer.render(showRoofOnly); // Still returns 12 canvases
      const annualCanvas = canvases[5]; // 🛠️ Assuming first canvas is annual flux
      const overlay = new window.google.maps.GroundOverlay(annualCanvas?.toDataURL(), bounds);
      overlay.setMap(map);
      newOverlays = [overlay]; // Only use this one
    }

    overlaysRef.current = newOverlays;

    console.log({
      showMonthlyHeatMap,
      showAnnualHeatMap,
      selectedMonth,
      overlaysCount: newOverlays.length,
    });
  }, [
    map,
    layer,
    showRoofOnly,
    clearOverlays,
    selectedMonth,
    showMonthlyHeatMap,
    showAnnualHeatMap,
  ]);

  useEffect(() => {
    if (panelRange !== undefined && loadBuildingInsights && libraries.geometry && map) {
      solarPanels.forEach(panel => panel.setMap(null));
      setSolarPanels([]);

      renderSolarPanels(libraries.geometry, loadBuildingInsights, map, panelRange);
    }
  }, [panelRange]);

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
                    <div className="data-row">
                      <span>Annual Solar Intensity</span>
                      <span className="value">
                        {buildingInsightss?.solarPotential?.maxSunshineHoursPerYear
                          ? `${Math.round(buildingInsightss.solarPotential.maxSunshineHoursPerYear.toFixed(1))} hr`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="data-row">
                      <span>Roof Area Apprx</span>
                      <span className="value">
                        {Math.round(buildingInsightss?.solarPotential?.wholeRoofStats?.areaMeters2?.toFixed(2)) || 'N/A'} m²
                      </span>
                    </div>
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
                      <span>Max panel count</span>
                      <span className="value">{buildingInsightss?.solarPotential?.maxArrayPanelsCount || 'N/A'}</span>
                    </div>
                    <div className="data-row">
                      <span>CO₂ savings</span>
                      <span className="value">
                        {buildingInsightss?.solarPotential?.carbonOffsetFactorKgPerMwh
                          ? `${buildingInsightss?.solarPotential?.carbonOffsetFactorKgPerMwh.toFixed(1)} Kg/MWh`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="data-row">
                      <span>Solar Potential</span>
                      <span className="value">{buildingInsightss?.solarPotential?.maxArrayPanelsCount || 'N/A'}</span>
                    </div>
                    <div className="data-row">
                      <span>Yearly Energy</span>
                      <span className="value">{buildingInsightss?.solarPotential?.maxArrayPanelsCount || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="insights-card position-absolute" style={{ bottom: "15px", left: "300px", zIndex: 1000 }}>
                  <div className="card-header">
                    <i className="fas fa-layer-group icon"></i>
                    <span className="title">Solar Intensity Key</span>
                  </div>
                  <hr />
                  <div className="card-body" style={{ width: '100%' }} >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ marginRight: "10px" }} >Shaday</span>
                      <div class="sun-gradient" style={{ flex: 1, height: '10px' }} ></div>
                      <span style={{ marginLeft: '30px' }}>Sunny</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            {showSolarPotential && (
              <>
                <div
                  className="insights-card position-absolute shadow rounded-4 bg-white"
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
                  onScroll={(e) => {
                    e.currentTarget.style.scrollbarWidth = "none";
                  }}
                >
               

                  <div className="card-header mb-2">
                    <i className="fas fa-home text-warning"></i>
                    Your Solar Home System
                  </div>

                  {/* Energy Production */}
                  <div className="section-title">Energy Production</div>
                  <div className="data-row"><span>Installation Size</span><span className="value">7.5 kW</span></div>
                  <div className="data-row"><span>Number of Panels</span><span className="value">{configId}</span></div>
                  <div className="data-row"><span>Annual Energy Production</span><span className="value">13,850.3 kWh</span></div>
                  <div className="data-row"><span>% Household Electricity Covered</span><span className="value">101%</span></div>

                  {/* Cost Savings */}
                  <div className="section-title">Cost Savings</div>
                  <div className="data-row"><span>Return-on-Investment</span><span className="value">@ $3.00/Watt</span></div>
                  <div className="data-row"><span>Cost Without Solar</span><span className="value">$50,000.00</span></div>
                  <div className="data-row"><span>Total Installation Cost</span><span className="value">$22,500.00</span></div>
                  <div className="data-row"><span>Savings</span><span className="value">$27,500.00</span></div>
                  <div className="data-row"><span>Payback Period</span><span className="value">8 yrs @ $3.00/Watt</span></div>

                  {/* Chart */}
                  <div className="section-title">Cost Comparison (20 Years)</div>
                  <Chart
                    chartType="Line"
                    width="100%"
                    height="200px"
                    data={data}
                    options={options}
                  />

                  {/* Key Components */}
                  <div className="section-title">Key Components</div>
                  <div className="data-row"><span>Module/Panel Type</span><span className="value">Monocrystalline</span></div>
                  <div className="data-row"><span>Capacity</span><span className="value">375 W</span></div>
                  <div className="data-row"><span>Efficiency</span><span className="value">20.5%</span></div>
                  <div className="data-row"><span>Efficiency Decline (20 yrs)</span><span className="value">12%</span></div>
                  <div className="data-row"><span>Inverter Type</span><span className="value">String Inverter</span></div>
                  <div className="data-row"><span>DC-to-AC Conversion</span><span className="value">97%</span></div>
                </div>


              </>
            )}
          </div>
          <div className="col-md-4 d-flex align-items-start" style={{ background: "#f8f8f8", height: "100vh", overflowY: "auto" }}>
            <div className="container">
              <h4 className="solar-header mt-4 text-center text-warning" style={{ fontWeight: 'bold' }} >See What Solar Can Do For You</h4>
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
                    <>
                      <div className="section-content ps-4 text-secondary">

                        {/* Monthly Electricity Bill */}
                        <fieldset className="border rounded p-3 mt-4">
                          <legend className="fs-6 text-muted mb-1">Average Monthly Electricity Bill</legend>
                          <div className="form-group input-group">
                            <input
                              type="number"
                              className="form-control"
                              value={averageBill}
                              onChange={handleInputChange}
                              min={50}
                              max={500}
                              step={10}
                              style={{ height: '44px' }}
                            />
                            <span className="input-group-text" style={{ height: '44px' }}>$</span>
                          </div>
                          <small className="text-muted mt-1 d-block">
                            Source: U.S. Dept of Energy, residential average
                          </small>
                        </fieldset>

                        <fieldset className="border rounded p-3 mt-4">
                          <legend className="fs-6 text-muted mb-1">Solar Panels Configuration</legend>
                         
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`ms-1 ${showSolarPanels ? 'text-warning' : 'text-secondary'}`}>
                              {showSolarPanels ? 'Enabled' : 'Disabled'}
                            </span>
                            <div className="form-check form-switch" style={{ padding: 0 }}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                style={{ width: '2rem', height: '1rem', cursor: 'pointer' }}
                                checked={showSolarPanels}
                                onChange={toggleSolarPanels}
                              />
                            </div>
                          </div>
                          <small className="text-muted mt-2 d-block">
                            {showSolarPanels
                              ? 'Solar panels are displayed on the map to visualize their layout and potential.'
                              : 'Solar panels are hidden from the map view for a clearer layout.'}
                          </small>

                          {/* Panel Count Display & Slider */}
                          <div className="row mt-4 mb-2">
                            <div className="col-6 text-start">
                              <strong>Panel Count</strong>
                            </div>
                            <div className="col-6 text-end">
                              {configId} Panels
                            </div>
                          </div>
                          <input
                            type="range"
                            className="form-range"
                            min="1"
                            max={buildingInsightss?.solarPotential?.maxArrayPanelsCount}
                            value={configId}
                            onChange={updateRangeFunc}
                          />
                          <small className="text-muted d-block mb-3">
                            Use the slider to adjust the number of panels based on your roof size and preference.
                          </small>

                          {/* Panel Capacity Input */}
                          <div className="mt-3">
                            <label htmlFor="panelCapacity" className="fs-6 text-dark-emphasis mb-3 ">
                              Panel Capacity
                            </label>
                            <div className="input-group">
                              <input
                                readOnly
                                type="number"
                                id="panelCapacity"
                                className="form-control"
                                value={panelCapacity}
                                onChange={handleChange}
                                style={{ height: '44px' }}
                              />
                              <span className="input-group-text" style={{ height: '44px' }}>Watts</span>
                            </div>
                            <small className="text-muted mt-1 d-block">
                              Define the wattage of each solar panel. Typical values range from 250W to 450W.
                            </small>
                          </div>
                        </fieldset>




                        {/* <legend className="fs-5 text-dark-emphasis mb-3">Solar Panels Configuration</legend> */}

                        {/* Toggles */}
                        {/* Heatmap Configuration Section */}
                        <fieldset className="border rounded p-4 mt-4 bg-light-subtle">
                          <legend className="fs-5 text-dark-emphasis mb-3">Solar Intensity Heatmap</legend>

                          {/* Monthly Heatmap Toggle */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <label className="form-label fw-semibold mb-1">
                                Average Monthly Intensity
                              </label>
                              <div className="form-check form-switch" style={{ padding: 0 }}>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  style={{ width: '2rem', height: '1rem', cursor: 'pointer' }}
                                  checked={showMonthlyHeatMap}
                                  onChange={(e) => handleMonthlyToggle(e.target.checked)}
                                />
                              </div>
                            </div>
                            <span className={`fw-medium ${showMonthlyHeatMap ? 'text-warning' : 'text-secondary'}`}>
                              {showMonthlyHeatMap ? 'Enabled' : 'Disabled'}
                            </span>
                            <small className="text-muted d-block mt-1">
                              {showMonthlyHeatMap
                                ? 'Displays a monthly heatmap of solar energy potential based on selected month.'
                                : 'Monthly heatmap is hidden from the map view.'}
                            </small>
                          </div>

                          {/* Month Dropdown Selector */}
                          {showMonthlyHeatMap && (
                            <div className="mb-4">
                              <label htmlFor="monthDropdown" className="form-label fw-semibold mb-1">
                                Select Month
                              </label>
                              <select
                                id="monthDropdown"
                                className="form-select"
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
                              <small className="text-muted mt-1 d-block">
                                Choose a specific month to visualize the solar intensity trend.
                              </small>
                            </div>
                          )}

                          {/* Annual Heatmap Toggle */}
                          <div>
                            <div className="d-flex justify-content-between align-items-center">
                              <label className="form-label fw-semibold mb-1">
                                Average Annual Intensity
                              </label>
                              <div className="form-check form-switch" style={{ padding: 0 }}>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  style={{ width: '2rem', height: '1rem', cursor: 'pointer' }}
                                  checked={showAnnualHeatMap}
                                  onChange={toggleAnnualHeatMap}
                                />
                              </div>
                            </div>
                            <span className={`fw-medium ${showAnnualHeatMap ? 'text-warning' : 'text-secondary'}`}>
                              {showAnnualHeatMap ? 'Enabled' : 'Disabled'}
                            </span>
                            <small className="text-muted d-block mt-1">
                              {showAnnualHeatMap
                                ? 'Displays overall yearly solar flux intensity to understand long-term trends.'
                                : 'Annual heatmap is currently not shown.'}
                            </small>
                          </div>
                        </fieldset>

                      </div>
                    </>
                  )}
                </div>
                <div>

                  <div
                    className="section-title d-flex justify-content-between align-items-center"
                    onClick={() => toggleSection("section2")}
                    style={{ cursor: "pointer" }}
                  >
                    <span  >
                      <i className="fas fa-user icon text-warning me-1 mt-2"></i> <b>Report of Your Solar Home System</b>
                      <p style={{ color: "black", marginLeft: "14%", fontSize: "13px" }}>
                        Help us reach out to you
                      </p>
                    </span>
                    <i className={`fas fa-chevron-${openSection === "section2" ? "up" : "down"}`}></i>
                  </div>

                  {openSection === "section2" && (
                    <>
                      {/* Summary Report Generation Section */}
                      <div className="mt-4">
                        <fieldset className="border rounded p-4 bg-light">
                          <legend className="fs-6 text-muted mb-3">Generate Your Summary Report</legend>

                          {/* Enable Report Message */}
                          <div className="form-check mb-3">
                            <label className="form-check-label text-secondary" htmlFor="generateReport">
                              Receive a personalized summary of your rooftop solar potential via email.
                            </label>
                          </div>

                          {/* Form Fields (only if solar potential shown) */}
                          {showSolarPotential && (
                            <>
                              {/* First Name */}
                              <div className="form-group mb-3">
                                <label htmlFor="firstName" className="form-label text-muted mb-1">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  id="firstName"
                                  className="form-control"
                                  placeholder="Enter your first name"
                                  value={formData.firstName}
                                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                              </div>

                              {/* Last Name */}
                              <div className="form-group mb-3">
                                <label htmlFor="lastName" className="form-label text-muted mb-1">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  id="lastName"
                                  className="form-control"
                                  placeholder="Enter your last name"
                                  value={formData.lastName}
                                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                              </div>

                              {/* Email */}
                              <div className="form-group mb-4">
                                <label htmlFor="email" className="form-label text-muted mb-1">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  id="email"
                                  className="form-control"
                                  placeholder="Enter your email"
                                  value={formData.email}
                                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                              </div>

                              {/* Submit Button */}
                              <button
                                className="btn btn-warning w-100"
                                disabled={!isFormComplete}
                                onClick={() => {
                                  // Replace with actual logic
                                  alert("Confirmation email sent!");
                                }}
                              >
                                Send My Report
                              </button>
                            </>
                          )}

                          {/* Example Report Link */}
                          <div className="mt-4 text-center">
                            <a
                              href="/example-summary-report"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none text-warning"
                            >
                              📄 View an Example Summary Report
                            </a>
                          </div>
                        </fieldset>
                      </div>

                    </>
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