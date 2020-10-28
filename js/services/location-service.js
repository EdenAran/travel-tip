'use strict';
import { storageService } from './storage-service.js'
export const locationService = {
    setLocation,
    initLocation,
    getLocations,
    getLastLocation
}



var gLocations;
var gNextId;

function initLocation(){
    gLocations = storageService.load('locations');
    gNextId = storageService.load('id');
    if(!gLocations) gLocations = [];
    if(!gNextId) gNextId = 101;
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
    console.log('gLocations:', gLocations)
    storageService.save('locations', gLocations)
    storageService.save('id', gNextId)
}

function getLastLocation(){
    console.log(gLocations)
    return gLocations[0];
}

function getLocations(){
    return gLocations;
}