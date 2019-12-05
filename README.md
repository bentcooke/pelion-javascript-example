# Pelion Javascript Examples

Examples on how to use the Pelion REST API within Javascript to connect and subscribe to device resources

## Pre-requisites

Install `nodejs` and `npm`:
```bash
sudo apt-get install nodejs npm
```

## Setup

Install application packages:
```bash
npm install
```

Create a `config.js` file in project root. Use `config.js.template` as a template. Fill out the appropriate information:
```javascript
/**
 * pelion_api_key - Generated on the portal. Add your key below
 * pelion_api_host - Points to the pelion instance. Production is default
 * pelion_filter - Filter when getting devices. Options specified in Pelion documentation. Registered devices is default
 */
module.exports = {
    pelion_api_key: '<INSERT_API_KEY_HERE>',
    pelion_api_host: 'https://api.us-east-1.mbedcloud.com',
    pelion_filter: {
        state: 'registered'
    }
};
````

## Running

To subscribe and send data to resources of a device, run the example:
```bash
node app.js
```