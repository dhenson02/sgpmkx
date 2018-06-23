'use strict';

const sweetAlert = require("sweetalert");

const {
    emitEvent
} = require('./events');

const {
    Router
} = require("director/build/director");

const pages = require("./pages");

function verifyPath ( path ) {
    if ( !pages[ path ] ) {
        emitEvent("missing", path);
        return false;
    }
}

const routes = {
    '/': {
        on: function () {
            emitEvent("content.loading", "/", 0, "");
        }
    },
    '/(\\w+)': {
        on: function ( section ) {
            var path = "/" + section.replace(/\s/g, "");
            if ( verifyPath(path) ) {
                emitEvent("content.loading", path, 1, "");
            }
        },
        '/(\\w+)': {
            on: function ( section, program ) {
                var path = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "");
                if ( verifyPath(path) ) {
                    emitEvent("content.loading", path, 2, path);
                }
            },
            '/(\\w+)': {
                on: function ( section, program, page ) {

                    var parent = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, ""),
                        path = parent + "/" + page.replace(/\s/g, "");
                    if ( verifyPath(path) ) {
                        emitEvent("content.loading", path, 3, parent);
                    }
                },
                '/(\\w+)': {
                    on: function ( section, program, page, rabbitHole ) {
                        var parent = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, ""),
                            path = parent + "/" + page.replace(/\s/g, "") + "/" + rabbitHole.replace(/\s/g, "");
                        if ( verifyPath(path) ) {
                            emitEvent("content.loading", path, 4, parent);
                        }
                    }
                }
            }
        }
    }
};

const router = Router(routes);
const routerConfig = {
    'strict': false,
    'notfound': function () {
        sweetAlert({
            'title': "Oops",
            'text': "Page doesn't exist.  Sorry :( \nI'll redirect you to the homepage instead.",
            'timer': 2000,
            'showConfirmButton': false,
            'showCancelButton': false,
            'allowOutsideClick': true
        }, function () {
            router.setRoute("/");
        });
    }
};

router.configure(routerConfig);

module.exports = {
    router
};
