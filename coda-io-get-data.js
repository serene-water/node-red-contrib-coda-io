"use strict";

var _ = require('lodash');

module.exports = function(RED) {

    function CodaIoGetDataNode(n) {

        RED.nodes.createNode(this, n);
        let node = this;
        node.on('input', function(msg) {

            // If nextPageLink is given, use the lind to request
            if (typeof msg.coda.nextPageLink !== 'undefined') {
                msg.url = msg.coda.nextPageLink;
            }
            // Construct a request URL from scratch
            else {
                const CodaReqestUrl = require('./core.js');
                let coda = new CodaReqestUrl(msg.coda.doc_id, msg.coda.secondary_type, msg.coda.secondary_id);
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
