'use strict';

(function() {
    var root = this;

    var has_require = typeof require !== 'undefined';
    var request = root.request;
    var Websocket = root.Websocket;
    if (typeof request === 'undefined') {
        if (has_require) {
            request = require('request');
        } else {
            throw new Error('Requires request');
        }
    }
    if (typeof Websocket === 'undefined') {
        if (has_require) {
            Websocket = require('isomorphic-ws');
        } else {
            throw new Error('Requires Websocket');
        }
    }

    /**
     * Javascript example of using the Pelion REST API
     * @author Michael Ray <michael.ray@arm.com>
     **/
    class Pelion {

        constructor(configuration)
        {
            /**
             * Configuration object to use for credentials and other private options
             * @property {String} pelion_api_key - API key from Pelion
             * @property {String} pelion_api_host - Base API URL
             * @property {Object} [pelion_filter] - Filter to use when obtaining devices
             **/
            this.config = configuration

            /**
             * Header object to use when using the Pelion REST API
             * @private
             **/
            this.header = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.config.pelion_api_key
            };

            /**
             * Callbacks that have not been fired yet, indexed by Async IDs
             * @type {Object.<String, Pelion~resource_callback>}
             **/
            this.in_flight_callbacks = {};
        }

        /**
         * Generate a random string of a given length
         * Needed to create an async ID
         * @private
         * @method Pelion#rand_string
         * @param {Number} n - Length of the random string
         * @return {String} rs - Random string of specified length
         **/
        rand_string(n) {
            if (n <= 0) {
                return '';
            }
            var rs = '';
            var r = n % 8, q = (n-r)/8, i;
            for(i = 0; i < q; i++) {
                rs += Math.random().toString(16).slice(2);
            }
            if(r > 0){
                rs += Math.random().toString(16).slice(2,i);
            }
            return rs;
        }

        /**
         * Callback for an HTTP GET/POST/PUT
         * http_callback(status, data)
         * @callback Pelion~http_callback
         * @param {number} status - HTTP Status code
         * @param {Object} data - Object containing the response from Pelion
         */

        /**
         * Send a HTTP GET to Pelion
         * @method Pelion#get
         * @param {String} uri - URI indicated by the Pelion API (excluding base)
         * @param {Object} params - HTTP PUT parameters. Can be null
         * @param {Object} payload - HTTP PUT payload. Can be null
         * @param {Pelion~http_callback} [callback] - Function to call when the GET completes
         **/
        get(uri, callback) {
            var payload = {
                url: this.config.pelion_api_host + uri,
                method: 'GET',
                headers: this.header
            };
            request(payload, function(error, res) {
                if (error) throw error;
                if (callback)
                    callback(res.statusCode, res.body);
            });
        }

        /**
         * Send a HTTP PUT to Pelion
         * @method Pelion#put
         * @param {String} uri - URI indicated by the Pelion API (excluding base)
         * @param {Object} params - HTTP PUT parameters. Can be null
         * @param {Object} payload - HTTP PUT payload. Can be null
         * @param {Pelion~http_callback} [callback] - Function to call when the PUT completes
         **/
        put(uri, params, payload, callback)
        {
            var options = {
                url: this.config.pelion_api_host + uri,
                method: 'PUT',
                headers: this.header
            };
            if (params !== null) {
                options.qs = params;
            }
            if (payload !== null) {
                options.body = payload;
            }
            request(options, function(error, res) {
                if (error) throw error;
                if (callback)
                    callback(res.statusCode, res.body);
            });
        }

        /**
         * Send a HTTP POST to Pelion
         * @method Pelion#post
         * @param {String} uri - URI indicated by the Pelion API (excluding base)
         * @param {Object} params - HTTP POST parameters. Can be null
         * @param {Object} payload - HTTP POST payload. Can be null
         * @param {Pelion~http_callback} [callback] - Function to call when the POST completes
         **/
        post(uri, params, payload, callback)
        {
            var options = {
                url: this.config.pelion_api_host + uri,
                method: 'POST',
                headers: this.header
            };
            if (params !== null) {
                options.qs = params;
            }
            if (payload !== null) {
                options.body = payload;
                options.json = true;
            }
            request(options, function(error, res) {
                if (error) throw error;
                if (callback)
                    callback(res.statusCode, res.body);
            });
        }

        /**
         * Get a list of devices - uses the filter specified in the config file
         * @method Pelion#getDevices
         * @param {Pelion~http_callback} [callback] - Function to call when the GET completes
         **/
        getDevices(callback) {
            var filter = this.config.pelion_filter;

            // Format URL
            var url = this.config.pelion_api_host + '/v3/devices';
            if (Object.keys(filter).length > 0) url += '?';
            for (var key in filter) {
                url += key + '=' + filter[key] + '&';
            }
            url = url.substring(0, url.length - 1);

            var options = {
                url: url,
                method: 'GET',
                headers: this.header
            };

            request(options, function(error, res) {
                if (error) throw error;
                let payload = JSON.parse(res.body);
                if (callback)
                    callback(res.statusCode, payload.data);
                this.deviceList = payload.data;
            });
        }

        /**
         * Callback for when the notification channel to Pelion has been opened
         * connect_callback()
         * @callback Pelion~connect_callback
         */

        /**
         * Start notifications from Pelion. Opens a websocket and presents data to the user
         * @method Pelion#startNotifications
         * @param {Pelion~connect_callback} [on_connect_callback] - Function to call when a notification channel has been opened
         * @param {Pelion~resource_callback} [on_message_callback] - Functino to call when a notification comes in from Pelion
         **/
        startNotifications(on_connect_callback, on_message_callback)
        {
            this.put('/v2/notification/websocket', null, null, function(code, content) {
                let url = this.config.pelion_api_host + '/v2/notification/websocket-connect';
                this.socket = new Websocket(url, {headers: this.header});
                this.socket.onopen = function open() {
                    if (on_connect_callback)
                        on_connect_callback();
                };
                this.socket.onclose = function close() {
                };
                this.socket.onmessage = function incoming(data) {
                    if (data.type === 'message') {
                        let json_struct = JSON.parse(data.data);
                        if ('notifications' in json_struct) {
                            if (on_message_callback)
                                on_message_callback(json_struct.notifications);
                        }
                        let async_responses = json_struct['async-responses'];
                        for (var i in async_responses) {
                            let id = async_responses[i].id;
                            if (id in this.in_flight_callbacks && this.in_flight_callbacks[id]) {
                                let payload = Buffer.from(async_responses[i].payload, 'base64');
                                this.in_flight_callbacks[id](payload);
                            }
                        }
                    }
                }.bind(this);
            }.bind(this));
        }

        /**
         * Callback for when an async resource payload has been received
         * resource_callback(data)
         * @callback Pelion~resource_callback
         * @param {Buffer} payload - Payload in buffer form. Can be converted to a string, or Hex
         */

        /**
         * Get the payload from a resource of a specific device
         * @method Pelion#getResource
         * @param {String} device_id - Device ID to get the data from
         * @param {String} resource - URI of the resource to get the data from
         * @param {Pelion~resource_callback} [callback] - Callback to run when the payload is available. Asynchronous
         **/
        getResource(device_id, resource, callback)
        {
            let payload = {
                method: 'GET',
                uri: resource
            };

            let async_id = '123e4567-e89b-12d3-a456-' + this.rand_string(12);
            let params = {
                'async-id': async_id
            };
            let endpoint = '/v2/device-requests/' + device_id;

            this.in_flight_callbacks[async_id] = callback;

            this.post(endpoint, params, payload, null);
        }

        /**
         * Get the resources for a specified device
         * @method Pelion#getDeviceResources
         * @param {String} device_id - Device ID
         * @param {Pelion~http_callback} [callback] - Function to call when the GET completes
         **/
        getDeviceResources(device_id, callback)
        {
            this.get('/v2/endpoints/' + device_id, callback);
        }
    };

    if ( typeof exports !== 'undefined' ) {
        if ( typeof module !== 'undefined' && module.exports ) {
            exports = module.exports = Pelion;
        }
        exports.Pelion = Pelion;
    } else {
        root.Pelion = Pelion;
    }

}).call(this);