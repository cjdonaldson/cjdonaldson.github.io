async function loadAndRenderCampgrounds() {
    const response = await fetch('florida-bound-locations.json');
    const data = await response.json();
    const container = document.getElementById('campgrounds-container');

    data.states.forEach(state => {
        const stateSection = document.createElement('details');
        stateSection.className = 'state-section';
        if (state.open) {
            stateSection.setAttribute('open', '');
        }

        const stateSummary = document.createElement('summary');
        stateSummary.textContent = `${state.emoji} ${state.name}`;
        stateSection.appendChild(stateSummary);

        state.campgrounds.forEach(campground => {
            const campDetails = document.createElement('details');

            const campSummary = document.createElement('summary');
            campSummary.innerHTML = `${campground.emoji} `;

            if (campground.url) {
                const link = document.createElement('a');
                link.href = campground.url;
                link.textContent = campground.name;
                campSummary.appendChild(link);
            } else {
                const link = document.createElement('a');
                link.href = campground.mapUrl || '#';
                link.textContent = campground.name;
                campSummary.appendChild(link);
            }

            campDetails.appendChild(campSummary);

            const detailsList = document.createElement('ul');

            if (campground.notes && campground.notes.length === 1 && campground.notes[0] === 'Private') {
                const li = document.createElement('li');
                li.textContent = 'ℹ️ Private';
                detailsList.appendChild(li);
            } else {
                if (campground.address) {
                    const li = document.createElement('li');
                    li.innerHTML = `📍 <a href="${campground.mapUrl}">${campground.address}</a>`;
                    detailsList.appendChild(li);
                }

                if (campground.phone || campground.email || campground.contactUrl) {
                    const li = document.createElement('li');
                    let content = '';

                    if (campground.phone) {
                        content += `📞 <a href="tel:${campground.phone}">${campground.phone}</a>`;
                    }

                    if (campground.email) {
                        const emailDisplay = campground.emailName || campground.email;
                        if (content) content += ' | ';
                        content += `📧 <a href="mailto:${campground.email}">${emailDisplay}</a>`;
                    } else if (campground.contactUrl) {
                        if (content) content += ' | ';
                        content += `📧 <a href="${campground.contactUrl}">contact us</a>`;
                    }

                    li.innerHTML = content;
                    detailsList.appendChild(li);
                }

                if (campground.bookingUrl || campground.booking || campground.siteMap) {
                    const li = document.createElement('li');
                    let content = '';

                    if (campground.bookingUrl) {
                        content += `🎫 <a href="${campground.bookingUrl}">book online</a>`;
                    } else if (campground.booking) {
                        content += `🎫 ${campground.booking}`;
                    }

                    if (campground.siteMap) {
                        if (content) content += ' | ';
                        content += `🏕️ <a href="${campground.siteMap}">Site map</a>`;
                    }

                    li.innerHTML = content;
                    detailsList.appendChild(li);
                }

                if (campground.hours) {
                    const li = document.createElement('li');
                    li.innerHTML = `🕐 <strong>Hours:</strong> ${campground.hours}`;
                    detailsList.appendChild(li);
                }

                if (campground.distance) {
                    const li = document.createElement('li');
                    li.textContent = `🚗 ${campground.distance}`;
                    detailsList.appendChild(li);
                }

                if (campground.distances) {
                    campground.distances.forEach(dist => {
                        const li = document.createElement('li');
                        li.textContent = `🚗 ${dist}`;
                        detailsList.appendChild(li);
                    });
                }

                if (campground.season) {
                    const li = document.createElement('li');
                    li.textContent = `📆 ${campground.season}`;
                    detailsList.appendChild(li);
                }

                if (campground.features) {
                    campground.features.forEach(feature => {
                        const li = document.createElement('li');
                        if (feature.includes('Good Sam')) {
                            li.textContent = `💰 ${feature}`;
                        } else if (feature.includes('I-95') || feature.includes('I-75')) {
                            li.textContent = `🛣️ ${feature}`;
                        } else if (feature.toLowerCase().includes('propane')) {
                            li.textContent = `⛽ ${feature}`;
                        } else if (feature.toLowerCase().includes('dump')) {
                            li.textContent = `🚽 ${feature}`;
                        } else {
                            li.textContent = feature;
                        }
                        detailsList.appendChild(li);
                    });
                }

                if (campground.notes && !(campground.notes.length === 1 && campground.notes[0] === 'Private')) {
                    campground.notes.forEach(note => {
                        const li = document.createElement('li');
                        li.textContent = note;
                        detailsList.appendChild(li);
                    });
                }
            }

            campDetails.appendChild(detailsList);
            stateSection.appendChild(campDetails);
        });

        container.appendChild(stateSection);
    });
}

document.addEventListener('DOMContentLoaded', loadAndRenderCampgrounds);
