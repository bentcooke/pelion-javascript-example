#!/usr/bin/nodejs

if(process.env.PELION_CONFIG_PATH) {
    console.log("Using environment variable for Pelion config path: " + process.env.PELION_CONFIG_PATH);
    var config = require(process.env.PELION_CONFIG_PATH);
} else { 
    var config = require('../config.js');
}

const Pelion = require('../src/Pelion.js');
var pelion = new Pelion(config);

let resource_uri = '/3/0/13';
let device_id = config.pelion_filter.id;

pelion.get('/v2/endpoints/' + device_id + resource_uri, function(status, payload) {
    if (payload === 'NOT_CONNECTED') {
        console.log("Device not connected: " + device_id);
        process.exit(1);
    } else {
        console.log("Device alive: " + device_id);
        process.exit(0);
    }
});