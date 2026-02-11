function buildDistanceTable() {
    const locations = locationData;
    const startLocation = locationData.find(loc => loc.defaultStart) || locationData[0];

    let headerHtml = '<tr><th>From / To</th>';
    locations.forEach(loc => {
        headerHtml += `<th>${loc.name}</th>\n`;
    });
    headerHtml += '</tr>';

    let bodyHtml = '';

    // Add start location row
    bodyHtml += `<tr>\n<td><a href="${startLocation.url}" target="_blank">${startLocation.name}</a></td>\n`;
    locations.forEach(toLoc => {
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
    locations.forEach((fromLoc, i) => {
        bodyHtml += `<tr>\n<td><a href="${fromLoc.url}" target="_blank">${fromLoc.name}</a></td>\n`;

        locations.forEach((toLoc, j) => {
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
