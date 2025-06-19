import { useCallback } from 'react';

export const useDataLayerUrls = () => {
  const getDataLayerUrls = async (location, sec, insights) => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    const google = window.google;
    console.log("insights", insights)
    const { center, boundingBox: { ne, sw } } = insights;
    const diameter = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(ne.latitude, ne.longitude),
      new google.maps.LatLng(sw.latitude, sw.longitude),
    );
    console.log("diameter", diameter)
    const radius = Math.ceil(diameter / 2);
    const params = new URLSearchParams({
      'location.latitude': center.latitude.toFixed(5),
      'location.longitude': center.longitude.toFixed(5),
      radius_meters: radius,
      required_quality: 'LOW',
      key: apiKey,
    });

    const res = await fetch(`https://solar.googleapis.com/v1/dataLayers:get?${params}`);
    const content = await res.json();
    if (res.status !== 200) throw content;
    return content;
  };

  return { getDataLayerUrls };
};
