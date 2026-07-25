async function loadAndRenderLocations() {
    const response = await fetch('florida-bound-locations.json');
    const data = await response.json();
    const container = document.getElementById('locations-container');

    data.states.forEach(state => {
        const stateSection = document.createElement('details');
        stateSection.className = 'state-section';
        if (state.open) {
            stateSection.setAttribute('open', '');
        }

        const stateSummary = document.createElement('summary');
        stateSummary.textContent = `${state.emoji} ${state.name}`;
        stateSection.appendChild(stateSummary);

        state.locations.forEach(location => {
            const locationDetails = document.createElement('details');

            const locationSummary = document.createElement('summary');
            locationSummary.innerHTML = location.emoji ? `${location.emoji} ` : '';

            if (location.url) {
                const link = document.createElement('a');
                link.href = location.url;
                link.textContent = location.name;
                locationSummary.appendChild(link);
            } else {
                const link = document.createElement('a');
                link.href = location.mapUrl || '#';
                link.textContent = location.name;
                locationSummary.appendChild(link);
            }

            locationDetails.appendChild(locationSummary);

            const detailsList = document.createElement('ul');

            if (location.notes && location.notes.length === 1 && location.notes[0] === 'Private') {
                const li = document.createElement('li');
                li.textContent = 'ℹ️ Private';
                detailsList.appendChild(li);
            } else {
                if (location.address) {
                    const li = document.createElement('li');
                    const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
                    li.innerHTML = `📍 <a href="${location.mapUrl}">${fullAddress}</a>`;
                    detailsList.appendChild(li);
                }

                if (location.phone || location.email) {
                    const li = document.createElement('li');
                    let content = '';

                    if (location.phone) {
                        content += `📞 <a href="tel:${location.phone}">${location.phone}</a>`;
                    }

                    if (location.email) {
                        const emailDisplay = location.emailName || location.email;
                        if (content) content += ' | ';
                        content += `📧 <a href="mailto:${location.email}">${emailDisplay}</a>`;
                    }

                    li.innerHTML = content;
                    detailsList.appendChild(li);
                }

                if (location.bookingUrl || location.siteMap) {
                    const li = document.createElement('li');
                    let content = '';

                    if (location.bookingUrl) {
                        content += `🎫 <a href="${location.bookingUrl}">book online</a>`;
                    }

                    if (location.siteMap) {
                        if (content) content += ' | ';
                        content += `🏕️ <a href="${location.siteMap}">Site map</a>`;
                    }

                    li.innerHTML = content;
                    detailsList.appendChild(li);
                }

                if (location.hours) {
                    const li = document.createElement('li');
                    li.innerHTML = `🕐 <strong>Hours:</strong> ${location.hours}`;
                    detailsList.appendChild(li);
                }

                if (location.distance) {
                    const li = document.createElement('li');
                    li.textContent = `🚗 ${location.distance}`;
                    detailsList.appendChild(li);
                }

                if (location.distances) {
                    location.distances.forEach(dist => {
                        const li = document.createElement('li');
                        li.textContent = `🚗 ${dist}`;
                        detailsList.appendChild(li);
                    });
                }

                if (location.season) {
                    const li = document.createElement('li');
                    li.textContent = `📆 ${location.season}`;
                    detailsList.appendChild(li);
                }

                if (location.features) {
                    location.features.forEach(feature => {
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

                if (location.notes && !(location.notes.length === 1 && location.notes[0] === 'Private')) {
                    location.notes.forEach(note => {
                        const li = document.createElement('li');
                        li.textContent = note;
                        detailsList.appendChild(li);
                    });
                }
            }

            if (location.pricing && location.pricing.length > 0) {
                const pricingLi = document.createElement('li');
                pricingLi.textContent = '💲 Prices';

                const pricingGrid = document.createElement('div');
                pricingGrid.className = 'pricing-grid';

                //const amountHeader = document.createElement('span');
                //amountHeader.className = 'pricing-header pricing-amount';
                //amountHeader.textContent = 'Amount';
                //pricingGrid.appendChild(amountHeader);

                //const typeHeader = document.createElement('span');
                //typeHeader.className = 'pricing-header';
                //typeHeader.textContent = 'Type';
                //pricingGrid.appendChild(typeHeader);

                location.pricing.forEach(priceEntry => {
                    const [entryType, entryAmount] = Object.entries(priceEntry)[0];

                    const amountCell = document.createElement('span');
                    amountCell.className = 'pricing-amount';
                    amountCell.textContent = `${parseFloat(entryAmount).toFixed(2)}`;
                    pricingGrid.appendChild(amountCell);

                    const typeCell = document.createElement('span');
                    typeCell.textContent = entryType;
                    pricingGrid.appendChild(typeCell);
                });

                pricingLi.appendChild(pricingGrid);
                detailsList.appendChild(pricingLi);
            }

            locationDetails.appendChild(detailsList);
            stateSection.appendChild(locationDetails);
        });

        container.appendChild(stateSection);
    });
}

document.addEventListener('DOMContentLoaded', loadAndRenderLocations);
