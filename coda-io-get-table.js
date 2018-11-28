module.exports = function(RED) {
    function CodaIoTableNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {

            msg.coda = {};
////


var creds = RED.nodes.getNode(n.creds);

var payload = typeof msg.payload === 'object' ? msg.payload : {};

var attrs = ['bearer_api_token', 'doc_id', 'table_id', 'get_rows'];

var attrVal = '';
var val = ''
for (var attr of attrs) {

    // Attempt matching only if the value is not boolean or null
    // as it will fail otherwise
    if (_.isBoolean(n[attr]) === false && _.isNull(n[attr]) === false) {
        attrVal = n[attr].match(/msg\.[a-zA-Z0-9-_.]+/g);
    }

    // Request for rows if the user desires
    if(attr == 'get_rows') {
        n[attr] ? payload[attr] = "rows" : '';
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
            node.warn("Type error: Type of the value for " + attrVal + " must be string or number. " + typeof(val) + " was given instead. Field name: " + attr + ". The value wasn't included in the search string");
        }
    }

    else {
        payload[attr] = n[attr];
    }
}
        msg.coda = {};
        msg.coda.qstr = payload;

////
            node.send(msg);
        });
    }
    RED.nodes.registerType("node-red-table", CodaIoTableNode);
}
