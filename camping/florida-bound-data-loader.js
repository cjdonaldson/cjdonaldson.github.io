// Load location data from JSON file
let locationData = [];

async function loadLocationData() {
    const response = await fetch('florida-bound-locations.json');
    const data = await response.json();

    // Flatten the nested structure into the simple array format
    locationData = [];
    data.states.forEach(state => {
        state.campgrounds.forEach(camp => {
            if (camp.coords && camp.zip) {
                locationData.push({
                    name: camp.name,
                    zip: camp.zip,
                    url: camp.url || camp.mapUrl,
                    coords: camp.coords,
                    defaultStart: camp.defaultStart || false,
                    city: camp.city,
                    state: camp.state
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
