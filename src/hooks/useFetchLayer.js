import { useEffect } from 'react';
// import { findClosestBuilding, getDataLayerUrls } from '../components/solar/Solar';
import { findClosestBuilding, getDataLayerUrls } from '../pages/FinalResult/Solar';
// import { findClosestBuilding } from '../pages/FinalResult/Solar';
// import { getLayer } from '../components/solar/Layer';
import { getLayer } from '../pages/FinalResult/Layer';

export function useFetchLayer({
  map,
  layerId,
  clearOverlays,
  isMonthlyFlux,
  selectedMonth,
  completeAddress,
  geometryLib,
  setLayer,
  setShowRoofOnly,
  setYearlyEnergy,
}) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const selectedMonthIndex = monthNames.indexOf(selectedMonth);
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

  useEffect(() => {
    if (!map || !geometryLib) return;

    const fetchLayer = async () => {
      try {
        clearOverlays();
        setLayer(null);

        setShowRoofOnly(['annualFlux', 'monthlyFlux', 'hourlyShade'].includes(layerId));
        map.setMapTypeId(layerId === 'rgb' ? 'roadmap' : 'satellite');

        if (layerId === 'none') return;

        const buildingInsightss = await findClosestBuilding(completeAddress, GOOGLE_MAPS_API_KEY);
        const center = buildingInsightss?.center;
        const ne = buildingInsightss.boundingBox.ne;
        const sw = buildingInsightss.boundingBox.sw;

        const diameter = geometryLib.spherical.computeDistanceBetween(
          { lat: ne.latitude, lng: ne.longitude },
          { lat: sw.latitude, lng: sw.longitude }
        );
        const radius = Math.ceil(diameter / 2);

        if (center && Array.isArray(center)) {
          map.setCenter({ lat: center[0], lng: center[1] });
        }

        const response = await getDataLayerUrls(center, radius, GOOGLE_MAPS_API_KEY);
        let loadedLayer;

        if (isMonthlyFlux) {
          const monthKey = `monthlyFlux-${selectedMonthIndex}-${Date.now()}`;
          loadedLayer = await getLayer('monthlyFlux', response, GOOGLE_MAPS_API_KEY, selectedMonthIndex);
        } else {
          loadedLayer = await getLayer('annualFlux', response, GOOGLE_MAPS_API_KEY);
        }

        const defaultEnergy = buildingInsightss.solarPotential.maxSunshineHoursPerYear;
        setYearlyEnergy(defaultEnergy);
        setLayer(loadedLayer);
      } catch (error) {
        console.error('❌ Data layer fetch error:', error);
      }
    };

    fetchLayer();
  }, [map, layerId, clearOverlays, isMonthlyFlux, selectedMonth, completeAddress, geometryLib]);
}
