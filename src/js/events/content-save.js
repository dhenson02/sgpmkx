'use strict';

var reqwest = require('reqwest');
var sweetAlert = require('sweetalert');
var db = require('../db');
var pages = require('../pages');
var DOM = require('../dom');
var misc = require('../helpers');

function transitionPageContent () {
    if ( DOM.state.contentSaving || DOM.state.contentChanging ) {
        return '';
    }
    DOM.setState({
        saveText: "...saving...",
        saveStyle: {
            color: "#00B16A",
            backgroundColor: "#FFFFFF"
        },
        contentSaving: true
    }, true, true, false, false);

    var pubs = "", pub;
    while ( pub = misc.regPubs.exec(pages.current.Policy) ) {
        pubs = pubs
            ? pubs + "," + pub
            : pub;
    }

    pages.current.set({
        Pubs: pubs,
        Modified: new Date()
    });

    return "/items(" + pages.current.ID + ")";
}

function getContentData ( itemPath ) {
    var id = ~~itemPath.replace(/\/items\((\d+)\)/, '$1');

    var data = {
        'ID': id,
        'Id': id,
        '__metadata': {
            'type': pages.current.listItemType
        },
        'Title': pages.current.Title,
        'Pubs': pages.current.Pubs,
        'Tags': pages.current.Tags,
        'Overview': pages.current.Overview,
        'Policy': pages.current.Policy,
        'Training': pages.current.Training,
        'Resources': pages.current.Resources,
        'Tools': pages.current.Tools,
        'Contributions': pages.current.Contributions
    };

    return data;
}

function showContentSaveSuccess () {
    DOM.setState({
        saveText: "Saved!",
        saveStyle: {
            backgroundColor: "#00B16A",
            color: "#FFFFFF"
        },
        contentSaving: false
    }, true, true, false, false);
}

function showContentSaveComplete () {
    setTimeout(function () {
        DOM.setState({
            saveText: "Save",
            saveStyle: {
                color: "#FFFFFF",
                backgroundColor: "#00B16A"
            }
        }, true, true, false, false);
    }, 500);
}

function showContentSaveFailure ( error ) {
    sweetAlert({
        title: "Failure",
        text: misc.md.renderInline(pages.current.Title + " **was not** able to be saved"),
        type: "fail",
        showCancelButton: false,
        html: true
    });
    DOM.setState({
        saveText: "Failed :(",
        saveStyle: {
            backgroundColor: "#ec6c62",
            color: "#FFFFFF"
        },
        contentSaving: false
    }, true, true, false, false);
    console.log("Content save error: ", error);
}

function handleContentSave () {
    var itemPath = transitionPageContent();
    var data = getContentData(itemPath);

    db.saveItem(data);

    showContentSaveSuccess();
    showContentSaveComplete();
}

function handleContentSaveNetwork () {
    var itemPath = transitionPageContent();
    var data = getContentData(itemPath);

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
                    showContentSaveSuccess();
                },
                error: function ( error ) {
                    showContentSaveFailure(error);
                },
                complete: function () {
                    showContentSaveComplete();
                }
            });
        },
        error: function ( error ) {
            sweetAlert({
                title: "Failure",
                text: misc.md.renderInline(pages.current.Title + " **was not** able to be saved"),
                type: "fail",
                showCancelButton: false,
                html: true
            });
            DOM.setState({
                saveText: "Failed :(",
                saveStyle: {
                    backgroundColor: "#ec6c62",
                    color: "#FFFFFF"
                },
                contentSaving: false
            }, true, true, false, false);
            console.log("Content save error (couldn't get digest): ", error);
            setTimeout(function () {
                DOM.setState({
                    saveText: "Save",
                    saveStyle: {
                        color: "#FFFFFF",
                        backgroundColor: "#00B16A"
                    }
                }, true, true, false, false);
            }, 500);
        }
    });
}

module.exports = {
    handler: handleContentSave,
    networkHandler: handleContentSaveNetwork
};
