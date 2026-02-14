let locations = [];
let startLocation = null;
let planners = [];
let plannerIdCounter = 0;
let map = null;
let markers = [];
let routePath = null;

async function initializePlanner() {
    await loadLocationData();
    locations = getLocationData();
    startLocation = locations.find(loc => loc.defaultStart) || locations[0];
    addPlanner();
}

function initMap() {
    if (locations.length === 0) {
        setTimeout(initMap, 100);
        return;
    }

    const mapCenter = startLocation ? { lat: startLocation.coords[0], lng: startLocation.coords[1] } : { lat: 37.0902, lng: -76.3645 };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: mapCenter,
        mapTypeId: 'roadmap'
    });

    updateMapForAllPlanners();
}

function updateMapForAllPlanners() {
    if (!map) return;

    markers.forEach(marker => marker.setMap(null));
    markers = [];

    if (routePath) {
        routePath.setMap(null);
    }

    const allWaypoints = new Set();
    planners.forEach(planner => {
        planner.route.forEach(waypoint => {
            allWaypoints.add(JSON.stringify(waypoint));
        });
    });

    const bounds = new google.maps.LatLngBounds();
    const pathCoordinates = [];

    planners.forEach((planner, plannerIndex) => {
        planner.route.forEach((waypoint, index) => {
            const position = { lat: waypoint.coords[0], lng: waypoint.coords[1] };

            const marker = new google.maps.Marker({
                position: position,
                map: map,
                title: waypoint.name,
                label: {
                    text: `${plannerIndex + 1}.${index + 1}`,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `<strong>${waypoint.name}</strong><br>${waypoint.address || ''}`
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            markers.push(marker);
            bounds.extend(position);
            pathCoordinates.push(position);
        });
    });

    if (pathCoordinates.length > 0) {
        routePath = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokeColor: '#009879',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        routePath.setMap(map);

        map.fitBounds(bounds);
    }
}

document.addEventListener('DOMContentLoaded', initializePlanner);

function createPlanner() {
    const plannerId = plannerIdCounter++;
    const planner = {
        id: plannerId,
        route: [startLocation]
    };
    planners.push(planner);
    return planner;
}

function addPlanner() {
    const planner = createPlanner();
    renderPlanner(planner);
}

function removePlanner(plannerId) {
    planners = planners.filter(p => p.id !== plannerId);
    document.getElementById(`planner-${plannerId}`).remove();
}

function renderPlanner(planner) {
    const container = document.getElementById('planners-container');
    const plannerDiv = document.createElement('div');
    plannerDiv.id = `planner-${planner.id}`;
    plannerDiv.className = 'planner';
    plannerDiv.style.margin = '20px';
    plannerDiv.style.display = 'inline-block';
    plannerDiv.style.verticalAlign = 'top';

    plannerDiv.innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center;">
    <h2>Route Planner ${planner.id + 1}</h2>
    ${planners.length > 1 ? `<button onclick="removePlanner(${planner.id})" style="background-color: #dc3545; padding: 5px 10px; margin: 0;">×</button>` : ''}
</div>

<div class="waypoint-list">
    <strong>Route:</strong>
    <div id="route-display-${planner.id}"></div>
</div>

<label for="filter-type-${planner.id}">Filter by:</label>
<select id="filter-type-${planner.id}">
    <option value="distance">Distance (miles)</option>
    <option value="time">Time (hours)</option>
</select>

<label for="filter-value-${planner.id}">Max value:</label>
<input type="number" id="filter-value-${planner.id}" value="330" min="1">

<label for="filter-direction-${planner.id}">Direction:</label>
<select id="filter-direction-${planner.id}">
    <option value="all">All directions</option>
    <option value="n">North (N)</option>
    <option value="ne">Northeast (NE)</option>
    <option value="e">East (E)</option>
    <option value="se">Southeast (SE)</option>
    <option value="s">South (S)</option>
    <option value="sw">Southwest (SW)</option>
    <option value="w">West (W)</option>
    <option value="nw">Northwest (NW)</option>
</select>

<label for="waypoint-select-${planner.id}">Add stop:</label>
<select id="waypoint-select-${planner.id}">
    <option value="">-- Select destination --</option>
</select>

<button onclick="addWaypoint(${planner.id})">Add Stop</button>
<button onclick="resetRoute(${planner.id})" style="background-color: #6c757d;">Reset Route</button>
`;

    container.appendChild(plannerDiv);

    document.getElementById(`filter-type-${planner.id}`).addEventListener('change', () => updateWaypointOptions(planner.id));
    document.getElementById(`filter-value-${planner.id}`).addEventListener('input', () => updateWaypointOptions(planner.id));
    document.getElementById(`filter-direction-${planner.id}`).addEventListener('change', () => updateWaypointOptions(planner.id));

    updateRouteDisplay(planner.id);
    updateWaypointOptions(planner.id);
}

function getPlanner(plannerId) {
    return planners.find(p => p.id === plannerId);
}

function updateWaypointOptions(plannerId) {
    const planner = getPlanner(plannerId);
    if (!planner) return;

    const select = document.getElementById(`waypoint-select-${plannerId}`);
    const filterType = document.getElementById(`filter-type-${plannerId}`).value;
    const filterValue = parseFloat(document.getElementById(`filter-value-${plannerId}`).value);
    const filterDirection = document.getElementById(`filter-direction-${plannerId}`).value;
    const currentLocation = planner.route[planner.route.length - 1];

    select.innerHTML = '<option value="">-- Select destination --</option>';

    const usedLocations = new Set(planner.route.map(r => r.name));

    locations.forEach((loc, index) => {
        if (!usedLocations.has(loc.name)) {
            const distance = haversineDistance(
                currentLocation.coords[0], currentLocation.coords[1],
                loc.coords[0], loc.coords[1]
            );
            const timeHours = distance / 60;
            const bearing = getBearing(
                currentLocation.coords[0], currentLocation.coords[1],
                loc.coords[0], loc.coords[1]
            );

            let passesFilter = false;
            if (filterType === 'distance') {
                passesFilter = distance <= filterValue;
            } else {
                passesFilter = timeHours <= filterValue;
            }

            const passesDirection = matchesDirection(bearing, filterDirection);

            if (passesFilter && passesDirection) {
                const hours = Math.floor(timeHours);
                const minutes = Math.floor((timeHours - hours) * 60);
                const direction = getDirection(bearing).toUpperCase();
                const option = document.createElement('option');
                option.value = index;
                const cityState = loc.city && loc.state ? ` ${loc.city}, ${loc.state}` : '';
                option.textContent = `${direction} ${Math.round(distance)}mi ${hours}:${minutes.toString().padStart(2, '0')} ${loc.name}${cityState}`;
                select.appendChild(option);
            }
        }
    });
}

function addWaypoint(plannerId) {
    const planner = getPlanner(plannerId);
    if (!planner) return;

    const select = document.getElementById(`waypoint-select-${plannerId}`);
    const selectedIndex = select.value;

    if (selectedIndex !== '') {
        const location = locations[parseInt(selectedIndex)];
        planner.route.push(location);
        updateRouteDisplay(plannerId);
        updateWaypointOptions(plannerId);
    }
}

function removeWaypoint(plannerId, index) {
    const planner = getPlanner(plannerId);
    if (!planner) return;

    planner.route.splice(index, 1);
    if (planner.route.length === 0) {
        planner.route = [startLocation];
    }
    updateRouteDisplay(plannerId);
    updateWaypointOptions(plannerId);
}

function resetRoute(plannerId) {
    const planner = getPlanner(plannerId);
    if (!planner) return;

    planner.route = [startLocation];
    updateRouteDisplay(plannerId);
    updateWaypointOptions(plannerId);
}

function updateRouteDisplay(plannerId) {
    const planner = getPlanner(plannerId);
    if (!planner) return;

    const display = document.getElementById(`route-display-${plannerId}`);
    display.innerHTML = '';

    let totalDistance = 0;
    let totalTime = 0;

    planner.route.forEach((waypoint, index) => {
        const div = document.createElement('div');
        div.className = 'waypoint-item';

        let displayText = `${index + 1}. ${waypoint.name}`;
        if (index > 0) {
            const distance = haversineDistance(
                planner.route[index-1].coords[0], planner.route[index-1].coords[1],
                waypoint.coords[0], waypoint.coords[1]
            );
            const bearing = getBearing(
                planner.route[index-1].coords[0], planner.route[index-1].coords[1],
                waypoint.coords[0], waypoint.coords[1]
            );
            const direction = getDirection(bearing).toUpperCase();
            const timeHours = distance / 60;
            totalDistance += distance;
            totalTime += timeHours;
            const hours = Math.floor(timeHours);
            const minutes = Math.floor((timeHours - hours) * 60);
            const cityState = waypoint.city && waypoint.state ? ` ${waypoint.city}, ${waypoint.state}` : '';
            displayText = `${index + 1}. ${direction} ${Math.round(distance)}mi ${hours}:${minutes.toString().padStart(2, '0')} ${waypoint.name}${cityState}`;
        }

        div.innerHTML = `
<span>${displayText}</span>
<button onclick="removeWaypoint(${plannerId}, ${index})">Remove</button>
`;
        display.appendChild(div);
    });

    if (planner.route.length > 1) {
        const totalDiv = document.createElement('div');
        totalDiv.style.marginTop = '10px';
        totalDiv.style.fontWeight = 'bold';
        const totalHours = Math.floor(totalTime);
        const totalMinutes = Math.floor((totalTime - totalHours) * 60);
        totalDiv.innerHTML = `<strong>Total: ${Math.round(totalDistance)} mi, ${totalHours}:${totalMinutes.toString().padStart(2, '0')}</strong>`;
        display.appendChild(totalDiv);
    }

    updateMapForAllPlanners();
}
