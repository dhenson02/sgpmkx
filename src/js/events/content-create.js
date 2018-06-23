'use strict';

var reqwest = require('reqwest');
var sweetAlert = require('sweetalert');
var db = require('../db');
var pages = require('../pages');
var DOM = require('../dom');
var misc = require('../helpers');

function handleCreate ( data, path, title ) {
    // Used for authentication - not needed with no live network data
    // var ctx = db.getData(phContext + "/_api/contextinfo");

    db.saveItem(data);
    // .getData('/items');  // only needed if we want to return the new list

    sweetAlert({
        title: "Success!",
        text: misc.md.renderInline(title + " was created at [" + path + "](#" + path + ")"),
        type: "success",
        showConfirmButton: false,
        showCancelButton: false,
        html: true
    });
}

function handleCreateNetwork ( data, path, title ) {
    reqwest({
        url: baseURL + phContext + "/_api/contextinfo",
        method: "POST",
        withCredentials: phLive,
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        },
        success: function ( ctx ) {
            reqwest({
                url: sitePath + "/items",
                method: "POST",
                data: JSON.stringify(data),
                type: "json",
                contentType: "application/json",
                withCredentials: phLive,
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "text-Type": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": ctx.d.GetContextWebInformation.FormDigestValue
                },
                success: function () {
                    sweetAlert({
                        title: "Success!",
                        text: misc.md.renderInline(title + " was created at [" + path + "](#" + path + ")"),
                        type: "success",
                        showConfirmButton: false,
                        showCancelButton: false,
                        html: true
                    });
                },
                error: function ( error ) {
                    sweetAlert({
                        title: "Failure",
                        text: misc.md.renderInline(title + " **was not** created at *" + path + "*"),
                        type: "fail",
                        showCancelButton: false,
                        html: true
                    });
                    console.log(error);
                }
            });
        },
        error: function ( error ) {
            sweetAlert({
                title: "Failure",
                text: misc.md.renderInline(title + " **was not** created at *" + path + "*"),
                type: "fail",
                showCancelButton: false,
                html: true
            });
            console.log("Error getting new digest: ", error);
        }
    });
}

module.exports = {
    handler: handleCreate,
    networkHandler: handleCreateNetwork
};
