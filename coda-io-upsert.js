"use strict";
module.exports = function(RED) {

    function codaIoUpsert(n) {

        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {

            var payload = typeof msg.payload === 'object' ? msg.payload : {};
            const pl = msg.payload.results;

            // List of fields whose value doesn't need any modifications
            const fields = n.no_conv.split(',');

            // Fields whose values contain URI elements and need to be encoded
            const uriFields = n.char_conv.split(',');

            // Numeric fields
            const numFields = n.num_val.split(',');

            // Merge all the arrays together
            let allFields = [...fields, ...uriFields, ...numFields];

            let rows = [];
            let rowNum = 0

            pl.forEach((plArr) => {

                let i = 0;
                cells = [];

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

                //TODO: delete
                const aggrDate = new Date().toISOString().slice(0,10);
                // Set aggregation date 
                let dateInfo = {
                    'column': 'signify_aggregation_date',
                    'value': aggrDate
                };
                cells.push(dateInfo);

                // Set query name
                // let queryName = {
                //     'column': 'query_name',
                //     'value': msg.buzzSumo.qstr[msg.coda.colNameId]
                // }
                // cells.push(queryName);

                rows[rowNum] = {'cells': cells};
                rowNum++;

            })

            msg.payload = {'rows': rows};
            if (n.key_cols != '') {
                msg.payload.keyColumns = n.key_cols;
            }
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
