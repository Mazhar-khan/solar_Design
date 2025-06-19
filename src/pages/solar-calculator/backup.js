import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useRenderSolarPanels } from '../../hooks/useRenderSolarPanels';
import { useLoadBuildingInsights } from '../../hooks/useLoadBuildingInsights';
import { useInitializeMap } from '../../hooks/useGoogleMapInit';
import { useFetchLayer } from '../../hooks/useFetchLayer';
import { AppContext } from '../../context/Context';
import SolarUserDetails from './calculator-UI-blocks/SolarUserDetails';
import SolarHomeSection from './calculator-UI-blocks/SolarHomeSection'
import BuildingInsightFirstCard from './calculator-UI-blocks/BuildingInsightFirstCard';
import BuildingInsightSecondCard from './calculator-UI-blocks/BuildingInsightSecondCard';
import { useRenderHeatmapOverlay } from '../../hooks/useRenderHeatmapOverlay';
import { useConfigId } from '../../hooks/useConfigId';

export default function SolarCalculator() {
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);

  const [isMonthlyFlux, setIsMonthlyFlux] = useState(true);
  const [showMonthlyHeatMap, setShowMonthlyHeatMap] = useState(false);
  const [showAnnualHeatMap, setShowAnnualHeatMap] = useState(true);
 

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonthIndex]);
  const [map, setMap] = useState(null);
                
  const { completeAddress, buildingInsights, setConFigID,defaultBill } = useContext(AppContext);
  const [averageBill, setAverageBill] = useState(defaultBill);
  const [yearlyEnergy, setYearlyEnergy] = useState(0);
  const [showSolarPanels, setShowSolarPanels] = useState(false);

  const [libraries, setLibraries] = useState({});
  const [layerId, setLayerId] = useState('annualFlux');
  const [layer, setLayer] = useState(null);
  const [solarPanels, setSolarPanels] = useState([]);
  const [openSection, setOpenSection] = useState("null");
  const [isHomeCandiate, setIsHomeCandiate] = useState(true)
  const [isPanellChange,setIsPanellChange] = useState(false)

  const [showProfileCard, setShowProfileCard] = useState(true);
  const [showSolarCard, setShowSolarCard] = useState(false);
  const [panelCapacity, setPanelCapacity] = useState();
  const [showChart, setShowChart] = useState(false);
  const [showSolarPotential, setSolarPotential] = useState(false);
  const [showRoofOnly, setShowRoofOnly] = useState(false);
  const [panelConfig, setPanelConfig] = useState(undefined);

  const [buildingInsightss, setBuildingInsightss] = useState();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });

  const [configId, setConfigId] = useState(null);
  const [panelConfigs, setPanelConfigs] = useState([]);

  const [hitPanelCount, setHitPanelCount] = useState(null)

  const isFormComplete = Object.values(formData).every((val) => val.trim() !== "");
//console.log("1")
  const { renderSolarPanels } = useRenderSolarPanels({
    solarPanelsState: solarPanels,
    setSolarPanels,
    showSolarPanels,
    averageBill,
  });
//console.log("2")
  const clearOverlays = useCallback(() => {
    console.log("2")
    overlaysRef.current?.forEach(overlay => overlay.setMap(null));
    overlaysRef.current = [];
  }, []);
// console.log("3")
  const { loadBuildingInsights } = useLoadBuildingInsights({
    renderSolarPanels,
    averageBill,
    hitPanelCount
  });
// console.log("4")
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
// console.log("5")
  useInitializeMap({
    mapRef,
    completeAddress,
    setLibraries,
    setMap,
    loadBuildingInsights,
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });
// console.log("6")
  useRenderHeatmapOverlay({
    map,
    layer,
    showRoofOnly,
    selectedMonth,
    showMonthlyHeatMap,
    showAnnualHeatMap,
    clearOverlays,
    overlaysRef,
  });

  const { getConfigId } = useConfigId();

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
      setShowProfileCard(false);
      setShowSolarCard(false);
      setSolarPotential(false);
      setShowChart(false);
      setIsHomeCandiate(true)
    } else {
      setOpenSection(section);
      if (section === "section1") {
        setShowProfileCard(true);

        setIsHomeCandiate(false)
        setShowSolarCard(false);
        setSolarPotential(true);
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

  useEffect(() => {
    console.log("7")
    const val = JSON.parse(localStorage.getItem('buildingInsights'));
    const panelConfig = val?.solarPotential?.solarPanelConfigs || [];
    setPanelConfigs(panelConfig);
  }, []);

  const handleInputChange = (e) => {
    const averageBill = Number(e.target.value);
    setAverageBill(averageBill);
    const updatedBill = getConfigId({ averageBill, buildingInsights })
  };

  const handleInputBlur = () => {
    if (averageBill < 50) {
      setAverageBill(50);
    } else if (averageBill > 500) {
      setAverageBill(500);
    }
  };

  useEffect(() => {
    console.log("8")
    if (map && buildingInsights && libraries.geometry) {
      const panelConfigOrRange = configId ?? buildingInsights?.solarPotential?.solarPanels?.length;
      renderSolarPanels(libraries.geometry, map, panelConfigOrRange);
    } else {
      solarPanels.forEach(panel => panel.setMap(null));
      setSolarPanels([]);
    }

  }, [showSolarPanels, hitPanelCount, averageBill]);

  return (
    <>
      <section className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-md-8 position-relative">
            <div ref={mapRef} id="map" style={{ height: "100vh" }} />
            {isHomeCandiate && (
              <BuildingInsightFirstCard
                completeAddress={completeAddress}
                buildingInsights={buildingInsights}
              />
            )}
            {showSolarPotential && (
              <BuildingInsightSecondCard
                configId={configId}
              />
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

                      <SolarHomeSection
                        averageBill={averageBill}
                        handleInputChange={handleInputChange}
                        showSolarPanels={showSolarPanels}
                        toggleSolarPanels={toggleSolarPanels}
                        configId={configId}
                        buildingInsightss={buildingInsightss}
                        setHitPanelCount={setHitPanelCount}
                        setIsPanellChange={setIsPanellChange}
                        panelCapacity={panelCapacity}
                        handleChange={handleChange}
                        showMonthlyHeatMap={showMonthlyHeatMap}
                        handleMonthlyToggle={handleMonthlyToggle}
                        selectedMonth={selectedMonth}
                        clearOverlays={clearOverlays}
                        setSelectedMonth={setSelectedMonth}
                        monthNames={monthNames}
                        showAnnualHeatMap={showAnnualHeatMap}
                        toggleAnnualHeatMap={toggleAnnualHeatMap}
                        handleInputBlur={handleInputBlur}
                      />
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
                    <SolarUserDetails
                      showSolarPotential={showSolarPotential}
                      formData={formData}
                      setFormData={setFormData}
                      isFormComplete={isFormComplete}
                    />
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