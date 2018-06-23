/*
'use strict';

var DOM = require('../dom');

function handleAfterPageLoaded () {
    DOM.init();
    if ( window.location.hash ) {
        router.init();
    }
    else {
        router.init("/");
    }
}

module.exports = {
    handler: handleAfterPageLoaded,
    networkHandler: handleAfterPageLoaded
};
*/
