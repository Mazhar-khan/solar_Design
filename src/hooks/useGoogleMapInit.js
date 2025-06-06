// File: hooks/useInitializeMap.js
import { useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export const useInitializeMap = ({
  mapRef,
  completeAddress,
  setLibraries,
  setMap,
  loadBuildingInsights,
  apiKey
}) => {
  useEffect(() => {
    async function initialize() {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
      });

      const [geometry, maps, places] = await Promise.all([
        loader.importLibrary('geometry'),
        loader.importLibrary('maps'),
        loader.importLibrary('places'),
      ]);

      const mapInstance = new maps.Map(mapRef.current, {
        center: {
          lat: completeAddress?.geo[0],
          lng: completeAddress?.geo[1]
        },
        zoom: 20,
        tilt: 0,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        streetViewControl: false,
        zoomControl: true,
      });

      setLibraries({ geometry, maps, places });
      setMap(mapInstance);
      await loadBuildingInsights(geometry, mapInstance);
    }

    if (mapRef?.current && completeAddress?.geo) {
      initialize();
    }
  }, [mapRef, completeAddress]);
};
