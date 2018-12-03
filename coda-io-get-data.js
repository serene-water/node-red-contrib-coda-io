"use strict";

var _ = require('lodash');

module.exports = function(RED) {

    function CodaIoTableNode(n) {

        RED.nodes.createNode(this, n);
        let node = this;
        node.on('input', function(msg) {

            if (typeof msg.coda.nextPageLink !== 'undefined') {
                msg.url = msg.coda.nextPageLink;
            }
            else {
                // Construct the URL
                const CodaReqestUrl = require('./core.js');
                let coda = new CodaReqestUrl(msg.coda.doc_id, msg.coda.secondary_id);
                let url = coda.getRequestUrl(n.get_rows);
                msg.url = coda.appendLimit(url, n.limit);
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-get-data", CodaIoTableNode);
}
