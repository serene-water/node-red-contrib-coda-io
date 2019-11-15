"use strict";
module.exports = function(RED) {

    function codaIoUpsert(n) {

        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            const pl = typeof msg.payload === 'object' ? msg.payload : {};

            // TODO: Improve - this bit is repetitive and inefficient
            // List of fields whose value doesn't need any modifications
            let rawFields = n.coda_cnf_field_no_conv.split(',');
            rawFields = rawFields.map(Function.prototype.call, String.prototype.trim);

            // Fields whose values contain URI elements and need to be encoded
            let uriFields = n.coda_cnf_field_char_conv.split(',');
            uriFields = uriFields.map(Function.prototype.call, String.prototype.trim);

            // Numeric fields
            let numFields = n.coda_cnf_field_num_val.split(',');
            numFields = numFields.map(Function.prototype.call, String.prototype.trim);

            // Merge all the arrays together, then remove empty elements
            const allFields = [...rawFields, ...uriFields, ...numFields].filter(val =>  val !== '');
            let rows = [];
            let rowNum = 0

            pl.forEach((plArr) => {

                let i = 0;
                let cells = [];

                // Process only the fields and values that are relevant
                allFields.forEach((fieldName) => {

                    // Contains URI elements. Encode the values
                    if (uriFields.find(element => element == fieldName) && plArr[fieldName] !== null) {
                        plArr[fieldName] = encodeURI(plArr[fieldName]);
                    }

                    // Replace null with 0
                    else if (numFields.find(element => element == fieldName) && plArr[fieldName] === null) {
                        plArr[fieldName] = 0;
                    }

                    // Replace null with another value because upsert will fail
                    // if null is given
                    if (plArr[fieldName] === null) {
                        plArr[fieldName] = n.null_val;
                    }

                    cells[i] = {
                        'column': fieldName,
                        'value': plArr[fieldName]
                    }

                    i++;
                });

                // Store all the cells in a single row
                rows[rowNum] = {'cells': cells};
                rowNum++;
            })

            msg.payload = {'rows': rows};

            // If a key/keys are given for upsert, trim and store as an array
            if (n.key_cols.length != '') {
                let key_cols = n.key_cols.split(',');
                key_cols = key_cols.map(Function.prototype.call, String.prototype.trim);
                msg.payload.keyColumns = key_cols;
            }

            // Set the auth header again, in case it was previously set
            // by the connection node and we are connecting to the same doc.
            //
            // If one wishes to connect to a different doc / table etc., then
            // they must set it using a new connection node
            if (msg.coda.headerBearer != null) {
                msg.headers = {};
                msg.headers['Authorization'] = msg.coda.headerBearer;
            }

            // Finally, construct the URL
            const CodaReqestUrl = require('./core.js');
            let coda = new CodaReqestUrl(msg.coda.doc_id, msg.coda.secondary_type, msg.coda.secondary_id);
            msg.url = coda.getRequestUrl('rows');

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-upsert", codaIoUpsert);
}
