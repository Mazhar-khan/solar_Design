import * as geotiff from 'geotiff';
import * as geokeysToProj4 from 'geotiff-geokeys-to-proj4';
import proj4 from 'proj4';



export async function findClosestBuilding(location, apiKey) {
    const qualities = ['HIGH', 'MEDIUM', 'LOW'];
  
    for (const quality of qualities) {
      const query = `location.latitude=${location.geo[0].toFixed(5)}&location.longitude=${location.geo[1].toFixed(5)}&requiredQuality=${quality}&key=${apiKey}`;
  
      console.log(`🔍 Trying buildingInsights with quality: ${quality}`, query);
  
      try {
        const response = await fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${query}`);
        const content = await response.json();
  
        if (response.status === 200) {
          console.log(`✅ Success with quality: ${quality}`, content);
          return content;
        } else {
          console.warn(`⚠️ Failed with quality: ${quality}`, content);
        }
      } catch (error) {
        console.error(`❌ Error fetching with quality: ${quality}`, error);
      }
    }
  
    throw new Error("Failed to retrieve building insights for all quality levels.");
  }
  
  

// export async function findClosestBuilding(location, apiKey) {
//     const args = {
//         'location.latitude': location["geo"][0].toFixed(5),
//         'location.longitude': location["geo"][1].toFixed(5),
//         'requiredQuality':'HIGH'
//         //MEDIUM,LOW
//     };
//     console.log('GET buildingInsights\n', args);
//     const params = new URLSearchParams({ ...args, key: apiKey });
   
//     return fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`).then(
//         async (response) => {
//             const content = await response.json();
//             if (response.status != 200) {
//                 console.error('findClosestBuilding\n', content);
//                 throw content;
//             }
//             console.log('buildingInsightsResponse', content);
//             return content;
//         },
//     );
// }

export async function getDataLayerUrls( location, radiusMeters, apiKey) {
    const args = {
      'location.latitude': location.latitude.toFixed(5),
      'location.longitude': location.longitude.toFixed(5),
      radius_meters: radiusMeters.toString(),
      required_quality: 'LOW',
    };
    console.log('GET dataLayers\n', args);
    const params = new URLSearchParams({ ...args, key: apiKey });
    // https://developers.google.com/maps/documentation/solar/reference/rest/v1/dataLayers/get
    return fetch(`https://solar.googleapis.com/v1/dataLayers:get?${params}`).then(
      async (response) => {
        const content = await response.json();
        if (response.status != 200) {
          console.error('getDataLayerUrls\n', content);
          throw content;
        }
        console.log('dataLayersResponse', content);
        return content;
      },
    );
  }

export async function downloadGeoTIFF(url, apiKey) {
    console.log(`Downloading data layer: ${url}`);

    // Include your Google Cloud API key in the Data Layers URL.
    const solarUrl = url.includes('solar.googleapis.com') ? url + `&key=${apiKey}` : url;
    const response = await fetch(solarUrl);
    if (response.status !== 200) {
        const error = await response.json();
        console.error(`downloadGeoTIFF failed: ${url}\n`, error);
        throw error;
    }

    // Get the GeoTIFF rasters, which are the pixel values for each band.
    const arrayBuffer = await response.arrayBuffer();
    const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const rasters = await image.readRasters();

    // Reproject the bounding box into lat/lon coordinates.
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
        // Width and height of the data layer image in pixels.
        width: rasters.width,
        height: rasters.height,
        // Each raster represents the pixel values of each band.
        rasters: [...Array(rasters.length).keys()].map((i) =>
            Array.from(rasters[i])
        ),
        // The bounding box as a lat/lon rectangle.
        bounds: {
            north: ne.y,
            south: sw.y,
            east: ne.x,
            west: sw.x,
        },
    };
}

export function showLatLng(point) {
    return `(${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)})`;
}

export function showDate(date) {
    return `${date.month}/${date.day}/${date.year}`;
}
