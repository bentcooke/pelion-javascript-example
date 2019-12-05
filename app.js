const Pelion = require('./src/Pelion.js');
const config = require('./config.js');

var pelion = new Pelion(config);

const resource_id = '/3/0/13';

function on_open() {
    console.log('Listening for Pelion notifications');

    // Find devices that fit within the config filter
    pelion.getDevices(function(statusCode, devices) {

        // Iterate through all devices and request device resources
        for (var device in devices) {
            let id = devices[device].id;
            pelion.getDeviceResources(config.pelion_filter.id, function(statusCode, data) {
                let resources = JSON.parse(data);

                // Print available resources
                console.log('Resources for device ' + id + ':');
                for (var resource in resources) {
                    let name = '';
                    if ('rt' in resources[resource])
                        name = ' (' + resources[resource].rt + ')';
                    console.log('\t' + resources[resource].uri + name);
                }
            });
        }
    });
}

function on_message(payload) {
    console.log(payload.toString());
}

pelion.startNotifications(on_open, on_message);
