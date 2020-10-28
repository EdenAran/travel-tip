'use strict';
import { storageService } from './storage-service.js'
export const locationService = {
    setLocation,
    initLocation
}



var gLocations;
var gNextId;

function initLocation(){
    gLocations = storageService.load('locations');
    gNextId = storageService.load('id');
    if(!gLocations) gLocations = [];
    if(!gNextId) gNextId = 101;
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
    gLocations.push(location)
    storageService.save('locations', gLocations)
    storageService.save('id', gNextId)
}