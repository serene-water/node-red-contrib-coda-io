module.exports = function(RED) {
    function CodaIoConnectionApiTokenNode(n) {
        RED.nodes.createNode(this,n);
        this.api_token = n.api_token;
    }
    RED.nodes.registerType("coda-io-connection-api-token", CodaIoConnectionApiTokenNode);
}
