const Pelion = require('./src/Pelion.js');
const config = require('./config.js');

var pelion = new Pelion(config);

const resource_id = '/3314/0/5702';

function print_connected_devices() {
    console.log('Connected devices and resources:');

    // Find devices that fit within the config filter
    pelion.getDevices(function(statusCode, devices) {
        console.log(devices);
        // Iterate through all devices and request device resources
        for (var device in devices) {
            let id = devices[device].id;
//            console.log(id);
            pelion.getDeviceResources(id, function(statusCode, data) {
                let resources = JSON.parse(data);

                // Print available resources
                console.log('Resources for device ' + id + ':');
//                console.log(resources);
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


function on_open() {
    console.log('Websocket open, now we can get some stuff...'); 

    //get a single resource value to be printed via on_message
    pelion.getResource(config.pelion_filter.id, resource_id, function(data) {
        console.log('async GET response: ' + data.toString());
    });

}

function subscribe_resource() {
    console.log('Subscribing to resource to receive notifications when updated:' + resource_id);
    pelion.put('/v2/subscriptions/' + config.pelion_filter.id + resource_id, null, null, null); 
}

function on_message(payload) {
    console.log('Notification: ' + JSON.stringify(payload));
}

print_connected_devices();

subscribe_resource();

pelion.startNotifications(on_open, on_message);
