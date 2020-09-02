"use strict";

/**
 * Handles construction of request URL
 */

module.exports = class CodaReqestUrl {
    constructor(docId, secondaryType, secondaryId) {
        this.docId = docId;
        this.secondaryType = secondaryType;
        this.secondaryId = secondaryId;
    }

    /**
     * Returns a full URL for a request
     * 
     * @param {String} type The type of resource to request
     * @returns {String} A full request URL without the record limit
     */
    getRequestUrl(type) {

        // TODO: allow variables, not just hard-coded values
        // const attrs = ['doc_id', 'secondary_id', 'limit', 'get_rows'];
        // let val = '';
        // let attrVal = '';

        // for (let attr of attrs) {

        //     // Attempt matching only if the value is not boolean or null,
        //     // as it will fail otherwise
        //     if (_.isBoolean(n[attr]) === false && _.isNull(n[attr]) === false) {
        //         attrVal = n[attr].match(/msg\.[a-zA-Z0-9-_.]+/g);
        //     }

        //     // Request for rows if the user desires
        //     if(attr == 'get_rows') {
        //         n[attr] ? payload[attr] = true : false;
        //     }

        //     // Get the object member if a match is found in a user-provided string
        //     else if (attrVal !== null) {

        //         // Evaluates the string to return an object member
        //         val = eval(attrVal[0]);

        //         // Only accept number or string data types
        //         if (_.isNumber(val) || _.isString(val)) {
        //             payload[attr] = val;
        //         }
        //         else {
        //             console.log("Type error: Type of the value for " + attrVal + " must be string or number. " + typeof(val) + " was given instead. Field name: " + attr + ". The value wasn't included in the query string");
        //         }
        //     }
        //     else {
        //         payload[attr] = n[attr];
        //     }
        // }

        // Construct a query string

        let reqStr;
        let req = {};
        req.docs = this.docId;
        // Dynamically assign the secondary ID's type
        req[this.secondaryType] = this.secondaryId;

        // Request for rows or columns as per the setting. Ignore 'Nothing'
        if (type != 'nothing'){
            req[type] = null;
        }

        // If the doc_id is empty, pass only 'docs' to get a list of docs
        if (req.docs == '') {
            reqStr = 'docs'
        }
        // Otherwise construct a query
        else {
            for (let str in req) {
                if (req[str] != '' || req[str] != null) {
                    reqStr = (reqStr == undefined ? str : reqStr + '/' + str);
                    reqStr = (req[str] == null ? reqStr + '' : reqStr + '/' + req[str]);
                }
            }
        }
        
        return 'https://coda.io/apis/v1/' + reqStr;
    }

    /**
     * Specify the record limit, if the value is given. Otherwise set it to
     * 500, which is the current maximum set by Coda.
     * 
     * @param {number} limit The maximun number of records to return
     * @returns {number} Return the number between 1 - 500
     */
    specifyRecordLimit(limit) {
        const num = parseInt(limit);
        if (num != null && num > 0 && num <= 500) {
            return num;
        }
        else {
            return 500;
        }
    }

    /**
     * Receives an array of key-value pairs of query parameter elements and
     * returns as a string of query parameters be appended to a request.
     *
     * @param {Array} arr An array of key-value pairs of to be converted into
     *  a query string.
     * @returns {String} Returns a query string to be appended to a request
     *  without the leading '?'.
     */
    encodeQueryParams(arr) {
        const params = [];
        for (let kv in arr)
            params.push(encodeURIComponent(kv) + '=' + encodeURIComponent(arr[kv]));
        return params.join('&');
     }
}
