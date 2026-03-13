"use strict";

global.getHasString = (str) => {
    return require('sha256')(require('md5')(appConfig.secretKey + str));
}

global.element = (key, array, defaultValue = null) => {
    if(typeof array === 'undefined' || typeof array[key] === 'undefined' || ! array[key]) {
        return defaultValue
    }
    return array[key] ?? defaultValue
}
