export const useDataLayers = (apiKey) => {
    const findDataLayers = async (location, insights) => {
        const google = window.google;
        const { center, boundingBox: { ne, sw } } = insights;
        const diameter = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(ne.latitude, ne.longitude),
            new google.maps.LatLng(sw.latitude, sw.longitude),
        );
        console.log("diameter",diameter)
        const radius = diameter / 2;
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

    return { findDataLayers };
};
