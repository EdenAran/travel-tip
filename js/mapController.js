import { mapService } from './services/mapService.js'
import { locationService } from './services/location-service.js'

var gMap;




mapService.getLocs()
    .then(locs => console.log('locs', locs))

window.onload = () => {

    getPosition()
        .then(pos => {
            initMap(pos.coords.latitude, pos.coords.longitude)
                .then(() => {
                    locationService.initLocation();
                    gMap.addListener("dblclick", (ev) => {
                        getLocationName()
                            .then((name) => {
                                locationService.setLocation(ev.latLng.lat(), ev.latLng.lng(), name)
                                addMarker({ lat: ev.latLng.lat(), lng: ev.latLng.lng() }, name)
                            })
                    })
                    addMarker({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                })
                .catch(console.log('INIT MAP ERROR'));
            console.log('User position is:', pos.coords);
        })
        .catch(err => {
            console.log('err!!!', err);
        })
}

document.querySelector('.btn').addEventListener('click', (ev) => {
    console.log('Aha!', ev.target);
    panTo(35.6895, 139.6917);
})

export function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log('InitMap');
    return _connectGoogleApi()
        .then(() => {
            console.log('google available');
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15,
                disableDoubleClickZoom: true
            })
            console.log('Map!', gMap);
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
    gMap.panTo(laLatLng);
}

function getPosition() {
    console.log('Getting Pos');

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyDkJKRWdmnO-W5_plUcpoCGUTvLJCgPN3A';
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