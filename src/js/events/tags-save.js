'use strict';

var reqwest = require('reqwest');
var sweetAlert = require('sweetalert');
var db = require('../db');
var pages = require('../pages');
var DOM = require('../dom');
var misc = require('../helpers');

function handleTagsSave ( tags ) {
    DOM.setState({
        tagsChanging: true
    }, true, true, false, true);

    var data = {
        'ID': pages.current.ID,
        '__metadata': {
            'type': pages.current.listItemType
        },
        'Tags': tags
    };

    db.saveItem(data);

    pages.current.set({
        Tags: tags
    });
    DOM.setState({
        tagsChanging: false
    }, true, true, false, true);
}

function handleTagsSaveNetwork ( tags ) {
    DOM.setState({
        tagsChanging: true
    }, true, true, false, true);

    var data = {
        '__metadata': {
            'type': pages.current.listItemType
        },
        'Tags': tags
    };

    var itemPath = "/items(" + pages.current.ID + ")";

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
                url: sitePath + itemPath,
                method: "POST",
                data: JSON.stringify(data),
                type: "json",
                withCredentials: phLive,
                headers: {
                    "X-HTTP-Method": "MERGE",
                    "Accept": "application/json;odata=verbose",
                    "text-Type": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": ctx.d.GetContextWebInformation.FormDigestValue,
                    "IF-MATCH": "*"
                },
                success: function () {
                    pages.current.set({
                        Tags: tags
                    });
                },
                error: function ( error ) {
                    sweetAlert({
                        title: "Failure",
                        text: misc.md.renderInline("Tag(s) **not** able to be saved"),
                        type: "fail",
                        showCancelButton: false,
                        html: true
                    });
                    console.log("Tags save error: ", error);
                    console.log("Tags: ", tags);
                },
                complete: function () {
                    DOM.setState({
                        tagsChanging: false
                    }, true, true, false, true);
                }
            });
        },
        error: function ( error ) {
            sweetAlert({
                title: "Failure",
                text: misc.md.renderInline("Tag(s) **not** able to be saved"),
                type: "fail",
                showCancelButton: false,
                html: true
            });
            console.log("Tags save error (couldn't get digest): ", error);
            console.log("Tags: ", tags);
            DOM.setState({
                tagsChanging: false
            }, true, true, false, true);
        }
    });
}

module.exports = {
    handler: handleTagsSave,
    networkHandler: handleTagsSaveNetwork
};
