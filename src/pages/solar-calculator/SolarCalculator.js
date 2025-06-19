import { useState, useRef, useContext, useEffect } from 'react';
import { useInitializeMap } from '../../hooks/useGoogleMapInit';
import { useLoadBuildingInsights } from '../../hooks/useLoadBuildingInsights';
import { useFetchLayer } from '../../hooks/useFetchLayer';
import BuildingInsightFirstCard from './calculator-UI-blocks/BuildingInsightFirstCard';
import BuildingInsightSecondCard from './calculator-UI-blocks/BuildingInsightSecondCard';
import SolarUserDetails from './calculator-UI-blocks/SolarUserDetails';
import SolarHomeSection from './calculator-UI-blocks/SolarHomeSection';
import { AppContext } from '../../context/Context';
import { useConfigId } from '../../hooks/useConfigId';
import { useRenderSolarPanels } from '../../hooks/useRenderSolarPanels';


export default function SolarCalculator() {
  const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
  const mapRef = useRef(null);
  const [layer, setLayer] = useState(null);
  const [libraries, setLibraries] = useState({});
  const [map, setMap] = useState(null);
  const [layerId, setLayerId] = useState('annualFlux');
  const [showRoofOnly, setShowRoofOnly] = useState(true);
  const overlaysRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [isHomeCandiate, setIsHomeCandiate] = useState(true)
  const [showSolarPotential, setSolarPotential] = useState(false);

  const [openSection, setOpenSection] = useState("null");
  const [showProfileCard, setShowProfileCard] = useState(true);
  const [showSolarCard, setShowSolarCard] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showAnnualHeatMap, setShowAnnualHeatMap] = useState(true);
  const [isMonthlyFlux, setIsMonthlyFlux] = useState(true);
  const [showMonthlyHeatMap, setShowMonthlyHeatMap] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }).toLowerCase());
  const { defaultBill, configId, completeAddress } = useContext(AppContext);
  const [averageBill, setAverageBill] = useState(defaultBill);
  const [showSolarPanels, setShowSolarPanels] = useState(false);

  const [solarPanels, setSolarPanels] = useState([]);
  const [hitPanelCount, setHitPanelCount] = useState(null);
  const [isPanellChange, setIsPanellChange] = useState(false)




  //custom hooks
  const { renderSolarPanels } = useRenderSolarPanels({
    solarPanelsState: solarPanels,
    setSolarPanels,
    showSolarPanels,
    averageBill,
    hitPanelCount
  })
  useFetchLayer({
    map, layerId, geometryLib: libraries.geometry, setLayer, showRoofOnly, apiKey,
    overlaysRef, setLoading, showAnnualHeatMap, showMonthlyHeatMap, selectedMonth, setSelectedMonth
  });
  const { loadBuildingInsights } = useLoadBuildingInsights({});
  useInitializeMap({ mapRef, setLibraries, setMap, renderSolarPanels });
  const { getConfigId } = useConfigId();

  // toggle panels sections
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

  // monthly heatmap
  const handleMonthlyToggle = () => {
    if (showMonthlyHeatMap === false) {
      setShowMonthlyHeatMap(true)
    } else if (showMonthlyHeatMap === true) {
      setShowMonthlyHeatMap(false)
    }
  };

  //annual heatmap
  const toggleAnnualHeatMap = () => {
    if (!showAnnualHeatMap) {
      setShowAnnualHeatMap(true);
      setShowMonthlyHeatMap(false);
      setLayerId('annualFlux');
    } else {
      setShowAnnualHeatMap(false);
    }
  };

  //electricity bill
  const handleInputChange = (e) => {
    const averageBill = Number(e.target.value);
    setAverageBill(averageBill);
    const updatedBill = getConfigId({ averageBill })
    console.log("updatedBill", updatedBill)
  };

  //solar panel 
  const toggleSolarPanels = () => {
    setShowSolarPanels(prev => {
      const newState = !prev;
      return newState;
    });
    // showSolarPanels == false means toggle is on 
    if (showSolarPanels === false) {

    } else if (showSolarPanels === true) {

    }
  };

  // stric electricity bill in specific range
  const handleInputBlur = () => {
    if (averageBill < 50) {
      setAverageBill(50);
    } else if (averageBill > 500) {
      setAverageBill(500);
    }
  };

  useEffect(() => {
    if (map && libraries.geometry) {
      renderSolarPanels(libraries.geometry, map);
    } else {
      solarPanels.forEach(panel => panel.setMap(null));
      setSolarPanels([]);
    }

  }, [showSolarPanels, averageBill, hitPanelCount]);


  return (
    <section className="container-fluid p-0">
      <div className="row g-0">
        <div className="col-md-8 position-relative">
          {/* <div ref={mapRef} id="map" style={{ height: "100vh" }} /> */}
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${completeAddress?.geo[0]},${completeAddress?.geo[1]}&zoom=20&size=800x800&maptype=satellite&key=${apiKey}`}
            alt="Static Map"
            style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
          />


          {loading && <div className="rooftop-loader"></div>}
          {isHomeCandiate && (<BuildingInsightFirstCard />)}
          {showSolarPotential && (<BuildingInsightSecondCard />)}

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
                    {/* Child Component */}
                    <SolarHomeSection
                      showAnnualHeatMap={showAnnualHeatMap}
                      toggleAnnualHeatMap={toggleAnnualHeatMap}
                      handleMonthlyToggle={handleMonthlyToggle}
                      selectedMonth={selectedMonth}
                      setSelectedMonth={setSelectedMonth}
                      showMonthlyHeatMap={showMonthlyHeatMap}
                      monthNames={[
                        "january", "february", "march", "april", "may", "june",
                        "july", "august", "september", "october", "november", "december"
                      ]}
                      averageBill={averageBill}
                      handleInputChange={handleInputChange}
                      toggleSolarPanels={toggleSolarPanels}
                      showSolarPanels={showSolarPanels}
                      handleInputBlur={handleInputBlur}
                      setHitPanelCount={setHitPanelCount}
                      setIsPanellChange={setIsPanellChange}
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
                  // formData={formData}
                  // setFormData={setFormData}
                  // isFormComplete={isFormComplete}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  )
}