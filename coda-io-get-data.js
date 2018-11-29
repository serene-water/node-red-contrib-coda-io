var _ = require('lodash');

module.exports = function(RED) {

    function CodaIoTableNode(n) {

        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            if (msg.payload.nextPageLink != null) {
                node.warn('nextPageLink available');
                msg.url = msg.payload.nextPageLink;
                msg.payload = {};
                msg.headers = {};  // initialise
                msg.headers['Authorization'] = msg.coda.headers.auth;
            }
            else {
                node.warn('Initial run');
                var payload = typeof msg.payload === 'object' ? msg.payload : {};
                var attrs = ['bearer_api_token', 'doc_id', 'table_id', 'limit', 'get_rows'];
                var val = attrVal = '';

                for (var attr of attrs) {

                    // Attempt matching only if the value is not boolean or null,
                    // as it will fail otherwise
                    if (_.isBoolean(n[attr]) === false && _.isNull(n[attr]) === false) {
                        attrVal = n[attr].match(/msg\.[a-zA-Z0-9-_.]+/g);
                    }

                    // Request for rows if the user desires
                    if(attr == 'get_rows') {
                        n[attr] ? payload[attr] = true : false;
                    }

                    // Get the object member if a match is found in a user-provided string
                    else if (attrVal !== null) {

                        // Evaluates the string to return an object member
                        val = eval(attrVal[0]);

                        // Only accept number or string data types
                        if (_.isNumber(val) || _.isString(val)) {
                            payload[attr] = val;
                        }
                        else {
                            console.log("Type error: Type of the value for " + attrVal + " must be string or number. " + typeof(val) + " was given instead. Field name: " + attr + ". The value wasn't included in the query string");
                        }
                    }
                    else {
                        payload[attr] = n[attr];
                    }
                }

                msg.coda = {headers: {}};

                // HTTP header
                msg.headers = {};
                msg.headers['Authorization'] = 'Bearer ' + payload.bearer_api_token;
                msg.coda.headers.auth = msg.headers['Authorization'];

                let req = {
                    'docs': payload.doc_id,
                    'tables': payload.table_id
                }

                // Get rows only if the table ID is given and the user requests for it
                if (payload.get_rows === true && payload.table_id != '') {
                    req.rows = null;
                }

                // Set the limit of number of rows to retrieve
                let limit = "?limit=";
                const num = parseInt(payload.limit)
                if (num != null && num <= 500) {
                     limit = limit + num;
                }
                else {
                    limit = limit + 500;
                }

                // If there are multiple pages, construct a query with a page token
                let nextPage = '';
                if (msg.coda.nextPage != null && _.isNumber(msg.coda.nextPage)) {
                    nextPage = "&pageToken=" + msg.coda.nextPage;
                }

                // Construct a query string
                let reqStr;
                for(var i in req){
                    reqStr = (reqStr == undefined ? i : reqStr + '/' + i);
                    reqStr = (req[i] == null ? reqStr + '' : reqStr + '/' + req[i]);
                }
                // Keep reqStr in case it is needed later
                msg.coda.reqStr = reqStr;

                msg.url = 'https://coda.io/apis/v1beta1/' + reqStr + limit + nextPage;

            }

            node.warn(msg);
            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-get-data", CodaIoTableNode);
}
