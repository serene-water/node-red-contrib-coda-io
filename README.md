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


Coda's response is found in `msg.payload`. `msg.payload.items` is an array of all the tables found in the document. If the debug message gets cut off and you cannot see all the tables, simply increase the value of `debugMaxLength` in `settings.js`.

### 3. Get rows from a table
Once you found the ID of the table from which you want to get records, add the table ID to the coda node and tick the 'Get rows' checkbox.

Coda's response will be under `msg.payload.items`, which includes metadata of each row. Values of each row will be found in `msg.payload.items.values`.


#TODO:

- Build a node that handles upcert
