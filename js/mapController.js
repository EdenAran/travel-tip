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
                            })
                    })
                    locationService.initLocation()
                        .then(locations => {
                            locations.forEach(location => { addMarker({ lat: location.lat, lng: location.lng }, location.name) })
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
    console.log('lat', lat, 'lng', lng)
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
    return marker;
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    console.log('A', laLatLng)
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
            addMarker({ lat, lng }, name);
            panTo(lat, lng);
            locationService.setLocation(lat, lng, name)
            elSearch.value = '';
        })
}