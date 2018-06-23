'use strict';

var reqwest = require('reqwest');
var sweetAlert = require('sweetalert');
var db = require('../db');
var pages = require('../pages');
var DOM = require('../dom');
var misc = require('../helpers');


function handleTitleSave ( titleInput ) {
    title = titleInput.replace(misc.regSanitize, "");
    if ( title === pages.current._title || DOM.state.titleChanging || !pages.options.saveTitleAfterEdit ) {
        return false;
    }

    DOM.setState({
        titleChanging: true,
        titleStyle: {
            borderBottomColor: "#FF9000",
            color: "#FF9000"
        }
    }, true, true, true, false);

    var data = {
        'ID': pages.current.ID,
        '__metadata': {
            'type': pages.current.listItemType
        },
        'Title': title
    };

    db.saveItem(data);

    pages.current.set({
        Title: title,
        _title: title
    });
    document.title = title;
    DOM.setState({
        titleStyle: {
            borderBottomColor: "#00B16A",
            color: "#00B16A"
        }
    }, false, true, true, false);

    // Change UI back after 500ms
    setTimeout(function () {
        DOM.setState({
            titleChanging: false,
            titleStyle: {}
        }, true, true, true, false);
    }, 500);
}

function handleTitleSaveNetwork ( titleInput ) {
    title = titleInput.replace(misc.regSanitize, "");
    if ( title === pages.current._title || DOM.state.titleChanging || !pages.options.saveTitleAfterEdit ) {
        return false;
    }
    DOM.setState({
        titleChanging: true,
        titleStyle: {
            borderBottomColor: "#FF9000",
            color: "#FF9000"
        }
    }, true, true, true, false);

    var data = {
        '__metadata': {
            'type': pages.current.listItemType
        },
        'Title': title
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
                        Title: title,
                        _title: title
                    });
                    document.title = title;
                    DOM.setState({
                        titleStyle: {
                            borderBottomColor: "#00B16A",
                            color: "#00B16A"
                        }
                    }, false, true, true, false);
                },
                error: function ( error ) {
                    sweetAlert({
                        title: "Failure",
                        text: misc.md.renderInline(title + " **was not** able to be saved"),
                        type: "fail",
                        showCancelButton: false,
                        html: true
                    });
                    DOM.setState({
                        titleStyle: {
                            borderBottomColor: "#EC6C62",
                            color: "#EC6C62"
                        }
                    }, true, true, true, false);
                    console.log("Title save error: ", error);
                },
                complete: function () {
                    setTimeout(function () {
                        DOM.setState({
                            titleChanging: false,
                            titleStyle: {}
                        }, true, true, true, false);
                    }, 500);
                }
            });
        },
        error: function ( error ) {
            sweetAlert({
                title: "Failure",
                text: misc.md.renderInline(title + " **was not** able to be saved"),
                type: "fail",
                showCancelButton: false,
                html: true
            });
            console.log("Title save error (couldn't get digest): ", error);
            DOM.setState({
                titleStyle: {
                    borderBottomColor: "#EC6C62",
                    color: "#EC6C62"
                }
            }, true, true, true, false);
            setTimeout(function () {
                DOM.setState({
                    titleChanging: false,
                    titleStyle: {}
                }, true, true, true, false);
            }, 500);
        }
    });
}

module.exports = {
    handler: handleTitleSave,
    networkHandler: handleTitleSaveNetwork
};
