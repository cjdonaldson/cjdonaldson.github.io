// Load location data from JSON file
let locationData = [];

async function loadLocationData() {
    const response = await fetch('florida-bound-locations.json');
    const data = await response.json();

    // Flatten the nested structure into the simple array format
    locationData = [];
    data.states.forEach(state => {
        state.locations.forEach(location => {
            if (location.coords && location.zip) {
                locationData.push({
                    name: location.name,
                    zip: location.zip,
                    url: location.url || location.mapUrl,
                    coords: location.coords,
                    defaultStart: location.defaultStart || false,
                    city: location.city,
                    state: location.state,
                    address: location.address,
                    bookingUrl: location.bookingUrl,
                    phone: location.phone
                });
            }
        });
    });

    return locationData;
}

// For synchronous access after loading
function getLocationData() {
    return locationData;
}
