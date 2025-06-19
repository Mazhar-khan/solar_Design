import { useCallback } from 'react';
import { binaryPalette, ironPalette, rainbowPalette, sunlightPalette } from "../constants/Colors";
// import { downloadGeoTIFF } from './Solar';
import { renderPalette, renderRGB } from '../utils/Visualize';
import { useDownloadGeoTIFF } from './useDownloadGeoTIFF';

export const useGetLayer = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
  const {downloadGeoTIFF} = useDownloadGeoTIFF()
  const getLayer = useCallback(async (layerId, urls) => {
    const get = {
      mask: async () => {
        const mask = await downloadGeoTIFF(urls.maskUrl, apiKey);
        const colors = binaryPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors,
            min: 'No roof',
            max: 'Roof',
          },
          render: (showRoofOnly) => [
            renderPalette({
              data: mask,
              mask: showRoofOnly ? mask : undefined,
              colors,
            }),
          ],
        };
      },
      dsm: async () => {
        const [mask, data] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, apiKey),
          downloadGeoTIFF(urls.dsmUrl, apiKey),
        ]);
        const sortedValues = Array.from(data.rasters[0]).sort((x, y) => x - y);
        const minValue = sortedValues[0];
        const maxValue = sortedValues[sortedValues.length - 1];
        const colors = rainbowPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors,
            min: `${minValue.toFixed(1)} m`,
            max: `${maxValue.toFixed(1)} m`,
          },
          render: (showRoofOnly) => [
            renderPalette({
              data,
              mask: showRoofOnly ? mask : undefined,
              colors,
              min: minValue,
              max: maxValue,
            }),
          ],
        };
      },
      rgb: async () => {
        const [mask, data] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, apiKey),
          downloadGeoTIFF(urls.rgbUrl, apiKey),
        ]);
        return {
          id: layerId,
          bounds: mask.bounds,
          render: (showRoofOnly) => [
            renderRGB(data, showRoofOnly ? mask : undefined),
          ],
        };
      },
      annualFlux: async () => {
        const [mask, data] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, apiKey),
          downloadGeoTIFF(urls.annualFluxUrl, apiKey),
        ]);
        const colors = ironPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors,
            min: 'Shady',
            max: 'Sunny',
          },
          render: (showRoofOnly) => [
            renderPalette({
              data,
              mask: showRoofOnly ? mask : undefined,
              colors,
              min: 0,
              max: 1800,
            }),
          ],
        };
      },
      monthlyFlux: async () => {
        const [mask, data] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, apiKey),
          downloadGeoTIFF(urls.monthlyFluxUrl, apiKey),
        ]);
        const colors = ironPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors,
            min: 'Shady',
            max: 'Sunny',
          },
          render: (showRoofOnly) =>
            [...Array(12).keys()].map((month) =>
              renderPalette({
                data,
                mask: showRoofOnly ? mask : undefined,
                colors,
                min: 0,
                max: 200,
                index: month,
              })
            ),
        };
      },
      hourlyShade: async () => {
        const [mask, ...months] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, apiKey),
          ...urls.hourlyShadeUrls.map((url) => downloadGeoTIFF(url, apiKey)),
        ]);
        const colors = sunlightPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors,
            min: 'Shade',
            max: 'Sun',
          },
          render: (showRoofOnly, month, day) =>
            [...Array(24).keys()].map((hour) =>
              renderPalette({
                data: {
                  ...months[month],
                  rasters: months[month].rasters.map((values) =>
                    values.map((x) => x & (1 << (day - 1)))
                  ),
                },
                mask: showRoofOnly ? mask : undefined,
                colors,
                min: 0,
                max: 1,
                index: hour,
              })
            ),
        };
      },
    };

    try {
      return get[layerId]();
    } catch (e) {
      console.error(`Error getting layer: ${layerId}\n`, e);
      throw e;
    }
  }, []);

  return { getLayer };
};
