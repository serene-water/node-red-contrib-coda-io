"use strict";

module.exports = function(RED) {

    function CodaIoTableNode(n) {

        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {
            msg.coda = {header: ''};
            msg.headers = {};
            msg.headers['Authorization'] = 'Bearer ' + n.bearer_api_token;
            msg.coda.header = msg.headers['Authorization'];

            //TODO: handle folders
            msg.coda.doc_id = n.doc_id;
            msg.coda.secondary_id = n.secondary_id;

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-connection", CodaIoTableNode);
}
