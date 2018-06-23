'use strict';

var reqwest = require('reqwest');
var sweetAlert = require('sweetalert');
var db = require('../db');
var pages = require('../pages');
var DOM = require('../dom');
var misc = require('../helpers');

const {
    emitEvent
} = require('./');


function loadContent ( data, path ) {
    // Prevent accidental load of previously clicked destination
    if ( DOM.state.nextPath !== path ) {
        return false;
    }
    emitEvent("content.loaded", data);
}

function verifyCorrectPage ( path ) {
    if ( DOM.state.contentSaving || DOM.state.contentChanging || DOM.state.path === path || DOM.state.nextPath === path ) {
        return false;
    }
    return true;
}

function getNewPath ( path, level, parent ) {
    if ( verifyCorrectPage(path) ) {
        DOM.setState({
            'nextPath': path,
            'nextLevel': level,
            'nextParent': parent,
            'contentChanging': true
        });

        return "/items(" + pages[path].ID + ")";
    }

    return '';
}

function handleContentLoading ( path, level, parent ) {
    var itemPath = getNewPath(path, level, parent);

    if ( !itemPath ) {
        return false;
    }

    return loadContent(db.getData(itemPath), path);
}

function handleContentLoadingNetwork ( path, level, parent ) {
    var itemPath = getNewPath(path, level, parent);

    if ( !itemPath ) {
        return false;
    }

    reqwest({
        'url': sitePath + itemPath,
        'method': "GET",
        'type': "json",
        'contentType': "application/json",
        'withCredentials': phLive,
        'headers': {
            "Accept": "application/json;odata=verbose",
            "text-Type": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose"
        },
        'success': function ( data ) {
            loadContent(data, path);
        },
        'error': function ( error ) {
            DOM.setState({
                nextPath: "",
                nextLevel: null,
                nextParent: "",
                contentChanging: false
            });
            console.log("error connecting:", error);
        }
    });
}

module.exports = {
    handler: handleContentLoading,
    networkHandler: handleContentLoadingNetwork
};
