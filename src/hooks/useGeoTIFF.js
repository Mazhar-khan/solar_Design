import { useState, useCallback } from 'react';
import * as geotiff from 'geotiff';
import * as proj4 from 'proj4';
import * as geokeysToProj4 from '@geoengine/geotiff-geokeys-to-proj4';

export function useGeoTIFF() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadGeoTIFF = useCallback(async (url, apiKey) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log(`Downloading data layer: ${url}`);
      const solarUrl = url.includes('solar.googleapis.com') ? `${url}&key=${apiKey}` : url;
      const response = await fetch(solarUrl);

      if (!response.ok) {
        const error = await response.json();
        console.error(`downloadGeoTIFF failed: ${url}\n`, error);
        throw error;
      }

      const arrayBuffer = await response.arrayBuffer();
      const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const rasters = await image.readRasters();

      const geoKeys = image.getGeoKeys();
      const projObj = geokeysToProj4.toProj4(geoKeys);
      const projection = proj4(projObj.proj4, 'WGS84');
      const box = image.getBoundingBox();

      const sw = projection.forward({
        x: box[0] * projObj.coordinatesConversionParameters.x,
        y: box[1] * projObj.coordinatesConversionParameters.y,
      });
      const ne = projection.forward({
        x: box[2] * projObj.coordinatesConversionParameters.x,
        y: box[3] * projObj.coordinatesConversionParameters.y,
      });

      const result = {
        width: rasters.width,
        height: rasters.height,
        rasters: [...Array(rasters.length).keys()].map(i =>
          Array.from(rasters[i])
        ),
        bounds: {
          north: ne.y,
          south: sw.y,
          east: ne.x,
          west: sw.x,
        },
      };

      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    downloadGeoTIFF,
    data,
    loading,
    error,
  };
}