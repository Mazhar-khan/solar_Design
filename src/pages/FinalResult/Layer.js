
import { binaryPalette, ironPalette, rainbowPalette, sunlightPalette } from './Colors';
import { downloadGeoTIFF } from './Solar';
import { renderPalette, renderRGB } from './Visualize';


export async function getLayer(layerId, urls, googleMapsApiKey) {
    const get = {
      mask: async () => {
        const mask = await downloadGeoTIFF(urls.maskUrl, googleMapsApiKey);
        const colors = binaryPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors: colors,
            min: 'No roof',
            max: 'Roof',
          },
          render: (showRoofOnly) => [
            renderPalette({
              data: mask,
              mask: showRoofOnly ? mask : undefined,
              colors: colors,
            }),
          ],
        };
      },
      dsm: async () => {
        const [mask, data] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, googleMapsApiKey),
          downloadGeoTIFF(urls.dsmUrl, googleMapsApiKey),
        ]);
        const sortedValues = Array.from(data.rasters[0]).sort((x, y) => x - y);
        const minValue = sortedValues[0];
        const maxValue = sortedValues[sortedValues.length - 1];
        const colors = rainbowPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors: colors,
            min: `${minValue.toFixed(1)} m`,
            max: `${maxValue.toFixed(1)} m`,
          },
          render: (showRoofOnly) => [
            renderPalette({
              data: data,
              mask: showRoofOnly ? mask : undefined,
              colors: colors,
              min: minValue,
              max: maxValue,
            }),
          ],
        };
      },
      rgb: async () => {
        const [mask, data] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, googleMapsApiKey),
          downloadGeoTIFF(urls.rgbUrl, googleMapsApiKey),
        ]);
        return {
          id: layerId,
          bounds: mask.bounds,
          render: (showRoofOnly) => [
            renderRGB(data, showRoofOnly ? mask : undefined)
          ],
        };
      },
      annualFlux: async () => {
        const [mask, data] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, googleMapsApiKey),
          downloadGeoTIFF(urls.annualFluxUrl, googleMapsApiKey),
        ]);
        const colors = ironPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors: colors,
            min: 'Shady',
            max: 'Sunny',
          },
          render: (showRoofOnly) => [
            renderPalette({
              data: data,
              mask: showRoofOnly ? mask : undefined,
              colors: colors,
              min: 0,
              max: 1800,
            }),
          ],
        };
      },
      monthlyFlux: async () => {
        const [mask, data] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, googleMapsApiKey),
          downloadGeoTIFF(urls.monthlyFluxUrl, googleMapsApiKey),
        ]);
        const colors = ironPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors: colors,
            min: 'Shady',
            max: 'Sunny',
          },
          render: (showRoofOnly) => 
            [...Array(12).keys()].map((month) =>
              renderPalette({
                data: data,
                mask: showRoofOnly ? mask : undefined,
                colors: colors,
                min: 0,
                max: 200,
                index: month,
              })
            ),
        };
      },
      hourlyShade: async () => {
        const [mask, ...months] = await Promise.all([
          downloadGeoTIFF(urls.maskUrl, googleMapsApiKey),
          ...urls.hourlyShadeUrls.map((url) => downloadGeoTIFF(url, googleMapsApiKey)),
        ]);
        const colors = sunlightPalette;
        return {
          id: layerId,
          bounds: mask.bounds,
          palette: {
            colors: colors,
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
                colors: colors,
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
  }
  