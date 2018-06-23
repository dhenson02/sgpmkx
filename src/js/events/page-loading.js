'use strict';

var reqwest = require('reqwest');
var sweetAlert = require('sweetalert');
var db = require('../db');
var pages = require('../pages');
var misc = require("../helpers");

function loadPage ( data ) {
    pages.init(data);
    if ( misc.codeMirror && pages.options.hideEmptyTabs === true && pages.options.emptyTabsNotify === true ) {
        sweetAlert({
            title: "Tabs missing?",
            text: misc.md.renderInline("Only tabs with content in them are visible.  To view all tabs, simply click `Show editor`.\n\n Adjust this behavior through the [Options list](/kj/kx7/PublicHealth/Lists/Options)"),
            type: "info",
            html: true,
            showCancelButton: false,
            confirmButtonText: "Got it!"
        });
    }
}

function handlePageLoading () {
    loadPage(db.getData('/items'));
}

function handlePageLoadingNetwork () {
    reqwest({
        url: sitePath + "/items/?$select=ID,Title,Icon,Section,Program,Page,rabbitHole,Policy,Tags,Link,Created,Modified,Published",
        method: "GET",
        type: "json",
        contentType: "application/json",
        withCredentials: phLive,
        headers: {
            "Accept": "application/json;odata=verbose",
            "text-Type": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose"
        },
        success: function ( data ) {
            loadPage(data);
        },
        error: function ( error ) {
            console.log("error connecting:", error);
        }
    });
}

module.exports = {
    handler: handlePageLoading,
    networkHandler: handlePageLoadingNetwork
};

