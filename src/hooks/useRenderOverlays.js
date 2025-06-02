import { useEffect } from 'react';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const useRenderOverlays = ({
  map,
  layer,
  showRoofOnly,
  selectedMonth,
  showMonthlyHeatMap,
  showAnnualHeatMap,
  overlaysRef,
  clearOverlays,
}) => {
  useEffect(() => {
    if (!map || !layer) return;

    clearOverlays();

    const bounds = layer.bounds;
    const selectedMonthIndex = monthNames.indexOf(selectedMonth);

    let newOverlays;

    if (showMonthlyHeatMap) {
      newOverlays = layer.render(showRoofOnly, selectedMonthIndex, 0).map((canvas) => {
        return new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
      });
    } else if (showAnnualHeatMap) {
      newOverlays = layer.render(showRoofOnly, 0, 0).map((canvas) => {
        return new window.google.maps.GroundOverlay(canvas.toDataURL(), bounds);
      });
    }

    if (newOverlays) {
      newOverlays.forEach((overlay, i) => {
        overlay.setMap(i === selectedMonthIndex ? map : null);
      });
    }

    overlaysRef.current = newOverlays || null;
  }, [
    map,
    layer,
    showRoofOnly,
    selectedMonth,
    showMonthlyHeatMap,
    showAnnualHeatMap,
    clearOverlays,
    overlaysRef,
  ]);
};
