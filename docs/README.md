<a name="Pelion"></a>

## Pelion
Javascript example of using the Pelion REST API

**Kind**: global class  
**Author**: Michael Ray <michael.ray@arm.com>  

* [Pelion](#Pelion)
    * _instance_
        * [.config](#Pelion+config)
        * [.in_flight_callbacks](#Pelion+in_flight_callbacks) : <code>[ &#x27;Object&#x27; ].&lt;String, Pelion~resource\_callback&gt;</code>
        * [.startNotifications([on_connect_callback])](#Pelion+startNotifications)
        * [.getResource(device_id, resource, [callback])](#Pelion+getResource)
    * _inner_
        * [~connect_callback](#Pelion..connect_callback) : <code>function</code>
        * [~resource_callback](#Pelion..resource_callback) : <code>function</code>

<a name="Pelion+config"></a>

### pelion.config
Configuration object to use for credentials and other private options

**Kind**: instance property of [<code>Pelion</code>](#Pelion)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| pelion_api_key | <code>String</code> | API key from Pelion |
| pelion_api_host | <code>String</code> | Base API URL |
| [pelion_filter] | <code>Object</code> | Filter to use when obtaining devices |

<a name="Pelion+in_flight_callbacks"></a>

### pelion.in\_flight\_callbacks : <code>[ &#x27;Object&#x27; ].&lt;String, Pelion~resource\_callback&gt;</code>
Callbacks that have not been fired yet, indexed by Async IDs

**Kind**: instance property of [<code>Pelion</code>](#Pelion)  
<a name="Pelion+startNotifications"></a>

### pelion.startNotifications([on_connect_callback])
Start notifications from Pelion. Opens a websocket and presents data to the user

**Kind**: instance method of [<code>Pelion</code>](#Pelion)  

| Param | Type | Description |
| --- | --- | --- |
| [on_connect_callback] | [<code>connect\_callback</code>](#Pelion..connect_callback) | Function to call when a notification channel has been opened |

<a name="Pelion+getResource"></a>

### pelion.getResource(device_id, resource, [callback])
Get the payload from a resource of a specific device

**Kind**: instance method of [<code>Pelion</code>](#Pelion)  

| Param | Type | Description |
| --- | --- | --- |
| device_id | <code>String</code> | Device ID to get the data from |
| resource | <code>String</code> | URI of the resource to get the data from |
| [callback] | [<code>resource\_callback</code>](#Pelion..resource_callback) | Callback to run when the payload is available. Asynchronous |

<a name="Pelion..connect_callback"></a>

### Pelion~connect\_callback : <code>function</code>
Callback for when the notification channel to Pelion has been opened
connect_callback()

**Kind**: inner typedef of [<code>Pelion</code>](#Pelion)  
<a name="Pelion..resource_callback"></a>

### Pelion~resource\_callback : <code>function</code>
Callback for when an async resource payload has been received
resource_callback(data)

**Kind**: inner typedef of [<code>Pelion</code>](#Pelion)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>Buffer</code> | Payload in buffer form. Can be converted to a string, or Hex |

