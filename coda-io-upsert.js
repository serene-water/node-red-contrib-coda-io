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

                    // Encode the values
                    if (inArray(fieldName, uriFields)) {
                        plArr[fieldName] = encodeURI(plArr[fieldName]);
                    }

                    // Replace null with 0
                    else if (inArray(fieldName, numFields) && plArr[fieldName] === null) {
                        plArr[fieldName] = 0;
                    }

                    // Replace null with another value
                    if (inArray(fieldName, allFields) && plArr[fieldName] === null) {
                        plArr[fieldName] = n.null_val;
                    }

                    cells[i] = {
                        'column': fieldName,
                        'value': plArr[fieldName]
                    }

                    i++;
                });

                rows[rowNum] = {'cells': cells};
                rowNum++;

            })

            msg.payload = {'rows': rows};
            if (n.key_cols.length != '') {
                let key_cols = n.key_cols.split(',');
                key_cols = key_cols.map(Function.prototype.call, String.prototype.trim);
                msg.payload.keyColumns = key_cols;
            }

            // Finally, construct the URI
            const CodaReqestUri = require('./core.js');
            let coda = new CodaReqestUri(msg.coda.doc_id, msg.coda.secondary_id);
            msg.url = coda.getRequestUri(true);

            node.send(msg);
        });
    }
    RED.nodes.registerType("coda-io-upsert", codaIoUpsert);
}

/**
 * search for a value in an array
 */

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
