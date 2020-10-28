export const storageService = {
    save: saveToStorage,
    load: loadFromStorage,
    remove: removeFromStorage
}

function saveToStorage(key, val) {
    var str = JSON.stringify(val);
    localStorage.setItem(key, str)
}
function loadFromStorage(key) {
    var str = localStorage.getItem(key)
    return JSON.parse(str)
}
function removeFromStorage(key){
    localStorage.removeItem(key);
}
