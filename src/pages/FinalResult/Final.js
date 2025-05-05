import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import * as geotiff from 'geotiff';
import * as geokeysToProj4 from 'geotiff-geokeys-to-proj4';
import proj4 from 'proj4';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GoogleMap, Polygon, useJsApiLoader, HeatmapLayer } from '@react-google-maps/api';
import { AppContext } from '../../context/Context';

export default function Final() {
  const panelsPalette = ['E8EAF6', '1A237E'];
  const { data, completeAddress, buildingInsights, dataLayers } = useContext(AppContext);
  const [panelRange, setPanelRange] = useState();
  const [openSection, setOpenSection] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [imageSrc, setImageSrc] = useState("assets/img/solar_api.png");
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showSolarCard, setShowSolarCard] = useState(false);
  const [showSolarPotential, setSolarPotential] = useState(false);
  const [solarPolygons, setSolarPolygons] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [roofSegments, setRoofSegments] = useState([]);
  const [yearlyEngery, setYearlyEngery] = useState();
  const [heatmapData, setHeatmapData] = useState([]);
  const [panelCapacity, setPanelCapacity] = useState(buildingInsights?.solarPotential.panelCapacityWatts);
  const [polygons, setPolygons] = useState([]);
  const [center, setCenter] = useState({
    lat: parseFloat(completeAddress["geo"][0].toFixed(5)),
    lng: parseFloat(completeAddress["geo"][1].toFixed(5)),
  });


  const downloadGeoTIFF = async () => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    const url = dataLayers.rgbUrl;
    console.log(`Downloading data layer: ${url}`);

    const solarUrl = url.includes('solar.googleapis.com') ? url + `&key=${apiKey}` : url;
    const response = await fetch(solarUrl);
    console.log("response", response.body)
    if (response.status !== 200) {
      const error = await response.json();
      console.error(`downloadGeoTIFF failed: ${url}\n`, error);
      throw error;
    }

    const arrayBuffer = await response.arrayBuffer();
    const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const rasters = await image.readRasters();

    const geoKeys = image.getGeoKeys();
    const projObj = geokeysToProj4.toProj4(geoKeys);
    const projection = proj4(projObj.proj4, 'WGS84');
    const box = image.getBoundingBox();
    const sw = projection.forward({
      x: box[0] * projObj.coordinatesConversionParameters.x,
      y: box[1] * projObj.coordinatesConversionParameters.y,
    });
    const ne = projection.forward({
      x: box[2] * projObj.coordinatesConversionParameters.x,
      y: box[3] * projObj.coordinatesConversionParameters.y,
    });

    return {
      width: rasters.width,
      height: rasters.height,
      rasters: [...Array(rasters.length).keys()].map((i) =>
        Array.from(rasters[i])
      ),
      bounds: {
        north: ne.y,
        south: sw.y,
        east: ne.x,
        west: sw.x,
      },
    };
  }

  const clamp = (x, min, max) => Math.min(Math.max(x, min), max);
  const normalize = (x, max = 1, min = 0) => clamp((x - min) / (max - min), 0, 1);
  const lerp = (x, y, t) => x + t * (y - x);

  const colorToRGB = (color) => {
    const hex = color.startsWith('#') ? color.slice(1) : color;
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  };


  const rgbToColor = ({ r, g, b }) => {
    const f = (x) => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${f(r)}${f(g)}${f(b)}`;
  };

  const createPalette = (hexColors) => {
    const rgb = hexColors.map(colorToRGB);
    const size = 256;
    const step = (rgb.length - 1) / (size - 1);
    return Array(size).fill(0).map((_, i) => {
      const index = i * step;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      return {
        r: lerp(rgb[lower].r, rgb[upper].r, index - lower),
        g: lerp(rgb[lower].g, rgb[upper].g, index - lower),
        b: lerp(rgb[lower].b, rgb[upper].b, index - lower),
      };
    });
  };


  const handleChange = (event) => {
    const newPanelCapacity = Number(event.target.value);
    setPanelCapacity(newPanelCapacity);

    yearlyEnergyConsumption(newPanelCapacity);
  };

  const handleChangeHeatMap = (e) => {
    const val = e.target.checked;
    setShowHeatmap(val);
  };

  const findPanelsCount = (yearlymax) => {
    let config = null;
    const solarPanelConfigs = buildingInsights?.solarPotential?.solarPanelConfigs;
    for (let i = 0; i < solarPanelConfigs?.length; i++) {
      config = solarPanelConfigs[i];
      if (config?.yearlyEnergyDcKwh >= yearlymax) { return config?.panelsCount; }
    }
  }

  const drawPolygons = useCallback(() => {
    if (!window.google || !buildingInsights) return;

    const geometryLibrary = window.google.maps.geometry;
    const panelData = buildingInsights?.solarPotential?.solarPanels || [];
    const segmentStats = buildingInsights?.solarPotential?.roofSegmentStats || [];

    const palette = createPalette(panelsPalette).map(rgbToColor);
    const maxEnergy = panelData[0]?.yearlyEnergyDcKwh || 1;
    const minEnergy = panelData[panelData.length - 1]?.yearlyEnergyDcKwh || 0;

    const panelWidth = buildingInsights?.solarPotential?.panelWidthMeters / 2;
    const panelHeight = buildingInsights?.solarPotential?.panelHeightMeters / 2;

    const polygons = panelData.slice(0, panelRange).map(panel => {
      const orientation = panel.orientation === 'PORTRAIT' ? 90 : 0;
      const azimuth = segmentStats[panel.segmentIndex]?.azimuthDegrees || 0;
      const colorIndex = Math.round(normalize(panel.yearlyEnergyDcKwh, maxEnergy, minEnergy) * 255);

      const corners = [
        { x: +panelWidth, y: +panelHeight },
        { x: +panelWidth, y: -panelHeight },
        { x: -panelWidth, y: -panelHeight },
        { x: -panelWidth, y: +panelHeight },
      ];

      const path = corners.map(({ x, y }) =>
        geometryLibrary.spherical.computeOffset(
          { lat: panel.center.latitude, lng: panel.center.longitude },
          Math.sqrt(x * x + y * y),
          Math.atan2(y, x) * (180 / Math.PI) + orientation + azimuth,
        )
      );

      return {
        path,
        options: {
          strokeColor: '#B0BEC5',
          strokeOpacity: 0.9,
          strokeWeight: 1,
          fillColor: palette[colorIndex],
          fillOpacity: 0.9,
        }
      };
    });

    setSolarPolygons(polygons);
  }, [panelRange, buildingInsights]);

  const drawSunlightPolygons = useCallback(() => {
    if (!window.google || !buildingInsights) return;
    const sunSegments = buildingInsights?.solarPotential?.roofSegmentStats || [];
  
    const getFluxColor = (flux) => {
      const maxFlux = 1200;
      const minFlux = 600;
      const norm = normalize(flux, maxFlux, minFlux);
      const intensity = Math.round(200 + 55 * norm);
      return `rgb(255, 255, ${255 - intensity})`;
    };
  
    const polygons = sunSegments.map((segment) => {
      const boundingBox = segment.boundingBox;
      
      const sw = boundingBox.sw;
      const ne = boundingBox.ne;
      const se = { latitude: sw.latitude, longitude: ne.longitude };
      const nw = { latitude: ne.latitude, longitude: sw.longitude };
  
      // Make a rectangle path: SW -> SE -> NE -> NW -> back to SW
      const path = [
        { lat: sw.latitude, lng: sw.longitude },
        { lat: se.latitude, lng: se.longitude },
        { lat: ne.latitude, lng: ne.longitude },
        { lat: nw.latitude, lng: nw.longitude },
        { lat: sw.latitude, lng: sw.longitude },
      ];
  
      return {
        path,
        options: {
          strokeColor: '#FFD700',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: getFluxColor(segment.stats.sunshineQuantiles?.[5] || 0),
          fillOpacity: 0.6,
          zIndex: 3,
        },
      };
    });
  
    setSolarPolygons(polygons);
  }, [buildingInsights]);
  
  useEffect(() => {
    // if (dataLayers) {
      drawSunlightPolygons();
    // }
  }, [dataLayers, drawSunlightPolygons]);

  useEffect(() => {
    if (buildingInsights) {
      drawPolygons();
      yearlyEnergyConsumption();
      console.log("dataLayers", dataLayers)
      if (dataLayers) {
        const fetchGeoTIFF = async () => {
          try {
            const result = await downloadGeoTIFF();
            console.log("Resolved GeoTIFF data:", result);
            
          } catch (error) {
            console.error("Error downloading GeoTIFF:", error);
          }
        };
        fetchGeoTIFF();
      }
    }

  }, [buildingInsights, drawPolygons]);

  const yearlyEnergyConsumption = (newPanelCapacityWatts) => {
    if (newPanelCapacityWatts == undefined) {
      newPanelCapacityWatts = buildingInsights?.solarPotential.panelCapacityWatts;
    }
    let monthlyAverageEnergyBillInput = 300;
    // let panelCapacityWattsInput = 250;
    let energyCostPerKwhInput = 0.31;
    let dcToAcDerateInput = 0.85;
    let yearlyKwhEnergyConsumption = (monthlyAverageEnergyBillInput / energyCostPerKwhInput) * 12;

    // const defaultPanelCapacity = newPanelCapacityWatts / buildingInsights.solarPotential.panelCapacityWatts;
    const panelCapacityRatio = newPanelCapacityWatts / buildingInsights.solarPotential.panelCapacityWatts;
    const haji = panelCapacityRatio * dcToAcDerateInput;
    const yearlymax = yearlyKwhEnergyConsumption / haji;
    const fixedValue = yearlymax.toFixed(2);
    setYearlyEngery(fixedValue)
    const panelCount = findPanelsCount(yearlymax);
    if (panelCount) {
      setPanelRange(panelCount);
    }
  }

  const updateRangeFunc = (event) => {
    let val = Number(event.target.value);
    setPanelRange(val);
  }



  // const drawSunlightPolygons = useCallback(() => {
  //   if (!window.google || !dataLayers) return;

  //   const geometryLibrary = window.google.maps.geometry;
  //   const sunSegments = dataLayers?.solarRoofSegments || []; // adjust key based on actual response

  //   // Flux value color range: light yellow to deep yellow
  //   const getFluxColor = (flux) => {
  //     const maxFlux = 1200; // define based on your dataset max
  //     const minFlux = 600;  // define based on your dataset min
  //     const norm = normalize(flux, maxFlux, minFlux);
  //     const intensity = Math.round(200 + 55 * norm); // from RGB(255, 255, 200) to RGB(255, 255, 0)
  //     return `rgb(255, 255, ${255 - intensity})`;
  //   };

  //   const polygons = sunSegments.map((segment, idx) => ({
  //     path: segment.boundingBox,
  //     options: {
  //       strokeColor: '#FFD700',
  //       strokeOpacity: 0.3,
  //       strokeWeight: 1,
  //       fillColor: getFluxColor(segment.solarFluxWPerM2),
  //       fillOpacity: 0.6,
  //     }
  //   }));

  //   setSolarPolygons(polygons); // Or use another state like setSunlightPolygons
  // }, [dataLayers]);

  useEffect(() => {
    if (dataLayers) {
      drawSunlightPolygons();
    }
  }, [dataLayers, drawSunlightPolygons]);


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

  return (
    <>
      <section className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-md-8 position-relative">
            <GoogleMap
              mapContainerStyle={{ height: '110vh', width: '100%' }}
              center={center}
              zoom={21}
              options={{
                mapTypeId: 'satellite',
                disableDefaultUI: true,
              }}
            >
              {solarPolygons.map((poly, index) => (
                <Polygon key={index} paths={poly.path} options={poly.options} />
              ))}
              {
                showHeatmap && (
                  <>
                    <HeatmapLayer
                      data={heatmapData}
                    />
                  </>
                )
              }

            </GoogleMap>
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
                    <span className="value">{buildingInsights.solarPotential.maxArrayPanelsCount || 'N/A'}</span>
                  </div>
                  <div className="data-row">
                    <span>CO₂ savings</span>
                    <span className="value">
                      {buildingInsights.solarPotential.carbonOffsetFactorKgPerMwh
                        ? `${buildingInsights.solarPotential.carbonOffsetFactorKgPerMwh.toFixed(1)} Kg/MWh`
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
                  <LineChart data={data}>
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

          <div className="col-md-4 d-flex align-items-center" style={{ background: "#f8f8f8", height: "auto", marginTop: "-3%" }}>
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
                      <p style={{ color: "black", marginLeft: "14%", fontSize: "13px" }}>Yearly energy: {yearlyEngery && yearlyEngery} Wh </p>
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
                          <p>{panelRange} Panels</p>
                        </div>
                      </div>
                      <input
                        type="range"
                        id="panelRange"
                        max={buildingInsights?.solarPotential?.maxArrayPanelsCount}
                        value={panelRange}
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
                          <span className="input-group-text">Watts</span>
                        </div>
                      </fieldset>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="content">
                          <div className="checkbox-group">
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

                          </div>
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
                    data-bs-toggle="modal"
                  >
                    Show Proposal
                  </a>
                </div>
                <div>
                  <a
                    className="group-btn"
                    data-bs-toggle="modal"
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