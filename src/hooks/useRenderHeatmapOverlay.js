import { useEffect } from 'react';

export function useRenderHeatmapOverlay({ map, layer, showRoofOnly }) {
  useEffect(() => {
    if (!map || !layer) return;
    const bounds = layer.bounds;
    let newOverlays = [];

    const canvases = layer.render(showRoofOnly, 5, 14);
    const overlay = new window.google.maps.GroundOverlay(canvases?.toDataURL(), bounds);
    overlay.setMap(map);
    newOverlays = [overlay];

  }, [map, layer, showRoofOnly,
  ]);
}
