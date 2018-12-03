# Node-RED nodes for coda

[coda](https://coda.io/ "coda") is a powerful  online tool that allows you to build complex and interactive documents quickly.

With [coda APIs](https://coda.io/developers/apis/v1beta1 "coda.io APIs"), you can interact with tables within Coda documents. The nodes included in this package allow you to easily work with Coda API using Node-RED.

## How to get data from Coda
### Preparation
The node comes with fields to enter the following information:
  - Coda API authentication key
  - Document ID
  - Table ID (optional)

To find your document ID, use [this tool](https://coda.io/developers/apis/v1beta1#doc-ids).

### 1. Find out table IDs
1. Connect an inject node to the coda connection settings node
2. Connect it to the get data node
3. Connect it to a HTTP request function node (set the method to GET) so that the output of the coda node is passed on to it
4. Finally output the message to a debug node.

![Example of a basic flow using the coda nodes](./doc/images/flow_basic.jpg)

Here's an example of the flow:

```[{"id":"3db10003.fca87","type":"inject","z":"74d0da05.4567d4","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":380,"y":480,"wires":[["f421ddc1.590a3"]]},{"id":"f421ddc1.590a3","type":"coda-io-connection","z":"74d0da05.4567d4","bearer_api_token":"","doc_id":"","secondary_id":"","name":"","x":480,"y":520,"wires":[["a4949c17.045e"]]},{"id":"a4949c17.045e","type":"coda-io-get-data","z":"74d0da05.4567d4","limit":"","get_rows":true,"name":"","x":530,"y":560,"wires":[["ae1791fd.c545c"]]},{"id":"ae1791fd.c545c","type":"debug","z":"74d0da05.4567d4","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":550,"y":600,"wires":[]}]```

Coda's response is found in `msg.payload`. `msg.payload.items` is an array of all the tables found in the document. If the debug message gets cut off and you cannot see all the tables, simply increase the value of `debugMaxLength` in `settings.js`.

 `msg.payload.items` will contain a list of tables. You can grab an ID of the table from it.


### 3. Get rows from a table
Once you found the ID of the table from which you want to get rows, add the table ID to the connection settings node. Then in the get data node, tick the 'Get rows' checkbox.

Coda's response will be under `msg.payload.items`, which includes metadata of each row. Values of each row will be found in `msg.payload.items.values`.

#### 3.1 Get 500+ rows from a table / ask coda to return a sertain number of rows per GET request
Coda sets a limit of 500 rows per GET request (as of Dec 2018). If you want to retrieve more than 500 or retrieve a certain number of rows below 500 per request, you need to set a limit and send multiple GET requests by building a loop with the multiple pages node.

In the below example, it uses a delay node to keep some interval between each request (although it is probably an overkill, as each response to a GET request takes a few seconds to arrive). Coda has rate limits, but the details are not disclosed . If you are planning on sending loads of requests, it might be a good idea to contact them and see if they can increase the limit for you. The email address is found in the API doc.

![Example of a flow with a loop using the multiple requests nodes](./doc/images/flow_multiple_requests.jpg)

```[{"id":"2b4ef3db.bd4dfc","type":"inject","z":"74d0da05.4567d4","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":60,"wires":[["8c944bc6.dc9618"]]},{"id":"d6dcd823.4a8698","type":"delay","z":"74d0da05.4567d4","name":"","pauseType":"delay","timeout":"1","timeoutUnits":"seconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":560,"y":220,"wires":[["3e9fd6f0.c791ea"]]},{"id":"8c944bc6.dc9618","type":"coda-io-connection","z":"74d0da05.4567d4","bearer_api_token":"","doc_id":"","secondary_id":"","name":"","x":240,"y":100,"wires":[["3e9fd6f0.c791ea"]]},{"id":"3e9fd6f0.c791ea","type":"coda-io-get-data","z":"74d0da05.4567d4","limit":"","get_rows":false,"name":"","x":290,"y":140,"wires":[["de0b3200.6e158"]]},{"id":"1a3cdb28.898e95","type":"coda-io-multiple-pages","z":"74d0da05.4567d4","name":"","x":320,"y":260,"wires":[["d6dcd823.4a8698"],["d9329e2f.c2dfb"]]},{"id":"de0b3200.6e158","type":"http request","z":"74d0da05.4567d4","name":"","method":"GET","ret":"txt","url":"","x":570,"y":140,"wires":[["1a3cdb28.898e95"]]},{"id":"d9329e2f.c2dfb","type":"debug","z":"74d0da05.4567d4","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":550,"y":300,"wires":[]}]```

## TODO:
- Add an option to get folders. Currently only supports tables
- Build a node that handles upcert
- Build a coda row parser
- Maybe add a subform to the API key field and table name field respectively so they can be reused

## CAUTION:
This package is still in its infancy. It is likely that, in the near future, non-backwards-compatible changes will be introduced without notice (e.g. adding subforms as described in the TODO above). Make sure to test the new version in a separate environment before installing the update to your production environment.
