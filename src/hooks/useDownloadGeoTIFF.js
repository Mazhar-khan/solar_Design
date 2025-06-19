import { useCallback } from 'react';
import * as geotiff from 'geotiff';
import * as geokeysToProj4 from 'geotiff-geokeys-to-proj4';
import proj4 from 'proj4';

export const useDownloadGeoTIFF = () => {
  const downloadGeoTIFF = useCallback(async (url, apiKey) => {
    console.log(`Downloading data layer: ${url}`);

    const solarUrl = url.includes('solar.googleapis.com') ? `${url}&key=${apiKey}` : url;
    const response = await fetch(solarUrl);

    if (response.status !== 200) {
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

    return {
      width: rasters.width,
      height: rasters.height,
      rasters: [...Array(rasters.length).keys()].map((i) =>
        Array.from(rasters[i])
      ),
      bounds: {
        north: ne.y,
        south: sw.y,
        east: ne.x,
        west: sw.x,
      },
    };
  }, []);

  return { downloadGeoTIFF };
};
