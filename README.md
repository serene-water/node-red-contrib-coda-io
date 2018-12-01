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

```[{"id":"b6c39003.639e5","type":"inject","z":"4050c482.8f8fcc","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":260,"y":620,"wires":[["7ed145fb.a585ec"]]},{"id":"7ed145fb.a585ec","type":"coda-io-connection","z":"4050c482.8f8fcc","bearer_api_token":"","doc_id":"","secondary_id":"","name":"","x":360,"y":660,"wires":[["c156580f.0ddd38"]]},{"id":"c156580f.0ddd38","type":"coda-io-get-data","z":"4050c482.8f8fcc","limit":"3","get_rows":true,"name":"","x":410,"y":700,"wires":[["cf76c463.036918"]]},{"id":"cf76c463.036918","type":"debug","z":"4050c482.8f8fcc","name":"Done","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":430,"y":740,"wires":[]}]```

Coda's response is found in `msg.payload`. `msg.payload.items` is an array of all the tables found in the document. If the debug message gets cut off and you cannot see all the tables, simply increase the value of `debugMaxLength` in `settings.js`.

 `msg.payload.items` will contain a list of tables. You can grab an ID of the table from it.


### 3. Get rows from a table
Once you found the ID of the table from which you want to get rows, add the table ID to the connection settings node. Then in the get data node, tick the 'Get rows' checkbox.

Coda's response will be under `msg.payload.items`, which includes metadata of each row. Values of each row will be found in `msg.payload.items.values`.

#### 3.1 Get 500+ rows from a table / ask coda to return a sertain number of rows per GET request
Coda sets a limit of 500 rows per GET request (as of Dec 2018). If you want to retrieve more than 500 or retrieve a certain number of rows below 500 per request, you need to set a limit and send multiple GET requests by building a loop with the multiple pages node.

In the below example, it uses a delay node to keep some interval between each request (although it is probably an overkill, as each response to a GET request takes a few seconds to arrive). Coda has rate limits, but the details are not disclosed . If you are planning on sending loads of requests, it might be a good idea to contact them and see if they can increase the limit for you. The email address is found in the API doc.

![Example of a flow with a loop using the multiple requests nodes](./doc/images/flow_multiple_requests.jpg)

## TODO:
- Add an option to get folders. Currently only supports tables
- Build a node that handles upcert
- Maybe add a subform to the API key field and table name field respectively so they can be reused

## CAUTION:
This package is still in its infancy. It is likely that, in the near future, non-backwards-compatible changes will be introduced without notice (e.g. adding subforms as described in the TODO above). Make sure to test the new version in a separate environment before installing the update to your production environment.
