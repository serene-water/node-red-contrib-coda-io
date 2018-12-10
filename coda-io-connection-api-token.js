module.exports = function(RED) {
    function CodaIoConnectionApiTokenNode(n) {
        RED.nodes.createNode(this, n);
        this.api_token = this.credentials.api_token;
    }
    RED.nodes.registerType("coda-io-connection-api-token", CodaIoConnectionApiTokenNode, {
        // Store the credential separate to the main flow file
        // so it won't be exported along with the flow
        credentials: {
            api_token: {type:"api_token"}
        }
    });
}
