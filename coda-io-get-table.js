var _ = require('lodash');

module.exports = function(RED) {

    function CodaIoTableNode(n) {

        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            var payload = typeof msg.payload === 'object' ? msg.payload : {};
            var attrs = ['bearer_api_token', 'doc_id', 'table_id', 'get_rows'];
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
                // No checks necessary
                else {
                    payload[attr] = n[attr];
                }
            }

            // HTTP header
            msg.headers = {};
            msg.headers['Authorization'] = 'Bearer ' + payload.bearer_api_token;

            let req = {
                'docs': payload.doc_id,
                'tables': payload.table_id
            }
            // Get rows only if the table ID is given and the user requests for it
            if (payload.get_rows === true && payload.table_id != '') {
                req.rows = '';
            }

            // Construct a query string
            let reqStr;
            for(var i in req){
                reqStr = (reqStr == undefined ? i : reqStr + '/' + i);
                reqStr = (req[i] == null ? reqStr + '' : reqStr + '/' + req[i]);
            }
            // Keep reqStr in case it is needed later
            msg.coda = {};
            msg.coda.reqStr = reqStr;

            msg.url = 'https://coda.io/apis/v1beta1/' + reqStr;

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-get-table", CodaIoTableNode);
}
