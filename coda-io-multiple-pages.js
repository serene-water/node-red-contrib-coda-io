"use strict";

module.exports = function(RED) {
    function codaIoMultiplePages(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            var payload = typeof msg.payload === 'object' ? msg.payload : {};

            let msg1 = {};
            let msg2 = {};

            let nextPage = false;
            if (typeof msg.payload.nextPageLink !== 'undefined') {
                msg.coda.nextPageLink = msg.payload.nextPageLink;
                nextPage = true;
            }
            node.warn(msg.payload.nextPageToken)
            if (typeof msg.payload.nextPageToken !== 'undefined') {   
                msg.coda.nextPageToken = parseInt(msg.payload.nextPageToken, 10);
                nextPage = true;
            }

            // merge all the results together
            if (msg.coda.results == null) {
                msg.coda.results = [];
            }
            let results = [...msg.coda.results, ...msg.payload.items];
            msg.coda.results = results;

            // If there is more than one page, then keep the pageToken value and 
            // send the message through the first output
            if (nextPage === true) {
                node.warn('continuing');
                msg1 = msg;
            }
            // If there are no more pages, then finish and send the message
            // through the second output
            else {
                node.warn('ending');
                delete msg.coda.nextPageLink;
                delete msg.coda.nextPageToken;
                delete msg.coda.results;
                msg2 = msg;
            }
            node.send([msg1, msg2]);
        });
    }
    RED.nodes.registerType("coda-io-multiple-pages", codaIoMultiplePages);
}
