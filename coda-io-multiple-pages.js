module.exports = function(RED) {
    function codaIoMultiplePages(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            msg1 = msg2 = {};

            let nextPage = false;
            if (msg.payload.nextPageLink =! null && msg.payload.nextPageLink !== true) {
                nextPage = true;
            }

            // merge all the results together
            if (msg.coda.results == null) {
                msg.coda.results = [];
            }
            let results = [...msg.coda.results, ...msg.payload.items];
            msg.coda.results = results;


            // If there is more than one page, then keep the pageToken value and loop
            if (nextPage === true) {
                node.warn('continuing');
                // msg.coda.nextPageLink = msg.payload.nextPageLink;
                // return [msg, null];
                msg1 = msg;
                // node.send([msg, null]);
            }
            // If there are no more pages, then finish
            else {
                node.warn('ending');
                // msg.coda.nextPage = '';
                // return [null, msg];
                msg2 = msg;

            }
            node.send([msg1, msg2]);
        });
    }
    RED.nodes.registerType("coda-io-multiple-pages", codaIoMultiplePages);
}
