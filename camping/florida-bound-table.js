async function buildDistanceTable() {
    await loadLocationData();
    const locations = getLocationData();

    const selectElement = document.getElementById('start-location-select');

    // Populate the selector if it's empty
    if (selectElement.options.length === 0) {
        const defaultLocation = locations.find(loc => loc.defaultStart) || locations[0];
        locations.forEach((loc, index) => {
            const option = document.createElement('option');
            option.value = index;
            const cityState = loc.city && loc.state ? ` (${loc.city}, ${loc.state})` : '';
            option.textContent = `${loc.name}${cityState}`;
            if (loc === defaultLocation) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }

    // Get the selected start location
    const selectedIndex = parseInt(selectElement.value);
    const startLocation = locations[selectedIndex];

    // Create list of other locations (excluding selected)
    const otherLocations = locations
        .map((loc, index) => ({ loc, index }))
        .filter(item => item.index !== selectedIndex);

    // Get sort order
    const sortOrder = document.getElementById('sort-order-select').value;

    // Sort by distance from start location
    otherLocations.sort((a, b) => {
        const distA = haversineDistance(
            a.loc.coords[0], a.loc.coords[1],
            startLocation.coords[0], startLocation.coords[1]
        );
        const distB = haversineDistance(
            b.loc.coords[0], b.loc.coords[1],
            startLocation.coords[0], startLocation.coords[1]
        );
        return sortOrder === 'asc' ? distA - distB : distB - distA;
    });

    let headerHtml = '<tr><th>From / To</th>';

    // Add selected location as second column
    const startCityState = startLocation.city && startLocation.state ? `<br>${startLocation.city}, ${startLocation.state}` : '';
    headerHtml += `<th>${startLocation.name}${startCityState}</th>\n`;

    // Add all other locations
    otherLocations.forEach(({ loc, index }) => {
        const cityState = loc.city && loc.state ? `<br>${loc.city}, ${loc.state}` : '';
        headerHtml += `<th>${loc.name}${cityState}</th>\n`;
    });
    headerHtml += '</tr>';

    let bodyHtml = '';

    // Add start location row
    const startRowCityState = startLocation.city && startLocation.state ? `<br>${startLocation.city}, ${startLocation.state}` : '';
    bodyHtml += `<tr>\n<td><a href="${startLocation.url}" target="_blank">${startLocation.name}${startRowCityState}</a></td>\n`;

    // Diagonal cell for start location
    bodyHtml += '<td class="diagonal">-</td>\n';

    // Add distances from start location to all other locations
    otherLocations.forEach(({ loc: toLoc, index }) => {
        const [lat1, lon1] = startLocation.coords;
        const [lat2, lon2] = toLoc.coords;
        const distance = haversineDistance(lat1, lon1, lat2, lon2);
        const timeHours = distance / 60;
        const hours = Math.floor(timeHours);
        const minutes = Math.floor((timeHours - hours) * 60);
        bodyHtml += `<td>${Math.round(distance)} mi<br>${hours}:${minutes.toString().padStart(2, '0')}</td>\n`;
    });
    bodyHtml += '</tr>\n';

    // Add all other location rows
    otherLocations.forEach(({ loc: fromLoc, index: i }) => {
        const fromCityState = fromLoc.city && fromLoc.state ? `<br>${fromLoc.city}, ${fromLoc.state}` : '';
        bodyHtml += `<tr>\n<td><a href="${fromLoc.url}" target="_blank">${fromLoc.name}${fromCityState}</a></td>\n`;

        // First add distance to start location (second column)
        const [lat1, lon1] = fromLoc.coords;
        const [lat2, lon2] = startLocation.coords;
        const distToStart = haversineDistance(lat1, lon1, lat2, lon2);
        const timeToStart = distToStart / 60;
        const hoursToStart = Math.floor(timeToStart);
        const minutesToStart = Math.floor((timeToStart - hoursToStart) * 60);
        bodyHtml += `<td>${Math.round(distToStart)} mi<br>${hoursToStart}:${minutesToStart.toString().padStart(2, '0')}</td>\n`;

        // Then add distances to all other locations
        otherLocations.forEach(({ loc: toLoc, index: j }) => {
            if (i === j) {
                bodyHtml += '<td class="diagonal">-</td>\n';
            } else {
                const [lat1, lon1] = fromLoc.coords;
                const [lat2, lon2] = toLoc.coords;
                const distance = haversineDistance(lat1, lon1, lat2, lon2);
                const timeHours = distance / 60;
                const hours = Math.floor(timeHours);
                const minutes = Math.floor((timeHours - hours) * 60);
                bodyHtml += `<td>${Math.round(distance)} mi<br>${hours}:${minutes.toString().padStart(2, '0')}</td>\n`;
            }
        });

        bodyHtml += '</tr>\n';
    });

    document.querySelector('.distance-grid thead').innerHTML = headerHtml;
    document.querySelector('.distance-grid tbody').innerHTML = bodyHtml;
}

document.addEventListener('DOMContentLoaded', buildDistanceTable);
