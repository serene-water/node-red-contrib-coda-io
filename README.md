# Node-RED nodes for coda

[coda](https://coda.io/ "coda") is a powerful  online tool that allows you to build complex and interactive documents quickly.

With [coda APIs](https://coda.io/developers/apis/v1beta1 "coda.io APIs"), you can interact with tables within Coda documents. The nodes included in this package allow you to easily work with Coda API using Node-RED.

## Content of this package and features

  - **Connection settings node**
    - Stores multiple coda API tokens and table IDs
  - **Get data node**
    - This node constructs a URL and HTTP header to:
      - get a list of tables in a doc
      - get a list of columns in a table
      - get rows from a table
  - **Multiple pages node**
    - Sends multiple requests to coda to retrieve a large numbers of rows from coda (coda allows you to retrieve up to 500 rows per GET request)
  - **Upsert node**
    - constructs a URL and HTTP header
    - format data that is accepted by coda

Please note: this package does not handle HTTP requests, but relies on the 'HTTP request' function node to handle it.

## How to get data from Coda
### Preparation
The node comes with fields to enter the following information:
  - Coda API authentication key
  - Document ID
  - Table ID (optional)

To find your document ID, use [this tool](https://coda.io/developers/apis/v1beta1#doc-ids).

### 1. Find out table IDs
1. Connect an inject node to a **coda connection settings**__** node
2. Connect it to a **get data** node
3. Connect it to a 'HTTP request' function node. Open the node, then select 'GET' in the 'Method' dropdown, as well as 'a parsed JSON object' for 'Return'
4. Output the message to a debug node. Coda's response is found in `msg.payload`
5. `msg.payload.items` is an array of all the tables found in the document and contains a list of tables. You can obtain the ID of the table you want to refer to. If the debug message gets cut off and you cannot see all the tables, simply increase the value of `debugMaxLength` in `settings.js`.

![Example of a basic flow using the coda nodes](./doc/images/flow_basic.jpg)

Here's an example of the flow:

```[{"id":"2505aded.ab29b2","type":"debug","z":"69eb5e38.bc12b","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":250,"y":200,"wires":[]},{"id":"7c547c80.9444e4","type":"inject","z":"69eb5e38.bc12b","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":100,"y":40,"wires":[["b8a5b381.0c4a9"]]},{"id":"5d41bbb8.af3084","type":"http request","z":"69eb5e38.bc12b","name":"","method":"GET","ret":"obj","url":"","tls":"","x":230,"y":160,"wires":[["2505aded.ab29b2"]]},{"id":"287575e.cdc418a","type":"coda-io-get-data","z":"69eb5e38.bc12b","limit":"","get_rows":false,"name":"","x":210,"y":120,"wires":[["5d41bbb8.af3084"]]},{"id":"b8a5b381.0c4a9","type":"coda-io-connection","z":"69eb5e38.bc12b","bearer_api_token":"60684f89.27692","doc_id":"ef2900f.4a1f6","secondary_id":"","name":"","x":160,"y":80,"wires":[["287575e.cdc418a"]]},{"id":"60684f89.27692","type":"coda-io-connection-api-token","z":"","name":"My coda API token","api_token":"ADD YOUR API TOKEN HERE"},{"id":"ef2900f.4a1f6","type":"coda-io-connection-doc-id","z":"","name":"My document ID","doc_id":"ADD YOUR DOCUMENT ID HERE"}]```


### 2. Get rows from a table
Once you found the ID of the table from which you want to get rows, add the table ID to the connection settings node. Then in the get data node, tick the 'Get rows' checkbox.

Coda's response will be under `msg.payload.items`, which includes metadata of each row. Values of each row will be found in `msg.payload.items.values`.

#### 2.1 Get 500+ rows from a table / ask coda to return a sertain number of rows per GET request
Coda sets a limit of 500 rows per GET request (as of Dec 2018). If you want to retrieve more than 500 or retrieve a certain number of rows below 500 per request, you need to set a limit and send multiple GET requests by building a loop with the multiple pages node.

In the below example, it uses a delay node to keep some interval between each request (although the delay node is probably an overkill, as each response to a GET request takes a few seconds to arrive). Coda has rate limits, but the details are not disclosed . If you are planning on sending loads of requests, it might be a good idea to contact them and see if they can increase the limit for you. The email address is found in the API doc.

![Example of a flow with a loop using the multiple requests nodes](./doc/images/flow_multiple_requests.jpg)

```[{"id":"f859228c.39e1","type":"debug","z":"69eb5e38.bc12b","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":490,"y":520,"wires":[]},{"id":"2f33c89d.94e588","type":"inject","z":"69eb5e38.bc12b","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":100,"y":300,"wires":[["e10ba576.b999f8"]]},{"id":"320eeaeb.698006","type":"http request","z":"69eb5e38.bc12b","name":"","method":"GET","ret":"obj","url":"","tls":"","x":410,"y":380,"wires":[["bcd65a2c.f78c68"]]},{"id":"4e1e206a.bcd9e","type":"coda-io-get-data","z":"69eb5e38.bc12b","limit":"","get_rows":true,"name":"","x":210,"y":380,"wires":[["320eeaeb.698006"]]},{"id":"e10ba576.b999f8","type":"coda-io-connection","z":"69eb5e38.bc12b","bearer_api_token":"60684f89.27692","doc_id":"ef2900f.4a1f6","secondary_id":"","name":"","x":180,"y":340,"wires":[["4e1e206a.bcd9e"]]},{"id":"bcd65a2c.f78c68","type":"coda-io-multiple-pages","z":"69eb5e38.bc12b","name":"","x":280,"y":480,"wires":[["c1c56a9b.fcdb18"],["f859228c.39e1"]]},{"id":"c1c56a9b.fcdb18","type":"delay","z":"69eb5e38.bc12b","name":"","pauseType":"delay","timeout":"2","timeoutUnits":"seconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":500,"y":440,"wires":[["4e1e206a.bcd9e"]]},{"id":"60684f89.27692","type":"coda-io-connection-api-token","z":"","name":"My coda API token","api_token":"ADD YOUR API TOKEN HERE"},{"id":"ef2900f.4a1f6","type":"coda-io-connection-doc-id","z":"","name":"My document ID","doc_id":"ADD YOUR DOCUMENT ID HERE"}]```

## 3 Upsert
The upsert node can be used for the following scenarios:
- You want to aggregate tweets and store them in a coda table (insert)
- You have a table in two separate documents respectively. The number of records don't change and you want to sync the two (update)
- You have a table in two separate documents respectively. The number of records *does* change and you want to sync the two i.e. sometimes existing field values are updated, but sometimes new rows are added (upsert)

In order for the upsert node to format the data in the way coda accepts, you need to pass the data to the node in the following format:
```
[
    {
        "column name OR column ID 1": "value1",
        "column name OR column ID 2": "value2",
        "column name OR column ID 3": "value3"
        . . .
    },
    {
        "column name OR column ID 1": "value1",
        "column name OR column ID 2": "value2",
        "column name OR column ID 3": "value3"
        . . .
    }
    . . .
]
```

#### 3.1 How to set up the upsert flow

The below is written under the assumption that:
- you already have a flow that retrieves the data from some source (coda / twitter etc.)
- you have a custom function node that formats the retrieved data into the accepted format, as described above

1. add a new **connection settings** node and set it up to access the destination document and table
2. add a new **upsert** node, then specify the destination table's fields. Its settings page has three fields for storing column names/IDs of the destination table. This is done to run appropriate checks for different data types. Make sure to enter the column names/IDs correctly, or it will upsert will fail
3. If you wish to update rows, you must give the name/ID of the column whose value will be used as the key. You can use more than one column for as the key. Make sure a key / a combination of keys only points to a single row
4. Connect it to the 'http request' function node. Open it and set the method to POST, then set the return value to 'parsed JSON object'
5. Connect it to a debug node and set it to display the entire `msg` object, rather than the payload

If you see the response `202`, then the upsert request was a success. It may take a while before the changes appear in the destination table.

![Example of an upsert flow using the coda nodes](./doc/images/flow_upsert.jpg)

# TODO:
- [] Add an option to get folders. Currently only supports tables
- [] Build a coda row parser to feed coda row data into the upsert node
- [] Improve the code a bit

# CAUTION:
This package is still in its infancy. It is likely that, in the near future, non-backwards-compatible changes will be introduced without notice. When a new version becomes available, make sure to test it thoroughly in a separate development environment before installing the update to your production environment.
