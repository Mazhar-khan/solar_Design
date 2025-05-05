import { useEffect, useState, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

import { findClosestBuilding, getDataLayerUrls } from './Solar';
import { createPalette, normalize, rgbToColor } from './Visualize';
import { panelsPalette } from './Colors';
import { getLayer } from './Layer';
import { findSolarConfig } from './Utils';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

const DATA_LAYER_OPTIONS = {
  none: 'No layer',
  mask: 'Roof mask',
  dsm: 'Digital Surface Model',
  rgb: 'Aerial image',
  annualFlux: 'Annual sunshine',
  monthlyFlux: 'Monthly sunshine',
  hourlyShade: 'Hourly shade',
};

const INITIAL_BUILDING = {
  geo: [38.8780596, -94.3045443],
  country: 'United States',
  state: 'Missouri',
  city: "Lee's Summit",
  postalCode: '64086',
  street: 'Smart Road',
  streetNumber: '13118',
};

export default function DataLayers() {
  const mapRef = useRef(null);

  const [map, setMap] = useState(null);
  const [libraries, setLibraries] = useState({});
  // const [layerId, setLayerId] = useState('monthlyFlux');
  const [layerId, setLayerId] = useState('annualFlux');
  const [layer, setLayer] = useState(null);
  // const [tick, setTick] = useState(0);
  // const [playAnimation, setPlayAnimation] = useState(true);
  const [showRoofOnly, setShowRoofOnly] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [panels, setPanels] = useState([]);
  const [panelConfig, setPanelConfig] = useState(undefined);
  const [solarPanels, setSolarPanels] = useState([]);

  const [monthlyAverageEnergyBillInput, setMonthlyAverageEnergyBillInput] = useState(300);
  const [panelCapacityWattsInput, setPanelCapacityWattsInput] = useState(250);
  const [energyCostPerKwhInput, setEnergyCostPerKwhInput] = useState(0.31);
  const [dcToAcDerateInput, setDcToAcDerateInput] = useState(0.85);
  const [configId, setConfigId] = useState(undefined);
  const yearlyKwhEnergyConsumption = (monthlyAverageEnergyBillInput / energyCostPerKwhInput) * 12;


  const overlaysRef = useRef([]);

  const clearOverlays = useCallback(() => {
    overlaysRef.current.forEach(overlay => overlay.setMap(null));
    overlaysRef.current = [];
  }, []);

  useEffect(() => {
    async function initMap() {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
      });

      const [geometry, maps, places] = await Promise.all([
        loader.importLibrary('geometry'),
        loader.importLibrary('maps'),
        loader.importLibrary('places'),
      ]);
      
      setLibraries({ geometry, maps, places });

      const mapInstance = new maps.Map(mapRef.current, {
        center: { lat: INITIAL_BUILDING.geo[0], lng: INITIAL_BUILDING.geo[1] },
        zoom: 20,
        tilt: 0,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        streetViewControl: false,
        zoomControl: true,
      });
      showSolarPotential(geometry,mapInstance);
      setMap(mapInstance);
    }

    initMap();
  }, []);

  useEffect(() => {
    if (!map) return;

    async function fetchData() {
      try {
        clearOverlays();
        setLayer(null);
        setRequestError(null);
        setShowRoofOnly(['annualFlux', 'monthlyFlux', 'hourlyShade'].includes(layerId));

        map.setMapTypeId(layerId === 'rgb' ? 'roadmap' : 'satellite');

        if (layerId === 'none') return;

        const buildingInsights = await findClosestBuilding(INITIAL_BUILDING, GOOGLE_MAPS_API_KEY);
        setPanels(buildingInsights?.solarPotential?.solarPanels || []);

        const center = buildingInsights?.center;
        const radius = 42;
        if (center && Array.isArray(center)) {
          map.setCenter({ lat: center[0], lng: center[1] });
        }

        const response = await getDataLayerUrls(center, radius, GOOGLE_MAPS_API_KEY);
        const loadedLayer = await getLayer(layerId, response, GOOGLE_MAPS_API_KEY);

        setLayer(loadedLayer);
      } catch (error) {
        console.error('❌ Data layer fetch error:', error);
        setRequestError(error);
      }
    }

    fetchData();
  }, [map, layerId]);

  useEffect(() => {
    if (!map || !layer) return;

    clearOverlays();

    const bounds = layer.bounds;
    const newOverlays = layer.render(showRoofOnly, 0, 0).map(canvas => {
      return new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
    });

    newOverlays.forEach(overlay => {
      overlay.setMap(map);
    });

    overlaysRef.current = newOverlays;
  }, [map, layer, showRoofOnly]);

  useEffect(() => {
    async function fetchBuildingInsights() {
      const buildingInsights = await findClosestBuilding(INITIAL_BUILDING, GOOGLE_MAPS_API_KEY);
      if (configId === undefined && buildingInsights) {
        const defaultPanelCapacity = buildingInsights.solarPotential.panelCapacityWatts;
        const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacity;

        const foundConfigId = findSolarConfig(
          buildingInsights.solarPotential.solarPanelConfigs,
          yearlyKwhEnergyConsumption,
          panelCapacityRatio,
          dcToAcDerateInput
        );
        setConfigId(foundConfigId);
      }
      if (buildingInsights && configId !== undefined) {
        setPanelConfig(buildingInsights.solarPotential.solarPanelConfigs[configId]);
      }
    }
    fetchBuildingInsights();

  }, []);

useEffect(() => {
  if (map && solarPanels.length > 0) {
    solarPanels.forEach(panel => {
      panel.setMap(map);
    });
  }
}, [map, solarPanels]);


  const showSolarPotential = async (lib,maap) => {
    if (!lib || !lib.spherical) {
      console.error("Geometry library is missing.");
      return;
    }
  
    const buildingInsights = await findClosestBuilding(INITIAL_BUILDING, GOOGLE_MAPS_API_KEY);
    const solarPotential = buildingInsights.solarPotential;
    const palette = createPalette(panelsPalette).map(rgbToColor);
  
    const minEnergy = solarPotential.solarPanels.slice(-1)[0].yearlyEnergyDcKwh;
    const maxEnergy = solarPotential.solarPanels[0].yearlyEnergyDcKwh;
    
    let solarPanels = solarPotential.solarPanels.map((panel) => {
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
        lib.spherical.computeOffset(
          { lat: panel.center.latitude, lng: panel.center.longitude },
          Math.sqrt(x * x + y * y),
          Math.atan2(y, x) * (180 / Math.PI) + orientation + azimuth,
        )
      );
  
      const newPanel = new window.google.maps.Polygon({
        paths: panelCoords,
        strokeColor: '#B0BEC5',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: palette[colorIndex],
        fillOpacity: 0.9,
      });
  
      return newPanel;
    });
    
    solarPanels.forEach((panel) => {
      panel.setMap(maap);
    });
  
    setSolarPanels(solarPanels);
  };
  

  return (
    <>
      <div ref={mapRef} id="map" style={{ width: "100vw", height: "100vh" }} />
    </>
  );
}