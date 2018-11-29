# Node-RED nodes for coda

[coda](https://coda.io/ "coda") is a powerful  online tool that allows you to build complex and interactive documents quickly.

With [coda APIs](https://coda.io/developers/apis/v1beta1 "coda.io APIs"), you can interact with tables within Coda documents. The nodes included in this package allow you to easily work with Coda API using Node-RED.

## How to use the node 'Get coda tables/rows'
### 1. Preparation
The node comes with fields to enter the following information:
  - Coda API authentication key
  - Document ID
  - Table ID

To find your document ID, use [this tool](https://coda.io/developers/apis/v1beta1#doc-ids).

### 2. Find out table IDs
To find the table name, send leave the 'Table ID' field blank.

Connect an inject node to the coda node, then connect a HTTP request function node so that the output of the coda node is passed on to it. Finally output the message to a debug node. Here's an example of the flow:

```[{"id":"69eb5e38.bc12b","type":"tab","label":"Flow 2","disabled":false,"info":""},{"id":"2505aded.ab29b2","type":"debug","z":"69eb5e38.bc12b","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":270,"y":200,"wires":[]},{"id":"7c547c80.9444e4","type":"inject","z":"69eb5e38.bc12b","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":160,"y":80,"wires":[["b8149537.635058"]]},{"id":"b8149537.635058","type":"coda-io-get-table","z":"69eb5e38.bc12b","bearer_api_token":"[API TOKEN HERE]","doc_id":"[DOC ID HERE]","table_id":"","get_rows":false,"name":"","x":220,"y":120,"wires":[["5d41bbb8.af3084"]]},{"id":"5d41bbb8.af3084","type":"http request","z":"69eb5e38.bc12b","name":"","method":"GET","ret":"obj","url":"","tls":"","x":230,"y":160,"wires":[["2505aded.ab29b2"]]}]```

Coda's response is found in `msg.payload`. `msg.payload.items` is an array of all the tables found in the document. If the debug message gets cut off and you cannot see all the tables, simply increase the value of `debugMaxLength` in `settings.js`.

### 3. Get rows from a table
Once you found the ID of the table from which you want to get records, add the table ID to the coda node and tick the 'Get rows' checkbox.

Coda's response will be under `msg.payload.items`, which includes metadata of each row. Values of each row will be found in `msg.payload.items.values`.


#TODO:

- Build a node that handles multiple pages (coda currently only returns up to 500 rows per GET request)
- Build a node that handles upcert
