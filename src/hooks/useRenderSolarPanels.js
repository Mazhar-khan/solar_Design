import { useCallback, useContext } from 'react';
import { createPalette, normalize, rgbToColor } from '../utils/Visualize'
import { panelsPalette } from '../constants/Colors'
import { AppContext } from '../context/Context';

export const useRenderSolarPanels = ({
  solarPanelsState,
  setSolarPanels,
  showSolarPanels,
  averageBill,
  hitPanelCount
}) => {
  const { buildingInsights, configId } = useContext(AppContext);

  const renderSolarPanels = useCallback(async (
    geometry,
    mapInstance
  ) => {
    console.log("configId", configId)
    const { solarPotential } = buildingInsights;
    const palette = createPalette(panelsPalette).map(rgbToColor);

    const minEnergy = solarPotential.solarPanels.at(-1)?.yearlyEnergyDcKwh || 0;
    const maxEnergy = solarPotential.solarPanels[0]?.yearlyEnergyDcKwh || 1;
    let panelCount = configId ?? solarPotential.solarPanels.length;
    const panelsToRender = solarPotential.solarPanels.slice(0, panelCount);
    const newPanels = panelsToRender.map(panel => {
      const [w, h] = [solarPotential.panelWidthMeters / 2, solarPotential.panelHeightMeters / 2];
      const points = [
        { x: +w, y: +h },
        { x: +w, y: -h },
        { x: -w, y: -h },
        { x: -w, y: +h },
        { x: +w, y: +h },
      ];

      const orientation = panel.orientation === 'PORTRAIT' ? 90 : 0;
      const azimuth = solarPotential.roofSegmentStats[panel.segmentIndex]?.azimuthDegrees || 0;

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

    // Clear old panels
    solarPanelsState.forEach(panel => panel.setMap(null));
    setSolarPanels([]);

    // Set new panels
    newPanels.forEach(panel => panel.setMap(showSolarPanels ? mapInstance : null));
    setSolarPanels(newPanels);
  }, [buildingInsights, setSolarPanels, showSolarPanels, solarPanelsState, averageBill, hitPanelCount]);

  return { renderSolarPanels };
};
