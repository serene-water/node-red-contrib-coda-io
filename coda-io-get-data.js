"use strict";

var _ = require('lodash');

module.exports = function(RED) {

    function CodaIoTableNode(n) {

        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            // node.warn('Initial run');
            // var payload = typeof msg.payload === 'object' ? msg.payload : {};

            // let req = {
            //     'docs': payload.doc_id,
            //     'tables': payload.table_id
            // }

            // // Get rows only if the table ID is given and the user requests for it
            // if (payload.get_rows === true && payload.table_id != '') {
            //     req.rows = null;
            // }

            if (typeof msg.coda.nextPageLink !== 'undefined') {
                msg.url = msg.coda.nextPageLink;
            }
            else {
                const CodaReqestUri = require('./core.js');
                let coda = new CodaReqestUri(msg.coda.doc_id, msg.coda.secondary_id);
                let uri = coda.getRequestUri(n.get_rows);
                msg.url = coda.appendLimit(uri, n.limit);
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-get-data", CodaIoTableNode);
}
