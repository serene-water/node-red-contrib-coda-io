"use strict";

const _ = require('lodash');

module.exports = function(RED) {

    function CodaIoGetDataNode(n) {

        RED.nodes.createNode(this, n);
        let node = this;
        node.on('input', function(msg) {

            // Set the auth header again, in case it was previously set
            // by the connection node and we are connecting to the same doc.
            //
            // If one wishes to connect to a different doc / table etc., then
            // they must set it using a new connection node
            if (msg.coda.headerBearer != null) {
                msg.headers = {};
                msg.headers['Authorization'] = msg.coda.headerBearer;
            }

            // If nextPageLink is given, use the lind to request
            if (typeof msg.coda.nextPageLink !== 'undefined') {
                msg.url = msg.coda.nextPageLink;
            }
            // Construct a request URL from scratch
            else {
                const CodaReqestUrl = require('./core.js');
                let coda = new CodaReqestUrl(msg.coda.doc_id, msg.coda.secondary_type, msg.coda.secondary_id);

                msg.url = coda.getRequestUrl(n.request_for);

                // If the secondary type is table and the rows option is selected
                // get the rows.
                if (msg.coda.secondary_type == 'tables' && n.request_for == 'rows') {

                    const limit = coda.specifyRecordLimit(n.limit);

                    // If query parameters are provided, join it with the
                    // limit. Otherwise only supply the limit as the parameter.
                    let params = {};

                    if (typeof msg.coda.params === 'object') {
                        msg.coda.params.limit = limit;
                        params = coda.encodeQueryParams(msg.coda.params);
                    }
                    else {
                        let limitParam = {'limit': limit};
                        params = coda.encodeQueryParams(limitParam);

                    }

                    msg.url = msg.url + '?' + params;

                }
                else if (msg.coda.secondary_type != 'tables' && n.request_for == 'rows') {
                    node.error('Requesting for rows while a table information was not supplied in the "Connection settings" node. Make sure the option "Table" is selected in the "Connection settings" node.', err);
                }
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-get-data", CodaIoGetDataNode);
}
