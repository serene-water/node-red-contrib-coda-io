"use strict";

module.exports = function(RED) {

    function CodaIoConnection(n) {

        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            const connCreds = RED.nodes.getNode(n.bearer_api_token);
            const api_token = connCreds.api_token;

            msg.coda = {header: ''};
            msg.headers = {};
            msg.headers['Authorization'] = 'Bearer ' + api_token;
            msg.coda.header = msg.headers['Authorization'];

            //TODO: handle folders
            const connDocId = RED.nodes.getNode(n.doc_id);
            msg.coda.doc_id = connDocId.doc_id;
            msg.coda.secondary_id = n.secondary_id;
            msg.coda.secondary_type = n.secondary_type;

            // Clean up if there is any remnants from previous requests
            delete msg.responseUrl;
            delete msg.statusCode;
            delete msg.responseCookies;

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-connection", CodaIoConnection);
}
