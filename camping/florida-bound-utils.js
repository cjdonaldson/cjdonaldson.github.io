function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3959;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLat = (lat2 - lat1) * Math.PI / 180;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.asin(Math.sqrt(a));

    return R * c;
}

function getBearing(lat1, lon1, lat2, lon2) {
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;

    return (bearing + 360) % 360;
}

function getDirection(bearing) {
    const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

function matchesDirection(bearing, filterDirection) {
    if (filterDirection === 'all') return true;

    const direction = getDirection(bearing);
    return direction === filterDirection;
}
