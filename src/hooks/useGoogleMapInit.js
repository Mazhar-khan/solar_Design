import { useEffect, useContext } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { AppContext } from '../context/Context';

export const useInitializeMap = ({ mapRef, setLibraries, setMap, renderSolarPanels }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { completeAddress } = useContext(AppContext);

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
      const center = {
        lat: completeAddress?.geo[0],
        lng: completeAddress?.geo[1]
      }
      const staticMapURL = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=20&size=800x600&maptype=satellite&key=${apiKey}`;

      mapRef.current.innerHTML = `<img src="${staticMapURL}" alt="Static Map" style="width:100%; height:100%;" />`;
      const mapInstance = new maps.Map(mapRef.current, {
        center: {
          lat: completeAddress?.geo[0],
          lng: completeAddress?.geo[1]
        },
        zoom: 22,
        tilt: 0,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        streetViewControl: false,
        zoomControl: false,
        draggable: false,              // Prevent panning
        scrollwheel: false,            // Prevent zooming with mouse wheel
        disableDoubleClickZoom: true, // Prevent zooming by double-click
        gestureHandling: 'none',
        disableDefaultUI: true
      });
      // setMap(null);
      // setLibraries({});
      setLibraries({ geometry, maps, places });
      setMap(mapInstance);
      await renderSolarPanels(geometry, mapInstance)
    }

    if (mapRef?.current && completeAddress?.geo) {
      initialize();
    }

  }, [mapRef, completeAddress]);
};
