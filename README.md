# Node-RED nodes for Coda

[Coda](https://coda.io/ "Coda") is a powerful online tool that allows you to build complex and interactive documents quickly.

With [Coda APIs](https://coda.io/developers/apis/v1beta1 "coda.io APIs"), you can interact with tables within Coda documents. The nodes included in this package allow you to easily work with Coda APIs using Node-RED.

**This package is compatible with Coda API version 0.1.1-beta**

## Content of this package and features

  - **Connection settings node**
    - Stores multiple Coda API tokens and table IDs
  - **Get data node**
    - This node constructs a URL and HTTP header to:
      - get a list of tables in a doc
      - get rows from a table
  - **Multiple pages node**
    - Sends multiple requests to Coda to retrieve a large number of rows from Coda (Coda allows you to retrieve up to 500 rows per GET request)
  - **Upsert node**
    - constructs a URL and HTTP header
    - format data into a structure that is accepted by Coda APIs

Please note: this package does not handle HTTP requests, but relies on the 'HTTP request' function node to handle it.

## How to get data from Coda
### Preparation
The node comes with fields to enter the following information:
  - Coda API authentication key
  - Document ID
  - Table ID (optional)

To find your document ID, use [this tool](https://coda.io/developers/apis/v1beta1#doc-ids).

### 1. Find out table IDs
1. Connect an inject node to a **Coda connection settings** node
2. Connect it to a **get data** node
3. Connect it to an 'HTTP request' function node. Open the node, then select 'GET' in the 'Method' dropdown, as well as 'a parsed JSON object' for 'Return'
4. Output the message to a debug node. Coda's response is found in `msg.payload`
5. `msg.payload.items` is an array of all the tables found in the document and contains a list of tables. You can obtain the ID of the table you want to refer to. If the debug message gets cut off and you cannot see all the tables, simply increase the value of `debugMaxLength` in `settings.js`.

![Example of a basic flow using the Coda nodes](./doc/images/flow_basic.jpg)

Here's an example of the flow:

```[{"id":"2505aded.ab29b2","type":"debug","z":"69eb5e38.bc12b","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":250,"y":200,"wires":[]},{"id":"7c547c80.9444e4","type":"inject","z":"69eb5e38.bc12b","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":100,"y":40,"wires":[["b8a5b381.0c4a9"]]},{"id":"5d41bbb8.af3084","type":"http request","z":"69eb5e38.bc12b","name":"","method":"GET","ret":"obj","url":"","tls":"","x":230,"y":160,"wires":[["2505aded.ab29b2"]]},{"id":"287575e.cdc418a","type":"coda-io-get-data","z":"69eb5e38.bc12b","limit":"","get_rows":false,"name":"","x":210,"y":120,"wires":[["5d41bbb8.af3084"]]},{"id":"b8a5b381.0c4a9","type":"coda-io-connection","z":"69eb5e38.bc12b","bearer_api_token":"60684f89.27692","doc_id":"ef2900f.4a1f6","secondary_id":"","name":"","x":160,"y":80,"wires":[["287575e.cdc418a"]]},{"id":"60684f89.27692","type":"coda-io-connection-api-token","z":"","name":"My coda API token","api_token":"ADD YOUR API TOKEN HERE"},{"id":"ef2900f.4a1f6","type":"coda-io-connection-doc-id","z":"","name":"My document ID","doc_id":"ADD YOUR DOCUMENT ID HERE"}]```


### 2. Get rows from a table
Once you've found the ID of the table from which you want to get rows, add the table ID to the 'connection settings' node. Then in the 'get data' node, tick the 'Get rows' checkbox.

Coda's response will be under `msg.payload.items`, which includes metadata of each row. Values of each row will be found in `msg.payload.items.values`.

#### 2.1 Get 500+ rows from a table / ask Coda to return a certain number of rows per GET request
Coda sets a limit of 500 rows per GET request (as of Dec 2018). If you want to retrieve more than 500 or retrieve a certain number of rows below 500 per request, you need to set a limit and send multiple GET requests by building a loop with the multiple pages node.

In the below example, it uses the rate limit feature of the 'delay' function node to keep some interval between each request (although the delay node is probably an overkill, as each response to a GET request takes a few seconds to arrive). Coda has rate limits, but the details are not disclosed. If you are planning on sending loads of requests within a short period of time, it might be a good idea to contact them and see if they can increase the limit for you. The email address is found in the API doc.

![Example of a flow with a loop using the multiple requests nodes](./doc/images/flow_multiple_requests.jpg)

```[{"id":"6a843ac1.a52354","type":"tab","label":"Flow 2","disabled":false,"info":""},{"id":"e5ccc2e5.c580e","type":"debug","z":"6a843ac1.a52354","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":530,"y":300,"wires":[]},{"id":"a2efbb40.b2cb48","type":"inject","z":"6a843ac1.a52354","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":80,"wires":[["c3d4ba05.152158"]]},{"id":"6822831b.32111c","type":"http request","z":"6a843ac1.a52354","name":"","method":"GET","ret":"obj","url":"","tls":"","x":450,"y":160,"wires":[["9d20180d.bbc9f8"]]},{"id":"250742b7.405c0e","type":"coda-io-get-data","z":"6a843ac1.a52354","limit":"","get_rows":true,"name":"","x":250,"y":160,"wires":[["6822831b.32111c"]]},{"id":"c3d4ba05.152158","type":"coda-io-connection","z":"6a843ac1.a52354","bearer_api_token":"60684f89.27692","doc_id":"ef2900f.4a1f6","secondary_id":"","name":"","x":220,"y":120,"wires":[["250742b7.405c0e"]]},{"id":"9d20180d.bbc9f8","type":"coda-io-multiple-pages","z":"6a843ac1.a52354","name":"","x":320,"y":260,"wires":[["99c4f283.10a57"],["e5ccc2e5.c580e"]]},{"id":"99c4f283.10a57","type":"delay","z":"6a843ac1.a52354","name":"","pauseType":"rate","timeout":"2","timeoutUnits":"seconds","rate":"1","nbRateUnits":"2","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":560,"y":220,"wires":[["250742b7.405c0e"]]},{"id":"60684f89.27692","type":"coda-io-connection-api-token","z":"","name":"My coda API token","api_token":"ADD YOUR API TOKEN HERE"},{"id":"ef2900f.4a1f6","type":"coda-io-connection-doc-id","z":"","name":"My document ID","doc_id":"ADD YOUR DOCUMENT ID HERE"}]```

## 3 Upsert
The upsert node can be used for the following scenarios:
- You want to aggregate data such as tweets and store them in a Coda table (insert)
- You have a table in two separate documents respectively. The number of records doesn't change and you simply want to keep the two tables in sync (update)
- You have a table in two separate documents respectively. The number of records *does* change and you want to sync the two i.e. sometimes existing field values are updated, but sometimes new rows are added (upsert)

In order for the upsert node to format the data in the way Coda accepts, you need to pass the data to the node in the following structure:
```
[
    {
        "column name/ID 1": "value1",
        "column name/ID 2": "value2",
        "column name/ID 3": "value3"
        . . .
    },
    {
        "column name/ID 1": "value1",
        "column name/ID 2": "value2",
        "column name/ID 3": "value3"
        . . .
    }
    . . .
]
```
Although the above example only shows string values, you can also pass numbers, dates etc. as long as it matches with the destination column's format.

#### 3.1 How to set up an upsert flow

The below is written under an assumption that:
- you already have a flow that retrieves the data from some source (Coda/twitter etc.)
- you have a custom function node that formats the retrieved data into the accepted format, as described above

1. add a new **connection settings** node and set it up to access the destination document and table
2. add a new **upsert** node, then specify the destination table's fields. Its settings page has three fields for storing column names/IDs of the destination table. This is done to run appropriate checks for different data types. Make sure to enter the column names/IDs correctly, or it will upsert will fail
3. If you wish to update rows, you must give the name/ID of the column whose value will be used as the key. You can use more than one column for as the key. Make sure a key / a combination of keys only points to a single row
4. Connect it to the 'http request' function node. Open it and set the method to POST, then set the return value to 'parsed JSON object'
5. Connect it to a debug node and set it to display the complete `msg` object, rather than the payload

If you see the statusCode `202`, then the upsert request was a success. It may take a while before the changes appear in the destination table.

![Example of an upsert flow using the Coda nodes](./doc/images/flow_upsert.jpg)

# TODO:
- [ ] Add an option to get folders. Currently only supports tables
- [ ] Add an option to get columns. Currently only supports rows
- [ ] Build a Coda row parser to make it easy to feed Coda row data into the upsert node
- [ ] Accept `msg` object members as variable field values so table/column names can be set dynamically
- [ ] Add validations and error handling

# CAUTION:
This package is still in its infancy. It is likely that, in the near future, non-backwards compatible changes may be introduced without prior notice. When a new version becomes available, make sure to test it thoroughly in a discrete development environment before installing it to your production environment.
