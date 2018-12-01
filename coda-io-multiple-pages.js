"use strict";

module.exports = function(RED) {
    function codaIoMultiplePages(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            var payload = typeof msg.payload === 'object' ? msg.payload : {};

            let nextPage = false;
            if (typeof payload.nextPageLink !== 'undefined') {
                msg.coda.nextPageLink = payload.nextPageLink;
                nextPage = true;
            }

            if (typeof payload.nextPageToken !== 'undefined') {
                msg.coda.nextPageToken = parseInt(payload.nextPageToken, 10);
                nextPage = true;
            }

            // Merge all the results together
            if (msg.coda.results == null) {
                msg.coda.results = [];
            }

            let results = [];
            if (payload.items != null) {
                results = [...msg.coda.results, ...payload.items];
                msg.coda.results = results;
            }

            // If there is more than one page, then keep the pageToken value and
            // send the message through the first output
            if (nextPage === true) {
                msg.headers = {'Authorization': msg.coda.header};
                node.send([msg, null]);
            }
            // If there are no more pages, then finish and send the message
            // through the second output
            else {
                msg.payload.items = msg.coda.results;
                delete msg.coda.nextPageLink;
                delete msg.coda.nextPageToken;
                delete msg.coda.results;
                node.send([null, msg]);
            }
        });
    }
    RED.nodes.registerType("coda-io-multiple-pages", codaIoMultiplePages);
}
