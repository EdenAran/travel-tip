'use strict';
import { storageService } from './storage-service.js'
export const locationService = {
    setLocation,
    initLocation,
    getLocations,
    getLastLocation,
    getLocationById,
    deletLocationById,
    getNextId
}



var gLocations;
var gNextId;

function initLocation() {
    gLocations = storageService.load('locations');
    gNextId = storageService.load('id');
    if (!gLocations) gLocations = [];
    if (!gNextId) gNextId = 101;
    return Promise.resolve(gLocations)
}

function setLocation(lat, lng, name = '', weather = '', createdAt = '', updatedAt = '') {
    const location = {
        id: gNextId++,
        name,
        lat,
        lng,
        weather,
        createdAt,
        updatedAt
    }
    gLocations.unshift(location)
    storageService.save('locations', gLocations)
    storageService.save('id', gNextId)
}

function getLastLocation() {
    console.log(gLocations)
    return gLocations[0];
}

function getLocations() {
    return gLocations;
}

function getLocationById(id) {
    return gLocations.find(location => location.id === id);
}

function deletLocationById(id){
    const idx = gLocations.findIndex(location => location.id === id);
    gLocations.splice(idx, 1)
    storageService.save('locations', gLocations)
    if(!gLocations.length) {
        gNextId = 101;
        storageService.save('id', gNextId)
    };
}

function getNextId(){
    return gNextId;
}
