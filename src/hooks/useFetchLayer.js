import { useEffect, useContext } from 'react';
import { AppContext } from '../context/Context';
import { useDataLayerUrls } from './useDataLayers';
import { useGetLayer } from './useSolarLayerFetcher';

export function useFetchLayer({
  map,
  layerId,
  geometryLib,
  setLayer,
  showRoofOnly,
  overlaysRef,
  setLoading,
  showAnnualHeatMap,
  showMonthlyHeatMap,
  selectedMonth,
  setSelectedMonth
}) {
  const { buildingInsights } = useContext(AppContext);
  const { getDataLayerUrls } = useDataLayerUrls();
  const { getLayer } = useGetLayer();

  useEffect(() => {
    if (!map || !geometryLib || !buildingInsights) return;
    const fetchLayer = async () => {

      try {
        setLoading(true);
        setLayer(null);

        map.setMapTypeId(layerId === 'rgb' ? 'roadmap' : 'satellite');
        if (layerId === 'none') return;

        const center = buildingInsights?.center;
        const ne = buildingInsights.boundingBox.ne;
        const sw = buildingInsights.boundingBox.sw;

        const diameter = geometryLib.spherical.computeDistanceBetween(
          { lat: ne.latitude, lng: ne.longitude },
          { lat: sw.latitude, lng: sw.longitude }
        );
        const radius = Math.ceil(diameter / 2);

        if (center && Array.isArray(center)) {
          map.setCenter({ lat: center[0], lng: center[1] });
        }

        // Clear previous overlays
        if (overlaysRef.current) {
          overlaysRef.current.forEach((overlay) => overlay.setMap(null));
          overlaysRef.current = [];
        }
        const response = await getDataLayerUrls(center, radius, buildingInsights);

        //monthly heatmap and annual heatmap
        if (showAnnualHeatMap && !showMonthlyHeatMap) {
          const layerRes = await getLayer('annualFlux', response);
          const bounds = layerRes.bounds;

          const overlays = layerRes.render(showRoofOnly).map((canvas) => {
            const overlay = new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
            overlay.setMap(map);
            return overlay;
          });
          overlaysRef.current = overlays;
        } else if (showMonthlyHeatMap && !showAnnualHeatMap) {
          const monthList =
            [
              "january", "february", "march", "april", "may", "june",
              "july", "august", "september", "october", "november", "december"
            ]
          const monthIndex = monthList.findIndex((e) => e === selectedMonth);
          const layerRes = await getLayer('monthlyFlux', response);
          const bounds = layerRes.bounds;
          const overlays = layerRes.render(showRoofOnly, monthIndex, 0).map((canvas, index) => {
            const overlay = new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
            overlay.setMap(index === monthIndex ? map : null);
            return overlay;
          });
          overlaysRef.current = overlays;
        }

        // hide show annual heatmap base on toggle button
      } catch (error) {
        console.error('❌ Data layer fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayer();
  }, [map, layerId, geometryLib, showAnnualHeatMap, showMonthlyHeatMap, selectedMonth]);


}
