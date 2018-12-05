"use strict";

var _ = require('lodash');

module.exports = function(RED) {

    function CodaIoGetDataNode(n) {

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
                msg.url = coda.getRequestUrl(n.get_rows);
                if (n.get_rows === true) {
                    msg.url = coda.appendLimit(msg.url, n.limit);
                }
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-get-data", CodaIoGetDataNode);
}
