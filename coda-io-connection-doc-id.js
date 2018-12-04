module.exports = function(RED) {
    function CodaIoConnectionDocIdNode(n) {
        RED.nodes.createNode(this, n);
        this.doc_id = n.doc_id;
    }
    RED.nodes.registerType("coda-io-connection-doc-id", CodaIoConnectionDocIdNode);
}
