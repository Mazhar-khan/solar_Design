import { useEffect } from 'react';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export function useRenderHeatmapOverlay({
  map,
  layer,
  showRoofOnly,
  selectedMonth,
  showMonthlyHeatMap,
  showAnnualHeatMap,
  clearOverlays,
  overlaysRef,
}) {
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
      const annualCanvas = canvases[5]; // 🛠️ Assuming this represents annual flux
      const overlay = new window.google.maps.GroundOverlay(annualCanvas?.toDataURL(), bounds);
      overlay.setMap(map);
      newOverlays = [overlay];
    }

    overlaysRef.current = newOverlays;

  }, [
    map,
    layer,
    showRoofOnly,
    clearOverlays,
    selectedMonth,
    showMonthlyHeatMap,
    showAnnualHeatMap,
  ]);
}
