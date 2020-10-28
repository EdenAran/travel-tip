import { mapService } from './services/mapService.js'
import { locationService } from './services/location-service.js'

const API_KEY = 'AIzaSyAqUZgbGEP11oNtkqb8bq06aDmUf4w9ksE';

var gMap;

window.onload = () => {
    getPosition()
        .then(pos => {
            initMap(pos.coords.latitude, pos.coords.longitude)
                .then(() => {
                    gMap.addListener("dblclick", (ev) => {
                        getLocationName()
                            .then((name) => {
                                locationService.setLocation(ev.latLng.lat(), ev.latLng.lng(), name)
                                addMarker({ lat: ev.latLng.lat(), lng: ev.latLng.lng() }, name)
                                renderWeather(ev.latLng.lat(), ev.latLng.lng());
                            })
                    })
                    locationService.initLocation()
                        .then(locations => {
                            locations.forEach(location => { addMarker({ lat: location.lat, lng: location.lng }, location.name) })
                            document.querySelectorAll('.go-btn').forEach(btn => btn.addEventListener('click', (ev) => {
                                const locationId = +ev.target.dataset.id
                                const location = locationService.getLocationById(locationId);
                                panTo(location.lat, location.lng)
                            }))
                            document.querySelectorAll('.delete-location-btn').forEach(btn => btn.addEventListener('click', (ev) => {
                                const locationId = +ev.target.dataset.id
                                locationService.deletLocationById(locationId);
                                renderInfoTable();
                            }))
                        })
                })
                .catch(err => console.log(err, 'INIT MAP ERROR'));
        })
        .catch(err => {
            console.log('err!!!', err);
        })
}

document.querySelector('.my-location-btn').addEventListener('click', (ev) => {
    console.log('Aha!', ev.target);
    getPosition()
        .then(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            panTo(lat, lng);
            addMarker({ lat, lng }, 'My Location')
        })
})

document.querySelector('form.search-location').addEventListener('submit', (ev) => {
    ev.preventDefault();
    onSearchAddress()
})

document.querySelector('.copy-location-btn').addEventListener('click', () => {
    const { lat, lng } = locationService.getLastLocation();
    const elInput = document.querySelector('.copy-url')
    elInput.value = `${window.location.host}${window.location.pathname}?lat=${lat}&lng=${lng}`
    elInput.select()
    document.execCommand("copy");
})



export function initMap(lat, lng) {
    return _connectGoogleApi()
        .then(() => {
            const copyLat = new URLSearchParams(`${window.location.search}`).get('lat')
            const copyLng = new URLSearchParams(`${window.location.search}`).get('lng')
            if (copyLat && copyLng) {
                lat = +copyLat;
                lng = +copyLng;
                console.log('lat', lat, 'lng', lng)
            }
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 13,
                disableDoubleClickZoom: true
            })
        })
}

function addMarker(loc, title) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title
    });
    renderInfoTable();
    return marker;
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    gMap.panTo(laLatLng);
}

function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    var elGoogleApi = document.createElement('script');
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    elGoogleApi.async = true;
    document.body.append(elGoogleApi);

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve;
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}


function getLocationName() {
    toggleModal()
    const elSave = document.querySelector('.modal .save-btn')
    const elCancel = document.querySelector('.modal .cancel-btn')
    return new Promise((resolve, reject) => {
        elSave.addEventListener('click', () => resolve())
        elCancel.addEventListener('click', () => reject())
    })
        .then(() => {
            toggleModal();
            return document.querySelector('.modal input').value
        }
        )
        .catch(() => { toggleModal() })
}

function toggleModal() {
    document.querySelector('.modal').classList.toggle('hide')
}

function onSearchAddress() {
    const elSearch = document.querySelector('.search input');
    const location = axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${elSearch.value}&key=${API_KEY}`)
        .then((res) => {
            const lat = res.data.results[0].geometry.location.lat;
            const lng = res.data.results[0].geometry.location.lng;
            const name = res.data.results[0].formatted_address;
            panTo(lat, lng);
            locationService.setLocation(lat, lng, name)
            elSearch.value = '';
            addMarker({ lat, lng }, name);
        })
}

function renderWeather(lat, lng) {
    axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=cc53ce7e40aa051e00744f72dbaa532c`)
        .then(res => {
            document.querySelector('.weather .weather-title').innerText = `The Weather is:`;
            document.querySelector('.weather .description').innerText = res.data.weather[0].description;
            const elTemp = document.querySelector('.weather .temp');
            elTemp.querySelector('.temp_min').innerText = `The temperature: ${res.data.main.temp_min} - `;
            elTemp.querySelector('.temp_max').innerText = `${res.data.main.temp_max}`;
            document.querySelector('.weather .humidity').innerText = `The humidity: ${res.data.main.humidity}`;
        })
}

function renderInfoTable() {
    const strHTML = locationService.getLocations().map(location => `
    <div class="location-card">
                        <h4>${location.name}</h4>
                        <div class="location-btns">
                        <button data-id="${location.id}" class="go-btn">Go</button>
                        <button data-id="${location.id}" class="delete-location-btn">Delete</button>
                        </div>
                    </div>
    `).join('')
    document.querySelector('.locations-container').innerHTML = strHTML;
    // document.getElementById("latitude").innerHTML = position.coords.latitude;
    // document.getElementById("longitude").innerHTML = position.coords.longitude;
    // document.getElementById("accuracy").innerHTML = position.coords.accuracy;

    // let date = new Date(position.timestamp);
    // document.getElementById("timestamp").innerHTML = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}