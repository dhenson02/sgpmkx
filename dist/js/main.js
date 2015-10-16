(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        (function(exports) {
            var dloc = document.location;
            function dlocHashEmpty() {
                return dloc.hash === "" || dloc.hash === "#";
            }
            var listener = {
                mode: "modern",
                hash: dloc.hash,
                history: false,
                check: function() {
                    var h = dloc.hash;
                    if (h != this.hash) {
                        this.hash = h;
                        this.onHashChanged();
                    }
                },
                fire: function() {
                    if (this.mode === "modern") {
                        this.history === true ? window.onpopstate() : window.onhashchange();
                    } else {
                        this.onHashChanged();
                    }
                },
                init: function(fn, history) {
                    var self = this;
                    this.history = history;
                    if (!Router.listeners) {
                        Router.listeners = [];
                    }
                    function onchange(onChangeEvent) {
                        for (var i = 0, l = Router.listeners.length; i < l; i++) {
                            Router.listeners[i](onChangeEvent);
                        }
                    }
                    if ("onhashchange" in window && (document.documentMode === undefined || document.documentMode > 7)) {
                        if (this.history === true) {
                            setTimeout(function() {
                                window.onpopstate = onchange;
                            }, 500);
                        } else {
                            window.onhashchange = onchange;
                        }
                        this.mode = "modern";
                    } else {
                        var frame = document.createElement("iframe");
                        frame.id = "state-frame";
                        frame.style.display = "none";
                        document.body.appendChild(frame);
                        this.writeFrame("");
                        if ("onpropertychange" in document && "attachEvent" in document) {
                            document.attachEvent("onpropertychange", function() {
                                if (event.propertyName === "location") {
                                    self.check();
                                }
                            });
                        }
                        window.setInterval(function() {
                            self.check();
                        }, 50);
                        this.onHashChanged = onchange;
                        this.mode = "legacy";
                    }
                    Router.listeners.push(fn);
                    return this.mode;
                },
                destroy: function(fn) {
                    if (!Router || !Router.listeners) {
                        return;
                    }
                    var listeners = Router.listeners;
                    for (var i = listeners.length - 1; i >= 0; i--) {
                        if (listeners[i] === fn) {
                            listeners.splice(i, 1);
                        }
                    }
                },
                setHash: function(s) {
                    if (this.mode === "legacy") {
                        this.writeFrame(s);
                    }
                    if (this.history === true) {
                        window.history.pushState({}, document.title, s);
                        this.fire();
                    } else {
                        dloc.hash = s[0] === "/" ? s : "/" + s;
                    }
                    return this;
                },
                writeFrame: function(s) {
                    var f = document.getElementById("state-frame");
                    var d = f.contentDocument || f.contentWindow.document;
                    d.open();
                    d.write("<script>_hash = '" + s + "'; onload = parent.listener.syncHash;<script>");
                    d.close();
                },
                syncHash: function() {
                    var s = this._hash;
                    if (s != dloc.hash) {
                        dloc.hash = s;
                    }
                    return this;
                },
                onHashChanged: function() {}
            };
            var Router = exports.Router = function(routes) {
                if (!(this instanceof Router)) return new Router(routes);
                this.params = {};
                this.routes = {};
                this.methods = [ "on", "once", "after", "before" ];
                this.scope = [];
                this._methods = {};
                this._insert = this.insert;
                this.insert = this.insertEx;
                this.historySupport = (window.history != null ? window.history.pushState : null) != null;
                this.configure();
                this.mount(routes || {});
            };
            Router.prototype.init = function(r) {
                var self = this, routeTo;
                this.handler = function(onChangeEvent) {
                    var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash;
                    var url = self.history === true ? self.getPath() : newURL.replace(/.*#/, "");
                    self.dispatch("on", url.charAt(0) === "/" ? url : "/" + url);
                };
                listener.init(this.handler, this.history);
                if (this.history === false) {
                    if (dlocHashEmpty() && r) {
                        dloc.hash = r;
                    } else if (!dlocHashEmpty()) {
                        self.dispatch("on", "/" + dloc.hash.replace(/^(#\/|#|\/)/, ""));
                    }
                } else {
                    if (this.convert_hash_in_init) {
                        routeTo = dlocHashEmpty() && r ? r : !dlocHashEmpty() ? dloc.hash.replace(/^#/, "") : null;
                        if (routeTo) {
                            window.history.replaceState({}, document.title, routeTo);
                        }
                    } else {
                        routeTo = this.getPath();
                    }
                    if (routeTo || this.run_in_init === true) {
                        this.handler();
                    }
                }
                return this;
            };
            Router.prototype.explode = function() {
                var v = this.history === true ? this.getPath() : dloc.hash;
                if (v.charAt(1) === "/") {
                    v = v.slice(1);
                }
                return v.slice(1, v.length).split("/");
            };
            Router.prototype.setRoute = function(i, v, val) {
                var url = this.explode();
                if (typeof i === "number" && typeof v === "string") {
                    url[i] = v;
                } else if (typeof val === "string") {
                    url.splice(i, v, s);
                } else {
                    url = [ i ];
                }
                listener.setHash(url.join("/"));
                return url;
            };
            Router.prototype.insertEx = function(method, path, route, parent) {
                if (method === "once") {
                    method = "on";
                    route = function(route) {
                        var once = false;
                        return function() {
                            if (once) return;
                            once = true;
                            return route.apply(this, arguments);
                        };
                    }(route);
                }
                return this._insert(method, path, route, parent);
            };
            Router.prototype.getRoute = function(v) {
                var ret = v;
                if (typeof v === "number") {
                    ret = this.explode()[v];
                } else if (typeof v === "string") {
                    var h = this.explode();
                    ret = h.indexOf(v);
                } else {
                    ret = this.explode();
                }
                return ret;
            };
            Router.prototype.destroy = function() {
                listener.destroy(this.handler);
                return this;
            };
            Router.prototype.getPath = function() {
                var path = window.location.pathname;
                if (path.substr(0, 1) !== "/") {
                    path = "/" + path;
                }
                return path;
            };
            function _every(arr, iterator) {
                for (var i = 0; i < arr.length; i += 1) {
                    if (iterator(arr[i], i, arr) === false) {
                        return;
                    }
                }
            }
            function _flatten(arr) {
                var flat = [];
                for (var i = 0, n = arr.length; i < n; i++) {
                    flat = flat.concat(arr[i]);
                }
                return flat;
            }
            function _asyncEverySeries(arr, iterator, callback) {
                if (!arr.length) {
                    return callback();
                }
                var completed = 0;
                (function iterate() {
                    iterator(arr[completed], function(err) {
                        if (err || err === false) {
                            callback(err);
                            callback = function() {};
                        } else {
                            completed += 1;
                            if (completed === arr.length) {
                                callback();
                            } else {
                                iterate();
                            }
                        }
                    });
                })();
            }
            function paramifyString(str, params, mod) {
                mod = str;
                for (var param in params) {
                    if (params.hasOwnProperty(param)) {
                        mod = params[param](str);
                        if (mod !== str) {
                            break;
                        }
                    }
                }
                return mod === str ? "([._a-zA-Z0-9-%()]+)" : mod;
            }
            function regifyString(str, params) {
                var matches, last = 0, out = "";
                while (matches = str.substr(last).match(/[^\w\d\- %@&]*\*[^\w\d\- %@&]*/)) {
                    last = matches.index + matches[0].length;
                    matches[0] = matches[0].replace(/^\*/, "([_.()!\\ %@&a-zA-Z0-9-]+)");
                    out += str.substr(0, matches.index) + matches[0];
                }
                str = out += str.substr(last);
                var captures = str.match(/:([^\/]+)/gi), capture, length;
                if (captures) {
                    length = captures.length;
                    for (var i = 0; i < length; i++) {
                        capture = captures[i];
                        if (capture.slice(0, 2) === "::") {
                            str = capture.slice(1);
                        } else {
                            str = str.replace(capture, paramifyString(capture, params));
                        }
                    }
                }
                return str;
            }
            function terminator(routes, delimiter, start, stop) {
                var last = 0, left = 0, right = 0, start = (start || "(").toString(), stop = (stop || ")").toString(), i;
                for (i = 0; i < routes.length; i++) {
                    var chunk = routes[i];
                    if (chunk.indexOf(start, last) > chunk.indexOf(stop, last) || ~chunk.indexOf(start, last) && !~chunk.indexOf(stop, last) || !~chunk.indexOf(start, last) && ~chunk.indexOf(stop, last)) {
                        left = chunk.indexOf(start, last);
                        right = chunk.indexOf(stop, last);
                        if (~left && !~right || !~left && ~right) {
                            var tmp = routes.slice(0, (i || 1) + 1).join(delimiter);
                            routes = [ tmp ].concat(routes.slice((i || 1) + 1));
                        }
                        last = (right > left ? right : left) + 1;
                        i = 0;
                    } else {
                        last = 0;
                    }
                }
                return routes;
            }
            var QUERY_SEPARATOR = /\?.*/;
            Router.prototype.configure = function(options) {
                options = options || {};
                for (var i = 0; i < this.methods.length; i++) {
                    this._methods[this.methods[i]] = true;
                }
                this.recurse = options.recurse || this.recurse || false;
                this.async = options.async || false;
                this.delimiter = options.delimiter || "/";
                this.strict = typeof options.strict === "undefined" ? true : options.strict;
                this.notfound = options.notfound;
                this.resource = options.resource;
                this.history = options.html5history && this.historySupport || false;
                this.run_in_init = this.history === true && options.run_handler_in_init !== false;
                this.convert_hash_in_init = this.history === true && options.convert_hash_in_init !== false;
                this.every = {
                    after: options.after || null,
                    before: options.before || null,
                    on: options.on || null
                };
                return this;
            };
            Router.prototype.param = function(token, matcher) {
                if (token[0] !== ":") {
                    token = ":" + token;
                }
                var compiled = new RegExp(token, "g");
                this.params[token] = function(str) {
                    return str.replace(compiled, matcher.source || matcher);
                };
                return this;
            };
            Router.prototype.on = Router.prototype.route = function(method, path, route) {
                var self = this;
                if (!route && typeof path == "function") {
                    route = path;
                    path = method;
                    method = "on";
                }
                if (Array.isArray(path)) {
                    return path.forEach(function(p) {
                        self.on(method, p, route);
                    });
                }
                if (path.source) {
                    path = path.source.replace(/\\\//gi, "/");
                }
                if (Array.isArray(method)) {
                    return method.forEach(function(m) {
                        self.on(m.toLowerCase(), path, route);
                    });
                }
                path = path.split(new RegExp(this.delimiter));
                path = terminator(path, this.delimiter);
                this.insert(method, this.scope.concat(path), route);
            };
            Router.prototype.path = function(path, routesFn) {
                var self = this, length = this.scope.length;
                if (path.source) {
                    path = path.source.replace(/\\\//gi, "/");
                }
                path = path.split(new RegExp(this.delimiter));
                path = terminator(path, this.delimiter);
                this.scope = this.scope.concat(path);
                routesFn.call(this, this);
                this.scope.splice(length, path.length);
            };
            Router.prototype.dispatch = function(method, path, callback) {
                var self = this, fns = this.traverse(method, path.replace(QUERY_SEPARATOR, ""), this.routes, ""), invoked = this._invoked, after;
                this._invoked = true;
                if (!fns || fns.length === 0) {
                    this.last = [];
                    if (typeof this.notfound === "function") {
                        this.invoke([ this.notfound ], {
                            method: method,
                            path: path
                        }, callback);
                    }
                    return false;
                }
                if (this.recurse === "forward") {
                    fns = fns.reverse();
                }
                function updateAndInvoke() {
                    self.last = fns.after;
                    self.invoke(self.runlist(fns), self, callback);
                }
                after = this.every && this.every.after ? [ this.every.after ].concat(this.last) : [ this.last ];
                if (after && after.length > 0 && invoked) {
                    if (this.async) {
                        this.invoke(after, this, updateAndInvoke);
                    } else {
                        this.invoke(after, this);
                        updateAndInvoke();
                    }
                    return true;
                }
                updateAndInvoke();
                return true;
            };
            Router.prototype.invoke = function(fns, thisArg, callback) {
                var self = this;
                var apply;
                if (this.async) {
                    apply = function(fn, next) {
                        if (Array.isArray(fn)) {
                            return _asyncEverySeries(fn, apply, next);
                        } else if (typeof fn == "function") {
                            fn.apply(thisArg, (fns.captures || []).concat(next));
                        }
                    };
                    _asyncEverySeries(fns, apply, function() {
                        if (callback) {
                            callback.apply(thisArg, arguments);
                        }
                    });
                } else {
                    apply = function(fn) {
                        if (Array.isArray(fn)) {
                            return _every(fn, apply);
                        } else if (typeof fn === "function") {
                            return fn.apply(thisArg, fns.captures || []);
                        } else if (typeof fn === "string" && self.resource) {
                            self.resource[fn].apply(thisArg, fns.captures || []);
                        }
                    };
                    _every(fns, apply);
                }
            };
            Router.prototype.traverse = function(method, path, routes, regexp, filter) {
                var fns = [], current, exact, match, next, that;
                function filterRoutes(routes) {
                    if (!filter) {
                        return routes;
                    }
                    function deepCopy(source) {
                        var result = [];
                        for (var i = 0; i < source.length; i++) {
                            result[i] = Array.isArray(source[i]) ? deepCopy(source[i]) : source[i];
                        }
                        return result;
                    }
                    function applyFilter(fns) {
                        for (var i = fns.length - 1; i >= 0; i--) {
                            if (Array.isArray(fns[i])) {
                                applyFilter(fns[i]);
                                if (fns[i].length === 0) {
                                    fns.splice(i, 1);
                                }
                            } else {
                                if (!filter(fns[i])) {
                                    fns.splice(i, 1);
                                }
                            }
                        }
                    }
                    var newRoutes = deepCopy(routes);
                    newRoutes.matched = routes.matched;
                    newRoutes.captures = routes.captures;
                    newRoutes.after = routes.after.filter(filter);
                    applyFilter(newRoutes);
                    return newRoutes;
                }
                if (path === this.delimiter && routes[method]) {
                    next = [ [ routes.before, routes[method] ].filter(Boolean) ];
                    next.after = [ routes.after ].filter(Boolean);
                    next.matched = true;
                    next.captures = [];
                    return filterRoutes(next);
                }
                for (var r in routes) {
                    if (routes.hasOwnProperty(r) && (!this._methods[r] || this._methods[r] && typeof routes[r] === "object" && !Array.isArray(routes[r]))) {
                        current = exact = regexp + this.delimiter + r;
                        if (!this.strict) {
                            exact += "[" + this.delimiter + "]?";
                        }
                        match = path.match(new RegExp("^" + exact));
                        if (!match) {
                            continue;
                        }
                        if (match[0] && match[0] == path && routes[r][method]) {
                            next = [ [ routes[r].before, routes[r][method] ].filter(Boolean) ];
                            next.after = [ routes[r].after ].filter(Boolean);
                            next.matched = true;
                            next.captures = match.slice(1);
                            if (this.recurse && routes === this.routes) {
                                next.push([ routes.before, routes.on ].filter(Boolean));
                                next.after = next.after.concat([ routes.after ].filter(Boolean));
                            }
                            return filterRoutes(next);
                        }
                        next = this.traverse(method, path, routes[r], current);
                        if (next.matched) {
                            if (next.length > 0) {
                                fns = fns.concat(next);
                            }
                            if (this.recurse) {
                                fns.push([ routes[r].before, routes[r].on ].filter(Boolean));
                                next.after = next.after.concat([ routes[r].after ].filter(Boolean));
                                if (routes === this.routes) {
                                    fns.push([ routes["before"], routes["on"] ].filter(Boolean));
                                    next.after = next.after.concat([ routes["after"] ].filter(Boolean));
                                }
                            }
                            fns.matched = true;
                            fns.captures = next.captures;
                            fns.after = next.after;
                            return filterRoutes(fns);
                        }
                    }
                }
                return false;
            };
            Router.prototype.insert = function(method, path, route, parent) {
                var methodType, parentType, isArray, nested, part;
                path = path.filter(function(p) {
                    return p && p.length > 0;
                });
                parent = parent || this.routes;
                part = path.shift();
                if (/\:|\*/.test(part) && !/\\d|\\w/.test(part)) {
                    part = regifyString(part, this.params);
                }
                if (path.length > 0) {
                    parent[part] = parent[part] || {};
                    return this.insert(method, path, route, parent[part]);
                }
                if (!part && !path.length && parent === this.routes) {
                    methodType = typeof parent[method];
                    switch (methodType) {
                      case "function":
                        parent[method] = [ parent[method], route ];
                        return;

                      case "object":
                        parent[method].push(route);
                        return;

                      case "undefined":
                        parent[method] = route;
                        return;
                    }
                    return;
                }
                parentType = typeof parent[part];
                isArray = Array.isArray(parent[part]);
                if (parent[part] && !isArray && parentType == "object") {
                    methodType = typeof parent[part][method];
                    switch (methodType) {
                      case "function":
                        parent[part][method] = [ parent[part][method], route ];
                        return;

                      case "object":
                        parent[part][method].push(route);
                        return;

                      case "undefined":
                        parent[part][method] = route;
                        return;
                    }
                } else if (parentType == "undefined") {
                    nested = {};
                    nested[method] = route;
                    parent[part] = nested;
                    return;
                }
                throw new Error("Invalid route context: " + parentType);
            };
            Router.prototype.extend = function(methods) {
                var self = this, len = methods.length, i;
                function extend(method) {
                    self._methods[method] = true;
                    self[method] = function() {
                        var extra = arguments.length === 1 ? [ method, "" ] : [ method ];
                        self.on.apply(self, extra.concat(Array.prototype.slice.call(arguments)));
                    };
                }
                for (i = 0; i < len; i++) {
                    extend(methods[i]);
                }
            };
            Router.prototype.runlist = function(fns) {
                var runlist = this.every && this.every.before ? [ this.every.before ].concat(_flatten(fns)) : _flatten(fns);
                if (this.every && this.every.on) {
                    runlist.push(this.every.on);
                }
                runlist.captures = fns.captures;
                runlist.source = fns.source;
                return runlist;
            };
            Router.prototype.mount = function(routes, path) {
                if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
                    return;
                }
                var self = this;
                path = path || [];
                if (!Array.isArray(path)) {
                    path = path.split(self.delimiter);
                }
                function insertOrMount(route, local) {
                    var rename = route, parts = route.split(self.delimiter), routeType = typeof routes[route], isRoute = parts[0] === "" || !self._methods[parts[0]], event = isRoute ? "on" : rename;
                    if (isRoute) {
                        rename = rename.slice((rename.match(new RegExp("^" + self.delimiter)) || [ "" ])[0].length);
                        parts.shift();
                    }
                    if (isRoute && routeType === "object" && !Array.isArray(routes[route])) {
                        local = local.concat(parts);
                        self.mount(routes[route], local);
                        return;
                    }
                    if (isRoute) {
                        local = local.concat(rename.split(self.delimiter));
                        local = terminator(local, self.delimiter);
                    }
                    self.insert(event, local, routes[route]);
                }
                for (var route in routes) {
                    if (routes.hasOwnProperty(route)) {
                        insertOrMount(route, path.slice(0));
                    }
                }
            };
        })(typeof exports === "object" ? exports : window);
    }, {} ],
    2: [ function(require, module, exports) {
        !function(undefined) {
            var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
                return Object.prototype.toString.call(obj) === "[object Array]";
            };
            var defaultMaxListeners = 10;
            function init() {
                this._events = {};
                if (this._conf) {
                    configure.call(this, this._conf);
                }
            }
            function configure(conf) {
                if (conf) {
                    this._conf = conf;
                    conf.delimiter && (this.delimiter = conf.delimiter);
                    conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
                    conf.wildcard && (this.wildcard = conf.wildcard);
                    conf.newListener && (this.newListener = conf.newListener);
                    if (this.wildcard) {
                        this.listenerTree = {};
                    }
                }
            }
            function EventEmitter(conf) {
                this._events = {};
                this.newListener = false;
                configure.call(this, conf);
            }
            function searchListenerTree(handlers, type, tree, i) {
                if (!tree) {
                    return [];
                }
                var listeners = [], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached, typeLength = type.length, currentType = type[i], nextType = type[i + 1];
                if (i === typeLength && tree._listeners) {
                    if (typeof tree._listeners === "function") {
                        handlers && handlers.push(tree._listeners);
                        return [ tree ];
                    } else {
                        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
                            handlers && handlers.push(tree._listeners[leaf]);
                        }
                        return [ tree ];
                    }
                }
                if (currentType === "*" || currentType === "**" || tree[currentType]) {
                    if (currentType === "*") {
                        for (branch in tree) {
                            if (branch !== "_listeners" && tree.hasOwnProperty(branch)) {
                                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 1));
                            }
                        }
                        return listeners;
                    } else if (currentType === "**") {
                        endReached = i + 1 === typeLength || i + 2 === typeLength && nextType === "*";
                        if (endReached && tree._listeners) {
                            listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
                        }
                        for (branch in tree) {
                            if (branch !== "_listeners" && tree.hasOwnProperty(branch)) {
                                if (branch === "*" || branch === "**") {
                                    if (tree[branch]._listeners && !endReached) {
                                        listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
                                    }
                                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
                                } else if (branch === nextType) {
                                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 2));
                                } else {
                                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
                                }
                            }
                        }
                        return listeners;
                    }
                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i + 1));
                }
                xTree = tree["*"];
                if (xTree) {
                    searchListenerTree(handlers, type, xTree, i + 1);
                }
                xxTree = tree["**"];
                if (xxTree) {
                    if (i < typeLength) {
                        if (xxTree._listeners) {
                            searchListenerTree(handlers, type, xxTree, typeLength);
                        }
                        for (branch in xxTree) {
                            if (branch !== "_listeners" && xxTree.hasOwnProperty(branch)) {
                                if (branch === nextType) {
                                    searchListenerTree(handlers, type, xxTree[branch], i + 2);
                                } else if (branch === currentType) {
                                    searchListenerTree(handlers, type, xxTree[branch], i + 1);
                                } else {
                                    isolatedBranch = {};
                                    isolatedBranch[branch] = xxTree[branch];
                                    searchListenerTree(handlers, type, {
                                        "**": isolatedBranch
                                    }, i + 1);
                                }
                            }
                        }
                    } else if (xxTree._listeners) {
                        searchListenerTree(handlers, type, xxTree, typeLength);
                    } else if (xxTree["*"] && xxTree["*"]._listeners) {
                        searchListenerTree(handlers, type, xxTree["*"], typeLength);
                    }
                }
                return listeners;
            }
            function growListenerTree(type, listener) {
                type = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                for (var i = 0, len = type.length; i + 1 < len; i++) {
                    if (type[i] === "**" && type[i + 1] === "**") {
                        return;
                    }
                }
                var tree = this.listenerTree;
                var name = type.shift();
                while (name) {
                    if (!tree[name]) {
                        tree[name] = {};
                    }
                    tree = tree[name];
                    if (type.length === 0) {
                        if (!tree._listeners) {
                            tree._listeners = listener;
                        } else if (typeof tree._listeners === "function") {
                            tree._listeners = [ tree._listeners, listener ];
                        } else if (isArray(tree._listeners)) {
                            tree._listeners.push(listener);
                            if (!tree._listeners.warned) {
                                var m = defaultMaxListeners;
                                if (typeof this._events.maxListeners !== "undefined") {
                                    m = this._events.maxListeners;
                                }
                                if (m > 0 && tree._listeners.length > m) {
                                    tree._listeners.warned = true;
                                    console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", tree._listeners.length);
                                    console.trace();
                                }
                            }
                        }
                        return true;
                    }
                    name = type.shift();
                }
                return true;
            }
            EventEmitter.prototype.delimiter = ".";
            EventEmitter.prototype.setMaxListeners = function(n) {
                this._events || init.call(this);
                this._events.maxListeners = n;
                if (!this._conf) this._conf = {};
                this._conf.maxListeners = n;
            };
            EventEmitter.prototype.event = "";
            EventEmitter.prototype.once = function(event, fn) {
                this.many(event, 1, fn);
                return this;
            };
            EventEmitter.prototype.many = function(event, ttl, fn) {
                var self = this;
                if (typeof fn !== "function") {
                    throw new Error("many only accepts instances of Function");
                }
                function listener() {
                    if (--ttl === 0) {
                        self.off(event, listener);
                    }
                    fn.apply(this, arguments);
                }
                listener._origin = fn;
                this.on(event, listener);
                return self;
            };
            EventEmitter.prototype.emit = function() {
                this._events || init.call(this);
                var type = arguments[0];
                if (type === "newListener" && !this.newListener) {
                    if (!this._events.newListener) {
                        return false;
                    }
                }
                if (this._all) {
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    for (i = 0, l = this._all.length; i < l; i++) {
                        this.event = type;
                        this._all[i].apply(this, args);
                    }
                }
                if (type === "error") {
                    if (!this._all && !this._events.error && !(this.wildcard && this.listenerTree.error)) {
                        if (arguments[1] instanceof Error) {
                            throw arguments[1];
                        } else {
                            throw new Error("Uncaught, unspecified 'error' event.");
                        }
                        return false;
                    }
                }
                var handler;
                if (this.wildcard) {
                    handler = [];
                    var ns = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                    searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
                } else {
                    handler = this._events[type];
                }
                if (typeof handler === "function") {
                    this.event = type;
                    if (arguments.length === 1) {
                        handler.call(this);
                    } else if (arguments.length > 1) switch (arguments.length) {
                      case 2:
                        handler.call(this, arguments[1]);
                        break;

                      case 3:
                        handler.call(this, arguments[1], arguments[2]);
                        break;

                      default:
                        var l = arguments.length;
                        var args = new Array(l - 1);
                        for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                        handler.apply(this, args);
                    }
                    return true;
                } else if (handler) {
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    var listeners = handler.slice();
                    for (var i = 0, l = listeners.length; i < l; i++) {
                        this.event = type;
                        listeners[i].apply(this, args);
                    }
                    return listeners.length > 0 || !!this._all;
                } else {
                    return !!this._all;
                }
            };
            EventEmitter.prototype.on = function(type, listener) {
                if (typeof type === "function") {
                    this.onAny(type);
                    return this;
                }
                if (typeof listener !== "function") {
                    throw new Error("on only accepts instances of Function");
                }
                this._events || init.call(this);
                this.emit("newListener", type, listener);
                if (this.wildcard) {
                    growListenerTree.call(this, type, listener);
                    return this;
                }
                if (!this._events[type]) {
                    this._events[type] = listener;
                } else if (typeof this._events[type] === "function") {
                    this._events[type] = [ this._events[type], listener ];
                } else if (isArray(this._events[type])) {
                    this._events[type].push(listener);
                    if (!this._events[type].warned) {
                        var m = defaultMaxListeners;
                        if (typeof this._events.maxListeners !== "undefined") {
                            m = this._events.maxListeners;
                        }
                        if (m > 0 && this._events[type].length > m) {
                            this._events[type].warned = true;
                            console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                            console.trace();
                        }
                    }
                }
                return this;
            };
            EventEmitter.prototype.onAny = function(fn) {
                if (typeof fn !== "function") {
                    throw new Error("onAny only accepts instances of Function");
                }
                if (!this._all) {
                    this._all = [];
                }
                this._all.push(fn);
                return this;
            };
            EventEmitter.prototype.addListener = EventEmitter.prototype.on;
            EventEmitter.prototype.off = function(type, listener) {
                if (typeof listener !== "function") {
                    throw new Error("removeListener only takes instances of Function");
                }
                var handlers, leafs = [];
                if (this.wildcard) {
                    var ns = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                    leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
                } else {
                    if (!this._events[type]) return this;
                    handlers = this._events[type];
                    leafs.push({
                        _listeners: handlers
                    });
                }
                for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
                    var leaf = leafs[iLeaf];
                    handlers = leaf._listeners;
                    if (isArray(handlers)) {
                        var position = -1;
                        for (var i = 0, length = handlers.length; i < length; i++) {
                            if (handlers[i] === listener || handlers[i].listener && handlers[i].listener === listener || handlers[i]._origin && handlers[i]._origin === listener) {
                                position = i;
                                break;
                            }
                        }
                        if (position < 0) {
                            continue;
                        }
                        if (this.wildcard) {
                            leaf._listeners.splice(position, 1);
                        } else {
                            this._events[type].splice(position, 1);
                        }
                        if (handlers.length === 0) {
                            if (this.wildcard) {
                                delete leaf._listeners;
                            } else {
                                delete this._events[type];
                            }
                        }
                        return this;
                    } else if (handlers === listener || handlers.listener && handlers.listener === listener || handlers._origin && handlers._origin === listener) {
                        if (this.wildcard) {
                            delete leaf._listeners;
                        } else {
                            delete this._events[type];
                        }
                    }
                }
                return this;
            };
            EventEmitter.prototype.offAny = function(fn) {
                var i = 0, l = 0, fns;
                if (fn && this._all && this._all.length > 0) {
                    fns = this._all;
                    for (i = 0, l = fns.length; i < l; i++) {
                        if (fn === fns[i]) {
                            fns.splice(i, 1);
                            return this;
                        }
                    }
                } else {
                    this._all = [];
                }
                return this;
            };
            EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
            EventEmitter.prototype.removeAllListeners = function(type) {
                if (arguments.length === 0) {
                    !this._events || init.call(this);
                    return this;
                }
                if (this.wildcard) {
                    var ns = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                    var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
                    for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
                        var leaf = leafs[iLeaf];
                        leaf._listeners = null;
                    }
                } else {
                    if (!this._events[type]) return this;
                    this._events[type] = null;
                }
                return this;
            };
            EventEmitter.prototype.listeners = function(type) {
                if (this.wildcard) {
                    var handlers = [];
                    var ns = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                    searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
                    return handlers;
                }
                this._events || init.call(this);
                if (!this._events[type]) this._events[type] = [];
                if (!isArray(this._events[type])) {
                    this._events[type] = [ this._events[type] ];
                }
                return this._events[type];
            };
            EventEmitter.prototype.listenersAny = function() {
                if (this._all) {
                    return this._all;
                } else {
                    return [];
                }
            };
            if (typeof define === "function" && define.amd) {
                define(function() {
                    return EventEmitter;
                });
            } else if (typeof exports === "object") {
                exports.EventEmitter2 = EventEmitter;
            } else {
                window.EventEmitter2 = EventEmitter;
            }
        }();
    }, {} ],
    3: [ function(require, module, exports) {}, {} ],
    4: [ function(require, module, exports) {
        (function(global) {
            (function(root) {
                var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
                var freeModule = typeof module == "object" && module && !module.nodeType && module;
                var freeGlobal = typeof global == "object" && global;
                if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
                    root = freeGlobal;
                }
                var punycode, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = "-", regexPunycode = /^xn--/, regexNonASCII = /[^\x20-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {
                    overflow: "Overflow: input needs wider integers to process",
                    "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                    "invalid-input": "Invalid input"
                }, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode, key;
                function error(type) {
                    throw RangeError(errors[type]);
                }
                function map(array, fn) {
                    var length = array.length;
                    var result = [];
                    while (length--) {
                        result[length] = fn(array[length]);
                    }
                    return result;
                }
                function mapDomain(string, fn) {
                    var parts = string.split("@");
                    var result = "";
                    if (parts.length > 1) {
                        result = parts[0] + "@";
                        string = parts[1];
                    }
                    string = string.replace(regexSeparators, ".");
                    var labels = string.split(".");
                    var encoded = map(labels, fn).join(".");
                    return result + encoded;
                }
                function ucs2decode(string) {
                    var output = [], counter = 0, length = string.length, value, extra;
                    while (counter < length) {
                        value = string.charCodeAt(counter++);
                        if (value >= 55296 && value <= 56319 && counter < length) {
                            extra = string.charCodeAt(counter++);
                            if ((extra & 64512) == 56320) {
                                output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
                            } else {
                                output.push(value);
                                counter--;
                            }
                        } else {
                            output.push(value);
                        }
                    }
                    return output;
                }
                function ucs2encode(array) {
                    return map(array, function(value) {
                        var output = "";
                        if (value > 65535) {
                            value -= 65536;
                            output += stringFromCharCode(value >>> 10 & 1023 | 55296);
                            value = 56320 | value & 1023;
                        }
                        output += stringFromCharCode(value);
                        return output;
                    }).join("");
                }
                function basicToDigit(codePoint) {
                    if (codePoint - 48 < 10) {
                        return codePoint - 22;
                    }
                    if (codePoint - 65 < 26) {
                        return codePoint - 65;
                    }
                    if (codePoint - 97 < 26) {
                        return codePoint - 97;
                    }
                    return base;
                }
                function digitToBasic(digit, flag) {
                    return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
                }
                function adapt(delta, numPoints, firstTime) {
                    var k = 0;
                    delta = firstTime ? floor(delta / damp) : delta >> 1;
                    delta += floor(delta / numPoints);
                    for (;delta > baseMinusTMin * tMax >> 1; k += base) {
                        delta = floor(delta / baseMinusTMin);
                    }
                    return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
                }
                function decode(input) {
                    var output = [], inputLength = input.length, out, i = 0, n = initialN, bias = initialBias, basic, j, index, oldi, w, k, digit, t, baseMinusT;
                    basic = input.lastIndexOf(delimiter);
                    if (basic < 0) {
                        basic = 0;
                    }
                    for (j = 0; j < basic; ++j) {
                        if (input.charCodeAt(j) >= 128) {
                            error("not-basic");
                        }
                        output.push(input.charCodeAt(j));
                    }
                    for (index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
                        for (oldi = i, w = 1, k = base; ;k += base) {
                            if (index >= inputLength) {
                                error("invalid-input");
                            }
                            digit = basicToDigit(input.charCodeAt(index++));
                            if (digit >= base || digit > floor((maxInt - i) / w)) {
                                error("overflow");
                            }
                            i += digit * w;
                            t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                            if (digit < t) {
                                break;
                            }
                            baseMinusT = base - t;
                            if (w > floor(maxInt / baseMinusT)) {
                                error("overflow");
                            }
                            w *= baseMinusT;
                        }
                        out = output.length + 1;
                        bias = adapt(i - oldi, out, oldi == 0);
                        if (floor(i / out) > maxInt - n) {
                            error("overflow");
                        }
                        n += floor(i / out);
                        i %= out;
                        output.splice(i++, 0, n);
                    }
                    return ucs2encode(output);
                }
                function encode(input) {
                    var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
                    input = ucs2decode(input);
                    inputLength = input.length;
                    n = initialN;
                    delta = 0;
                    bias = initialBias;
                    for (j = 0; j < inputLength; ++j) {
                        currentValue = input[j];
                        if (currentValue < 128) {
                            output.push(stringFromCharCode(currentValue));
                        }
                    }
                    handledCPCount = basicLength = output.length;
                    if (basicLength) {
                        output.push(delimiter);
                    }
                    while (handledCPCount < inputLength) {
                        for (m = maxInt, j = 0; j < inputLength; ++j) {
                            currentValue = input[j];
                            if (currentValue >= n && currentValue < m) {
                                m = currentValue;
                            }
                        }
                        handledCPCountPlusOne = handledCPCount + 1;
                        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                            error("overflow");
                        }
                        delta += (m - n) * handledCPCountPlusOne;
                        n = m;
                        for (j = 0; j < inputLength; ++j) {
                            currentValue = input[j];
                            if (currentValue < n && ++delta > maxInt) {
                                error("overflow");
                            }
                            if (currentValue == n) {
                                for (q = delta, k = base; ;k += base) {
                                    t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                                    if (q < t) {
                                        break;
                                    }
                                    qMinusT = q - t;
                                    baseMinusT = base - t;
                                    output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                                    q = floor(qMinusT / baseMinusT);
                                }
                                output.push(stringFromCharCode(digitToBasic(q, 0)));
                                bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                                delta = 0;
                                ++handledCPCount;
                            }
                        }
                        ++delta;
                        ++n;
                    }
                    return output.join("");
                }
                function toUnicode(input) {
                    return mapDomain(input, function(string) {
                        return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
                    });
                }
                function toASCII(input) {
                    return mapDomain(input, function(string) {
                        return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
                    });
                }
                punycode = {
                    version: "1.3.2",
                    ucs2: {
                        decode: ucs2decode,
                        encode: ucs2encode
                    },
                    decode: decode,
                    encode: encode,
                    toASCII: toASCII,
                    toUnicode: toUnicode
                };
                if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
                    define("punycode", function() {
                        return punycode;
                    });
                } else if (freeExports && freeModule) {
                    if (module.exports == freeExports) {
                        freeModule.exports = punycode;
                    } else {
                        for (key in punycode) {
                            punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
                        }
                    }
                } else {
                    root.punycode = punycode;
                }
            })(this);
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    5: [ function(require, module, exports) {
        "use strict";
        var sell = require("sell");
        var crossvent = require("crossvent");
        var bullseye = require("bullseye");
        var fuzzysearch = require("fuzzysearch");
        var KEY_ENTER = 13;
        var KEY_ESC = 27;
        var KEY_UP = 38;
        var KEY_DOWN = 40;
        var cache = [];
        var doc = document;
        var docElement = doc.documentElement;
        function find(el) {
            var entry;
            var i;
            for (i = 0; i < cache.length; i++) {
                entry = cache[i];
                if (entry.el === el) {
                    return entry.api;
                }
            }
            return null;
        }
        function horsey(el, options) {
            var cached = find(el);
            if (cached) {
                return cached;
            }
            var o = options || {};
            var parent = o.appendTo || doc.body;
            var render = o.render || defaultRenderer;
            var getText = o.getText || defaultGetText;
            var getValue = o.getValue || defaultGetValue;
            var form = o.form;
            var limit = typeof o.limit === "number" ? o.limit : Infinity;
            var suggestions = o.suggestions;
            var userFilter = o.filter || defaultFilter;
            var userSet = o.set || defaultSetter;
            var ul = tag("ul", "sey-list");
            var selection = null;
            var oneload = once(loading);
            var eye;
            var deferredFiltering = defer(filtering);
            var attachment = el;
            var textInput;
            var anyInput;
            var ranchorleft;
            var ranchorright;
            if (o.autoHideOnBlur === void 0) {
                o.autoHideOnBlur = true;
            }
            if (o.autoHideOnClick === void 0) {
                o.autoHideOnClick = true;
            }
            if (o.autoShowOnUpDown === void 0) {
                o.autoShowOnUpDown = el.tagName === "INPUT";
            }
            if (o.anchor) {
                ranchorleft = new RegExp("^" + o.anchor);
                ranchorright = new RegExp(o.anchor + "$");
            }
            var api = {
                add: add,
                anchor: o.anchor,
                clear: clear,
                show: show,
                hide: hide,
                toggle: toggle,
                destroy: destroy,
                refreshPosition: refreshPosition,
                appendText: appendText,
                appendHTML: appendHTML,
                filterAnchoredText: filterAnchoredText,
                filterAnchoredHTML: filterAnchoredHTML,
                defaultAppendText: appendText,
                defaultFilter: defaultFilter,
                defaultGetText: defaultGetText,
                defaultGetValue: defaultGetValue,
                defaultRenderer: defaultRenderer,
                defaultSetter: defaultSetter,
                retarget: retarget,
                attachment: attachment,
                list: ul,
                suggestions: []
            };
            var entry = {
                el: el,
                api: api
            };
            retarget(el);
            cache.push(entry);
            parent.appendChild(ul);
            el.setAttribute("autocomplete", "off");
            if (Array.isArray(suggestions)) {
                loaded(suggestions);
            }
            return api;
            function retarget(el) {
                inputEvents(true);
                attachment = api.attachment = el;
                textInput = attachment.tagName === "INPUT" || attachment.tagName === "TEXTAREA";
                anyInput = textInput || isEditable(attachment);
                inputEvents();
            }
            function refreshPosition() {
                if (eye) {
                    eye.refresh();
                }
            }
            function loading() {
                crossvent.remove(attachment, "focus", oneload);
                suggestions(loaded);
            }
            function loaded(suggestions) {
                suggestions.forEach(add);
                api.suggestions = suggestions;
            }
            function clear() {
                while (ul.lastChild) {
                    ul.removeChild(ul.lastChild);
                }
            }
            function add(suggestion) {
                var li = tag("li", "sey-item");
                render(li, suggestion);
                crossvent.add(li, "click", clickedSuggestion);
                crossvent.add(li, "horsey-filter", filterItem);
                crossvent.add(li, "horsey-hide", hideItem);
                ul.appendChild(li);
                api.suggestions.push(suggestion);
                return li;
                function clickedSuggestion() {
                    var value = getValue(suggestion);
                    set(value);
                    hide();
                    attachment.focus();
                    crossvent.fabricate(attachment, "horsey-selected", value);
                }
                function filterItem() {
                    var value = textInput ? el.value : el.innerHTML;
                    if (filter(value, suggestion)) {
                        li.className = li.className.replace(/ sey-hide/g, "");
                    } else {
                        crossvent.fabricate(li, "horsey-hide");
                    }
                }
                function hideItem() {
                    if (!hidden(li)) {
                        li.className += " sey-hide";
                        if (selection === li) {
                            unselect();
                        }
                    }
                }
            }
            function set(value) {
                if (o.anchor) {
                    return (isText() ? api.appendText : api.appendHTML)(value);
                }
                userSet(value);
            }
            function filter(value, suggestion) {
                if (o.anchor) {
                    var il = (isText() ? api.filterAnchoredText : api.filterAnchoredHTML)(value, suggestion);
                    return il ? userFilter(il.input, il.suggestion) : false;
                }
                return userFilter(value, suggestion);
            }
            function isText() {
                return isInput(attachment);
            }
            function visible() {
                return ul.className.indexOf("sey-show") !== -1;
            }
            function hidden(li) {
                return li.className.indexOf("sey-hide") !== -1;
            }
            function show() {
                if (!visible()) {
                    ul.className += " sey-show";
                    eye.refresh();
                    crossvent.fabricate(attachment, "horsey-show");
                }
            }
            function toggler(e) {
                var left = e.which === 1 && !e.metaKey && !e.ctrlKey;
                if (left === false) {
                    return;
                }
                toggle();
            }
            function toggle() {
                if (!visible()) {
                    show();
                } else {
                    hide();
                }
            }
            function select(suggestion) {
                unselect();
                if (suggestion) {
                    selection = suggestion;
                    selection.className += " sey-selected";
                }
            }
            function unselect() {
                if (selection) {
                    selection.className = selection.className.replace(/ sey-selected/g, "");
                    selection = null;
                }
            }
            function move(up, moves) {
                var total = ul.children.length;
                if (total < moves) {
                    unselect();
                    return;
                }
                if (total === 0) {
                    return;
                }
                var first = up ? "lastChild" : "firstChild";
                var next = up ? "previousSibling" : "nextSibling";
                var suggestion = selection && selection[next] || ul[first];
                select(suggestion);
                if (hidden(suggestion)) {
                    move(up, moves ? moves + 1 : 1);
                }
            }
            function hide() {
                eye.sleep();
                ul.className = ul.className.replace(/ sey-show/g, "");
                unselect();
                crossvent.fabricate(attachment, "horsey-hide");
            }
            function keydown(e) {
                var shown = visible();
                var which = e.which || e.keyCode;
                if (which === KEY_DOWN) {
                    if (anyInput && o.autoShowOnUpDown) {
                        show();
                    }
                    if (shown) {
                        move();
                        stop(e);
                    }
                } else if (which === KEY_UP) {
                    if (anyInput && o.autoShowOnUpDown) {
                        show();
                    }
                    if (shown) {
                        move(true);
                        stop(e);
                    }
                } else if (shown) {
                    if (which === KEY_ENTER) {
                        if (selection) {
                            crossvent.fabricate(selection, "click");
                        } else {
                            hide();
                        }
                        stop(e);
                    } else if (which === KEY_ESC) {
                        hide();
                        stop(e);
                    }
                }
            }
            function stop(e) {
                e.stopPropagation();
                e.preventDefault();
            }
            function filtering() {
                if (!visible()) {
                    return;
                }
                crossvent.fabricate(attachment, "horsey-filter");
                var li = ul.firstChild;
                var count = 0;
                while (li) {
                    if (count >= limit) {
                        crossvent.fabricate(li, "horsey-hide");
                    }
                    if (count < limit) {
                        crossvent.fabricate(li, "horsey-filter");
                        if (li.className.indexOf("sey-hide") === -1) {
                            count++;
                        }
                    }
                    li = li.nextSibling;
                }
                if (!selection) {
                    move();
                }
                if (!selection) {
                    hide();
                }
            }
            function deferredFilteringNoEnter(e) {
                var which = e.which || e.keyCode;
                if (which === KEY_ENTER) {
                    return;
                }
                deferredFiltering();
            }
            function deferredShow(e) {
                var which = e.which || e.keyCode;
                if (which === KEY_ENTER) {
                    return;
                }
                setTimeout(show, 0);
            }
            function horseyEventTarget(e) {
                var target = e.target;
                if (target === attachment) {
                    return true;
                }
                while (target) {
                    if (target === ul || target === attachment) {
                        return true;
                    }
                    target = target.parentNode;
                }
            }
            function hideOnBlur(e) {
                if (horseyEventTarget(e)) {
                    return;
                }
                hide();
            }
            function hideOnClick(e) {
                if (horseyEventTarget(e)) {
                    return;
                }
                hide();
            }
            function inputEvents(remove) {
                var op = remove ? "remove" : "add";
                if (eye) {
                    eye.destroy();
                    eye = null;
                }
                if (!remove) {
                    eye = bullseye(ul, attachment, {
                        caret: anyInput && attachment.tagName !== "INPUT"
                    });
                    if (!visible()) {
                        eye.sleep();
                    }
                }
                if (typeof suggestions === "function" && !oneload.used) {
                    if (remove || anyInput && doc.activeElement !== attachment) {
                        crossvent[op](attachment, "focus", oneload);
                    } else {
                        oneload();
                    }
                }
                if (anyInput) {
                    crossvent[op](attachment, "keypress", deferredShow);
                    crossvent[op](attachment, "keypress", deferredFiltering);
                    crossvent[op](attachment, "keydown", deferredFilteringNoEnter);
                    crossvent[op](attachment, "paste", deferredFiltering);
                    crossvent[op](attachment, "keydown", keydown);
                    if (o.autoHideOnBlur) {
                        crossvent[op](docElement, "focus", hideOnBlur, true);
                    }
                } else {
                    crossvent[op](attachment, "click", toggler);
                    crossvent[op](docElement, "keydown", keydown);
                }
                if (o.autoHideOnClick) {
                    crossvent[op](doc, "click", hideOnClick);
                }
                if (form) {
                    crossvent[op](form, "submit", hide);
                }
            }
            function destroy() {
                inputEvents(true);
                if (parent.contains(ul)) {
                    parent.removeChild(ul);
                }
                cache.splice(cache.indexOf(entry), 1);
            }
            function defaultSetter(value) {
                if (textInput) {
                    el.value = value;
                } else {
                    el.innerHTML = value;
                }
            }
            function defaultRenderer(li, suggestion) {
                li.innerText = li.textContent = getText(suggestion);
            }
            function defaultFilter(q, suggestion) {
                var text = getText(suggestion) || "";
                var value = getValue(suggestion) || "";
                var needle = q.toLowerCase();
                return fuzzysearch(needle, text.toLowerCase()) || fuzzysearch(needle, value.toLowerCase());
            }
            function loopbackToAnchor(text, p) {
                var result = "";
                var anchored = false;
                var start = p.start;
                while (anchored === false && start >= 0) {
                    result = text.substr(start - 1, p.start - start + 1);
                    anchored = ranchorleft.test(result);
                    start--;
                }
                return {
                    text: anchored ? result : null,
                    start: start
                };
            }
            function filterAnchoredText(q, suggestion) {
                var position = sell(el);
                var input = loopbackToAnchor(q, position).text;
                if (input) {
                    return {
                        input: input,
                        suggestion: suggestion
                    };
                }
            }
            function appendText(value) {
                var current = el.value;
                var position = sell(el);
                var input = loopbackToAnchor(current, position);
                var left = current.substr(0, input.start);
                var right = current.substr(input.start + input.text.length + (position.end - position.start));
                var before = left + value + " ";
                el.value = before + right;
                sell(el, {
                    start: before.length,
                    end: before.length
                });
            }
            function filterAnchoredHTML() {
                throw new Error("Anchoring in editable elements is disabled by default.");
            }
            function appendHTML() {
                throw new Error("Anchoring in editable elements is disabled by default.");
            }
        }
        function isInput(el) {
            return el.tagName === "INPUT" || el.tagName === "TEXTAREA";
        }
        function defaultGetValue(suggestion) {
            return defaultGet("value", suggestion);
        }
        function defaultGetText(suggestion) {
            return defaultGet("text", suggestion);
        }
        function defaultGet(type, value) {
            return value && value[type] !== void 0 ? value[type] : value;
        }
        function tag(type, className) {
            var el = doc.createElement(type);
            el.className = className;
            return el;
        }
        function once(fn) {
            var disposed;
            function disposable() {
                if (disposed) {
                    return;
                }
                disposable.used = disposed = true;
                (fn || noop).apply(null, arguments);
            }
            return disposable;
        }
        function defer(fn) {
            return function() {
                setTimeout(fn, 0);
            };
        }
        function noop() {}
        function isEditable(el) {
            var value = el.getAttribute("contentEditable");
            if (value === "false") {
                return false;
            }
            if (value === "true") {
                return true;
            }
            if (el.parentElement) {
                return isEditable(el.parentElement);
            }
            return false;
        }
        horsey.find = find;
        module.exports = horsey;
    }, {
        bullseye: 6,
        crossvent: 21,
        fuzzysearch: 23,
        sell: 24
    } ],
    6: [ function(require, module, exports) {
        "use strict";
        var crossvent = require("crossvent");
        var throttle = require("./throttle");
        var tailormade = require("./tailormade");
        function bullseye(el, target, options) {
            var o = options;
            var domTarget = target && target.tagName;
            if (!domTarget && arguments.length === 2) {
                o = target;
            }
            if (!domTarget) {
                target = el;
            }
            if (!o) {
                o = {};
            }
            var destroyed = false;
            var throttledWrite = throttle(write, 30);
            var tailorOptions = {
                update: o.autoupdateToCaret !== false && update
            };
            var tailor = o.caret && tailormade(target, tailorOptions);
            write();
            if (o.tracking !== false) {
                crossvent.add(window, "resize", throttledWrite);
            }
            return {
                read: readNull,
                refresh: write,
                destroy: destroy,
                sleep: sleep
            };
            function sleep() {
                tailorOptions.sleeping = true;
            }
            function readNull() {
                return read();
            }
            function read(readings) {
                var bounds = target.getBoundingClientRect();
                var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                if (tailor) {
                    readings = tailor.read();
                    return {
                        x: (readings.absolute ? 0 : bounds.left) + readings.x,
                        y: (readings.absolute ? 0 : bounds.top) + scrollTop + readings.y + 20
                    };
                }
                return {
                    x: bounds.left,
                    y: bounds.top + scrollTop
                };
            }
            function update(readings) {
                write(readings);
            }
            function write(readings) {
                if (destroyed) {
                    throw new Error("Bullseye can't refresh after being destroyed. Create another instance instead.");
                }
                if (tailor && !readings) {
                    tailorOptions.sleeping = false;
                    tailor.refresh();
                    return;
                }
                var p = read(readings);
                if (!tailor && target !== el) {
                    p.y += target.offsetHeight;
                }
                el.style.left = p.x + "px";
                el.style.top = p.y + "px";
            }
            function destroy() {
                if (tailor) {
                    tailor.destroy();
                }
                crossvent.remove(window, "resize", throttledWrite);
                destroyed = true;
            }
        }
        module.exports = bullseye;
    }, {
        "./tailormade": 18,
        "./throttle": 19,
        crossvent: 8
    } ],
    7: [ function(require, module, exports) {
        (function(global) {
            var NativeCustomEvent = global.CustomEvent;
            function useNative() {
                try {
                    var p = new NativeCustomEvent("cat", {
                        detail: {
                            foo: "bar"
                        }
                    });
                    return "cat" === p.type && "bar" === p.detail.foo;
                } catch (e) {}
                return false;
            }
            module.exports = useNative() ? NativeCustomEvent : "function" === typeof document.createEvent ? function CustomEvent(type, params) {
                var e = document.createEvent("CustomEvent");
                if (params) {
                    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
                } else {
                    e.initCustomEvent(type, false, false, void 0);
                }
                return e;
            } : function CustomEvent(type, params) {
                var e = document.createEventObject();
                e.type = type;
                if (params) {
                    e.bubbles = Boolean(params.bubbles);
                    e.cancelable = Boolean(params.cancelable);
                    e.detail = params.detail;
                } else {
                    e.bubbles = false;
                    e.cancelable = false;
                    e.detail = void 0;
                }
                return e;
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    8: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var customEvent = require("custom-event");
            var eventmap = require("./eventmap");
            var doc = global.document;
            var addEvent = addEventEasy;
            var removeEvent = removeEventEasy;
            var hardCache = [];
            if (!global.addEventListener) {
                addEvent = addEventHard;
                removeEvent = removeEventHard;
            }
            module.exports = {
                add: addEvent,
                remove: removeEvent,
                fabricate: fabricateEvent
            };
            function addEventEasy(el, type, fn, capturing) {
                return el.addEventListener(type, fn, capturing);
            }
            function addEventHard(el, type, fn) {
                return el.attachEvent("on" + type, wrap(el, type, fn));
            }
            function removeEventEasy(el, type, fn, capturing) {
                return el.removeEventListener(type, fn, capturing);
            }
            function removeEventHard(el, type, fn) {
                var listener = unwrap(el, type, fn);
                if (listener) {
                    return el.detachEvent("on" + type, listener);
                }
            }
            function fabricateEvent(el, type, model) {
                var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
                if (el.dispatchEvent) {
                    el.dispatchEvent(e);
                } else {
                    el.fireEvent("on" + type, e);
                }
                function makeClassicEvent() {
                    var e;
                    if (doc.createEvent) {
                        e = doc.createEvent("Event");
                        e.initEvent(type, true, true);
                    } else if (doc.createEventObject) {
                        e = doc.createEventObject();
                    }
                    return e;
                }
                function makeCustomEvent() {
                    return new customEvent(type, {
                        detail: model
                    });
                }
            }
            function wrapperFactory(el, type, fn) {
                return function wrapper(originalEvent) {
                    var e = originalEvent || global.event;
                    e.target = e.target || e.srcElement;
                    e.preventDefault = e.preventDefault || function preventDefault() {
                        e.returnValue = false;
                    };
                    e.stopPropagation = e.stopPropagation || function stopPropagation() {
                        e.cancelBubble = true;
                    };
                    e.which = e.which || e.keyCode;
                    fn.call(el, e);
                };
            }
            function wrap(el, type, fn) {
                var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
                hardCache.push({
                    wrapper: wrapper,
                    element: el,
                    type: type,
                    fn: fn
                });
                return wrapper;
            }
            function unwrap(el, type, fn) {
                var i = find(el, type, fn);
                if (i) {
                    var wrapper = hardCache[i].wrapper;
                    hardCache.splice(i, 1);
                    return wrapper;
                }
            }
            function find(el, type, fn) {
                var i, item;
                for (i = 0; i < hardCache.length; i++) {
                    item = hardCache[i];
                    if (item.element === el && item.type === type && item.fn === fn) {
                        return i;
                    }
                }
            }
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./eventmap": 9,
        "custom-event": 7
    } ],
    9: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var eventmap = [];
            var eventname = "";
            var ron = /^on/;
            for (eventname in global) {
                if (ron.test(eventname)) {
                    eventmap.push(eventname.slice(2));
                }
            }
            module.exports = eventmap;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    10: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var getSelection;
            var doc = global.document;
            var getSelectionRaw = require("./getSelectionRaw");
            var getSelectionNullOp = require("./getSelectionNullOp");
            var getSelectionSynthetic = require("./getSelectionSynthetic");
            var isHost = require("./isHost");
            if (isHost.method(global, "getSelection")) {
                getSelection = getSelectionRaw;
            } else if (typeof doc.selection === "object" && doc.selection) {
                getSelection = getSelectionSynthetic;
            } else {
                getSelection = getSelectionNullOp;
            }
            module.exports = getSelection;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./getSelectionNullOp": 11,
        "./getSelectionRaw": 12,
        "./getSelectionSynthetic": 13,
        "./isHost": 14
    } ],
    11: [ function(require, module, exports) {
        "use strict";
        function noop() {}
        function getSelectionNullOp() {
            return {
                removeAllRanges: noop,
                addRange: noop
            };
        }
        module.exports = getSelectionNullOp;
    }, {} ],
    12: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            function getSelectionRaw() {
                return global.getSelection();
            }
            module.exports = getSelectionRaw;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    13: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var rangeToTextRange = require("./rangeToTextRange");
            var doc = global.document;
            var body = doc.body;
            var GetSelectionProto = GetSelection.prototype;
            function GetSelection(selection) {
                var self = this;
                var range = selection.createRange();
                this._selection = selection;
                this._ranges = [];
                if (selection.type === "Control") {
                    updateControlSelection(self);
                } else if (isTextRange(range)) {
                    updateFromTextRange(self, range);
                } else {
                    updateEmptySelection(self);
                }
            }
            GetSelectionProto.removeAllRanges = function() {
                var textRange;
                try {
                    this._selection.empty();
                    if (this._selection.type !== "None") {
                        textRange = body.createTextRange();
                        textRange.select();
                        this._selection.empty();
                    }
                } catch (e) {}
                updateEmptySelection(this);
            };
            GetSelectionProto.addRange = function(range) {
                if (this._selection.type === "Control") {
                    addRangeToControlSelection(this, range);
                } else {
                    rangeToTextRange(range).select();
                    this._ranges[0] = range;
                    this.rangeCount = 1;
                    this.isCollapsed = this._ranges[0].collapsed;
                    updateAnchorAndFocusFromRange(this, range, false);
                }
            };
            GetSelectionProto.setRanges = function(ranges) {
                this.removeAllRanges();
                var rangeCount = ranges.length;
                if (rangeCount > 1) {
                    createControlSelection(this, ranges);
                } else if (rangeCount) {
                    this.addRange(ranges[0]);
                }
            };
            GetSelectionProto.getRangeAt = function(index) {
                if (index < 0 || index >= this.rangeCount) {
                    throw new Error("getRangeAt(): index out of bounds");
                } else {
                    return this._ranges[index].cloneRange();
                }
            };
            GetSelectionProto.removeRange = function(range) {
                if (this._selection.type !== "Control") {
                    removeRangeManually(this, range);
                    return;
                }
                var controlRange = this._selection.createRange();
                var rangeElement = getSingleElementFromRange(range);
                var newControlRange = body.createControlRange();
                var el;
                var removed = false;
                for (var i = 0, len = controlRange.length; i < len; ++i) {
                    el = controlRange.item(i);
                    if (el !== rangeElement || removed) {
                        newControlRange.add(controlRange.item(i));
                    } else {
                        removed = true;
                    }
                }
                newControlRange.select();
                updateControlSelection(this);
            };
            GetSelectionProto.eachRange = function(fn, returnValue) {
                var i = 0;
                var len = this._ranges.length;
                for (i = 0; i < len; ++i) {
                    if (fn(this.getRangeAt(i))) {
                        return returnValue;
                    }
                }
            };
            GetSelectionProto.getAllRanges = function() {
                var ranges = [];
                this.eachRange(function(range) {
                    ranges.push(range);
                });
                return ranges;
            };
            GetSelectionProto.setSingleRange = function(range) {
                this.removeAllRanges();
                this.addRange(range);
            };
            function createControlSelection(sel, ranges) {
                var controlRange = body.createControlRange();
                for (var i = 0, el, len = ranges.length; i < len; ++i) {
                    el = getSingleElementFromRange(ranges[i]);
                    try {
                        controlRange.add(el);
                    } catch (e) {
                        throw new Error("setRanges(): Element could not be added to control selection");
                    }
                }
                controlRange.select();
                updateControlSelection(sel);
            }
            function removeRangeManually(sel, range) {
                var ranges = sel.getAllRanges();
                sel.removeAllRanges();
                for (var i = 0, len = ranges.length; i < len; ++i) {
                    if (!isSameRange(range, ranges[i])) {
                        sel.addRange(ranges[i]);
                    }
                }
                if (!sel.rangeCount) {
                    updateEmptySelection(sel);
                }
            }
            function updateAnchorAndFocusFromRange(sel, range) {
                var anchorPrefix = "start";
                var focusPrefix = "end";
                sel.anchorNode = range[anchorPrefix + "Container"];
                sel.anchorOffset = range[anchorPrefix + "Offset"];
                sel.focusNode = range[focusPrefix + "Container"];
                sel.focusOffset = range[focusPrefix + "Offset"];
            }
            function updateEmptySelection(sel) {
                sel.anchorNode = sel.focusNode = null;
                sel.anchorOffset = sel.focusOffset = 0;
                sel.rangeCount = 0;
                sel.isCollapsed = true;
                sel._ranges.length = 0;
            }
            function rangeContainsSingleElement(rangeNodes) {
                if (!rangeNodes.length || rangeNodes[0].nodeType !== 1) {
                    return false;
                }
                for (var i = 1, len = rangeNodes.length; i < len; ++i) {
                    if (!isAncestorOf(rangeNodes[0], rangeNodes[i])) {
                        return false;
                    }
                }
                return true;
            }
            function getSingleElementFromRange(range) {
                var nodes = range.getNodes();
                if (!rangeContainsSingleElement(nodes)) {
                    throw new Error("getSingleElementFromRange(): range did not consist of a single element");
                }
                return nodes[0];
            }
            function isTextRange(range) {
                return range && range.text !== void 0;
            }
            function updateFromTextRange(sel, range) {
                sel._ranges = [ range ];
                updateAnchorAndFocusFromRange(sel, range, false);
                sel.rangeCount = 1;
                sel.isCollapsed = range.collapsed;
            }
            function updateControlSelection(sel) {
                sel._ranges.length = 0;
                if (sel._selection.type === "None") {
                    updateEmptySelection(sel);
                } else {
                    var controlRange = sel._selection.createRange();
                    if (isTextRange(controlRange)) {
                        updateFromTextRange(sel, controlRange);
                    } else {
                        sel.rangeCount = controlRange.length;
                        var range;
                        for (var i = 0; i < sel.rangeCount; ++i) {
                            range = doc.createRange();
                            range.selectNode(controlRange.item(i));
                            sel._ranges.push(range);
                        }
                        sel.isCollapsed = sel.rangeCount === 1 && sel._ranges[0].collapsed;
                        updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], false);
                    }
                }
            }
            function addRangeToControlSelection(sel, range) {
                var controlRange = sel._selection.createRange();
                var rangeElement = getSingleElementFromRange(range);
                var newControlRange = body.createControlRange();
                for (var i = 0, len = controlRange.length; i < len; ++i) {
                    newControlRange.add(controlRange.item(i));
                }
                try {
                    newControlRange.add(rangeElement);
                } catch (e) {
                    throw new Error("addRange(): Element could not be added to control selection");
                }
                newControlRange.select();
                updateControlSelection(sel);
            }
            function isSameRange(left, right) {
                return left.startContainer === right.startContainer && left.startOffset === right.startOffset && left.endContainer === right.endContainer && left.endOffset === right.endOffset;
            }
            function isAncestorOf(ancestor, descendant) {
                var node = descendant;
                while (node.parentNode) {
                    if (node.parentNode === ancestor) {
                        return true;
                    }
                    node = node.parentNode;
                }
                return false;
            }
            function getSelection() {
                return new GetSelection(global.document.selection);
            }
            module.exports = getSelection;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./rangeToTextRange": 15
    } ],
    14: [ function(require, module, exports) {
        "use strict";
        function isHostMethod(host, prop) {
            var type = typeof host[prop];
            return type === "function" || !!(type === "object" && host[prop]) || type === "unknown";
        }
        function isHostProperty(host, prop) {
            return typeof host[prop] !== "undefined";
        }
        function many(fn) {
            return function areHosted(host, props) {
                var i = props.length;
                while (i--) {
                    if (!fn(host, props[i])) {
                        return false;
                    }
                }
                return true;
            };
        }
        module.exports = {
            method: isHostMethod,
            methods: many(isHostMethod),
            property: isHostProperty,
            properties: many(isHostProperty)
        };
    }, {} ],
    15: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var doc = global.document;
            var body = doc.body;
            function rangeToTextRange(p) {
                if (p.collapsed) {
                    return createBoundaryTextRange({
                        node: p.startContainer,
                        offset: p.startOffset
                    }, true);
                }
                var startRange = createBoundaryTextRange({
                    node: p.startContainer,
                    offset: p.startOffset
                }, true);
                var endRange = createBoundaryTextRange({
                    node: p.endContainer,
                    offset: p.endOffset
                }, false);
                var textRange = body.createTextRange();
                textRange.setEndPoint("StartToStart", startRange);
                textRange.setEndPoint("EndToEnd", endRange);
                return textRange;
            }
            function isCharacterDataNode(node) {
                var t = node.nodeType;
                return t === 3 || t === 4 || t === 8;
            }
            function createBoundaryTextRange(p, starting) {
                var bound;
                var parent;
                var offset = p.offset;
                var workingNode;
                var childNodes;
                var range = body.createTextRange();
                var data = isCharacterDataNode(p.node);
                if (data) {
                    bound = p.node;
                    parent = bound.parentNode;
                } else {
                    childNodes = p.node.childNodes;
                    bound = offset < childNodes.length ? childNodes[offset] : null;
                    parent = p.node;
                }
                workingNode = doc.createElement("span");
                workingNode.innerHTML = "&#feff;";
                if (bound) {
                    parent.insertBefore(workingNode, bound);
                } else {
                    parent.appendChild(workingNode);
                }
                range.moveToElementText(workingNode);
                range.collapse(!starting);
                parent.removeChild(workingNode);
                if (data) {
                    range[starting ? "moveStart" : "moveEnd"]("character", offset);
                }
                return range;
            }
            module.exports = rangeToTextRange;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    16: [ function(require, module, exports) {
        "use strict";
        var getSelection = require("./getSelection");
        var setSelection = require("./setSelection");
        module.exports = {
            get: getSelection,
            set: setSelection
        };
    }, {
        "./getSelection": 10,
        "./setSelection": 17
    } ],
    17: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var getSelection = require("./getSelection");
            var rangeToTextRange = require("./rangeToTextRange");
            var doc = global.document;
            function setSelection(p) {
                if (doc.createRange) {
                    modernSelection();
                } else {
                    oldSelection();
                }
                function modernSelection() {
                    var sel = getSelection();
                    var range = doc.createRange();
                    if (!p.startContainer) {
                        return;
                    }
                    if (p.endContainer) {
                        range.setEnd(p.endContainer, p.endOffset);
                    } else {
                        range.setEnd(p.startContainer, p.startOffset);
                    }
                    range.setStart(p.startContainer, p.startOffset);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                function oldSelection() {
                    rangeToTextRange(p).select();
                }
            }
            module.exports = setSelection;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./getSelection": 10,
        "./rangeToTextRange": 15
    } ],
    18: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var sell = require("sell");
            var crossvent = require("crossvent");
            var seleccion = require("seleccion");
            var throttle = require("./throttle");
            var getSelection = seleccion.get;
            var props = [ "direction", "boxSizing", "width", "height", "overflowX", "overflowY", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize", "fontSizeAdjust", "lineHeight", "fontFamily", "textAlign", "textTransform", "textIndent", "textDecoration", "letterSpacing", "wordSpacing" ];
            var win = global;
            var doc = document;
            var ff = win.mozInnerScreenX !== null && win.mozInnerScreenX !== void 0;
            function tailormade(el, options) {
                var textInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
                var throttledRefresh = throttle(refresh, 30);
                var o = options || {};
                bind();
                return {
                    read: readPosition,
                    refresh: throttledRefresh,
                    destroy: destroy
                };
                function noop() {}
                function readPosition() {
                    return (textInput ? coordsText : coordsHTML)();
                }
                function refresh() {
                    if (o.sleeping) {
                        return;
                    }
                    return (o.update || noop)(readPosition());
                }
                function coordsText() {
                    var p = sell(el);
                    var context = prepare();
                    var readings = readTextCoords(context, p.start);
                    doc.body.removeChild(context.mirror);
                    return readings;
                }
                function coordsHTML() {
                    var sel = getSelection();
                    if (sel.rangeCount) {
                        var range = sel.getRangeAt(0);
                        var needsToWorkAroundNewlineBug = range.startContainer.nodeName === "P" && range.startOffset === 0;
                        if (needsToWorkAroundNewlineBug) {
                            return {
                                x: range.startContainer.offsetLeft,
                                y: range.startContainer.offsetTop,
                                absolute: true
                            };
                        }
                        if (range.getClientRects) {
                            var rects = range.getClientRects();
                            if (rects.length > 0) {
                                return {
                                    x: rects[0].left,
                                    y: rects[0].top,
                                    absolute: true
                                };
                            }
                        }
                    }
                    return {
                        x: 0,
                        y: 0
                    };
                }
                function readTextCoords(context, p) {
                    var rest = doc.createElement("span");
                    var mirror = context.mirror;
                    var computed = context.computed;
                    write(mirror, read(el).substring(0, p));
                    if (el.tagName === "INPUT") {
                        mirror.textContent = mirror.textContent.replace(/\s/g, " ");
                    }
                    write(rest, read(el).substring(p) || ".");
                    mirror.appendChild(rest);
                    return {
                        x: rest.offsetLeft + parseInt(computed["borderLeftWidth"]),
                        y: rest.offsetTop + parseInt(computed["borderTopWidth"])
                    };
                }
                function read(el) {
                    return textInput ? el.value : el.innerHTML;
                }
                function prepare() {
                    var computed = win.getComputedStyle ? getComputedStyle(el) : el.currentStyle;
                    var mirror = doc.createElement("div");
                    var style = mirror.style;
                    doc.body.appendChild(mirror);
                    if (el.tagName !== "INPUT") {
                        style.wordWrap = "break-word";
                    }
                    style.whiteSpace = "pre-wrap";
                    style.position = "absolute";
                    style.visibility = "hidden";
                    props.forEach(copy);
                    if (ff) {
                        style.width = parseInt(computed.width) - 2 + "px";
                        if (el.scrollHeight > parseInt(computed.height)) {
                            style.overflowY = "scroll";
                        }
                    } else {
                        style.overflow = "hidden";
                    }
                    return {
                        mirror: mirror,
                        computed: computed
                    };
                    function copy(prop) {
                        style[prop] = computed[prop];
                    }
                }
                function write(el, value) {
                    if (textInput) {
                        el.textContent = value;
                    } else {
                        el.innerHTML = value;
                    }
                }
                function bind(remove) {
                    var op = remove ? "remove" : "add";
                    crossvent[op](el, "keydown", throttledRefresh);
                    crossvent[op](el, "keyup", throttledRefresh);
                    crossvent[op](el, "input", throttledRefresh);
                    crossvent[op](el, "paste", throttledRefresh);
                    crossvent[op](el, "change", throttledRefresh);
                }
                function destroy() {
                    bind(true);
                }
            }
            module.exports = tailormade;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./throttle": 19,
        crossvent: 8,
        seleccion: 16,
        sell: 24
    } ],
    19: [ function(require, module, exports) {
        "use strict";
        function throttle(fn, boundary) {
            var last = -Infinity;
            var timer;
            return function bounced() {
                if (timer) {
                    return;
                }
                unbound();
                function unbound() {
                    clearTimeout(timer);
                    timer = null;
                    var next = last + boundary;
                    var now = Date.now();
                    if (now > next) {
                        last = now;
                        fn();
                    } else {
                        timer = setTimeout(unbound, next - now);
                    }
                }
            };
        }
        module.exports = throttle;
    }, {} ],
    20: [ function(require, module, exports) {
        arguments[4][7][0].apply(exports, arguments);
    }, {
        dup: 7
    } ],
    21: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var customEvent = require("custom-event");
            var eventmap = require("./eventmap");
            var doc = document;
            var addEvent = addEventEasy;
            var removeEvent = removeEventEasy;
            var hardCache = [];
            if (!global.addEventListener) {
                addEvent = addEventHard;
                removeEvent = removeEventHard;
            }
            function addEventEasy(el, type, fn, capturing) {
                return el.addEventListener(type, fn, capturing);
            }
            function addEventHard(el, type, fn) {
                return el.attachEvent("on" + type, wrap(el, type, fn));
            }
            function removeEventEasy(el, type, fn, capturing) {
                return el.removeEventListener(type, fn, capturing);
            }
            function removeEventHard(el, type, fn) {
                return el.detachEvent("on" + type, unwrap(el, type, fn));
            }
            function fabricateEvent(el, type, model) {
                var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
                if (el.dispatchEvent) {
                    el.dispatchEvent(e);
                } else {
                    el.fireEvent("on" + type, e);
                }
                function makeClassicEvent() {
                    var e;
                    if (doc.createEvent) {
                        e = doc.createEvent("Event");
                        e.initEvent(type, true, true);
                    } else if (doc.createEventObject) {
                        e = doc.createEventObject();
                    }
                    return e;
                }
                function makeCustomEvent() {
                    return new customEvent(type, {
                        detail: model
                    });
                }
            }
            function wrapperFactory(el, type, fn) {
                return function wrapper(originalEvent) {
                    var e = originalEvent || global.event;
                    e.target = e.target || e.srcElement;
                    e.preventDefault = e.preventDefault || function preventDefault() {
                        e.returnValue = false;
                    };
                    e.stopPropagation = e.stopPropagation || function stopPropagation() {
                        e.cancelBubble = true;
                    };
                    e.which = e.which || e.keyCode;
                    fn.call(el, e);
                };
            }
            function wrap(el, type, fn) {
                var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
                hardCache.push({
                    wrapper: wrapper,
                    element: el,
                    type: type,
                    fn: fn
                });
                return wrapper;
            }
            function unwrap(el, type, fn) {
                var i = find(el, type, fn);
                if (i) {
                    var wrapper = hardCache[i].wrapper;
                    hardCache.splice(i, 1);
                    return wrapper;
                }
            }
            function find(el, type, fn) {
                var i, item;
                for (i = 0; i < hardCache.length; i++) {
                    item = hardCache[i];
                    if (item.element === el && item.type === type && item.fn === fn) {
                        return i;
                    }
                }
            }
            module.exports = {
                add: addEvent,
                remove: removeEvent,
                fabricate: fabricateEvent
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./eventmap": 22,
        "custom-event": 20
    } ],
    22: [ function(require, module, exports) {
        arguments[4][9][0].apply(exports, arguments);
    }, {
        dup: 9
    } ],
    23: [ function(require, module, exports) {
        "use strict";
        function fuzzysearch(needle, haystack) {
            var tlen = haystack.length;
            var qlen = needle.length;
            if (qlen > tlen) {
                return false;
            }
            if (qlen === tlen) {
                return needle === haystack;
            }
            outer: for (var i = 0, j = 0; i < qlen; i++) {
                var nch = needle.charCodeAt(i);
                while (j < tlen) {
                    if (haystack.charCodeAt(j++) === nch) {
                        continue outer;
                    }
                }
                return false;
            }
            return true;
        }
        module.exports = fuzzysearch;
    }, {} ],
    24: [ function(require, module, exports) {
        "use strict";
        var get = easyGet;
        var set = easySet;
        if (document.selection && document.selection.createRange) {
            get = hardGet;
            set = hardSet;
        }
        function easyGet(el) {
            return {
                start: el.selectionStart,
                end: el.selectionEnd
            };
        }
        function hardGet(el) {
            var active = document.activeElement;
            if (active !== el) {
                el.focus();
            }
            var range = document.selection.createRange();
            var bookmark = range.getBookmark();
            var original = el.value;
            var marker = getUniqueMarker(original);
            var parent = range.parentElement();
            if (parent === null || !inputs(parent)) {
                return result(0, 0);
            }
            range.text = marker + range.text + marker;
            var contents = el.value;
            el.value = original;
            range.moveToBookmark(bookmark);
            range.select();
            return result(contents.indexOf(marker), contents.lastIndexOf(marker) - marker.length);
            function result(start, end) {
                if (active !== el) {
                    if (active) {
                        active.focus();
                    } else {
                        el.blur();
                    }
                }
                return {
                    start: start,
                    end: end
                };
            }
        }
        function getUniqueMarker(contents) {
            var marker;
            do {
                marker = "@@marker." + Math.random() * new Date();
            } while (contents.indexOf(marker) !== -1);
            return marker;
        }
        function inputs(el) {
            return el.tagName === "INPUT" && el.type === "text" || el.tagName === "TEXTAREA";
        }
        function easySet(el, p) {
            el.selectionStart = parse(el, p.start);
            el.selectionEnd = parse(el, p.end);
        }
        function hardSet(el, p) {
            var range = el.createTextRange();
            if (p.start === "end" && p.end === "end") {
                range.collapse(false);
                range.select();
            } else {
                range.collapse(true);
                range.moveEnd("character", parse(el, p.end));
                range.moveStart("character", parse(el, p.start));
                range.select();
            }
        }
        function parse(el, value) {
            return value === "end" ? el.value.length : value || 0;
        }
        function sell(el, p) {
            if (arguments.length === 2) {
                set(el, p);
            }
            return get(el);
        }
        module.exports = sell;
    }, {} ],
    25: [ function(require, module, exports) {
        function last(array) {
            var length = array ? array.length : 0;
            return length ? array[length - 1] : undefined;
        }
        module.exports = last;
    }, {} ],
    26: [ function(require, module, exports) {
        var arrayMap = require("../internal/arrayMap"), baseCallback = require("../internal/baseCallback"), baseMap = require("../internal/baseMap"), isArray = require("../lang/isArray");
        function map(collection, iteratee, thisArg) {
            var func = isArray(collection) ? arrayMap : baseMap;
            iteratee = baseCallback(iteratee, thisArg, 3);
            return func(collection, iteratee);
        }
        module.exports = map;
    }, {
        "../internal/arrayMap": 29,
        "../internal/baseCallback": 32,
        "../internal/baseMap": 40,
        "../lang/isArray": 68
    } ],
    27: [ function(require, module, exports) {
        var map = require("./map"), property = require("../utility/property");
        function pluck(collection, path) {
            return map(collection, property(path));
        }
        module.exports = pluck;
    }, {
        "../utility/property": 77,
        "./map": 26
    } ],
    28: [ function(require, module, exports) {
        var arrayReduce = require("../internal/arrayReduce"), baseEach = require("../internal/baseEach"), createReduce = require("../internal/createReduce");
        var reduce = createReduce(arrayReduce, baseEach);
        module.exports = reduce;
    }, {
        "../internal/arrayReduce": 30,
        "../internal/baseEach": 33,
        "../internal/createReduce": 51
    } ],
    29: [ function(require, module, exports) {
        function arrayMap(array, iteratee) {
            var index = -1, length = array.length, result = Array(length);
            while (++index < length) {
                result[index] = iteratee(array[index], index, array);
            }
            return result;
        }
        module.exports = arrayMap;
    }, {} ],
    30: [ function(require, module, exports) {
        function arrayReduce(array, iteratee, accumulator, initFromArray) {
            var index = -1, length = array.length;
            if (initFromArray && length) {
                accumulator = array[++index];
            }
            while (++index < length) {
                accumulator = iteratee(accumulator, array[index], index, array);
            }
            return accumulator;
        }
        module.exports = arrayReduce;
    }, {} ],
    31: [ function(require, module, exports) {
        function arraySome(array, predicate) {
            var index = -1, length = array.length;
            while (++index < length) {
                if (predicate(array[index], index, array)) {
                    return true;
                }
            }
            return false;
        }
        module.exports = arraySome;
    }, {} ],
    32: [ function(require, module, exports) {
        var baseMatches = require("./baseMatches"), baseMatchesProperty = require("./baseMatchesProperty"), bindCallback = require("./bindCallback"), identity = require("../utility/identity"), property = require("../utility/property");
        function baseCallback(func, thisArg, argCount) {
            var type = typeof func;
            if (type == "function") {
                return thisArg === undefined ? func : bindCallback(func, thisArg, argCount);
            }
            if (func == null) {
                return identity;
            }
            if (type == "object") {
                return baseMatches(func);
            }
            return thisArg === undefined ? property(func) : baseMatchesProperty(func, thisArg);
        }
        module.exports = baseCallback;
    }, {
        "../utility/identity": 76,
        "../utility/property": 77,
        "./baseMatches": 41,
        "./baseMatchesProperty": 42,
        "./bindCallback": 48
    } ],
    33: [ function(require, module, exports) {
        var baseForOwn = require("./baseForOwn"), createBaseEach = require("./createBaseEach");
        var baseEach = createBaseEach(baseForOwn);
        module.exports = baseEach;
    }, {
        "./baseForOwn": 35,
        "./createBaseEach": 49
    } ],
    34: [ function(require, module, exports) {
        var createBaseFor = require("./createBaseFor");
        var baseFor = createBaseFor();
        module.exports = baseFor;
    }, {
        "./createBaseFor": 50
    } ],
    35: [ function(require, module, exports) {
        var baseFor = require("./baseFor"), keys = require("../object/keys");
        function baseForOwn(object, iteratee) {
            return baseFor(object, iteratee, keys);
        }
        module.exports = baseForOwn;
    }, {
        "../object/keys": 73,
        "./baseFor": 34
    } ],
    36: [ function(require, module, exports) {
        var toObject = require("./toObject");
        function baseGet(object, path, pathKey) {
            if (object == null) {
                return;
            }
            if (pathKey !== undefined && pathKey in toObject(object)) {
                path = [ pathKey ];
            }
            var index = 0, length = path.length;
            while (object != null && index < length) {
                object = object[path[index++]];
            }
            return index && index == length ? object : undefined;
        }
        module.exports = baseGet;
    }, {
        "./toObject": 65
    } ],
    37: [ function(require, module, exports) {
        var baseIsEqualDeep = require("./baseIsEqualDeep"), isObject = require("../lang/isObject"), isObjectLike = require("./isObjectLike");
        function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
            if (value === other) {
                return true;
            }
            if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
                return value !== value && other !== other;
            }
            return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
        }
        module.exports = baseIsEqual;
    }, {
        "../lang/isObject": 71,
        "./baseIsEqualDeep": 38,
        "./isObjectLike": 62
    } ],
    38: [ function(require, module, exports) {
        var equalArrays = require("./equalArrays"), equalByTag = require("./equalByTag"), equalObjects = require("./equalObjects"), isArray = require("../lang/isArray"), isTypedArray = require("../lang/isTypedArray");
        var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
        var objectProto = Object.prototype;
        var hasOwnProperty = objectProto.hasOwnProperty;
        var objToString = objectProto.toString;
        function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
            var objIsArr = isArray(object), othIsArr = isArray(other), objTag = arrayTag, othTag = arrayTag;
            if (!objIsArr) {
                objTag = objToString.call(object);
                if (objTag == argsTag) {
                    objTag = objectTag;
                } else if (objTag != objectTag) {
                    objIsArr = isTypedArray(object);
                }
            }
            if (!othIsArr) {
                othTag = objToString.call(other);
                if (othTag == argsTag) {
                    othTag = objectTag;
                } else if (othTag != objectTag) {
                    othIsArr = isTypedArray(other);
                }
            }
            var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
            if (isSameTag && !(objIsArr || objIsObj)) {
                return equalByTag(object, other, objTag);
            }
            if (!isLoose) {
                var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
                if (objIsWrapped || othIsWrapped) {
                    return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
                }
            }
            if (!isSameTag) {
                return false;
            }
            stackA || (stackA = []);
            stackB || (stackB = []);
            var length = stackA.length;
            while (length--) {
                if (stackA[length] == object) {
                    return stackB[length] == other;
                }
            }
            stackA.push(object);
            stackB.push(other);
            var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
            stackA.pop();
            stackB.pop();
            return result;
        }
        module.exports = baseIsEqualDeep;
    }, {
        "../lang/isArray": 68,
        "../lang/isTypedArray": 72,
        "./equalArrays": 52,
        "./equalByTag": 53,
        "./equalObjects": 54
    } ],
    39: [ function(require, module, exports) {
        var baseIsEqual = require("./baseIsEqual"), toObject = require("./toObject");
        function baseIsMatch(object, matchData, customizer) {
            var index = matchData.length, length = index, noCustomizer = !customizer;
            if (object == null) {
                return !length;
            }
            object = toObject(object);
            while (index--) {
                var data = matchData[index];
                if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
                    return false;
                }
            }
            while (++index < length) {
                data = matchData[index];
                var key = data[0], objValue = object[key], srcValue = data[1];
                if (noCustomizer && data[2]) {
                    if (objValue === undefined && !(key in object)) {
                        return false;
                    }
                } else {
                    var result = customizer ? customizer(objValue, srcValue, key) : undefined;
                    if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
                        return false;
                    }
                }
            }
            return true;
        }
        module.exports = baseIsMatch;
    }, {
        "./baseIsEqual": 37,
        "./toObject": 65
    } ],
    40: [ function(require, module, exports) {
        var baseEach = require("./baseEach"), isArrayLike = require("./isArrayLike");
        function baseMap(collection, iteratee) {
            var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
            baseEach(collection, function(value, key, collection) {
                result[++index] = iteratee(value, key, collection);
            });
            return result;
        }
        module.exports = baseMap;
    }, {
        "./baseEach": 33,
        "./isArrayLike": 58
    } ],
    41: [ function(require, module, exports) {
        var baseIsMatch = require("./baseIsMatch"), getMatchData = require("./getMatchData"), toObject = require("./toObject");
        function baseMatches(source) {
            var matchData = getMatchData(source);
            if (matchData.length == 1 && matchData[0][2]) {
                var key = matchData[0][0], value = matchData[0][1];
                return function(object) {
                    if (object == null) {
                        return false;
                    }
                    return object[key] === value && (value !== undefined || key in toObject(object));
                };
            }
            return function(object) {
                return baseIsMatch(object, matchData);
            };
        }
        module.exports = baseMatches;
    }, {
        "./baseIsMatch": 39,
        "./getMatchData": 56,
        "./toObject": 65
    } ],
    42: [ function(require, module, exports) {
        var baseGet = require("./baseGet"), baseIsEqual = require("./baseIsEqual"), baseSlice = require("./baseSlice"), isArray = require("../lang/isArray"), isKey = require("./isKey"), isStrictComparable = require("./isStrictComparable"), last = require("../array/last"), toObject = require("./toObject"), toPath = require("./toPath");
        function baseMatchesProperty(path, srcValue) {
            var isArr = isArray(path), isCommon = isKey(path) && isStrictComparable(srcValue), pathKey = path + "";
            path = toPath(path);
            return function(object) {
                if (object == null) {
                    return false;
                }
                var key = pathKey;
                object = toObject(object);
                if ((isArr || !isCommon) && !(key in object)) {
                    object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
                    if (object == null) {
                        return false;
                    }
                    key = last(path);
                    object = toObject(object);
                }
                return object[key] === srcValue ? srcValue !== undefined || key in object : baseIsEqual(srcValue, object[key], undefined, true);
            };
        }
        module.exports = baseMatchesProperty;
    }, {
        "../array/last": 25,
        "../lang/isArray": 68,
        "./baseGet": 36,
        "./baseIsEqual": 37,
        "./baseSlice": 46,
        "./isKey": 60,
        "./isStrictComparable": 63,
        "./toObject": 65,
        "./toPath": 66
    } ],
    43: [ function(require, module, exports) {
        function baseProperty(key) {
            return function(object) {
                return object == null ? undefined : object[key];
            };
        }
        module.exports = baseProperty;
    }, {} ],
    44: [ function(require, module, exports) {
        var baseGet = require("./baseGet"), toPath = require("./toPath");
        function basePropertyDeep(path) {
            var pathKey = path + "";
            path = toPath(path);
            return function(object) {
                return baseGet(object, path, pathKey);
            };
        }
        module.exports = basePropertyDeep;
    }, {
        "./baseGet": 36,
        "./toPath": 66
    } ],
    45: [ function(require, module, exports) {
        function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
            eachFunc(collection, function(value, index, collection) {
                accumulator = initFromCollection ? (initFromCollection = false, value) : iteratee(accumulator, value, index, collection);
            });
            return accumulator;
        }
        module.exports = baseReduce;
    }, {} ],
    46: [ function(require, module, exports) {
        function baseSlice(array, start, end) {
            var index = -1, length = array.length;
            start = start == null ? 0 : +start || 0;
            if (start < 0) {
                start = -start > length ? 0 : length + start;
            }
            end = end === undefined || end > length ? length : +end || 0;
            if (end < 0) {
                end += length;
            }
            length = start > end ? 0 : end - start >>> 0;
            start >>>= 0;
            var result = Array(length);
            while (++index < length) {
                result[index] = array[index + start];
            }
            return result;
        }
        module.exports = baseSlice;
    }, {} ],
    47: [ function(require, module, exports) {
        function baseToString(value) {
            return value == null ? "" : value + "";
        }
        module.exports = baseToString;
    }, {} ],
    48: [ function(require, module, exports) {
        var identity = require("../utility/identity");
        function bindCallback(func, thisArg, argCount) {
            if (typeof func != "function") {
                return identity;
            }
            if (thisArg === undefined) {
                return func;
            }
            switch (argCount) {
              case 1:
                return function(value) {
                    return func.call(thisArg, value);
                };

              case 3:
                return function(value, index, collection) {
                    return func.call(thisArg, value, index, collection);
                };

              case 4:
                return function(accumulator, value, index, collection) {
                    return func.call(thisArg, accumulator, value, index, collection);
                };

              case 5:
                return function(value, other, key, object, source) {
                    return func.call(thisArg, value, other, key, object, source);
                };
            }
            return function() {
                return func.apply(thisArg, arguments);
            };
        }
        module.exports = bindCallback;
    }, {
        "../utility/identity": 76
    } ],
    49: [ function(require, module, exports) {
        var getLength = require("./getLength"), isLength = require("./isLength"), toObject = require("./toObject");
        function createBaseEach(eachFunc, fromRight) {
            return function(collection, iteratee) {
                var length = collection ? getLength(collection) : 0;
                if (!isLength(length)) {
                    return eachFunc(collection, iteratee);
                }
                var index = fromRight ? length : -1, iterable = toObject(collection);
                while (fromRight ? index-- : ++index < length) {
                    if (iteratee(iterable[index], index, iterable) === false) {
                        break;
                    }
                }
                return collection;
            };
        }
        module.exports = createBaseEach;
    }, {
        "./getLength": 55,
        "./isLength": 61,
        "./toObject": 65
    } ],
    50: [ function(require, module, exports) {
        var toObject = require("./toObject");
        function createBaseFor(fromRight) {
            return function(object, iteratee, keysFunc) {
                var iterable = toObject(object), props = keysFunc(object), length = props.length, index = fromRight ? length : -1;
                while (fromRight ? index-- : ++index < length) {
                    var key = props[index];
                    if (iteratee(iterable[key], key, iterable) === false) {
                        break;
                    }
                }
                return object;
            };
        }
        module.exports = createBaseFor;
    }, {
        "./toObject": 65
    } ],
    51: [ function(require, module, exports) {
        var baseCallback = require("./baseCallback"), baseReduce = require("./baseReduce"), isArray = require("../lang/isArray");
        function createReduce(arrayFunc, eachFunc) {
            return function(collection, iteratee, accumulator, thisArg) {
                var initFromArray = arguments.length < 3;
                return typeof iteratee == "function" && thisArg === undefined && isArray(collection) ? arrayFunc(collection, iteratee, accumulator, initFromArray) : baseReduce(collection, baseCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
            };
        }
        module.exports = createReduce;
    }, {
        "../lang/isArray": 68,
        "./baseCallback": 32,
        "./baseReduce": 45
    } ],
    52: [ function(require, module, exports) {
        var arraySome = require("./arraySome");
        function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
            var index = -1, arrLength = array.length, othLength = other.length;
            if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
                return false;
            }
            while (++index < arrLength) {
                var arrValue = array[index], othValue = other[index], result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;
                if (result !== undefined) {
                    if (result) {
                        continue;
                    }
                    return false;
                }
                if (isLoose) {
                    if (!arraySome(other, function(othValue) {
                        return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
                    })) {
                        return false;
                    }
                } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
                    return false;
                }
            }
            return true;
        }
        module.exports = equalArrays;
    }, {
        "./arraySome": 31
    } ],
    53: [ function(require, module, exports) {
        var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", numberTag = "[object Number]", regexpTag = "[object RegExp]", stringTag = "[object String]";
        function equalByTag(object, other, tag) {
            switch (tag) {
              case boolTag:
              case dateTag:
                return +object == +other;

              case errorTag:
                return object.name == other.name && object.message == other.message;

              case numberTag:
                return object != +object ? other != +other : object == +other;

              case regexpTag:
              case stringTag:
                return object == other + "";
            }
            return false;
        }
        module.exports = equalByTag;
    }, {} ],
    54: [ function(require, module, exports) {
        var keys = require("../object/keys");
        var objectProto = Object.prototype;
        var hasOwnProperty = objectProto.hasOwnProperty;
        function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
            var objProps = keys(object), objLength = objProps.length, othProps = keys(other), othLength = othProps.length;
            if (objLength != othLength && !isLoose) {
                return false;
            }
            var index = objLength;
            while (index--) {
                var key = objProps[index];
                if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
                    return false;
                }
            }
            var skipCtor = isLoose;
            while (++index < objLength) {
                key = objProps[index];
                var objValue = object[key], othValue = other[key], result = customizer ? customizer(isLoose ? othValue : objValue, isLoose ? objValue : othValue, key) : undefined;
                if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
                    return false;
                }
                skipCtor || (skipCtor = key == "constructor");
            }
            if (!skipCtor) {
                var objCtor = object.constructor, othCtor = other.constructor;
                if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
                    return false;
                }
            }
            return true;
        }
        module.exports = equalObjects;
    }, {
        "../object/keys": 73
    } ],
    55: [ function(require, module, exports) {
        var baseProperty = require("./baseProperty");
        var getLength = baseProperty("length");
        module.exports = getLength;
    }, {
        "./baseProperty": 43
    } ],
    56: [ function(require, module, exports) {
        var isStrictComparable = require("./isStrictComparable"), pairs = require("../object/pairs");
        function getMatchData(object) {
            var result = pairs(object), length = result.length;
            while (length--) {
                result[length][2] = isStrictComparable(result[length][1]);
            }
            return result;
        }
        module.exports = getMatchData;
    }, {
        "../object/pairs": 75,
        "./isStrictComparable": 63
    } ],
    57: [ function(require, module, exports) {
        var isNative = require("../lang/isNative");
        function getNative(object, key) {
            var value = object == null ? undefined : object[key];
            return isNative(value) ? value : undefined;
        }
        module.exports = getNative;
    }, {
        "../lang/isNative": 70
    } ],
    58: [ function(require, module, exports) {
        var getLength = require("./getLength"), isLength = require("./isLength");
        function isArrayLike(value) {
            return value != null && isLength(getLength(value));
        }
        module.exports = isArrayLike;
    }, {
        "./getLength": 55,
        "./isLength": 61
    } ],
    59: [ function(require, module, exports) {
        var reIsUint = /^\d+$/;
        var MAX_SAFE_INTEGER = 9007199254740991;
        function isIndex(value, length) {
            value = typeof value == "number" || reIsUint.test(value) ? +value : -1;
            length = length == null ? MAX_SAFE_INTEGER : length;
            return value > -1 && value % 1 == 0 && value < length;
        }
        module.exports = isIndex;
    }, {} ],
    60: [ function(require, module, exports) {
        var isArray = require("../lang/isArray"), toObject = require("./toObject");
        var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
        function isKey(value, object) {
            var type = typeof value;
            if (type == "string" && reIsPlainProp.test(value) || type == "number") {
                return true;
            }
            if (isArray(value)) {
                return false;
            }
            var result = !reIsDeepProp.test(value);
            return result || object != null && value in toObject(object);
        }
        module.exports = isKey;
    }, {
        "../lang/isArray": 68,
        "./toObject": 65
    } ],
    61: [ function(require, module, exports) {
        var MAX_SAFE_INTEGER = 9007199254740991;
        function isLength(value) {
            return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
        }
        module.exports = isLength;
    }, {} ],
    62: [ function(require, module, exports) {
        function isObjectLike(value) {
            return !!value && typeof value == "object";
        }
        module.exports = isObjectLike;
    }, {} ],
    63: [ function(require, module, exports) {
        var isObject = require("../lang/isObject");
        function isStrictComparable(value) {
            return value === value && !isObject(value);
        }
        module.exports = isStrictComparable;
    }, {
        "../lang/isObject": 71
    } ],
    64: [ function(require, module, exports) {
        var isArguments = require("../lang/isArguments"), isArray = require("../lang/isArray"), isIndex = require("./isIndex"), isLength = require("./isLength"), keysIn = require("../object/keysIn");
        var objectProto = Object.prototype;
        var hasOwnProperty = objectProto.hasOwnProperty;
        function shimKeys(object) {
            var props = keysIn(object), propsLength = props.length, length = propsLength && object.length;
            var allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object));
            var index = -1, result = [];
            while (++index < propsLength) {
                var key = props[index];
                if (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) {
                    result.push(key);
                }
            }
            return result;
        }
        module.exports = shimKeys;
    }, {
        "../lang/isArguments": 67,
        "../lang/isArray": 68,
        "../object/keysIn": 74,
        "./isIndex": 59,
        "./isLength": 61
    } ],
    65: [ function(require, module, exports) {
        var isObject = require("../lang/isObject");
        function toObject(value) {
            return isObject(value) ? value : Object(value);
        }
        module.exports = toObject;
    }, {
        "../lang/isObject": 71
    } ],
    66: [ function(require, module, exports) {
        var baseToString = require("./baseToString"), isArray = require("../lang/isArray");
        var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
        var reEscapeChar = /\\(\\)?/g;
        function toPath(value) {
            if (isArray(value)) {
                return value;
            }
            var result = [];
            baseToString(value).replace(rePropName, function(match, number, quote, string) {
                result.push(quote ? string.replace(reEscapeChar, "$1") : number || match);
            });
            return result;
        }
        module.exports = toPath;
    }, {
        "../lang/isArray": 68,
        "./baseToString": 47
    } ],
    67: [ function(require, module, exports) {
        var isArrayLike = require("../internal/isArrayLike"), isObjectLike = require("../internal/isObjectLike");
        var objectProto = Object.prototype;
        var hasOwnProperty = objectProto.hasOwnProperty;
        var propertyIsEnumerable = objectProto.propertyIsEnumerable;
        function isArguments(value) {
            return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
        }
        module.exports = isArguments;
    }, {
        "../internal/isArrayLike": 58,
        "../internal/isObjectLike": 62
    } ],
    68: [ function(require, module, exports) {
        var getNative = require("../internal/getNative"), isLength = require("../internal/isLength"), isObjectLike = require("../internal/isObjectLike");
        var arrayTag = "[object Array]";
        var objectProto = Object.prototype;
        var objToString = objectProto.toString;
        var nativeIsArray = getNative(Array, "isArray");
        var isArray = nativeIsArray || function(value) {
            return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
        };
        module.exports = isArray;
    }, {
        "../internal/getNative": 57,
        "../internal/isLength": 61,
        "../internal/isObjectLike": 62
    } ],
    69: [ function(require, module, exports) {
        var isObject = require("./isObject");
        var funcTag = "[object Function]";
        var objectProto = Object.prototype;
        var objToString = objectProto.toString;
        function isFunction(value) {
            return isObject(value) && objToString.call(value) == funcTag;
        }
        module.exports = isFunction;
    }, {
        "./isObject": 71
    } ],
    70: [ function(require, module, exports) {
        var isFunction = require("./isFunction"), isObjectLike = require("../internal/isObjectLike");
        var reIsHostCtor = /^\[object .+?Constructor\]$/;
        var objectProto = Object.prototype;
        var fnToString = Function.prototype.toString;
        var hasOwnProperty = objectProto.hasOwnProperty;
        var reIsNative = RegExp("^" + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
        function isNative(value) {
            if (value == null) {
                return false;
            }
            if (isFunction(value)) {
                return reIsNative.test(fnToString.call(value));
            }
            return isObjectLike(value) && reIsHostCtor.test(value);
        }
        module.exports = isNative;
    }, {
        "../internal/isObjectLike": 62,
        "./isFunction": 69
    } ],
    71: [ function(require, module, exports) {
        function isObject(value) {
            var type = typeof value;
            return !!value && (type == "object" || type == "function");
        }
        module.exports = isObject;
    }, {} ],
    72: [ function(require, module, exports) {
        var isLength = require("../internal/isLength"), isObjectLike = require("../internal/isObjectLike");
        var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]";
        var arrayBufferTag = "[object ArrayBuffer]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
        var typedArrayTags = {};
        typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
        typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
        var objectProto = Object.prototype;
        var objToString = objectProto.toString;
        function isTypedArray(value) {
            return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
        }
        module.exports = isTypedArray;
    }, {
        "../internal/isLength": 61,
        "../internal/isObjectLike": 62
    } ],
    73: [ function(require, module, exports) {
        var getNative = require("../internal/getNative"), isArrayLike = require("../internal/isArrayLike"), isObject = require("../lang/isObject"), shimKeys = require("../internal/shimKeys");
        var nativeKeys = getNative(Object, "keys");
        var keys = !nativeKeys ? shimKeys : function(object) {
            var Ctor = object == null ? undefined : object.constructor;
            if (typeof Ctor == "function" && Ctor.prototype === object || typeof object != "function" && isArrayLike(object)) {
                return shimKeys(object);
            }
            return isObject(object) ? nativeKeys(object) : [];
        };
        module.exports = keys;
    }, {
        "../internal/getNative": 57,
        "../internal/isArrayLike": 58,
        "../internal/shimKeys": 64,
        "../lang/isObject": 71
    } ],
    74: [ function(require, module, exports) {
        var isArguments = require("../lang/isArguments"), isArray = require("../lang/isArray"), isIndex = require("../internal/isIndex"), isLength = require("../internal/isLength"), isObject = require("../lang/isObject");
        var objectProto = Object.prototype;
        var hasOwnProperty = objectProto.hasOwnProperty;
        function keysIn(object) {
            if (object == null) {
                return [];
            }
            if (!isObject(object)) {
                object = Object(object);
            }
            var length = object.length;
            length = length && isLength(length) && (isArray(object) || isArguments(object)) && length || 0;
            var Ctor = object.constructor, index = -1, isProto = typeof Ctor == "function" && Ctor.prototype === object, result = Array(length), skipIndexes = length > 0;
            while (++index < length) {
                result[index] = index + "";
            }
            for (var key in object) {
                if (!(skipIndexes && isIndex(key, length)) && !(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
                    result.push(key);
                }
            }
            return result;
        }
        module.exports = keysIn;
    }, {
        "../internal/isIndex": 59,
        "../internal/isLength": 61,
        "../lang/isArguments": 67,
        "../lang/isArray": 68,
        "../lang/isObject": 71
    } ],
    75: [ function(require, module, exports) {
        var keys = require("./keys"), toObject = require("../internal/toObject");
        function pairs(object) {
            object = toObject(object);
            var index = -1, props = keys(object), length = props.length, result = Array(length);
            while (++index < length) {
                var key = props[index];
                result[index] = [ key, object[key] ];
            }
            return result;
        }
        module.exports = pairs;
    }, {
        "../internal/toObject": 65,
        "./keys": 73
    } ],
    76: [ function(require, module, exports) {
        function identity(value) {
            return value;
        }
        module.exports = identity;
    }, {} ],
    77: [ function(require, module, exports) {
        var baseProperty = require("../internal/baseProperty"), basePropertyDeep = require("../internal/basePropertyDeep"), isKey = require("../internal/isKey");
        function property(path) {
            return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
        }
        module.exports = property;
    }, {
        "../internal/baseProperty": 43,
        "../internal/basePropertyDeep": 44,
        "../internal/isKey": 60
    } ],
    78: [ function(require, module, exports) {
        "use strict";
        module.exports = require("./lib/");
    }, {
        "./lib/": 88
    } ],
    79: [ function(require, module, exports) {
        "use strict";
        module.exports = require("entities/maps/entities.json");
    }, {
        "entities/maps/entities.json": 131
    } ],
    80: [ function(require, module, exports) {
        "use strict";
        module.exports = [ "address", "article", "aside", "base", "basefont", "blockquote", "body", "caption", "center", "col", "colgroup", "dd", "details", "dialog", "dir", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "head", "header", "hr", "html", "iframe", "legend", "li", "link", "main", "menu", "menuitem", "meta", "nav", "noframes", "ol", "optgroup", "option", "p", "param", "pre", "section", "source", "title", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "title", "tr", "track", "ul" ];
    }, {} ],
    81: [ function(require, module, exports) {
        "use strict";
        var attr_name = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
        var unquoted = "[^\"'=<>`\\x00-\\x20]+";
        var single_quoted = "'[^']*'";
        var double_quoted = '"[^"]*"';
        var attr_value = "(?:" + unquoted + "|" + single_quoted + "|" + double_quoted + ")";
        var attribute = "(?:\\s+" + attr_name + "(?:\\s*=\\s*" + attr_value + ")?)";
        var open_tag = "<[A-Za-z][A-Za-z0-9\\-]*" + attribute + "*\\s*\\/?>";
        var close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
        var comment = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->";
        var processing = "<[?].*?[?]>";
        var declaration = "<![A-Z]+\\s+[^>]*>";
        var cdata = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
        var HTML_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + "|" + comment + "|" + processing + "|" + declaration + "|" + cdata + ")");
        var HTML_OPEN_CLOSE_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + ")");
        module.exports.HTML_TAG_RE = HTML_TAG_RE;
        module.exports.HTML_OPEN_CLOSE_TAG_RE = HTML_OPEN_CLOSE_TAG_RE;
    }, {} ],
    82: [ function(require, module, exports) {
        "use strict";
        module.exports = [ "coap", "doi", "javascript", "aaa", "aaas", "about", "acap", "cap", "cid", "crid", "data", "dav", "dict", "dns", "file", "ftp", "geo", "go", "gopher", "h323", "http", "https", "iax", "icap", "im", "imap", "info", "ipp", "iris", "iris.beep", "iris.xpc", "iris.xpcs", "iris.lwz", "ldap", "mailto", "mid", "msrp", "msrps", "mtqp", "mupdate", "news", "nfs", "ni", "nih", "nntp", "opaquelocktoken", "pop", "pres", "rtsp", "service", "session", "shttp", "sieve", "sip", "sips", "sms", "snmp", "soap.beep", "soap.beeps", "tag", "tel", "telnet", "tftp", "thismessage", "tn3270", "tip", "tv", "urn", "vemmi", "ws", "wss", "xcon", "xcon-userid", "xmlrpc.beep", "xmlrpc.beeps", "xmpp", "z39.50r", "z39.50s", "adiumxtra", "afp", "afs", "aim", "apt", "attachment", "aw", "beshare", "bitcoin", "bolo", "callto", "chrome", "chrome-extension", "com-eventbrite-attendee", "content", "cvs", "dlna-playsingle", "dlna-playcontainer", "dtn", "dvb", "ed2k", "facetime", "feed", "finger", "fish", "gg", "git", "gizmoproject", "gtalk", "hcp", "icon", "ipn", "irc", "irc6", "ircs", "itms", "jar", "jms", "keyparc", "lastfm", "ldaps", "magnet", "maps", "market", "message", "mms", "ms-help", "msnim", "mumble", "mvn", "notes", "oid", "palm", "paparazzi", "platform", "proxy", "psyc", "query", "res", "resource", "rmi", "rsync", "rtmp", "secondlife", "sftp", "sgn", "skype", "smb", "soldat", "spotify", "ssh", "steam", "svn", "teamspeak", "things", "udp", "unreal", "ut2004", "ventrilo", "view-source", "webcal", "wtai", "wyciwyg", "xfire", "xri", "ymsgr" ];
    }, {} ],
    83: [ function(require, module, exports) {
        "use strict";
        function _class(obj) {
            return Object.prototype.toString.call(obj);
        }
        function isString(obj) {
            return _class(obj) === "[object String]";
        }
        var _hasOwnProperty = Object.prototype.hasOwnProperty;
        function has(object, key) {
            return _hasOwnProperty.call(object, key);
        }
        function assign(obj) {
            var sources = Array.prototype.slice.call(arguments, 1);
            sources.forEach(function(source) {
                if (!source) {
                    return;
                }
                if (typeof source !== "object") {
                    throw new TypeError(source + "must be object");
                }
                Object.keys(source).forEach(function(key) {
                    obj[key] = source[key];
                });
            });
            return obj;
        }
        function arrayReplaceAt(src, pos, newElements) {
            return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
        }
        function isValidEntityCode(c) {
            if (c >= 55296 && c <= 57343) {
                return false;
            }
            if (c >= 64976 && c <= 65007) {
                return false;
            }
            if ((c & 65535) === 65535 || (c & 65535) === 65534) {
                return false;
            }
            if (c >= 0 && c <= 8) {
                return false;
            }
            if (c === 11) {
                return false;
            }
            if (c >= 14 && c <= 31) {
                return false;
            }
            if (c >= 127 && c <= 159) {
                return false;
            }
            if (c > 1114111) {
                return false;
            }
            return true;
        }
        function fromCodePoint(c) {
            if (c > 65535) {
                c -= 65536;
                var surrogate1 = 55296 + (c >> 10), surrogate2 = 56320 + (c & 1023);
                return String.fromCharCode(surrogate1, surrogate2);
            }
            return String.fromCharCode(c);
        }
        var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
        var ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
        var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + "|" + ENTITY_RE.source, "gi");
        var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;
        var entities = require("./entities");
        function replaceEntityPattern(match, name) {
            var code = 0;
            if (has(entities, name)) {
                return entities[name];
            }
            if (name.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name)) {
                code = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
                if (isValidEntityCode(code)) {
                    return fromCodePoint(code);
                }
            }
            return match;
        }
        function unescapeMd(str) {
            if (str.indexOf("\\") < 0) {
                return str;
            }
            return str.replace(UNESCAPE_MD_RE, "$1");
        }
        function unescapeAll(str) {
            if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) {
                return str;
            }
            return str.replace(UNESCAPE_ALL_RE, function(match, escaped, entity) {
                if (escaped) {
                    return escaped;
                }
                return replaceEntityPattern(match, entity);
            });
        }
        var HTML_ESCAPE_TEST_RE = /[&<>"]/;
        var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
        var HTML_REPLACEMENTS = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        };
        function replaceUnsafeChar(ch) {
            return HTML_REPLACEMENTS[ch];
        }
        function escapeHtml(str) {
            if (HTML_ESCAPE_TEST_RE.test(str)) {
                return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
            }
            return str;
        }
        var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
        function escapeRE(str) {
            return str.replace(REGEXP_ESCAPE_RE, "\\$&");
        }
        function isSpace(code) {
            switch (code) {
              case 9:
              case 32:
                return true;
            }
            return false;
        }
        function isWhiteSpace(code) {
            if (code >= 8192 && code <= 8202) {
                return true;
            }
            switch (code) {
              case 9:
              case 10:
              case 11:
              case 12:
              case 13:
              case 32:
              case 160:
              case 5760:
              case 8239:
              case 8287:
              case 12288:
                return true;
            }
            return false;
        }
        var UNICODE_PUNCT_RE = require("uc.micro/categories/P/regex");
        function isPunctChar(ch) {
            return UNICODE_PUNCT_RE.test(ch);
        }
        function isMdAsciiPunct(ch) {
            switch (ch) {
              case 33:
              case 34:
              case 35:
              case 36:
              case 37:
              case 38:
              case 39:
              case 40:
              case 41:
              case 42:
              case 43:
              case 44:
              case 45:
              case 46:
              case 47:
              case 58:
              case 59:
              case 60:
              case 61:
              case 62:
              case 63:
              case 64:
              case 91:
              case 92:
              case 93:
              case 94:
              case 95:
              case 96:
              case 123:
              case 124:
              case 125:
              case 126:
                return true;

              default:
                return false;
            }
        }
        function normalizeReference(str) {
            return str.trim().replace(/\s+/g, " ").toUpperCase();
        }
        exports.lib = {};
        exports.lib.mdurl = require("mdurl");
        exports.lib.ucmicro = require("uc.micro");
        exports.assign = assign;
        exports.isString = isString;
        exports.has = has;
        exports.unescapeMd = unescapeMd;
        exports.unescapeAll = unescapeAll;
        exports.isValidEntityCode = isValidEntityCode;
        exports.fromCodePoint = fromCodePoint;
        exports.escapeHtml = escapeHtml;
        exports.arrayReplaceAt = arrayReplaceAt;
        exports.isSpace = isSpace;
        exports.isWhiteSpace = isWhiteSpace;
        exports.isMdAsciiPunct = isMdAsciiPunct;
        exports.isPunctChar = isPunctChar;
        exports.escapeRE = escapeRE;
        exports.normalizeReference = normalizeReference;
    }, {
        "./entities": 79,
        mdurl: 137,
        "uc.micro": 143,
        "uc.micro/categories/P/regex": 141
    } ],
    84: [ function(require, module, exports) {
        "use strict";
        exports.parseLinkLabel = require("./parse_link_label");
        exports.parseLinkDestination = require("./parse_link_destination");
        exports.parseLinkTitle = require("./parse_link_title");
    }, {
        "./parse_link_destination": 85,
        "./parse_link_label": 86,
        "./parse_link_title": 87
    } ],
    85: [ function(require, module, exports) {
        "use strict";
        var unescapeAll = require("../common/utils").unescapeAll;
        module.exports = function parseLinkDestination(str, pos, max) {
            var code, level, lines = 0, start = pos, result = {
                ok: false,
                pos: 0,
                lines: 0,
                str: ""
            };
            if (str.charCodeAt(pos) === 60) {
                pos++;
                while (pos < max) {
                    code = str.charCodeAt(pos);
                    if (code === 10) {
                        return result;
                    }
                    if (code === 62) {
                        result.pos = pos + 1;
                        result.str = unescapeAll(str.slice(start + 1, pos));
                        result.ok = true;
                        return result;
                    }
                    if (code === 92 && pos + 1 < max) {
                        pos += 2;
                        continue;
                    }
                    pos++;
                }
                return result;
            }
            level = 0;
            while (pos < max) {
                code = str.charCodeAt(pos);
                if (code === 32) {
                    break;
                }
                if (code < 32 || code === 127) {
                    break;
                }
                if (code === 92 && pos + 1 < max) {
                    pos += 2;
                    continue;
                }
                if (code === 40) {
                    level++;
                    if (level > 1) {
                        break;
                    }
                }
                if (code === 41) {
                    level--;
                    if (level < 0) {
                        break;
                    }
                }
                pos++;
            }
            if (start === pos) {
                return result;
            }
            result.str = unescapeAll(str.slice(start, pos));
            result.lines = lines;
            result.pos = pos;
            result.ok = true;
            return result;
        };
    }, {
        "../common/utils": 83
    } ],
    86: [ function(require, module, exports) {
        "use strict";
        module.exports = function parseLinkLabel(state, start, disableNested) {
            var level, found, marker, prevPos, labelEnd = -1, max = state.posMax, oldPos = state.pos;
            state.pos = start + 1;
            level = 1;
            while (state.pos < max) {
                marker = state.src.charCodeAt(state.pos);
                if (marker === 93) {
                    level--;
                    if (level === 0) {
                        found = true;
                        break;
                    }
                }
                prevPos = state.pos;
                state.md.inline.skipToken(state);
                if (marker === 91) {
                    if (prevPos === state.pos - 1) {
                        level++;
                    } else if (disableNested) {
                        state.pos = oldPos;
                        return -1;
                    }
                }
            }
            if (found) {
                labelEnd = state.pos;
            }
            state.pos = oldPos;
            return labelEnd;
        };
    }, {} ],
    87: [ function(require, module, exports) {
        "use strict";
        var unescapeAll = require("../common/utils").unescapeAll;
        module.exports = function parseLinkTitle(str, pos, max) {
            var code, marker, lines = 0, start = pos, result = {
                ok: false,
                pos: 0,
                lines: 0,
                str: ""
            };
            if (pos >= max) {
                return result;
            }
            marker = str.charCodeAt(pos);
            if (marker !== 34 && marker !== 39 && marker !== 40) {
                return result;
            }
            pos++;
            if (marker === 40) {
                marker = 41;
            }
            while (pos < max) {
                code = str.charCodeAt(pos);
                if (code === marker) {
                    result.pos = pos + 1;
                    result.lines = lines;
                    result.str = unescapeAll(str.slice(start + 1, pos));
                    result.ok = true;
                    return result;
                } else if (code === 10) {
                    lines++;
                } else if (code === 92 && pos + 1 < max) {
                    pos++;
                    if (str.charCodeAt(pos) === 10) {
                        lines++;
                    }
                }
                pos++;
            }
            return result;
        };
    }, {
        "../common/utils": 83
    } ],
    88: [ function(require, module, exports) {
        "use strict";
        var utils = require("./common/utils");
        var helpers = require("./helpers");
        var Renderer = require("./renderer");
        var ParserCore = require("./parser_core");
        var ParserBlock = require("./parser_block");
        var ParserInline = require("./parser_inline");
        var LinkifyIt = require("linkify-it");
        var mdurl = require("mdurl");
        var punycode = require("punycode");
        var config = {
            "default": require("./presets/default"),
            zero: require("./presets/zero"),
            commonmark: require("./presets/commonmark")
        };
        var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
        var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
        function validateLink(url) {
            var str = url.trim().toLowerCase();
            return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) ? true : false : true;
        }
        var RECODE_HOSTNAME_FOR = [ "http:", "https:", "mailto:" ];
        function normalizeLink(url) {
            var parsed = mdurl.parse(url, true);
            if (parsed.hostname) {
                if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
                    try {
                        parsed.hostname = punycode.toASCII(parsed.hostname);
                    } catch (er) {}
                }
            }
            return mdurl.encode(mdurl.format(parsed));
        }
        function normalizeLinkText(url) {
            var parsed = mdurl.parse(url, true);
            if (parsed.hostname) {
                if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
                    try {
                        parsed.hostname = punycode.toUnicode(parsed.hostname);
                    } catch (er) {}
                }
            }
            return mdurl.decode(mdurl.format(parsed));
        }
        function MarkdownIt(presetName, options) {
            if (!(this instanceof MarkdownIt)) {
                return new MarkdownIt(presetName, options);
            }
            if (!options) {
                if (!utils.isString(presetName)) {
                    options = presetName || {};
                    presetName = "default";
                }
            }
            this.inline = new ParserInline();
            this.block = new ParserBlock();
            this.core = new ParserCore();
            this.renderer = new Renderer();
            this.linkify = new LinkifyIt();
            this.validateLink = validateLink;
            this.normalizeLink = normalizeLink;
            this.normalizeLinkText = normalizeLinkText;
            this.utils = utils;
            this.helpers = helpers;
            this.options = {};
            this.configure(presetName);
            if (options) {
                this.set(options);
            }
        }
        MarkdownIt.prototype.set = function(options) {
            utils.assign(this.options, options);
            return this;
        };
        MarkdownIt.prototype.configure = function(presets) {
            var self = this, presetName;
            if (utils.isString(presets)) {
                presetName = presets;
                presets = config[presetName];
                if (!presets) {
                    throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name');
                }
            }
            if (!presets) {
                throw new Error("Wrong `markdown-it` preset, can't be empty");
            }
            if (presets.options) {
                self.set(presets.options);
            }
            if (presets.components) {
                Object.keys(presets.components).forEach(function(name) {
                    if (presets.components[name].rules) {
                        self[name].ruler.enableOnly(presets.components[name].rules);
                    }
                    if (presets.components[name].rules2) {
                        self[name].ruler2.enableOnly(presets.components[name].rules2);
                    }
                });
            }
            return this;
        };
        MarkdownIt.prototype.enable = function(list, ignoreInvalid) {
            var result = [];
            if (!Array.isArray(list)) {
                list = [ list ];
            }
            [ "core", "block", "inline" ].forEach(function(chain) {
                result = result.concat(this[chain].ruler.enable(list, true));
            }, this);
            result = result.concat(this.inline.ruler2.enable(list, true));
            var missed = list.filter(function(name) {
                return result.indexOf(name) < 0;
            });
            if (missed.length && !ignoreInvalid) {
                throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + missed);
            }
            return this;
        };
        MarkdownIt.prototype.disable = function(list, ignoreInvalid) {
            var result = [];
            if (!Array.isArray(list)) {
                list = [ list ];
            }
            [ "core", "block", "inline" ].forEach(function(chain) {
                result = result.concat(this[chain].ruler.disable(list, true));
            }, this);
            result = result.concat(this.inline.ruler2.disable(list, true));
            var missed = list.filter(function(name) {
                return result.indexOf(name) < 0;
            });
            if (missed.length && !ignoreInvalid) {
                throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + missed);
            }
            return this;
        };
        MarkdownIt.prototype.use = function(plugin) {
            var args = [ this ].concat(Array.prototype.slice.call(arguments, 1));
            plugin.apply(plugin, args);
            return this;
        };
        MarkdownIt.prototype.parse = function(src, env) {
            var state = new this.core.State(src, this, env);
            this.core.process(state);
            return state.tokens;
        };
        MarkdownIt.prototype.render = function(src, env) {
            env = env || {};
            return this.renderer.render(this.parse(src, env), this.options, env);
        };
        MarkdownIt.prototype.parseInline = function(src, env) {
            var state = new this.core.State(src, this, env);
            state.inlineMode = true;
            this.core.process(state);
            return state.tokens;
        };
        MarkdownIt.prototype.renderInline = function(src, env) {
            env = env || {};
            return this.renderer.render(this.parseInline(src, env), this.options, env);
        };
        module.exports = MarkdownIt;
    }, {
        "./common/utils": 83,
        "./helpers": 84,
        "./parser_block": 89,
        "./parser_core": 90,
        "./parser_inline": 91,
        "./presets/commonmark": 92,
        "./presets/default": 93,
        "./presets/zero": 94,
        "./renderer": 95,
        "linkify-it": 132,
        mdurl: 137,
        punycode: 4
    } ],
    89: [ function(require, module, exports) {
        "use strict";
        var Ruler = require("./ruler");
        var _rules = [ [ "code", require("./rules_block/code") ], [ "fence", require("./rules_block/fence"), [ "paragraph", "reference", "blockquote", "list" ] ], [ "blockquote", require("./rules_block/blockquote"), [ "paragraph", "reference", "list" ] ], [ "hr", require("./rules_block/hr"), [ "paragraph", "reference", "blockquote", "list" ] ], [ "list", require("./rules_block/list"), [ "paragraph", "reference", "blockquote" ] ], [ "reference", require("./rules_block/reference") ], [ "heading", require("./rules_block/heading"), [ "paragraph", "reference", "blockquote" ] ], [ "lheading", require("./rules_block/lheading") ], [ "html_block", require("./rules_block/html_block"), [ "paragraph", "reference", "blockquote" ] ], [ "table", require("./rules_block/table"), [ "paragraph", "reference" ] ], [ "paragraph", require("./rules_block/paragraph") ] ];
        function ParserBlock() {
            this.ruler = new Ruler();
            for (var i = 0; i < _rules.length; i++) {
                this.ruler.push(_rules[i][0], _rules[i][1], {
                    alt: (_rules[i][2] || []).slice()
                });
            }
        }
        ParserBlock.prototype.tokenize = function(state, startLine, endLine) {
            var ok, i, rules = this.ruler.getRules(""), len = rules.length, line = startLine, hasEmptyLines = false, maxNesting = state.md.options.maxNesting;
            while (line < endLine) {
                state.line = line = state.skipEmptyLines(line);
                if (line >= endLine) {
                    break;
                }
                if (state.sCount[line] < state.blkIndent) {
                    break;
                }
                if (state.level >= maxNesting) {
                    state.line = endLine;
                    break;
                }
                for (i = 0; i < len; i++) {
                    ok = rules[i](state, line, endLine, false);
                    if (ok) {
                        break;
                    }
                }
                state.tight = !hasEmptyLines;
                if (state.isEmpty(state.line - 1)) {
                    hasEmptyLines = true;
                }
                line = state.line;
                if (line < endLine && state.isEmpty(line)) {
                    hasEmptyLines = true;
                    line++;
                    if (line < endLine && state.parentType === "list" && state.isEmpty(line)) {
                        break;
                    }
                    state.line = line;
                }
            }
        };
        ParserBlock.prototype.parse = function(src, md, env, outTokens) {
            var state;
            if (!src) {
                return [];
            }
            state = new this.State(src, md, env, outTokens);
            this.tokenize(state, state.line, state.lineMax);
        };
        ParserBlock.prototype.State = require("./rules_block/state_block");
        module.exports = ParserBlock;
    }, {
        "./ruler": 96,
        "./rules_block/blockquote": 97,
        "./rules_block/code": 98,
        "./rules_block/fence": 99,
        "./rules_block/heading": 100,
        "./rules_block/hr": 101,
        "./rules_block/html_block": 102,
        "./rules_block/lheading": 103,
        "./rules_block/list": 104,
        "./rules_block/paragraph": 105,
        "./rules_block/reference": 106,
        "./rules_block/state_block": 107,
        "./rules_block/table": 108
    } ],
    90: [ function(require, module, exports) {
        "use strict";
        var Ruler = require("./ruler");
        var _rules = [ [ "normalize", require("./rules_core/normalize") ], [ "block", require("./rules_core/block") ], [ "inline", require("./rules_core/inline") ], [ "linkify", require("./rules_core/linkify") ], [ "replacements", require("./rules_core/replacements") ], [ "smartquotes", require("./rules_core/smartquotes") ] ];
        function Core() {
            this.ruler = new Ruler();
            for (var i = 0; i < _rules.length; i++) {
                this.ruler.push(_rules[i][0], _rules[i][1]);
            }
        }
        Core.prototype.process = function(state) {
            var i, l, rules;
            rules = this.ruler.getRules("");
            for (i = 0, l = rules.length; i < l; i++) {
                rules[i](state);
            }
        };
        Core.prototype.State = require("./rules_core/state_core");
        module.exports = Core;
    }, {
        "./ruler": 96,
        "./rules_core/block": 109,
        "./rules_core/inline": 110,
        "./rules_core/linkify": 111,
        "./rules_core/normalize": 112,
        "./rules_core/replacements": 113,
        "./rules_core/smartquotes": 114,
        "./rules_core/state_core": 115
    } ],
    91: [ function(require, module, exports) {
        "use strict";
        var Ruler = require("./ruler");
        var _rules = [ [ "text", require("./rules_inline/text") ], [ "newline", require("./rules_inline/newline") ], [ "escape", require("./rules_inline/escape") ], [ "backticks", require("./rules_inline/backticks") ], [ "strikethrough", require("./rules_inline/strikethrough").tokenize ], [ "emphasis", require("./rules_inline/emphasis").tokenize ], [ "link", require("./rules_inline/link") ], [ "image", require("./rules_inline/image") ], [ "autolink", require("./rules_inline/autolink") ], [ "html_inline", require("./rules_inline/html_inline") ], [ "entity", require("./rules_inline/entity") ] ];
        var _rules2 = [ [ "balance_pairs", require("./rules_inline/balance_pairs") ], [ "strikethrough", require("./rules_inline/strikethrough").postProcess ], [ "emphasis", require("./rules_inline/emphasis").postProcess ], [ "text_collapse", require("./rules_inline/text_collapse") ] ];
        function ParserInline() {
            var i;
            this.ruler = new Ruler();
            for (i = 0; i < _rules.length; i++) {
                this.ruler.push(_rules[i][0], _rules[i][1]);
            }
            this.ruler2 = new Ruler();
            for (i = 0; i < _rules2.length; i++) {
                this.ruler2.push(_rules2[i][0], _rules2[i][1]);
            }
        }
        ParserInline.prototype.skipToken = function(state) {
            var i, pos = state.pos, rules = this.ruler.getRules(""), len = rules.length, maxNesting = state.md.options.maxNesting, cache = state.cache;
            if (typeof cache[pos] !== "undefined") {
                state.pos = cache[pos];
                return;
            }
            if (state.level < maxNesting) {
                for (i = 0; i < len; i++) {
                    if (rules[i](state, true)) {
                        cache[pos] = state.pos;
                        return;
                    }
                }
            }
            state.pos++;
            cache[pos] = state.pos;
        };
        ParserInline.prototype.tokenize = function(state) {
            var ok, i, rules = this.ruler.getRules(""), len = rules.length, end = state.posMax, maxNesting = state.md.options.maxNesting;
            while (state.pos < end) {
                if (state.level < maxNesting) {
                    for (i = 0; i < len; i++) {
                        ok = rules[i](state, false);
                        if (ok) {
                            break;
                        }
                    }
                }
                if (ok) {
                    if (state.pos >= end) {
                        break;
                    }
                    continue;
                }
                state.pending += state.src[state.pos++];
            }
            if (state.pending) {
                state.pushPending();
            }
        };
        ParserInline.prototype.parse = function(str, md, env, outTokens) {
            var i, rules, len;
            var state = new this.State(str, md, env, outTokens);
            this.tokenize(state);
            rules = this.ruler2.getRules("");
            len = rules.length;
            for (i = 0; i < len; i++) {
                rules[i](state);
            }
        };
        ParserInline.prototype.State = require("./rules_inline/state_inline");
        module.exports = ParserInline;
    }, {
        "./ruler": 96,
        "./rules_inline/autolink": 116,
        "./rules_inline/backticks": 117,
        "./rules_inline/balance_pairs": 118,
        "./rules_inline/emphasis": 119,
        "./rules_inline/entity": 120,
        "./rules_inline/escape": 121,
        "./rules_inline/html_inline": 122,
        "./rules_inline/image": 123,
        "./rules_inline/link": 124,
        "./rules_inline/newline": 125,
        "./rules_inline/state_inline": 126,
        "./rules_inline/strikethrough": 127,
        "./rules_inline/text": 128,
        "./rules_inline/text_collapse": 129
    } ],
    92: [ function(require, module, exports) {
        "use strict";
        module.exports = {
            options: {
                html: true,
                xhtmlOut: true,
                breaks: false,
                langPrefix: "language-",
                linkify: false,
                typographer: false,
                quotes: "“”‘’",
                highlight: null,
                maxNesting: 20
            },
            components: {
                core: {
                    rules: [ "normalize", "block", "inline" ]
                },
                block: {
                    rules: [ "blockquote", "code", "fence", "heading", "hr", "html_block", "lheading", "list", "reference", "paragraph" ]
                },
                inline: {
                    rules: [ "autolink", "backticks", "emphasis", "entity", "escape", "html_inline", "image", "link", "newline", "text" ],
                    rules2: [ "balance_pairs", "emphasis", "text_collapse" ]
                }
            }
        };
    }, {} ],
    93: [ function(require, module, exports) {
        "use strict";
        module.exports = {
            options: {
                html: false,
                xhtmlOut: false,
                breaks: false,
                langPrefix: "language-",
                linkify: false,
                typographer: false,
                quotes: "“”‘’",
                highlight: null,
                maxNesting: 20
            },
            components: {
                core: {},
                block: {},
                inline: {}
            }
        };
    }, {} ],
    94: [ function(require, module, exports) {
        "use strict";
        module.exports = {
            options: {
                html: false,
                xhtmlOut: false,
                breaks: false,
                langPrefix: "language-",
                linkify: false,
                typographer: false,
                quotes: "“”‘’",
                highlight: null,
                maxNesting: 20
            },
            components: {
                core: {
                    rules: [ "normalize", "block", "inline" ]
                },
                block: {
                    rules: [ "paragraph" ]
                },
                inline: {
                    rules: [ "text" ],
                    rules2: [ "balance_pairs", "text_collapse" ]
                }
            }
        };
    }, {} ],
    95: [ function(require, module, exports) {
        "use strict";
        var assign = require("./common/utils").assign;
        var unescapeAll = require("./common/utils").unescapeAll;
        var escapeHtml = require("./common/utils").escapeHtml;
        var default_rules = {};
        default_rules.code_inline = function(tokens, idx) {
            return "<code>" + escapeHtml(tokens[idx].content) + "</code>";
        };
        default_rules.code_block = function(tokens, idx) {
            return "<pre><code>" + escapeHtml(tokens[idx].content) + "</code></pre>\n";
        };
        default_rules.fence = function(tokens, idx, options, env, slf) {
            var token = tokens[idx], info = token.info ? unescapeAll(token.info).trim() : "", langName = "", highlighted;
            if (info) {
                langName = info.split(/\s+/g)[0];
                token.attrPush([ "class", options.langPrefix + langName ]);
            }
            if (options.highlight) {
                highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
            } else {
                highlighted = escapeHtml(token.content);
            }
            return "<pre><code" + slf.renderAttrs(token) + ">" + highlighted + "</code></pre>\n";
        };
        default_rules.image = function(tokens, idx, options, env, slf) {
            var token = tokens[idx];
            token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
            return slf.renderToken(tokens, idx, options);
        };
        default_rules.hardbreak = function(tokens, idx, options) {
            return options.xhtmlOut ? "<br />\n" : "<br>\n";
        };
        default_rules.softbreak = function(tokens, idx, options) {
            return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
        };
        default_rules.text = function(tokens, idx) {
            return escapeHtml(tokens[idx].content);
        };
        default_rules.html_block = function(tokens, idx) {
            return tokens[idx].content;
        };
        default_rules.html_inline = function(tokens, idx) {
            return tokens[idx].content;
        };
        function Renderer() {
            this.rules = assign({}, default_rules);
        }
        Renderer.prototype.renderAttrs = function renderAttrs(token) {
            var i, l, result;
            if (!token.attrs) {
                return "";
            }
            result = "";
            for (i = 0, l = token.attrs.length; i < l; i++) {
                result += " " + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
            }
            return result;
        };
        Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
            var nextToken, result = "", needLf = false, token = tokens[idx];
            if (token.hidden) {
                return "";
            }
            if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
                result += "\n";
            }
            result += (token.nesting === -1 ? "</" : "<") + token.tag;
            result += this.renderAttrs(token);
            if (token.nesting === 0 && options.xhtmlOut) {
                result += " /";
            }
            if (token.block) {
                needLf = true;
                if (token.nesting === 1) {
                    if (idx + 1 < tokens.length) {
                        nextToken = tokens[idx + 1];
                        if (nextToken.type === "inline" || nextToken.hidden) {
                            needLf = false;
                        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
                            needLf = false;
                        }
                    }
                }
            }
            result += needLf ? ">\n" : ">";
            return result;
        };
        Renderer.prototype.renderInline = function(tokens, options, env) {
            var type, result = "", rules = this.rules;
            for (var i = 0, len = tokens.length; i < len; i++) {
                type = tokens[i].type;
                if (typeof rules[type] !== "undefined") {
                    result += rules[type](tokens, i, options, env, this);
                } else {
                    result += this.renderToken(tokens, i, options);
                }
            }
            return result;
        };
        Renderer.prototype.renderInlineAsText = function(tokens, options, env) {
            var result = "", rules = this.rules;
            for (var i = 0, len = tokens.length; i < len; i++) {
                if (tokens[i].type === "text") {
                    result += rules.text(tokens, i, options, env, this);
                } else if (tokens[i].type === "image") {
                    result += this.renderInlineAsText(tokens[i].children, options, env);
                }
            }
            return result;
        };
        Renderer.prototype.render = function(tokens, options, env) {
            var i, len, type, result = "", rules = this.rules;
            for (i = 0, len = tokens.length; i < len; i++) {
                type = tokens[i].type;
                if (type === "inline") {
                    result += this.renderInline(tokens[i].children, options, env);
                } else if (typeof rules[type] !== "undefined") {
                    result += rules[tokens[i].type](tokens, i, options, env, this);
                } else {
                    result += this.renderToken(tokens, i, options, env);
                }
            }
            return result;
        };
        module.exports = Renderer;
    }, {
        "./common/utils": 83
    } ],
    96: [ function(require, module, exports) {
        "use strict";
        function Ruler() {
            this.__rules__ = [];
            this.__cache__ = null;
        }
        Ruler.prototype.__find__ = function(name) {
            for (var i = 0; i < this.__rules__.length; i++) {
                if (this.__rules__[i].name === name) {
                    return i;
                }
            }
            return -1;
        };
        Ruler.prototype.__compile__ = function() {
            var self = this;
            var chains = [ "" ];
            self.__rules__.forEach(function(rule) {
                if (!rule.enabled) {
                    return;
                }
                rule.alt.forEach(function(altName) {
                    if (chains.indexOf(altName) < 0) {
                        chains.push(altName);
                    }
                });
            });
            self.__cache__ = {};
            chains.forEach(function(chain) {
                self.__cache__[chain] = [];
                self.__rules__.forEach(function(rule) {
                    if (!rule.enabled) {
                        return;
                    }
                    if (chain && rule.alt.indexOf(chain) < 0) {
                        return;
                    }
                    self.__cache__[chain].push(rule.fn);
                });
            });
        };
        Ruler.prototype.at = function(name, fn, options) {
            var index = this.__find__(name);
            var opt = options || {};
            if (index === -1) {
                throw new Error("Parser rule not found: " + name);
            }
            this.__rules__[index].fn = fn;
            this.__rules__[index].alt = opt.alt || [];
            this.__cache__ = null;
        };
        Ruler.prototype.before = function(beforeName, ruleName, fn, options) {
            var index = this.__find__(beforeName);
            var opt = options || {};
            if (index === -1) {
                throw new Error("Parser rule not found: " + beforeName);
            }
            this.__rules__.splice(index, 0, {
                name: ruleName,
                enabled: true,
                fn: fn,
                alt: opt.alt || []
            });
            this.__cache__ = null;
        };
        Ruler.prototype.after = function(afterName, ruleName, fn, options) {
            var index = this.__find__(afterName);
            var opt = options || {};
            if (index === -1) {
                throw new Error("Parser rule not found: " + afterName);
            }
            this.__rules__.splice(index + 1, 0, {
                name: ruleName,
                enabled: true,
                fn: fn,
                alt: opt.alt || []
            });
            this.__cache__ = null;
        };
        Ruler.prototype.push = function(ruleName, fn, options) {
            var opt = options || {};
            this.__rules__.push({
                name: ruleName,
                enabled: true,
                fn: fn,
                alt: opt.alt || []
            });
            this.__cache__ = null;
        };
        Ruler.prototype.enable = function(list, ignoreInvalid) {
            if (!Array.isArray(list)) {
                list = [ list ];
            }
            var result = [];
            list.forEach(function(name) {
                var idx = this.__find__(name);
                if (idx < 0) {
                    if (ignoreInvalid) {
                        return;
                    }
                    throw new Error("Rules manager: invalid rule name " + name);
                }
                this.__rules__[idx].enabled = true;
                result.push(name);
            }, this);
            this.__cache__ = null;
            return result;
        };
        Ruler.prototype.enableOnly = function(list, ignoreInvalid) {
            if (!Array.isArray(list)) {
                list = [ list ];
            }
            this.__rules__.forEach(function(rule) {
                rule.enabled = false;
            });
            this.enable(list, ignoreInvalid);
        };
        Ruler.prototype.disable = function(list, ignoreInvalid) {
            if (!Array.isArray(list)) {
                list = [ list ];
            }
            var result = [];
            list.forEach(function(name) {
                var idx = this.__find__(name);
                if (idx < 0) {
                    if (ignoreInvalid) {
                        return;
                    }
                    throw new Error("Rules manager: invalid rule name " + name);
                }
                this.__rules__[idx].enabled = false;
                result.push(name);
            }, this);
            this.__cache__ = null;
            return result;
        };
        Ruler.prototype.getRules = function(chainName) {
            if (this.__cache__ === null) {
                this.__compile__();
            }
            return this.__cache__[chainName] || [];
        };
        module.exports = Ruler;
    }, {} ],
    97: [ function(require, module, exports) {
        "use strict";
        var isSpace = require("../common/utils").isSpace;
        module.exports = function blockquote(state, startLine, endLine, silent) {
            var nextLine, lastLineEmpty, oldTShift, oldSCount, oldBMarks, oldIndent, oldParentType, lines, initial, offset, ch, terminatorRules, token, i, l, terminate, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
            if (state.src.charCodeAt(pos++) !== 62) {
                return false;
            }
            if (silent) {
                return true;
            }
            if (state.src.charCodeAt(pos) === 32) {
                pos++;
            }
            oldIndent = state.blkIndent;
            state.blkIndent = 0;
            initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);
            oldBMarks = [ state.bMarks[startLine] ];
            state.bMarks[startLine] = pos;
            while (pos < max) {
                ch = state.src.charCodeAt(pos);
                if (isSpace(ch)) {
                    if (ch === 9) {
                        offset += 4 - offset % 4;
                    } else {
                        offset++;
                    }
                } else {
                    break;
                }
                pos++;
            }
            lastLineEmpty = pos >= max;
            oldSCount = [ state.sCount[startLine] ];
            state.sCount[startLine] = offset - initial;
            oldTShift = [ state.tShift[startLine] ];
            state.tShift[startLine] = pos - state.bMarks[startLine];
            terminatorRules = state.md.block.ruler.getRules("blockquote");
            for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
                if (state.sCount[nextLine] < oldIndent) {
                    break;
                }
                pos = state.bMarks[nextLine] + state.tShift[nextLine];
                max = state.eMarks[nextLine];
                if (pos >= max) {
                    break;
                }
                if (state.src.charCodeAt(pos++) === 62) {
                    if (state.src.charCodeAt(pos) === 32) {
                        pos++;
                    }
                    initial = offset = state.sCount[nextLine] + pos - (state.bMarks[nextLine] + state.tShift[nextLine]);
                    oldBMarks.push(state.bMarks[nextLine]);
                    state.bMarks[nextLine] = pos;
                    while (pos < max) {
                        ch = state.src.charCodeAt(pos);
                        if (isSpace(ch)) {
                            if (ch === 9) {
                                offset += 4 - offset % 4;
                            } else {
                                offset++;
                            }
                        } else {
                            break;
                        }
                        pos++;
                    }
                    lastLineEmpty = pos >= max;
                    oldSCount.push(state.sCount[nextLine]);
                    state.sCount[nextLine] = offset - initial;
                    oldTShift.push(state.tShift[nextLine]);
                    state.tShift[nextLine] = pos - state.bMarks[nextLine];
                    continue;
                }
                if (lastLineEmpty) {
                    break;
                }
                terminate = false;
                for (i = 0, l = terminatorRules.length; i < l; i++) {
                    if (terminatorRules[i](state, nextLine, endLine, true)) {
                        terminate = true;
                        break;
                    }
                }
                if (terminate) {
                    break;
                }
                oldBMarks.push(state.bMarks[nextLine]);
                oldTShift.push(state.tShift[nextLine]);
                oldSCount.push(state.sCount[nextLine]);
                state.sCount[nextLine] = -1;
            }
            oldParentType = state.parentType;
            state.parentType = "blockquote";
            token = state.push("blockquote_open", "blockquote", 1);
            token.markup = ">";
            token.map = lines = [ startLine, 0 ];
            state.md.block.tokenize(state, startLine, nextLine);
            token = state.push("blockquote_close", "blockquote", -1);
            token.markup = ">";
            state.parentType = oldParentType;
            lines[1] = state.line;
            for (i = 0; i < oldTShift.length; i++) {
                state.bMarks[i + startLine] = oldBMarks[i];
                state.tShift[i + startLine] = oldTShift[i];
                state.sCount[i + startLine] = oldSCount[i];
            }
            state.blkIndent = oldIndent;
            return true;
        };
    }, {
        "../common/utils": 83
    } ],
    98: [ function(require, module, exports) {
        "use strict";
        module.exports = function code(state, startLine, endLine) {
            var nextLine, last, token;
            if (state.sCount[startLine] - state.blkIndent < 4) {
                return false;
            }
            last = nextLine = startLine + 1;
            while (nextLine < endLine) {
                if (state.isEmpty(nextLine)) {
                    nextLine++;
                    continue;
                }
                if (state.sCount[nextLine] - state.blkIndent >= 4) {
                    nextLine++;
                    last = nextLine;
                    continue;
                }
                break;
            }
            state.line = nextLine;
            token = state.push("code_block", "code", 0);
            token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
            token.map = [ startLine, state.line ];
            return true;
        };
    }, {} ],
    99: [ function(require, module, exports) {
        "use strict";
        module.exports = function fence(state, startLine, endLine, silent) {
            var marker, len, params, nextLine, mem, token, markup, haveEndMarker = false, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
            if (pos + 3 > max) {
                return false;
            }
            marker = state.src.charCodeAt(pos);
            if (marker !== 126 && marker !== 96) {
                return false;
            }
            mem = pos;
            pos = state.skipChars(pos, marker);
            len = pos - mem;
            if (len < 3) {
                return false;
            }
            markup = state.src.slice(mem, pos);
            params = state.src.slice(pos, max);
            if (params.indexOf("`") >= 0) {
                return false;
            }
            if (silent) {
                return true;
            }
            nextLine = startLine;
            for (;;) {
                nextLine++;
                if (nextLine >= endLine) {
                    break;
                }
                pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
                max = state.eMarks[nextLine];
                if (pos < max && state.sCount[nextLine] < state.blkIndent) {
                    break;
                }
                if (state.src.charCodeAt(pos) !== marker) {
                    continue;
                }
                if (state.sCount[nextLine] - state.blkIndent >= 4) {
                    continue;
                }
                pos = state.skipChars(pos, marker);
                if (pos - mem < len) {
                    continue;
                }
                pos = state.skipSpaces(pos);
                if (pos < max) {
                    continue;
                }
                haveEndMarker = true;
                break;
            }
            len = state.sCount[startLine];
            state.line = nextLine + (haveEndMarker ? 1 : 0);
            token = state.push("fence", "code", 0);
            token.info = params;
            token.content = state.getLines(startLine + 1, nextLine, len, true);
            token.markup = markup;
            token.map = [ startLine, state.line ];
            return true;
        };
    }, {} ],
    100: [ function(require, module, exports) {
        "use strict";
        var isSpace = require("../common/utils").isSpace;
        module.exports = function heading(state, startLine, endLine, silent) {
            var ch, level, tmp, token, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
            ch = state.src.charCodeAt(pos);
            if (ch !== 35 || pos >= max) {
                return false;
            }
            level = 1;
            ch = state.src.charCodeAt(++pos);
            while (ch === 35 && pos < max && level <= 6) {
                level++;
                ch = state.src.charCodeAt(++pos);
            }
            if (level > 6 || pos < max && ch !== 32) {
                return false;
            }
            if (silent) {
                return true;
            }
            max = state.skipSpacesBack(max, pos);
            tmp = state.skipCharsBack(max, 35, pos);
            if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
                max = tmp;
            }
            state.line = startLine + 1;
            token = state.push("heading_open", "h" + String(level), 1);
            token.markup = "########".slice(0, level);
            token.map = [ startLine, state.line ];
            token = state.push("inline", "", 0);
            token.content = state.src.slice(pos, max).trim();
            token.map = [ startLine, state.line ];
            token.children = [];
            token = state.push("heading_close", "h" + String(level), -1);
            token.markup = "########".slice(0, level);
            return true;
        };
    }, {
        "../common/utils": 83
    } ],
    101: [ function(require, module, exports) {
        "use strict";
        var isSpace = require("../common/utils").isSpace;
        module.exports = function hr(state, startLine, endLine, silent) {
            var marker, cnt, ch, token, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
            marker = state.src.charCodeAt(pos++);
            if (marker !== 42 && marker !== 45 && marker !== 95) {
                return false;
            }
            cnt = 1;
            while (pos < max) {
                ch = state.src.charCodeAt(pos++);
                if (ch !== marker && !isSpace(ch)) {
                    return false;
                }
                if (ch === marker) {
                    cnt++;
                }
            }
            if (cnt < 3) {
                return false;
            }
            if (silent) {
                return true;
            }
            state.line = startLine + 1;
            token = state.push("hr", "hr", 0);
            token.map = [ startLine, state.line ];
            token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
            return true;
        };
    }, {
        "../common/utils": 83
    } ],
    102: [ function(require, module, exports) {
        "use strict";
        var block_names = require("../common/html_blocks");
        var HTML_OPEN_CLOSE_TAG_RE = require("../common/html_re").HTML_OPEN_CLOSE_TAG_RE;
        var HTML_SEQUENCES = [ [ /^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true ], [ /^<!--/, /-->/, true ], [ /^<\?/, /\?>/, true ], [ /^<![A-Z]/, />/, true ], [ /^<!\[CDATA\[/, /\]\]>/, true ], [ new RegExp("^</?(" + block_names.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, true ], [ new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + "\\s*$"), /^$/, false ] ];
        module.exports = function html_block(state, startLine, endLine, silent) {
            var i, nextLine, token, lineText, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
            if (!state.md.options.html) {
                return false;
            }
            if (state.src.charCodeAt(pos) !== 60) {
                return false;
            }
            lineText = state.src.slice(pos, max);
            for (i = 0; i < HTML_SEQUENCES.length; i++) {
                if (HTML_SEQUENCES[i][0].test(lineText)) {
                    break;
                }
            }
            if (i === HTML_SEQUENCES.length) {
                return false;
            }
            if (silent) {
                return HTML_SEQUENCES[i][2];
            }
            nextLine = startLine + 1;
            if (!HTML_SEQUENCES[i][1].test(lineText)) {
                for (;nextLine < endLine; nextLine++) {
                    if (state.sCount[nextLine] < state.blkIndent) {
                        break;
                    }
                    pos = state.bMarks[nextLine] + state.tShift[nextLine];
                    max = state.eMarks[nextLine];
                    lineText = state.src.slice(pos, max);
                    if (HTML_SEQUENCES[i][1].test(lineText)) {
                        if (lineText.length !== 0) {
                            nextLine++;
                        }
                        break;
                    }
                }
            }
            state.line = nextLine;
            token = state.push("html_block", "", 0);
            token.map = [ startLine, nextLine ];
            token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
            return true;
        };
    }, {
        "../common/html_blocks": 80,
        "../common/html_re": 81
    } ],
    103: [ function(require, module, exports) {
        "use strict";
        module.exports = function lheading(state, startLine, endLine) {
            var marker, pos, max, token, level, next = startLine + 1;
            if (next >= endLine) {
                return false;
            }
            if (state.sCount[next] < state.blkIndent) {
                return false;
            }
            if (state.sCount[next] - state.blkIndent > 3) {
                return false;
            }
            pos = state.bMarks[next] + state.tShift[next];
            max = state.eMarks[next];
            if (pos >= max) {
                return false;
            }
            marker = state.src.charCodeAt(pos);
            if (marker !== 45 && marker !== 61) {
                return false;
            }
            pos = state.skipChars(pos, marker);
            pos = state.skipSpaces(pos);
            if (pos < max) {
                return false;
            }
            pos = state.bMarks[startLine] + state.tShift[startLine];
            state.line = next + 1;
            level = marker === 61 ? 1 : 2;
            token = state.push("heading_open", "h" + String(level), 1);
            token.markup = String.fromCharCode(marker);
            token.map = [ startLine, state.line ];
            token = state.push("inline", "", 0);
            token.content = state.src.slice(pos, state.eMarks[startLine]).trim();
            token.map = [ startLine, state.line - 1 ];
            token.children = [];
            token = state.push("heading_close", "h" + String(level), -1);
            token.markup = String.fromCharCode(marker);
            return true;
        };
    }, {} ],
    104: [ function(require, module, exports) {
        "use strict";
        var isSpace = require("../common/utils").isSpace;
        function skipBulletListMarker(state, startLine) {
            var marker, pos, max, ch;
            pos = state.bMarks[startLine] + state.tShift[startLine];
            max = state.eMarks[startLine];
            marker = state.src.charCodeAt(pos++);
            if (marker !== 42 && marker !== 45 && marker !== 43) {
                return -1;
            }
            if (pos < max) {
                ch = state.src.charCodeAt(pos);
                if (!isSpace(ch)) {
                    return -1;
                }
            }
            return pos;
        }
        function skipOrderedListMarker(state, startLine) {
            var ch, start = state.bMarks[startLine] + state.tShift[startLine], pos = start, max = state.eMarks[startLine];
            if (pos + 1 >= max) {
                return -1;
            }
            ch = state.src.charCodeAt(pos++);
            if (ch < 48 || ch > 57) {
                return -1;
            }
            for (;;) {
                if (pos >= max) {
                    return -1;
                }
                ch = state.src.charCodeAt(pos++);
                if (ch >= 48 && ch <= 57) {
                    if (pos - start >= 10) {
                        return -1;
                    }
                    continue;
                }
                if (ch === 41 || ch === 46) {
                    break;
                }
                return -1;
            }
            if (pos < max) {
                ch = state.src.charCodeAt(pos);
                if (!isSpace(ch)) {
                    return -1;
                }
            }
            return pos;
        }
        function markTightParagraphs(state, idx) {
            var i, l, level = state.level + 2;
            for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
                if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") {
                    state.tokens[i + 2].hidden = true;
                    state.tokens[i].hidden = true;
                    i += 2;
                }
            }
        }
        module.exports = function list(state, startLine, endLine, silent) {
            var nextLine, initial, offset, indent, oldTShift, oldIndent, oldLIndent, oldTight, oldParentType, start, posAfterMarker, ch, pos, max, indentAfterMarker, markerValue, markerCharCode, isOrdered, contentStart, listTokIdx, prevEmptyEnd, listLines, itemLines, tight = true, terminatorRules, token, i, l, terminate;
            if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
                isOrdered = true;
            } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
                isOrdered = false;
            } else {
                return false;
            }
            markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
            if (silent) {
                return true;
            }
            listTokIdx = state.tokens.length;
            if (isOrdered) {
                start = state.bMarks[startLine] + state.tShift[startLine];
                markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));
                token = state.push("ordered_list_open", "ol", 1);
                if (markerValue !== 1) {
                    token.attrs = [ [ "start", markerValue ] ];
                }
            } else {
                token = state.push("bullet_list_open", "ul", 1);
            }
            token.map = listLines = [ startLine, 0 ];
            token.markup = String.fromCharCode(markerCharCode);
            nextLine = startLine;
            prevEmptyEnd = false;
            terminatorRules = state.md.block.ruler.getRules("list");
            while (nextLine < endLine) {
                pos = posAfterMarker;
                max = state.eMarks[nextLine];
                initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]);
                while (pos < max) {
                    ch = state.src.charCodeAt(pos);
                    if (isSpace(ch)) {
                        if (ch === 9) {
                            offset += 4 - offset % 4;
                        } else {
                            offset++;
                        }
                    } else {
                        break;
                    }
                    pos++;
                }
                contentStart = pos;
                if (contentStart >= max) {
                    indentAfterMarker = 1;
                } else {
                    indentAfterMarker = offset - initial;
                }
                if (indentAfterMarker > 4) {
                    indentAfterMarker = 1;
                }
                indent = initial + indentAfterMarker;
                token = state.push("list_item_open", "li", 1);
                token.markup = String.fromCharCode(markerCharCode);
                token.map = itemLines = [ startLine, 0 ];
                oldIndent = state.blkIndent;
                oldTight = state.tight;
                oldTShift = state.tShift[startLine];
                oldLIndent = state.sCount[startLine];
                oldParentType = state.parentType;
                state.blkIndent = indent;
                state.tight = true;
                state.parentType = "list";
                state.tShift[startLine] = contentStart - state.bMarks[startLine];
                state.sCount[startLine] = offset;
                state.md.block.tokenize(state, startLine, endLine, true);
                if (!state.tight || prevEmptyEnd) {
                    tight = false;
                }
                prevEmptyEnd = state.line - startLine > 1 && state.isEmpty(state.line - 1);
                state.blkIndent = oldIndent;
                state.tShift[startLine] = oldTShift;
                state.sCount[startLine] = oldLIndent;
                state.tight = oldTight;
                state.parentType = oldParentType;
                token = state.push("list_item_close", "li", -1);
                token.markup = String.fromCharCode(markerCharCode);
                nextLine = startLine = state.line;
                itemLines[1] = nextLine;
                contentStart = state.bMarks[startLine];
                if (nextLine >= endLine) {
                    break;
                }
                if (state.isEmpty(nextLine)) {
                    break;
                }
                if (state.sCount[nextLine] < state.blkIndent) {
                    break;
                }
                terminate = false;
                for (i = 0, l = terminatorRules.length; i < l; i++) {
                    if (terminatorRules[i](state, nextLine, endLine, true)) {
                        terminate = true;
                        break;
                    }
                }
                if (terminate) {
                    break;
                }
                if (isOrdered) {
                    posAfterMarker = skipOrderedListMarker(state, nextLine);
                    if (posAfterMarker < 0) {
                        break;
                    }
                } else {
                    posAfterMarker = skipBulletListMarker(state, nextLine);
                    if (posAfterMarker < 0) {
                        break;
                    }
                }
                if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
                    break;
                }
            }
            if (isOrdered) {
                token = state.push("ordered_list_close", "ol", -1);
            } else {
                token = state.push("bullet_list_close", "ul", -1);
            }
            token.markup = String.fromCharCode(markerCharCode);
            listLines[1] = nextLine;
            state.line = nextLine;
            if (tight) {
                markTightParagraphs(state, listTokIdx);
            }
            return true;
        };
    }, {
        "../common/utils": 83
    } ],
    105: [ function(require, module, exports) {
        "use strict";
        module.exports = function paragraph(state, startLine) {
            var content, terminate, i, l, token, nextLine = startLine + 1, terminatorRules = state.md.block.ruler.getRules("paragraph"), endLine = state.lineMax;
            for (;nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
                if (state.sCount[nextLine] - state.blkIndent > 3) {
                    continue;
                }
                if (state.sCount[nextLine] < 0) {
                    continue;
                }
                terminate = false;
                for (i = 0, l = terminatorRules.length; i < l; i++) {
                    if (terminatorRules[i](state, nextLine, endLine, true)) {
                        terminate = true;
                        break;
                    }
                }
                if (terminate) {
                    break;
                }
            }
            content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
            state.line = nextLine;
            token = state.push("paragraph_open", "p", 1);
            token.map = [ startLine, state.line ];
            token = state.push("inline", "", 0);
            token.content = content;
            token.map = [ startLine, state.line ];
            token.children = [];
            token = state.push("paragraph_close", "p", -1);
            return true;
        };
    }, {} ],
    106: [ function(require, module, exports) {
        "use strict";
        var parseLinkDestination = require("../helpers/parse_link_destination");
        var parseLinkTitle = require("../helpers/parse_link_title");
        var normalizeReference = require("../common/utils").normalizeReference;
        var isSpace = require("../common/utils").isSpace;
        module.exports = function reference(state, startLine, _endLine, silent) {
            var ch, destEndPos, destEndLineNo, endLine, href, i, l, label, labelEnd, res, start, str, terminate, terminatorRules, title, lines = 0, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine], nextLine = startLine + 1;
            if (state.src.charCodeAt(pos) !== 91) {
                return false;
            }
            while (++pos < max) {
                if (state.src.charCodeAt(pos) === 93 && state.src.charCodeAt(pos - 1) !== 92) {
                    if (pos + 1 === max) {
                        return false;
                    }
                    if (state.src.charCodeAt(pos + 1) !== 58) {
                        return false;
                    }
                    break;
                }
            }
            endLine = state.lineMax;
            terminatorRules = state.md.block.ruler.getRules("reference");
            for (;nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
                if (state.sCount[nextLine] - state.blkIndent > 3) {
                    continue;
                }
                if (state.sCount[nextLine] < 0) {
                    continue;
                }
                terminate = false;
                for (i = 0, l = terminatorRules.length; i < l; i++) {
                    if (terminatorRules[i](state, nextLine, endLine, true)) {
                        terminate = true;
                        break;
                    }
                }
                if (terminate) {
                    break;
                }
            }
            str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
            max = str.length;
            for (pos = 1; pos < max; pos++) {
                ch = str.charCodeAt(pos);
                if (ch === 91) {
                    return false;
                } else if (ch === 93) {
                    labelEnd = pos;
                    break;
                } else if (ch === 10) {
                    lines++;
                } else if (ch === 92) {
                    pos++;
                    if (pos < max && str.charCodeAt(pos) === 10) {
                        lines++;
                    }
                }
            }
            if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 58) {
                return false;
            }
            for (pos = labelEnd + 2; pos < max; pos++) {
                ch = str.charCodeAt(pos);
                if (ch === 10) {
                    lines++;
                } else if (isSpace(ch)) {} else {
                    break;
                }
            }
            res = parseLinkDestination(str, pos, max);
            if (!res.ok) {
                return false;
            }
            href = state.md.normalizeLink(res.str);
            if (!state.md.validateLink(href)) {
                return false;
            }
            pos = res.pos;
            lines += res.lines;
            destEndPos = pos;
            destEndLineNo = lines;
            start = pos;
            for (;pos < max; pos++) {
                ch = str.charCodeAt(pos);
                if (ch === 10) {
                    lines++;
                } else if (isSpace(ch)) {} else {
                    break;
                }
            }
            res = parseLinkTitle(str, pos, max);
            if (pos < max && start !== pos && res.ok) {
                title = res.str;
                pos = res.pos;
                lines += res.lines;
            } else {
                title = "";
                pos = destEndPos;
                lines = destEndLineNo;
            }
            while (pos < max) {
                ch = str.charCodeAt(pos);
                if (!isSpace(ch)) {
                    break;
                }
                pos++;
            }
            if (pos < max && str.charCodeAt(pos) !== 10) {
                if (title) {
                    title = "";
                    pos = destEndPos;
                    lines = destEndLineNo;
                    while (pos < max) {
                        ch = str.charCodeAt(pos);
                        if (!isSpace(ch)) {
                            break;
                        }
                        pos++;
                    }
                }
            }
            if (pos < max && str.charCodeAt(pos) !== 10) {
                return false;
            }
            label = normalizeReference(str.slice(1, labelEnd));
            if (!label) {
                return false;
            }
            if (silent) {
                return true;
            }
            if (typeof state.env.references === "undefined") {
                state.env.references = {};
            }
            if (typeof state.env.references[label] === "undefined") {
                state.env.references[label] = {
                    title: title,
                    href: href
                };
            }
            state.line = startLine + lines + 1;
            return true;
        };
    }, {
        "../common/utils": 83,
        "../helpers/parse_link_destination": 85,
        "../helpers/parse_link_title": 87
    } ],
    107: [ function(require, module, exports) {
        "use strict";
        var Token = require("../token");
        var isSpace = require("../common/utils").isSpace;
        function StateBlock(src, md, env, tokens) {
            var ch, s, start, pos, len, indent, offset, indent_found;
            this.src = src;
            this.md = md;
            this.env = env;
            this.tokens = tokens;
            this.bMarks = [];
            this.eMarks = [];
            this.tShift = [];
            this.sCount = [];
            this.blkIndent = 0;
            this.line = 0;
            this.lineMax = 0;
            this.tight = false;
            this.parentType = "root";
            this.ddIndent = -1;
            this.level = 0;
            this.result = "";
            s = this.src;
            indent_found = false;
            for (start = pos = indent = offset = 0, len = s.length; pos < len; pos++) {
                ch = s.charCodeAt(pos);
                if (!indent_found) {
                    if (isSpace(ch)) {
                        indent++;
                        if (ch === 9) {
                            offset += 4 - offset % 4;
                        } else {
                            offset++;
                        }
                        continue;
                    } else {
                        indent_found = true;
                    }
                }
                if (ch === 10 || pos === len - 1) {
                    if (ch !== 10) {
                        pos++;
                    }
                    this.bMarks.push(start);
                    this.eMarks.push(pos);
                    this.tShift.push(indent);
                    this.sCount.push(offset);
                    indent_found = false;
                    indent = 0;
                    offset = 0;
                    start = pos + 1;
                }
            }
            this.bMarks.push(s.length);
            this.eMarks.push(s.length);
            this.tShift.push(0);
            this.sCount.push(0);
            this.lineMax = this.bMarks.length - 1;
        }
        StateBlock.prototype.push = function(type, tag, nesting) {
            var token = new Token(type, tag, nesting);
            token.block = true;
            if (nesting < 0) {
                this.level--;
            }
            token.level = this.level;
            if (nesting > 0) {
                this.level++;
            }
            this.tokens.push(token);
            return token;
        };
        StateBlock.prototype.isEmpty = function isEmpty(line) {
            return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
        };
        StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
            for (var max = this.lineMax; from < max; from++) {
                if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
                    break;
                }
            }
            return from;
        };
        StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
            var ch;
            for (var max = this.src.length; pos < max; pos++) {
                ch = this.src.charCodeAt(pos);
                if (!isSpace(ch)) {
                    break;
                }
            }
            return pos;
        };
        StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
            if (pos <= min) {
                return pos;
            }
            while (pos > min) {
                if (!isSpace(this.src.charCodeAt(--pos))) {
                    return pos + 1;
                }
            }
            return pos;
        };
        StateBlock.prototype.skipChars = function skipChars(pos, code) {
            for (var max = this.src.length; pos < max; pos++) {
                if (this.src.charCodeAt(pos) !== code) {
                    break;
                }
            }
            return pos;
        };
        StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
            if (pos <= min) {
                return pos;
            }
            while (pos > min) {
                if (code !== this.src.charCodeAt(--pos)) {
                    return pos + 1;
                }
            }
            return pos;
        };
        StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
            var i, lineIndent, ch, first, last, queue, lineStart, line = begin;
            if (begin >= end) {
                return "";
            }
            queue = new Array(end - begin);
            for (i = 0; line < end; line++, i++) {
                lineIndent = 0;
                lineStart = first = this.bMarks[line];
                if (line + 1 < end || keepLastLF) {
                    last = this.eMarks[line] + 1;
                } else {
                    last = this.eMarks[line];
                }
                while (first < last && lineIndent < indent) {
                    ch = this.src.charCodeAt(first);
                    if (isSpace(ch)) {
                        if (ch === 9) {
                            lineIndent += 4 - lineIndent % 4;
                        } else {
                            lineIndent++;
                        }
                    } else if (first - lineStart < this.tShift[line]) {
                        lineIndent++;
                    } else {
                        break;
                    }
                    first++;
                }
                queue[i] = this.src.slice(first, last);
            }
            return queue.join("");
        };
        StateBlock.prototype.Token = Token;
        module.exports = StateBlock;
    }, {
        "../common/utils": 83,
        "../token": 130
    } ],
    108: [ function(require, module, exports) {
        "use strict";
        function getLine(state, line) {
            var pos = state.bMarks[line] + state.blkIndent, max = state.eMarks[line];
            return state.src.substr(pos, max - pos);
        }
        function escapedSplit(str) {
            var result = [], pos = 0, max = str.length, ch, escapes = 0, lastPos = 0, backTicked = false, lastBackTick = 0;
            ch = str.charCodeAt(pos);
            while (pos < max) {
                if (ch === 96 && escapes % 2 === 0) {
                    backTicked = !backTicked;
                    lastBackTick = pos;
                } else if (ch === 124 && escapes % 2 === 0 && !backTicked) {
                    result.push(str.substring(lastPos, pos));
                    lastPos = pos + 1;
                } else if (ch === 92) {
                    escapes++;
                } else {
                    escapes = 0;
                }
                pos++;
                if (pos === max && backTicked) {
                    backTicked = false;
                    pos = lastBackTick + 1;
                }
                ch = str.charCodeAt(pos);
            }
            result.push(str.substring(lastPos));
            return result;
        }
        module.exports = function table(state, startLine, endLine, silent) {
            var ch, lineText, pos, i, nextLine, rows, token, aligns, t, tableLines, tbodyLines;
            if (startLine + 2 > endLine) {
                return false;
            }
            nextLine = startLine + 1;
            if (state.sCount[nextLine] < state.blkIndent) {
                return false;
            }
            pos = state.bMarks[nextLine] + state.tShift[nextLine];
            if (pos >= state.eMarks[nextLine]) {
                return false;
            }
            ch = state.src.charCodeAt(pos);
            if (ch !== 124 && ch !== 45 && ch !== 58) {
                return false;
            }
            lineText = getLine(state, startLine + 1);
            if (!/^[-:| ]+$/.test(lineText)) {
                return false;
            }
            rows = lineText.split("|");
            if (rows.length < 2) {
                return false;
            }
            aligns = [];
            for (i = 0; i < rows.length; i++) {
                t = rows[i].trim();
                if (!t) {
                    if (i === 0 || i === rows.length - 1) {
                        continue;
                    } else {
                        return false;
                    }
                }
                if (!/^:?-+:?$/.test(t)) {
                    return false;
                }
                if (t.charCodeAt(t.length - 1) === 58) {
                    aligns.push(t.charCodeAt(0) === 58 ? "center" : "right");
                } else if (t.charCodeAt(0) === 58) {
                    aligns.push("left");
                } else {
                    aligns.push("");
                }
            }
            lineText = getLine(state, startLine).trim();
            if (lineText.indexOf("|") === -1) {
                return false;
            }
            rows = escapedSplit(lineText.replace(/^\||\|$/g, ""));
            if (aligns.length !== rows.length) {
                return false;
            }
            if (silent) {
                return true;
            }
            token = state.push("table_open", "table", 1);
            token.map = tableLines = [ startLine, 0 ];
            token = state.push("thead_open", "thead", 1);
            token.map = [ startLine, startLine + 1 ];
            token = state.push("tr_open", "tr", 1);
            token.map = [ startLine, startLine + 1 ];
            for (i = 0; i < rows.length; i++) {
                token = state.push("th_open", "th", 1);
                token.map = [ startLine, startLine + 1 ];
                if (aligns[i]) {
                    token.attrs = [ [ "style", "text-align:" + aligns[i] ] ];
                }
                token = state.push("inline", "", 0);
                token.content = rows[i].trim();
                token.map = [ startLine, startLine + 1 ];
                token.children = [];
                token = state.push("th_close", "th", -1);
            }
            token = state.push("tr_close", "tr", -1);
            token = state.push("thead_close", "thead", -1);
            token = state.push("tbody_open", "tbody", 1);
            token.map = tbodyLines = [ startLine + 2, 0 ];
            for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
                if (state.sCount[nextLine] < state.blkIndent) {
                    break;
                }
                lineText = getLine(state, nextLine).trim();
                if (lineText.indexOf("|") === -1) {
                    break;
                }
                rows = escapedSplit(lineText.replace(/^\||\|$/g, ""));
                rows.length = aligns.length;
                token = state.push("tr_open", "tr", 1);
                for (i = 0; i < rows.length; i++) {
                    token = state.push("td_open", "td", 1);
                    if (aligns[i]) {
                        token.attrs = [ [ "style", "text-align:" + aligns[i] ] ];
                    }
                    token = state.push("inline", "", 0);
                    token.content = rows[i] ? rows[i].trim() : "";
                    token.children = [];
                    token = state.push("td_close", "td", -1);
                }
                token = state.push("tr_close", "tr", -1);
            }
            token = state.push("tbody_close", "tbody", -1);
            token = state.push("table_close", "table", -1);
            tableLines[1] = tbodyLines[1] = nextLine;
            state.line = nextLine;
            return true;
        };
    }, {} ],
    109: [ function(require, module, exports) {
        "use strict";
        module.exports = function block(state) {
            var token;
            if (state.inlineMode) {
                token = new state.Token("inline", "", 0);
                token.content = state.src;
                token.map = [ 0, 1 ];
                token.children = [];
                state.tokens.push(token);
            } else {
                state.md.block.parse(state.src, state.md, state.env, state.tokens);
            }
        };
    }, {} ],
    110: [ function(require, module, exports) {
        "use strict";
        module.exports = function inline(state) {
            var tokens = state.tokens, tok, i, l;
            for (i = 0, l = tokens.length; i < l; i++) {
                tok = tokens[i];
                if (tok.type === "inline") {
                    state.md.inline.parse(tok.content, state.md, state.env, tok.children);
                }
            }
        };
    }, {} ],
    111: [ function(require, module, exports) {
        "use strict";
        var arrayReplaceAt = require("../common/utils").arrayReplaceAt;
        function isLinkOpen(str) {
            return /^<a[>\s]/i.test(str);
        }
        function isLinkClose(str) {
            return /^<\/a\s*>/i.test(str);
        }
        module.exports = function linkify(state) {
            var i, j, l, tokens, token, currentToken, nodes, ln, text, pos, lastPos, level, htmlLinkLevel, url, fullUrl, urlText, blockTokens = state.tokens, links;
            if (!state.md.options.linkify) {
                return;
            }
            for (j = 0, l = blockTokens.length; j < l; j++) {
                if (blockTokens[j].type !== "inline" || !state.md.linkify.pretest(blockTokens[j].content)) {
                    continue;
                }
                tokens = blockTokens[j].children;
                htmlLinkLevel = 0;
                for (i = tokens.length - 1; i >= 0; i--) {
                    currentToken = tokens[i];
                    if (currentToken.type === "link_close") {
                        i--;
                        while (tokens[i].level !== currentToken.level && tokens[i].type !== "link_open") {
                            i--;
                        }
                        continue;
                    }
                    if (currentToken.type === "html_inline") {
                        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
                            htmlLinkLevel--;
                        }
                        if (isLinkClose(currentToken.content)) {
                            htmlLinkLevel++;
                        }
                    }
                    if (htmlLinkLevel > 0) {
                        continue;
                    }
                    if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
                        text = currentToken.content;
                        links = state.md.linkify.match(text);
                        nodes = [];
                        level = currentToken.level;
                        lastPos = 0;
                        for (ln = 0; ln < links.length; ln++) {
                            url = links[ln].url;
                            fullUrl = state.md.normalizeLink(url);
                            if (!state.md.validateLink(fullUrl)) {
                                continue;
                            }
                            urlText = links[ln].text;
                            if (!links[ln].schema) {
                                urlText = state.md.normalizeLinkText("http://" + urlText).replace(/^http:\/\//, "");
                            } else if (links[ln].schema === "mailto:" && !/^mailto:/i.test(urlText)) {
                                urlText = state.md.normalizeLinkText("mailto:" + urlText).replace(/^mailto:/, "");
                            } else {
                                urlText = state.md.normalizeLinkText(urlText);
                            }
                            pos = links[ln].index;
                            if (pos > lastPos) {
                                token = new state.Token("text", "", 0);
                                token.content = text.slice(lastPos, pos);
                                token.level = level;
                                nodes.push(token);
                            }
                            token = new state.Token("link_open", "a", 1);
                            token.attrs = [ [ "href", fullUrl ] ];
                            token.level = level++;
                            token.markup = "linkify";
                            token.info = "auto";
                            nodes.push(token);
                            token = new state.Token("text", "", 0);
                            token.content = urlText;
                            token.level = level;
                            nodes.push(token);
                            token = new state.Token("link_close", "a", -1);
                            token.level = --level;
                            token.markup = "linkify";
                            token.info = "auto";
                            nodes.push(token);
                            lastPos = links[ln].lastIndex;
                        }
                        if (lastPos < text.length) {
                            token = new state.Token("text", "", 0);
                            token.content = text.slice(lastPos);
                            token.level = level;
                            nodes.push(token);
                        }
                        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
                    }
                }
            }
        };
    }, {
        "../common/utils": 83
    } ],
    112: [ function(require, module, exports) {
        "use strict";
        var NEWLINES_RE = /\r[\n\u0085]|[\u2424\u2028\u0085]/g;
        var NULL_RE = /\u0000/g;
        module.exports = function inline(state) {
            var str;
            str = state.src.replace(NEWLINES_RE, "\n");
            str = str.replace(NULL_RE, "�");
            state.src = str;
        };
    }, {} ],
    113: [ function(require, module, exports) {
        "use strict";
        var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
        var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;
        var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/gi;
        var SCOPED_ABBR = {
            c: "©",
            r: "®",
            p: "§",
            tm: "™"
        };
        function replaceFn(match, name) {
            return SCOPED_ABBR[name.toLowerCase()];
        }
        function replace_scoped(inlineTokens) {
            var i, token;
            for (i = inlineTokens.length - 1; i >= 0; i--) {
                token = inlineTokens[i];
                if (token.type === "text") {
                    token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
                }
            }
        }
        function replace_rare(inlineTokens) {
            var i, token;
            for (i = inlineTokens.length - 1; i >= 0; i--) {
                token = inlineTokens[i];
                if (token.type === "text") {
                    if (RARE_RE.test(token.content)) {
                        token.content = token.content.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---([^-]|$)/gm, "$1—$2").replace(/(^|\s)--(\s|$)/gm, "$1–$2").replace(/(^|[^-\s])--([^-\s]|$)/gm, "$1–$2");
                    }
                }
            }
        }
        module.exports = function replace(state) {
            var blkIdx;
            if (!state.md.options.typographer) {
                return;
            }
            for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
                if (state.tokens[blkIdx].type !== "inline") {
                    continue;
                }
                if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
                    replace_scoped(state.tokens[blkIdx].children);
                }
                if (RARE_RE.test(state.tokens[blkIdx].content)) {
                    replace_rare(state.tokens[blkIdx].children);
                }
            }
        };
    }, {} ],
    114: [ function(require, module, exports) {
        "use strict";
        var isWhiteSpace = require("../common/utils").isWhiteSpace;
        var isPunctChar = require("../common/utils").isPunctChar;
        var isMdAsciiPunct = require("../common/utils").isMdAsciiPunct;
        var QUOTE_TEST_RE = /['"]/;
        var QUOTE_RE = /['"]/g;
        var APOSTROPHE = "’";
        function replaceAt(str, index, ch) {
            return str.substr(0, index) + ch + str.substr(index + 1);
        }
        function process_inlines(tokens, state) {
            var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar, isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace, canOpen, canClose, j, isSingle, stack, openQuote, closeQuote;
            stack = [];
            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                thisLevel = tokens[i].level;
                for (j = stack.length - 1; j >= 0; j--) {
                    if (stack[j].level <= thisLevel) {
                        break;
                    }
                }
                stack.length = j + 1;
                if (token.type !== "text") {
                    continue;
                }
                text = token.content;
                pos = 0;
                max = text.length;
                OUTER: while (pos < max) {
                    QUOTE_RE.lastIndex = pos;
                    t = QUOTE_RE.exec(text);
                    if (!t) {
                        break;
                    }
                    canOpen = canClose = true;
                    pos = t.index + 1;
                    isSingle = t[0] === "'";
                    lastChar = t.index - 1 >= 0 ? text.charCodeAt(t.index - 1) : 32;
                    nextChar = pos < max ? text.charCodeAt(pos) : 32;
                    isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
                    isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
                    isLastWhiteSpace = isWhiteSpace(lastChar);
                    isNextWhiteSpace = isWhiteSpace(nextChar);
                    if (isNextWhiteSpace) {
                        canOpen = false;
                    } else if (isNextPunctChar) {
                        if (!(isLastWhiteSpace || isLastPunctChar)) {
                            canOpen = false;
                        }
                    }
                    if (isLastWhiteSpace) {
                        canClose = false;
                    } else if (isLastPunctChar) {
                        if (!(isNextWhiteSpace || isNextPunctChar)) {
                            canClose = false;
                        }
                    }
                    if (nextChar === 34 && t[0] === '"') {
                        if (lastChar >= 48 && lastChar <= 57) {
                            canClose = canOpen = false;
                        }
                    }
                    if (canOpen && canClose) {
                        canOpen = false;
                        canClose = isNextPunctChar;
                    }
                    if (!canOpen && !canClose) {
                        if (isSingle) {
                            token.content = replaceAt(token.content, t.index, APOSTROPHE);
                        }
                        continue;
                    }
                    if (canClose) {
                        for (j = stack.length - 1; j >= 0; j--) {
                            item = stack[j];
                            if (stack[j].level < thisLevel) {
                                break;
                            }
                            if (item.single === isSingle && stack[j].level === thisLevel) {
                                item = stack[j];
                                if (isSingle) {
                                    openQuote = state.md.options.quotes[2];
                                    closeQuote = state.md.options.quotes[3];
                                } else {
                                    openQuote = state.md.options.quotes[0];
                                    closeQuote = state.md.options.quotes[1];
                                }
                                token.content = replaceAt(token.content, t.index, closeQuote);
                                tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, openQuote);
                                pos += closeQuote.length - 1;
                                if (item.token === i) {
                                    pos += openQuote.length - 1;
                                }
                                text = token.content;
                                max = text.length;
                                stack.length = j;
                                continue OUTER;
                            }
                        }
                    }
                    if (canOpen) {
                        stack.push({
                            token: i,
                            pos: t.index,
                            single: isSingle,
                            level: thisLevel
                        });
                    } else if (canClose && isSingle) {
                        token.content = replaceAt(token.content, t.index, APOSTROPHE);
                    }
                }
            }
        }
        module.exports = function smartquotes(state) {
            var blkIdx;
            if (!state.md.options.typographer) {
                return;
            }
            for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
                if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
                    continue;
                }
                process_inlines(state.tokens[blkIdx].children, state);
            }
        };
    }, {
        "../common/utils": 83
    } ],
    115: [ function(require, module, exports) {
        "use strict";
        var Token = require("../token");
        function StateCore(src, md, env) {
            this.src = src;
            this.env = env;
            this.tokens = [];
            this.inlineMode = false;
            this.md = md;
        }
        StateCore.prototype.Token = Token;
        module.exports = StateCore;
    }, {
        "../token": 130
    } ],
    116: [ function(require, module, exports) {
        "use strict";
        var url_schemas = require("../common/url_schemas");
        var EMAIL_RE = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
        var AUTOLINK_RE = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;
        module.exports = function autolink(state, silent) {
            var tail, linkMatch, emailMatch, url, fullUrl, token, pos = state.pos;
            if (state.src.charCodeAt(pos) !== 60) {
                return false;
            }
            tail = state.src.slice(pos);
            if (tail.indexOf(">") < 0) {
                return false;
            }
            if (AUTOLINK_RE.test(tail)) {
                linkMatch = tail.match(AUTOLINK_RE);
                if (url_schemas.indexOf(linkMatch[1].toLowerCase()) < 0) {
                    return false;
                }
                url = linkMatch[0].slice(1, -1);
                fullUrl = state.md.normalizeLink(url);
                if (!state.md.validateLink(fullUrl)) {
                    return false;
                }
                if (!silent) {
                    token = state.push("link_open", "a", 1);
                    token.attrs = [ [ "href", fullUrl ] ];
                    token = state.push("text", "", 0);
                    token.content = state.md.normalizeLinkText(url);
                    token = state.push("link_close", "a", -1);
                }
                state.pos += linkMatch[0].length;
                return true;
            }
            if (EMAIL_RE.test(tail)) {
                emailMatch = tail.match(EMAIL_RE);
                url = emailMatch[0].slice(1, -1);
                fullUrl = state.md.normalizeLink("mailto:" + url);
                if (!state.md.validateLink(fullUrl)) {
                    return false;
                }
                if (!silent) {
                    token = state.push("link_open", "a", 1);
                    token.attrs = [ [ "href", fullUrl ] ];
                    token.markup = "autolink";
                    token.info = "auto";
                    token = state.push("text", "", 0);
                    token.content = state.md.normalizeLinkText(url);
                    token = state.push("link_close", "a", -1);
                    token.markup = "autolink";
                    token.info = "auto";
                }
                state.pos += emailMatch[0].length;
                return true;
            }
            return false;
        };
    }, {
        "../common/url_schemas": 82
    } ],
    117: [ function(require, module, exports) {
        "use strict";
        module.exports = function backtick(state, silent) {
            var start, max, marker, matchStart, matchEnd, token, pos = state.pos, ch = state.src.charCodeAt(pos);
            if (ch !== 96) {
                return false;
            }
            start = pos;
            pos++;
            max = state.posMax;
            while (pos < max && state.src.charCodeAt(pos) === 96) {
                pos++;
            }
            marker = state.src.slice(start, pos);
            matchStart = matchEnd = pos;
            while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1) {
                matchEnd = matchStart + 1;
                while (matchEnd < max && state.src.charCodeAt(matchEnd) === 96) {
                    matchEnd++;
                }
                if (matchEnd - matchStart === marker.length) {
                    if (!silent) {
                        token = state.push("code_inline", "code", 0);
                        token.markup = marker;
                        token.content = state.src.slice(pos, matchStart).replace(/[ \n]+/g, " ").trim();
                    }
                    state.pos = matchEnd;
                    return true;
                }
            }
            if (!silent) {
                state.pending += marker;
            }
            state.pos += marker.length;
            return true;
        };
    }, {} ],
    118: [ function(require, module, exports) {
        "use strict";
        module.exports = function link_pairs(state) {
            var i, j, lastDelim, currDelim, delimiters = state.delimiters, max = state.delimiters.length;
            for (i = 0; i < max; i++) {
                lastDelim = delimiters[i];
                if (!lastDelim.close) {
                    continue;
                }
                j = i - lastDelim.jump - 1;
                while (j >= 0) {
                    currDelim = delimiters[j];
                    if (currDelim.open && currDelim.marker === lastDelim.marker && currDelim.end < 0 && currDelim.level === lastDelim.level) {
                        lastDelim.jump = i - j;
                        lastDelim.open = false;
                        currDelim.end = i;
                        currDelim.jump = 0;
                        break;
                    }
                    j -= currDelim.jump + 1;
                }
            }
        };
    }, {} ],
    119: [ function(require, module, exports) {
        "use strict";
        module.exports.tokenize = function emphasis(state, silent) {
            var i, scanned, token, start = state.pos, marker = state.src.charCodeAt(start);
            if (silent) {
                return false;
            }
            if (marker !== 95 && marker !== 42) {
                return false;
            }
            scanned = state.scanDelims(state.pos, marker === 42);
            for (i = 0; i < scanned.length; i++) {
                token = state.push("text", "", 0);
                token.content = String.fromCharCode(marker);
                state.delimiters.push({
                    marker: marker,
                    jump: i,
                    token: state.tokens.length - 1,
                    level: state.level,
                    end: -1,
                    open: scanned.can_open,
                    close: scanned.can_close
                });
            }
            state.pos += scanned.length;
            return true;
        };
        module.exports.postProcess = function emphasis(state) {
            var i, startDelim, endDelim, token, ch, isStrong, delimiters = state.delimiters, max = state.delimiters.length;
            for (i = 0; i < max; i++) {
                startDelim = delimiters[i];
                if (startDelim.marker !== 95 && startDelim.marker !== 42) {
                    continue;
                }
                if (startDelim.end === -1) {
                    continue;
                }
                endDelim = delimiters[startDelim.end];
                isStrong = i + 1 < max && delimiters[i + 1].end === startDelim.end - 1 && delimiters[i + 1].token === startDelim.token + 1 && delimiters[startDelim.end - 1].token === endDelim.token - 1 && delimiters[i + 1].marker === startDelim.marker;
                ch = String.fromCharCode(startDelim.marker);
                token = state.tokens[startDelim.token];
                token.type = isStrong ? "strong_open" : "em_open";
                token.tag = isStrong ? "strong" : "em";
                token.nesting = 1;
                token.markup = isStrong ? ch + ch : ch;
                token.content = "";
                token = state.tokens[endDelim.token];
                token.type = isStrong ? "strong_close" : "em_close";
                token.tag = isStrong ? "strong" : "em";
                token.nesting = -1;
                token.markup = isStrong ? ch + ch : ch;
                token.content = "";
                if (isStrong) {
                    state.tokens[delimiters[i + 1].token].content = "";
                    state.tokens[delimiters[startDelim.end - 1].token].content = "";
                    i++;
                }
            }
        };
    }, {} ],
    120: [ function(require, module, exports) {
        "use strict";
        var entities = require("../common/entities");
        var has = require("../common/utils").has;
        var isValidEntityCode = require("../common/utils").isValidEntityCode;
        var fromCodePoint = require("../common/utils").fromCodePoint;
        var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
        var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
        module.exports = function entity(state, silent) {
            var ch, code, match, pos = state.pos, max = state.posMax;
            if (state.src.charCodeAt(pos) !== 38) {
                return false;
            }
            if (pos + 1 < max) {
                ch = state.src.charCodeAt(pos + 1);
                if (ch === 35) {
                    match = state.src.slice(pos).match(DIGITAL_RE);
                    if (match) {
                        if (!silent) {
                            code = match[1][0].toLowerCase() === "x" ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
                            state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(65533);
                        }
                        state.pos += match[0].length;
                        return true;
                    }
                } else {
                    match = state.src.slice(pos).match(NAMED_RE);
                    if (match) {
                        if (has(entities, match[1])) {
                            if (!silent) {
                                state.pending += entities[match[1]];
                            }
                            state.pos += match[0].length;
                            return true;
                        }
                    }
                }
            }
            if (!silent) {
                state.pending += "&";
            }
            state.pos++;
            return true;
        };
    }, {
        "../common/entities": 79,
        "../common/utils": 83
    } ],
    121: [ function(require, module, exports) {
        "use strict";
        var isSpace = require("../common/utils").isSpace;
        var ESCAPED = [];
        for (var i = 0; i < 256; i++) {
            ESCAPED.push(0);
        }
        "\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(ch) {
            ESCAPED[ch.charCodeAt(0)] = 1;
        });
        module.exports = function escape(state, silent) {
            var ch, pos = state.pos, max = state.posMax;
            if (state.src.charCodeAt(pos) !== 92) {
                return false;
            }
            pos++;
            if (pos < max) {
                ch = state.src.charCodeAt(pos);
                if (ch < 256 && ESCAPED[ch] !== 0) {
                    if (!silent) {
                        state.pending += state.src[pos];
                    }
                    state.pos += 2;
                    return true;
                }
                if (ch === 10) {
                    if (!silent) {
                        state.push("hardbreak", "br", 0);
                    }
                    pos++;
                    while (pos < max) {
                        ch = state.src.charCodeAt(pos);
                        if (!isSpace(ch)) {
                            break;
                        }
                        pos++;
                    }
                    state.pos = pos;
                    return true;
                }
            }
            if (!silent) {
                state.pending += "\\";
            }
            state.pos++;
            return true;
        };
    }, {
        "../common/utils": 83
    } ],
    122: [ function(require, module, exports) {
        "use strict";
        var HTML_TAG_RE = require("../common/html_re").HTML_TAG_RE;
        function isLetter(ch) {
            var lc = ch | 32;
            return lc >= 97 && lc <= 122;
        }
        module.exports = function html_inline(state, silent) {
            var ch, match, max, token, pos = state.pos;
            if (!state.md.options.html) {
                return false;
            }
            max = state.posMax;
            if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max) {
                return false;
            }
            ch = state.src.charCodeAt(pos + 1);
            if (ch !== 33 && ch !== 63 && ch !== 47 && !isLetter(ch)) {
                return false;
            }
            match = state.src.slice(pos).match(HTML_TAG_RE);
            if (!match) {
                return false;
            }
            if (!silent) {
                token = state.push("html_inline", "", 0);
                token.content = state.src.slice(pos, pos + match[0].length);
            }
            state.pos += match[0].length;
            return true;
        };
    }, {
        "../common/html_re": 81
    } ],
    123: [ function(require, module, exports) {
        "use strict";
        var parseLinkLabel = require("../helpers/parse_link_label");
        var parseLinkDestination = require("../helpers/parse_link_destination");
        var parseLinkTitle = require("../helpers/parse_link_title");
        var normalizeReference = require("../common/utils").normalizeReference;
        var isSpace = require("../common/utils").isSpace;
        module.exports = function image(state, silent) {
            var attrs, code, label, labelEnd, labelStart, pos, ref, res, title, token, tokens, start, href = "", oldPos = state.pos, max = state.posMax;
            if (state.src.charCodeAt(state.pos) !== 33) {
                return false;
            }
            if (state.src.charCodeAt(state.pos + 1) !== 91) {
                return false;
            }
            labelStart = state.pos + 2;
            labelEnd = parseLinkLabel(state, state.pos + 1, false);
            if (labelEnd < 0) {
                return false;
            }
            pos = labelEnd + 1;
            if (pos < max && state.src.charCodeAt(pos) === 40) {
                pos++;
                for (;pos < max; pos++) {
                    code = state.src.charCodeAt(pos);
                    if (!isSpace(code) && code !== 10) {
                        break;
                    }
                }
                if (pos >= max) {
                    return false;
                }
                start = pos;
                res = parseLinkDestination(state.src, pos, state.posMax);
                if (res.ok) {
                    href = state.md.normalizeLink(res.str);
                    if (state.md.validateLink(href)) {
                        pos = res.pos;
                    } else {
                        href = "";
                    }
                }
                start = pos;
                for (;pos < max; pos++) {
                    code = state.src.charCodeAt(pos);
                    if (!isSpace(code) && code !== 10) {
                        break;
                    }
                }
                res = parseLinkTitle(state.src, pos, state.posMax);
                if (pos < max && start !== pos && res.ok) {
                    title = res.str;
                    pos = res.pos;
                    for (;pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (!isSpace(code) && code !== 10) {
                            break;
                        }
                    }
                } else {
                    title = "";
                }
                if (pos >= max || state.src.charCodeAt(pos) !== 41) {
                    state.pos = oldPos;
                    return false;
                }
                pos++;
            } else {
                if (typeof state.env.references === "undefined") {
                    return false;
                }
                for (;pos < max; pos++) {
                    code = state.src.charCodeAt(pos);
                    if (!isSpace(code) && code !== 10) {
                        break;
                    }
                }
                if (pos < max && state.src.charCodeAt(pos) === 91) {
                    start = pos + 1;
                    pos = parseLinkLabel(state, pos);
                    if (pos >= 0) {
                        label = state.src.slice(start, pos++);
                    } else {
                        pos = labelEnd + 1;
                    }
                } else {
                    pos = labelEnd + 1;
                }
                if (!label) {
                    label = state.src.slice(labelStart, labelEnd);
                }
                ref = state.env.references[normalizeReference(label)];
                if (!ref) {
                    state.pos = oldPos;
                    return false;
                }
                href = ref.href;
                title = ref.title;
            }
            if (!silent) {
                state.md.inline.parse(state.src.slice(labelStart, labelEnd), state.md, state.env, tokens = []);
                token = state.push("image", "img", 0);
                token.attrs = attrs = [ [ "src", href ], [ "alt", "" ] ];
                token.children = tokens;
                if (title) {
                    attrs.push([ "title", title ]);
                }
            }
            state.pos = pos;
            state.posMax = max;
            return true;
        };
    }, {
        "../common/utils": 83,
        "../helpers/parse_link_destination": 85,
        "../helpers/parse_link_label": 86,
        "../helpers/parse_link_title": 87
    } ],
    124: [ function(require, module, exports) {
        "use strict";
        var parseLinkLabel = require("../helpers/parse_link_label");
        var parseLinkDestination = require("../helpers/parse_link_destination");
        var parseLinkTitle = require("../helpers/parse_link_title");
        var normalizeReference = require("../common/utils").normalizeReference;
        var isSpace = require("../common/utils").isSpace;
        module.exports = function link(state, silent) {
            var attrs, code, label, labelEnd, labelStart, pos, res, ref, title, token, href = "", oldPos = state.pos, max = state.posMax, start = state.pos;
            if (state.src.charCodeAt(state.pos) !== 91) {
                return false;
            }
            labelStart = state.pos + 1;
            labelEnd = parseLinkLabel(state, state.pos, true);
            if (labelEnd < 0) {
                return false;
            }
            pos = labelEnd + 1;
            if (pos < max && state.src.charCodeAt(pos) === 40) {
                pos++;
                for (;pos < max; pos++) {
                    code = state.src.charCodeAt(pos);
                    if (!isSpace(code) && code !== 10) {
                        break;
                    }
                }
                if (pos >= max) {
                    return false;
                }
                start = pos;
                res = parseLinkDestination(state.src, pos, state.posMax);
                if (res.ok) {
                    href = state.md.normalizeLink(res.str);
                    if (state.md.validateLink(href)) {
                        pos = res.pos;
                    } else {
                        href = "";
                    }
                }
                start = pos;
                for (;pos < max; pos++) {
                    code = state.src.charCodeAt(pos);
                    if (!isSpace(code) && code !== 10) {
                        break;
                    }
                }
                res = parseLinkTitle(state.src, pos, state.posMax);
                if (pos < max && start !== pos && res.ok) {
                    title = res.str;
                    pos = res.pos;
                    for (;pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (!isSpace(code) && code !== 10) {
                            break;
                        }
                    }
                } else {
                    title = "";
                }
                if (pos >= max || state.src.charCodeAt(pos) !== 41) {
                    state.pos = oldPos;
                    return false;
                }
                pos++;
            } else {
                if (typeof state.env.references === "undefined") {
                    return false;
                }
                for (;pos < max; pos++) {
                    code = state.src.charCodeAt(pos);
                    if (!isSpace(code) && code !== 10) {
                        break;
                    }
                }
                if (pos < max && state.src.charCodeAt(pos) === 91) {
                    start = pos + 1;
                    pos = parseLinkLabel(state, pos);
                    if (pos >= 0) {
                        label = state.src.slice(start, pos++);
                    } else {
                        pos = labelEnd + 1;
                    }
                } else {
                    pos = labelEnd + 1;
                }
                if (!label) {
                    label = state.src.slice(labelStart, labelEnd);
                }
                ref = state.env.references[normalizeReference(label)];
                if (!ref) {
                    state.pos = oldPos;
                    return false;
                }
                href = ref.href;
                title = ref.title;
            }
            if (!silent) {
                state.pos = labelStart;
                state.posMax = labelEnd;
                token = state.push("link_open", "a", 1);
                token.attrs = attrs = [ [ "href", href ] ];
                if (title) {
                    attrs.push([ "title", title ]);
                }
                state.md.inline.tokenize(state);
                token = state.push("link_close", "a", -1);
            }
            state.pos = pos;
            state.posMax = max;
            return true;
        };
    }, {
        "../common/utils": 83,
        "../helpers/parse_link_destination": 85,
        "../helpers/parse_link_label": 86,
        "../helpers/parse_link_title": 87
    } ],
    125: [ function(require, module, exports) {
        "use strict";
        module.exports = function newline(state, silent) {
            var pmax, max, pos = state.pos;
            if (state.src.charCodeAt(pos) !== 10) {
                return false;
            }
            pmax = state.pending.length - 1;
            max = state.posMax;
            if (!silent) {
                if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) {
                    if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
                        state.pending = state.pending.replace(/ +$/, "");
                        state.push("hardbreak", "br", 0);
                    } else {
                        state.pending = state.pending.slice(0, -1);
                        state.push("softbreak", "br", 0);
                    }
                } else {
                    state.push("softbreak", "br", 0);
                }
            }
            pos++;
            while (pos < max && state.src.charCodeAt(pos) === 32) {
                pos++;
            }
            state.pos = pos;
            return true;
        };
    }, {} ],
    126: [ function(require, module, exports) {
        "use strict";
        var Token = require("../token");
        var isWhiteSpace = require("../common/utils").isWhiteSpace;
        var isPunctChar = require("../common/utils").isPunctChar;
        var isMdAsciiPunct = require("../common/utils").isMdAsciiPunct;
        function StateInline(src, md, env, outTokens) {
            this.src = src;
            this.env = env;
            this.md = md;
            this.tokens = outTokens;
            this.pos = 0;
            this.posMax = this.src.length;
            this.level = 0;
            this.pending = "";
            this.pendingLevel = 0;
            this.cache = {};
            this.delimiters = [];
        }
        StateInline.prototype.pushPending = function() {
            var token = new Token("text", "", 0);
            token.content = this.pending;
            token.level = this.pendingLevel;
            this.tokens.push(token);
            this.pending = "";
            return token;
        };
        StateInline.prototype.push = function(type, tag, nesting) {
            if (this.pending) {
                this.pushPending();
            }
            var token = new Token(type, tag, nesting);
            if (nesting < 0) {
                this.level--;
            }
            token.level = this.level;
            if (nesting > 0) {
                this.level++;
            }
            this.pendingLevel = this.level;
            this.tokens.push(token);
            return token;
        };
        StateInline.prototype.scanDelims = function(start, canSplitWord) {
            var pos = start, lastChar, nextChar, count, can_open, can_close, isLastWhiteSpace, isLastPunctChar, isNextWhiteSpace, isNextPunctChar, left_flanking = true, right_flanking = true, max = this.posMax, marker = this.src.charCodeAt(start);
            lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 32;
            while (pos < max && this.src.charCodeAt(pos) === marker) {
                pos++;
            }
            count = pos - start;
            nextChar = pos < max ? this.src.charCodeAt(pos) : 32;
            isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
            isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
            isLastWhiteSpace = isWhiteSpace(lastChar);
            isNextWhiteSpace = isWhiteSpace(nextChar);
            if (isNextWhiteSpace) {
                left_flanking = false;
            } else if (isNextPunctChar) {
                if (!(isLastWhiteSpace || isLastPunctChar)) {
                    left_flanking = false;
                }
            }
            if (isLastWhiteSpace) {
                right_flanking = false;
            } else if (isLastPunctChar) {
                if (!(isNextWhiteSpace || isNextPunctChar)) {
                    right_flanking = false;
                }
            }
            if (!canSplitWord) {
                can_open = left_flanking && (!right_flanking || isLastPunctChar);
                can_close = right_flanking && (!left_flanking || isNextPunctChar);
            } else {
                can_open = left_flanking;
                can_close = right_flanking;
            }
            return {
                can_open: can_open,
                can_close: can_close,
                length: count
            };
        };
        StateInline.prototype.Token = Token;
        module.exports = StateInline;
    }, {
        "../common/utils": 83,
        "../token": 130
    } ],
    127: [ function(require, module, exports) {
        "use strict";
        module.exports.tokenize = function strikethrough(state, silent) {
            var i, scanned, token, len, ch, start = state.pos, marker = state.src.charCodeAt(start);
            if (silent) {
                return false;
            }
            if (marker !== 126) {
                return false;
            }
            scanned = state.scanDelims(state.pos, true);
            len = scanned.length;
            ch = String.fromCharCode(marker);
            if (len < 2) {
                return false;
            }
            if (len % 2) {
                token = state.push("text", "", 0);
                token.content = ch;
                len--;
            }
            for (i = 0; i < len; i += 2) {
                token = state.push("text", "", 0);
                token.content = ch + ch;
                state.delimiters.push({
                    marker: marker,
                    jump: i,
                    token: state.tokens.length - 1,
                    level: state.level,
                    end: -1,
                    open: scanned.can_open,
                    close: scanned.can_close
                });
            }
            state.pos += scanned.length;
            return true;
        };
        module.exports.postProcess = function strikethrough(state) {
            var i, j, startDelim, endDelim, token, loneMarkers = [], delimiters = state.delimiters, max = state.delimiters.length;
            for (i = 0; i < max; i++) {
                startDelim = delimiters[i];
                if (startDelim.marker !== 126) {
                    continue;
                }
                if (startDelim.end === -1) {
                    continue;
                }
                endDelim = delimiters[startDelim.end];
                token = state.tokens[startDelim.token];
                token.type = "s_open";
                token.tag = "s";
                token.nesting = 1;
                token.markup = "~~";
                token.content = "";
                token = state.tokens[endDelim.token];
                token.type = "s_close";
                token.tag = "s";
                token.nesting = -1;
                token.markup = "~~";
                token.content = "";
                if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") {
                    loneMarkers.push(endDelim.token - 1);
                }
            }
            while (loneMarkers.length) {
                i = loneMarkers.pop();
                j = i + 1;
                while (j < state.tokens.length && state.tokens[j].type === "s_close") {
                    j++;
                }
                j--;
                if (i !== j) {
                    token = state.tokens[j];
                    state.tokens[j] = state.tokens[i];
                    state.tokens[i] = token;
                }
            }
        };
    }, {} ],
    128: [ function(require, module, exports) {
        "use strict";
        function isTerminatorChar(ch) {
            switch (ch) {
              case 10:
              case 33:
              case 35:
              case 36:
              case 37:
              case 38:
              case 42:
              case 43:
              case 45:
              case 58:
              case 60:
              case 61:
              case 62:
              case 64:
              case 91:
              case 92:
              case 93:
              case 94:
              case 95:
              case 96:
              case 123:
              case 125:
              case 126:
                return true;

              default:
                return false;
            }
        }
        module.exports = function text(state, silent) {
            var pos = state.pos;
            while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
                pos++;
            }
            if (pos === state.pos) {
                return false;
            }
            if (!silent) {
                state.pending += state.src.slice(state.pos, pos);
            }
            state.pos = pos;
            return true;
        };
    }, {} ],
    129: [ function(require, module, exports) {
        "use strict";
        module.exports = function text_collapse(state) {
            var curr, last, level = 0, tokens = state.tokens, max = state.tokens.length;
            for (curr = last = 0; curr < max; curr++) {
                level += tokens[curr].nesting;
                tokens[curr].level = level;
                if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
                    tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
                } else {
                    if (curr !== last) {
                        tokens[last] = tokens[curr];
                    }
                    last++;
                }
            }
            if (curr !== last) {
                tokens.length = last;
            }
        };
    }, {} ],
    130: [ function(require, module, exports) {
        "use strict";
        function Token(type, tag, nesting) {
            this.type = type;
            this.tag = tag;
            this.attrs = null;
            this.map = null;
            this.nesting = nesting;
            this.level = 0;
            this.children = null;
            this.content = "";
            this.markup = "";
            this.info = "";
            this.meta = null;
            this.block = false;
            this.hidden = false;
        }
        Token.prototype.attrIndex = function attrIndex(name) {
            var attrs, i, len;
            if (!this.attrs) {
                return -1;
            }
            attrs = this.attrs;
            for (i = 0, len = attrs.length; i < len; i++) {
                if (attrs[i][0] === name) {
                    return i;
                }
            }
            return -1;
        };
        Token.prototype.attrPush = function attrPush(attrData) {
            if (this.attrs) {
                this.attrs.push(attrData);
            } else {
                this.attrs = [ attrData ];
            }
        };
        module.exports = Token;
    }, {} ],
    131: [ function(require, module, exports) {
        module.exports = {
            Aacute: "Á",
            aacute: "á",
            Abreve: "Ă",
            abreve: "ă",
            ac: "∾",
            acd: "∿",
            acE: "∾̳",
            Acirc: "Â",
            acirc: "â",
            acute: "´",
            Acy: "А",
            acy: "а",
            AElig: "Æ",
            aelig: "æ",
            af: "⁡",
            Afr: "𝔄",
            afr: "𝔞",
            Agrave: "À",
            agrave: "à",
            alefsym: "ℵ",
            aleph: "ℵ",
            Alpha: "Α",
            alpha: "α",
            Amacr: "Ā",
            amacr: "ā",
            amalg: "⨿",
            amp: "&",
            AMP: "&",
            andand: "⩕",
            And: "⩓",
            and: "∧",
            andd: "⩜",
            andslope: "⩘",
            andv: "⩚",
            ang: "∠",
            ange: "⦤",
            angle: "∠",
            angmsdaa: "⦨",
            angmsdab: "⦩",
            angmsdac: "⦪",
            angmsdad: "⦫",
            angmsdae: "⦬",
            angmsdaf: "⦭",
            angmsdag: "⦮",
            angmsdah: "⦯",
            angmsd: "∡",
            angrt: "∟",
            angrtvb: "⊾",
            angrtvbd: "⦝",
            angsph: "∢",
            angst: "Å",
            angzarr: "⍼",
            Aogon: "Ą",
            aogon: "ą",
            Aopf: "𝔸",
            aopf: "𝕒",
            apacir: "⩯",
            ap: "≈",
            apE: "⩰",
            ape: "≊",
            apid: "≋",
            apos: "'",
            ApplyFunction: "⁡",
            approx: "≈",
            approxeq: "≊",
            Aring: "Å",
            aring: "å",
            Ascr: "𝒜",
            ascr: "𝒶",
            Assign: "≔",
            ast: "*",
            asymp: "≈",
            asympeq: "≍",
            Atilde: "Ã",
            atilde: "ã",
            Auml: "Ä",
            auml: "ä",
            awconint: "∳",
            awint: "⨑",
            backcong: "≌",
            backepsilon: "϶",
            backprime: "‵",
            backsim: "∽",
            backsimeq: "⋍",
            Backslash: "∖",
            Barv: "⫧",
            barvee: "⊽",
            barwed: "⌅",
            Barwed: "⌆",
            barwedge: "⌅",
            bbrk: "⎵",
            bbrktbrk: "⎶",
            bcong: "≌",
            Bcy: "Б",
            bcy: "б",
            bdquo: "„",
            becaus: "∵",
            because: "∵",
            Because: "∵",
            bemptyv: "⦰",
            bepsi: "϶",
            bernou: "ℬ",
            Bernoullis: "ℬ",
            Beta: "Β",
            beta: "β",
            beth: "ℶ",
            between: "≬",
            Bfr: "𝔅",
            bfr: "𝔟",
            bigcap: "⋂",
            bigcirc: "◯",
            bigcup: "⋃",
            bigodot: "⨀",
            bigoplus: "⨁",
            bigotimes: "⨂",
            bigsqcup: "⨆",
            bigstar: "★",
            bigtriangledown: "▽",
            bigtriangleup: "△",
            biguplus: "⨄",
            bigvee: "⋁",
            bigwedge: "⋀",
            bkarow: "⤍",
            blacklozenge: "⧫",
            blacksquare: "▪",
            blacktriangle: "▴",
            blacktriangledown: "▾",
            blacktriangleleft: "◂",
            blacktriangleright: "▸",
            blank: "␣",
            blk12: "▒",
            blk14: "░",
            blk34: "▓",
            block: "█",
            bne: "=⃥",
            bnequiv: "≡⃥",
            bNot: "⫭",
            bnot: "⌐",
            Bopf: "𝔹",
            bopf: "𝕓",
            bot: "⊥",
            bottom: "⊥",
            bowtie: "⋈",
            boxbox: "⧉",
            boxdl: "┐",
            boxdL: "╕",
            boxDl: "╖",
            boxDL: "╗",
            boxdr: "┌",
            boxdR: "╒",
            boxDr: "╓",
            boxDR: "╔",
            boxh: "─",
            boxH: "═",
            boxhd: "┬",
            boxHd: "╤",
            boxhD: "╥",
            boxHD: "╦",
            boxhu: "┴",
            boxHu: "╧",
            boxhU: "╨",
            boxHU: "╩",
            boxminus: "⊟",
            boxplus: "⊞",
            boxtimes: "⊠",
            boxul: "┘",
            boxuL: "╛",
            boxUl: "╜",
            boxUL: "╝",
            boxur: "└",
            boxuR: "╘",
            boxUr: "╙",
            boxUR: "╚",
            boxv: "│",
            boxV: "║",
            boxvh: "┼",
            boxvH: "╪",
            boxVh: "╫",
            boxVH: "╬",
            boxvl: "┤",
            boxvL: "╡",
            boxVl: "╢",
            boxVL: "╣",
            boxvr: "├",
            boxvR: "╞",
            boxVr: "╟",
            boxVR: "╠",
            bprime: "‵",
            breve: "˘",
            Breve: "˘",
            brvbar: "¦",
            bscr: "𝒷",
            Bscr: "ℬ",
            bsemi: "⁏",
            bsim: "∽",
            bsime: "⋍",
            bsolb: "⧅",
            bsol: "\\",
            bsolhsub: "⟈",
            bull: "•",
            bullet: "•",
            bump: "≎",
            bumpE: "⪮",
            bumpe: "≏",
            Bumpeq: "≎",
            bumpeq: "≏",
            Cacute: "Ć",
            cacute: "ć",
            capand: "⩄",
            capbrcup: "⩉",
            capcap: "⩋",
            cap: "∩",
            Cap: "⋒",
            capcup: "⩇",
            capdot: "⩀",
            CapitalDifferentialD: "ⅅ",
            caps: "∩︀",
            caret: "⁁",
            caron: "ˇ",
            Cayleys: "ℭ",
            ccaps: "⩍",
            Ccaron: "Č",
            ccaron: "č",
            Ccedil: "Ç",
            ccedil: "ç",
            Ccirc: "Ĉ",
            ccirc: "ĉ",
            Cconint: "∰",
            ccups: "⩌",
            ccupssm: "⩐",
            Cdot: "Ċ",
            cdot: "ċ",
            cedil: "¸",
            Cedilla: "¸",
            cemptyv: "⦲",
            cent: "¢",
            centerdot: "·",
            CenterDot: "·",
            cfr: "𝔠",
            Cfr: "ℭ",
            CHcy: "Ч",
            chcy: "ч",
            check: "✓",
            checkmark: "✓",
            Chi: "Χ",
            chi: "χ",
            circ: "ˆ",
            circeq: "≗",
            circlearrowleft: "↺",
            circlearrowright: "↻",
            circledast: "⊛",
            circledcirc: "⊚",
            circleddash: "⊝",
            CircleDot: "⊙",
            circledR: "®",
            circledS: "Ⓢ",
            CircleMinus: "⊖",
            CirclePlus: "⊕",
            CircleTimes: "⊗",
            cir: "○",
            cirE: "⧃",
            cire: "≗",
            cirfnint: "⨐",
            cirmid: "⫯",
            cirscir: "⧂",
            ClockwiseContourIntegral: "∲",
            CloseCurlyDoubleQuote: "”",
            CloseCurlyQuote: "’",
            clubs: "♣",
            clubsuit: "♣",
            colon: ":",
            Colon: "∷",
            Colone: "⩴",
            colone: "≔",
            coloneq: "≔",
            comma: ",",
            commat: "@",
            comp: "∁",
            compfn: "∘",
            complement: "∁",
            complexes: "ℂ",
            cong: "≅",
            congdot: "⩭",
            Congruent: "≡",
            conint: "∮",
            Conint: "∯",
            ContourIntegral: "∮",
            copf: "𝕔",
            Copf: "ℂ",
            coprod: "∐",
            Coproduct: "∐",
            copy: "©",
            COPY: "©",
            copysr: "℗",
            CounterClockwiseContourIntegral: "∳",
            crarr: "↵",
            cross: "✗",
            Cross: "⨯",
            Cscr: "𝒞",
            cscr: "𝒸",
            csub: "⫏",
            csube: "⫑",
            csup: "⫐",
            csupe: "⫒",
            ctdot: "⋯",
            cudarrl: "⤸",
            cudarrr: "⤵",
            cuepr: "⋞",
            cuesc: "⋟",
            cularr: "↶",
            cularrp: "⤽",
            cupbrcap: "⩈",
            cupcap: "⩆",
            CupCap: "≍",
            cup: "∪",
            Cup: "⋓",
            cupcup: "⩊",
            cupdot: "⊍",
            cupor: "⩅",
            cups: "∪︀",
            curarr: "↷",
            curarrm: "⤼",
            curlyeqprec: "⋞",
            curlyeqsucc: "⋟",
            curlyvee: "⋎",
            curlywedge: "⋏",
            curren: "¤",
            curvearrowleft: "↶",
            curvearrowright: "↷",
            cuvee: "⋎",
            cuwed: "⋏",
            cwconint: "∲",
            cwint: "∱",
            cylcty: "⌭",
            dagger: "†",
            Dagger: "‡",
            daleth: "ℸ",
            darr: "↓",
            Darr: "↡",
            dArr: "⇓",
            dash: "‐",
            Dashv: "⫤",
            dashv: "⊣",
            dbkarow: "⤏",
            dblac: "˝",
            Dcaron: "Ď",
            dcaron: "ď",
            Dcy: "Д",
            dcy: "д",
            ddagger: "‡",
            ddarr: "⇊",
            DD: "ⅅ",
            dd: "ⅆ",
            DDotrahd: "⤑",
            ddotseq: "⩷",
            deg: "°",
            Del: "∇",
            Delta: "Δ",
            delta: "δ",
            demptyv: "⦱",
            dfisht: "⥿",
            Dfr: "𝔇",
            dfr: "𝔡",
            dHar: "⥥",
            dharl: "⇃",
            dharr: "⇂",
            DiacriticalAcute: "´",
            DiacriticalDot: "˙",
            DiacriticalDoubleAcute: "˝",
            DiacriticalGrave: "`",
            DiacriticalTilde: "˜",
            diam: "⋄",
            diamond: "⋄",
            Diamond: "⋄",
            diamondsuit: "♦",
            diams: "♦",
            die: "¨",
            DifferentialD: "ⅆ",
            digamma: "ϝ",
            disin: "⋲",
            div: "÷",
            divide: "÷",
            divideontimes: "⋇",
            divonx: "⋇",
            DJcy: "Ђ",
            djcy: "ђ",
            dlcorn: "⌞",
            dlcrop: "⌍",
            dollar: "$",
            Dopf: "𝔻",
            dopf: "𝕕",
            Dot: "¨",
            dot: "˙",
            DotDot: "⃜",
            doteq: "≐",
            doteqdot: "≑",
            DotEqual: "≐",
            dotminus: "∸",
            dotplus: "∔",
            dotsquare: "⊡",
            doublebarwedge: "⌆",
            DoubleContourIntegral: "∯",
            DoubleDot: "¨",
            DoubleDownArrow: "⇓",
            DoubleLeftArrow: "⇐",
            DoubleLeftRightArrow: "⇔",
            DoubleLeftTee: "⫤",
            DoubleLongLeftArrow: "⟸",
            DoubleLongLeftRightArrow: "⟺",
            DoubleLongRightArrow: "⟹",
            DoubleRightArrow: "⇒",
            DoubleRightTee: "⊨",
            DoubleUpArrow: "⇑",
            DoubleUpDownArrow: "⇕",
            DoubleVerticalBar: "∥",
            DownArrowBar: "⤓",
            downarrow: "↓",
            DownArrow: "↓",
            Downarrow: "⇓",
            DownArrowUpArrow: "⇵",
            DownBreve: "̑",
            downdownarrows: "⇊",
            downharpoonleft: "⇃",
            downharpoonright: "⇂",
            DownLeftRightVector: "⥐",
            DownLeftTeeVector: "⥞",
            DownLeftVectorBar: "⥖",
            DownLeftVector: "↽",
            DownRightTeeVector: "⥟",
            DownRightVectorBar: "⥗",
            DownRightVector: "⇁",
            DownTeeArrow: "↧",
            DownTee: "⊤",
            drbkarow: "⤐",
            drcorn: "⌟",
            drcrop: "⌌",
            Dscr: "𝒟",
            dscr: "𝒹",
            DScy: "Ѕ",
            dscy: "ѕ",
            dsol: "⧶",
            Dstrok: "Đ",
            dstrok: "đ",
            dtdot: "⋱",
            dtri: "▿",
            dtrif: "▾",
            duarr: "⇵",
            duhar: "⥯",
            dwangle: "⦦",
            DZcy: "Џ",
            dzcy: "џ",
            dzigrarr: "⟿",
            Eacute: "É",
            eacute: "é",
            easter: "⩮",
            Ecaron: "Ě",
            ecaron: "ě",
            Ecirc: "Ê",
            ecirc: "ê",
            ecir: "≖",
            ecolon: "≕",
            Ecy: "Э",
            ecy: "э",
            eDDot: "⩷",
            Edot: "Ė",
            edot: "ė",
            eDot: "≑",
            ee: "ⅇ",
            efDot: "≒",
            Efr: "𝔈",
            efr: "𝔢",
            eg: "⪚",
            Egrave: "È",
            egrave: "è",
            egs: "⪖",
            egsdot: "⪘",
            el: "⪙",
            Element: "∈",
            elinters: "⏧",
            ell: "ℓ",
            els: "⪕",
            elsdot: "⪗",
            Emacr: "Ē",
            emacr: "ē",
            empty: "∅",
            emptyset: "∅",
            EmptySmallSquare: "◻",
            emptyv: "∅",
            EmptyVerySmallSquare: "▫",
            emsp13: " ",
            emsp14: " ",
            emsp: " ",
            ENG: "Ŋ",
            eng: "ŋ",
            ensp: " ",
            Eogon: "Ę",
            eogon: "ę",
            Eopf: "𝔼",
            eopf: "𝕖",
            epar: "⋕",
            eparsl: "⧣",
            eplus: "⩱",
            epsi: "ε",
            Epsilon: "Ε",
            epsilon: "ε",
            epsiv: "ϵ",
            eqcirc: "≖",
            eqcolon: "≕",
            eqsim: "≂",
            eqslantgtr: "⪖",
            eqslantless: "⪕",
            Equal: "⩵",
            equals: "=",
            EqualTilde: "≂",
            equest: "≟",
            Equilibrium: "⇌",
            equiv: "≡",
            equivDD: "⩸",
            eqvparsl: "⧥",
            erarr: "⥱",
            erDot: "≓",
            escr: "ℯ",
            Escr: "ℰ",
            esdot: "≐",
            Esim: "⩳",
            esim: "≂",
            Eta: "Η",
            eta: "η",
            ETH: "Ð",
            eth: "ð",
            Euml: "Ë",
            euml: "ë",
            euro: "€",
            excl: "!",
            exist: "∃",
            Exists: "∃",
            expectation: "ℰ",
            exponentiale: "ⅇ",
            ExponentialE: "ⅇ",
            fallingdotseq: "≒",
            Fcy: "Ф",
            fcy: "ф",
            female: "♀",
            ffilig: "ﬃ",
            fflig: "ﬀ",
            ffllig: "ﬄ",
            Ffr: "𝔉",
            ffr: "𝔣",
            filig: "ﬁ",
            FilledSmallSquare: "◼",
            FilledVerySmallSquare: "▪",
            fjlig: "fj",
            flat: "♭",
            fllig: "ﬂ",
            fltns: "▱",
            fnof: "ƒ",
            Fopf: "𝔽",
            fopf: "𝕗",
            forall: "∀",
            ForAll: "∀",
            fork: "⋔",
            forkv: "⫙",
            Fouriertrf: "ℱ",
            fpartint: "⨍",
            frac12: "½",
            frac13: "⅓",
            frac14: "¼",
            frac15: "⅕",
            frac16: "⅙",
            frac18: "⅛",
            frac23: "⅔",
            frac25: "⅖",
            frac34: "¾",
            frac35: "⅗",
            frac38: "⅜",
            frac45: "⅘",
            frac56: "⅚",
            frac58: "⅝",
            frac78: "⅞",
            frasl: "⁄",
            frown: "⌢",
            fscr: "𝒻",
            Fscr: "ℱ",
            gacute: "ǵ",
            Gamma: "Γ",
            gamma: "γ",
            Gammad: "Ϝ",
            gammad: "ϝ",
            gap: "⪆",
            Gbreve: "Ğ",
            gbreve: "ğ",
            Gcedil: "Ģ",
            Gcirc: "Ĝ",
            gcirc: "ĝ",
            Gcy: "Г",
            gcy: "г",
            Gdot: "Ġ",
            gdot: "ġ",
            ge: "≥",
            gE: "≧",
            gEl: "⪌",
            gel: "⋛",
            geq: "≥",
            geqq: "≧",
            geqslant: "⩾",
            gescc: "⪩",
            ges: "⩾",
            gesdot: "⪀",
            gesdoto: "⪂",
            gesdotol: "⪄",
            gesl: "⋛︀",
            gesles: "⪔",
            Gfr: "𝔊",
            gfr: "𝔤",
            gg: "≫",
            Gg: "⋙",
            ggg: "⋙",
            gimel: "ℷ",
            GJcy: "Ѓ",
            gjcy: "ѓ",
            gla: "⪥",
            gl: "≷",
            glE: "⪒",
            glj: "⪤",
            gnap: "⪊",
            gnapprox: "⪊",
            gne: "⪈",
            gnE: "≩",
            gneq: "⪈",
            gneqq: "≩",
            gnsim: "⋧",
            Gopf: "𝔾",
            gopf: "𝕘",
            grave: "`",
            GreaterEqual: "≥",
            GreaterEqualLess: "⋛",
            GreaterFullEqual: "≧",
            GreaterGreater: "⪢",
            GreaterLess: "≷",
            GreaterSlantEqual: "⩾",
            GreaterTilde: "≳",
            Gscr: "𝒢",
            gscr: "ℊ",
            gsim: "≳",
            gsime: "⪎",
            gsiml: "⪐",
            gtcc: "⪧",
            gtcir: "⩺",
            gt: ">",
            GT: ">",
            Gt: "≫",
            gtdot: "⋗",
            gtlPar: "⦕",
            gtquest: "⩼",
            gtrapprox: "⪆",
            gtrarr: "⥸",
            gtrdot: "⋗",
            gtreqless: "⋛",
            gtreqqless: "⪌",
            gtrless: "≷",
            gtrsim: "≳",
            gvertneqq: "≩︀",
            gvnE: "≩︀",
            Hacek: "ˇ",
            hairsp: " ",
            half: "½",
            hamilt: "ℋ",
            HARDcy: "Ъ",
            hardcy: "ъ",
            harrcir: "⥈",
            harr: "↔",
            hArr: "⇔",
            harrw: "↭",
            Hat: "^",
            hbar: "ℏ",
            Hcirc: "Ĥ",
            hcirc: "ĥ",
            hearts: "♥",
            heartsuit: "♥",
            hellip: "…",
            hercon: "⊹",
            hfr: "𝔥",
            Hfr: "ℌ",
            HilbertSpace: "ℋ",
            hksearow: "⤥",
            hkswarow: "⤦",
            hoarr: "⇿",
            homtht: "∻",
            hookleftarrow: "↩",
            hookrightarrow: "↪",
            hopf: "𝕙",
            Hopf: "ℍ",
            horbar: "―",
            HorizontalLine: "─",
            hscr: "𝒽",
            Hscr: "ℋ",
            hslash: "ℏ",
            Hstrok: "Ħ",
            hstrok: "ħ",
            HumpDownHump: "≎",
            HumpEqual: "≏",
            hybull: "⁃",
            hyphen: "‐",
            Iacute: "Í",
            iacute: "í",
            ic: "⁣",
            Icirc: "Î",
            icirc: "î",
            Icy: "И",
            icy: "и",
            Idot: "İ",
            IEcy: "Е",
            iecy: "е",
            iexcl: "¡",
            iff: "⇔",
            ifr: "𝔦",
            Ifr: "ℑ",
            Igrave: "Ì",
            igrave: "ì",
            ii: "ⅈ",
            iiiint: "⨌",
            iiint: "∭",
            iinfin: "⧜",
            iiota: "℩",
            IJlig: "Ĳ",
            ijlig: "ĳ",
            Imacr: "Ī",
            imacr: "ī",
            image: "ℑ",
            ImaginaryI: "ⅈ",
            imagline: "ℐ",
            imagpart: "ℑ",
            imath: "ı",
            Im: "ℑ",
            imof: "⊷",
            imped: "Ƶ",
            Implies: "⇒",
            incare: "℅",
            "in": "∈",
            infin: "∞",
            infintie: "⧝",
            inodot: "ı",
            intcal: "⊺",
            "int": "∫",
            Int: "∬",
            integers: "ℤ",
            Integral: "∫",
            intercal: "⊺",
            Intersection: "⋂",
            intlarhk: "⨗",
            intprod: "⨼",
            InvisibleComma: "⁣",
            InvisibleTimes: "⁢",
            IOcy: "Ё",
            iocy: "ё",
            Iogon: "Į",
            iogon: "į",
            Iopf: "𝕀",
            iopf: "𝕚",
            Iota: "Ι",
            iota: "ι",
            iprod: "⨼",
            iquest: "¿",
            iscr: "𝒾",
            Iscr: "ℐ",
            isin: "∈",
            isindot: "⋵",
            isinE: "⋹",
            isins: "⋴",
            isinsv: "⋳",
            isinv: "∈",
            it: "⁢",
            Itilde: "Ĩ",
            itilde: "ĩ",
            Iukcy: "І",
            iukcy: "і",
            Iuml: "Ï",
            iuml: "ï",
            Jcirc: "Ĵ",
            jcirc: "ĵ",
            Jcy: "Й",
            jcy: "й",
            Jfr: "𝔍",
            jfr: "𝔧",
            jmath: "ȷ",
            Jopf: "𝕁",
            jopf: "𝕛",
            Jscr: "𝒥",
            jscr: "𝒿",
            Jsercy: "Ј",
            jsercy: "ј",
            Jukcy: "Є",
            jukcy: "є",
            Kappa: "Κ",
            kappa: "κ",
            kappav: "ϰ",
            Kcedil: "Ķ",
            kcedil: "ķ",
            Kcy: "К",
            kcy: "к",
            Kfr: "𝔎",
            kfr: "𝔨",
            kgreen: "ĸ",
            KHcy: "Х",
            khcy: "х",
            KJcy: "Ќ",
            kjcy: "ќ",
            Kopf: "𝕂",
            kopf: "𝕜",
            Kscr: "𝒦",
            kscr: "𝓀",
            lAarr: "⇚",
            Lacute: "Ĺ",
            lacute: "ĺ",
            laemptyv: "⦴",
            lagran: "ℒ",
            Lambda: "Λ",
            lambda: "λ",
            lang: "⟨",
            Lang: "⟪",
            langd: "⦑",
            langle: "⟨",
            lap: "⪅",
            Laplacetrf: "ℒ",
            laquo: "«",
            larrb: "⇤",
            larrbfs: "⤟",
            larr: "←",
            Larr: "↞",
            lArr: "⇐",
            larrfs: "⤝",
            larrhk: "↩",
            larrlp: "↫",
            larrpl: "⤹",
            larrsim: "⥳",
            larrtl: "↢",
            latail: "⤙",
            lAtail: "⤛",
            lat: "⪫",
            late: "⪭",
            lates: "⪭︀",
            lbarr: "⤌",
            lBarr: "⤎",
            lbbrk: "❲",
            lbrace: "{",
            lbrack: "[",
            lbrke: "⦋",
            lbrksld: "⦏",
            lbrkslu: "⦍",
            Lcaron: "Ľ",
            lcaron: "ľ",
            Lcedil: "Ļ",
            lcedil: "ļ",
            lceil: "⌈",
            lcub: "{",
            Lcy: "Л",
            lcy: "л",
            ldca: "⤶",
            ldquo: "“",
            ldquor: "„",
            ldrdhar: "⥧",
            ldrushar: "⥋",
            ldsh: "↲",
            le: "≤",
            lE: "≦",
            LeftAngleBracket: "⟨",
            LeftArrowBar: "⇤",
            leftarrow: "←",
            LeftArrow: "←",
            Leftarrow: "⇐",
            LeftArrowRightArrow: "⇆",
            leftarrowtail: "↢",
            LeftCeiling: "⌈",
            LeftDoubleBracket: "⟦",
            LeftDownTeeVector: "⥡",
            LeftDownVectorBar: "⥙",
            LeftDownVector: "⇃",
            LeftFloor: "⌊",
            leftharpoondown: "↽",
            leftharpoonup: "↼",
            leftleftarrows: "⇇",
            leftrightarrow: "↔",
            LeftRightArrow: "↔",
            Leftrightarrow: "⇔",
            leftrightarrows: "⇆",
            leftrightharpoons: "⇋",
            leftrightsquigarrow: "↭",
            LeftRightVector: "⥎",
            LeftTeeArrow: "↤",
            LeftTee: "⊣",
            LeftTeeVector: "⥚",
            leftthreetimes: "⋋",
            LeftTriangleBar: "⧏",
            LeftTriangle: "⊲",
            LeftTriangleEqual: "⊴",
            LeftUpDownVector: "⥑",
            LeftUpTeeVector: "⥠",
            LeftUpVectorBar: "⥘",
            LeftUpVector: "↿",
            LeftVectorBar: "⥒",
            LeftVector: "↼",
            lEg: "⪋",
            leg: "⋚",
            leq: "≤",
            leqq: "≦",
            leqslant: "⩽",
            lescc: "⪨",
            les: "⩽",
            lesdot: "⩿",
            lesdoto: "⪁",
            lesdotor: "⪃",
            lesg: "⋚︀",
            lesges: "⪓",
            lessapprox: "⪅",
            lessdot: "⋖",
            lesseqgtr: "⋚",
            lesseqqgtr: "⪋",
            LessEqualGreater: "⋚",
            LessFullEqual: "≦",
            LessGreater: "≶",
            lessgtr: "≶",
            LessLess: "⪡",
            lesssim: "≲",
            LessSlantEqual: "⩽",
            LessTilde: "≲",
            lfisht: "⥼",
            lfloor: "⌊",
            Lfr: "𝔏",
            lfr: "𝔩",
            lg: "≶",
            lgE: "⪑",
            lHar: "⥢",
            lhard: "↽",
            lharu: "↼",
            lharul: "⥪",
            lhblk: "▄",
            LJcy: "Љ",
            ljcy: "љ",
            llarr: "⇇",
            ll: "≪",
            Ll: "⋘",
            llcorner: "⌞",
            Lleftarrow: "⇚",
            llhard: "⥫",
            lltri: "◺",
            Lmidot: "Ŀ",
            lmidot: "ŀ",
            lmoustache: "⎰",
            lmoust: "⎰",
            lnap: "⪉",
            lnapprox: "⪉",
            lne: "⪇",
            lnE: "≨",
            lneq: "⪇",
            lneqq: "≨",
            lnsim: "⋦",
            loang: "⟬",
            loarr: "⇽",
            lobrk: "⟦",
            longleftarrow: "⟵",
            LongLeftArrow: "⟵",
            Longleftarrow: "⟸",
            longleftrightarrow: "⟷",
            LongLeftRightArrow: "⟷",
            Longleftrightarrow: "⟺",
            longmapsto: "⟼",
            longrightarrow: "⟶",
            LongRightArrow: "⟶",
            Longrightarrow: "⟹",
            looparrowleft: "↫",
            looparrowright: "↬",
            lopar: "⦅",
            Lopf: "𝕃",
            lopf: "𝕝",
            loplus: "⨭",
            lotimes: "⨴",
            lowast: "∗",
            lowbar: "_",
            LowerLeftArrow: "↙",
            LowerRightArrow: "↘",
            loz: "◊",
            lozenge: "◊",
            lozf: "⧫",
            lpar: "(",
            lparlt: "⦓",
            lrarr: "⇆",
            lrcorner: "⌟",
            lrhar: "⇋",
            lrhard: "⥭",
            lrm: "‎",
            lrtri: "⊿",
            lsaquo: "‹",
            lscr: "𝓁",
            Lscr: "ℒ",
            lsh: "↰",
            Lsh: "↰",
            lsim: "≲",
            lsime: "⪍",
            lsimg: "⪏",
            lsqb: "[",
            lsquo: "‘",
            lsquor: "‚",
            Lstrok: "Ł",
            lstrok: "ł",
            ltcc: "⪦",
            ltcir: "⩹",
            lt: "<",
            LT: "<",
            Lt: "≪",
            ltdot: "⋖",
            lthree: "⋋",
            ltimes: "⋉",
            ltlarr: "⥶",
            ltquest: "⩻",
            ltri: "◃",
            ltrie: "⊴",
            ltrif: "◂",
            ltrPar: "⦖",
            lurdshar: "⥊",
            luruhar: "⥦",
            lvertneqq: "≨︀",
            lvnE: "≨︀",
            macr: "¯",
            male: "♂",
            malt: "✠",
            maltese: "✠",
            Map: "⤅",
            map: "↦",
            mapsto: "↦",
            mapstodown: "↧",
            mapstoleft: "↤",
            mapstoup: "↥",
            marker: "▮",
            mcomma: "⨩",
            Mcy: "М",
            mcy: "м",
            mdash: "—",
            mDDot: "∺",
            measuredangle: "∡",
            MediumSpace: " ",
            Mellintrf: "ℳ",
            Mfr: "𝔐",
            mfr: "𝔪",
            mho: "℧",
            micro: "µ",
            midast: "*",
            midcir: "⫰",
            mid: "∣",
            middot: "·",
            minusb: "⊟",
            minus: "−",
            minusd: "∸",
            minusdu: "⨪",
            MinusPlus: "∓",
            mlcp: "⫛",
            mldr: "…",
            mnplus: "∓",
            models: "⊧",
            Mopf: "𝕄",
            mopf: "𝕞",
            mp: "∓",
            mscr: "𝓂",
            Mscr: "ℳ",
            mstpos: "∾",
            Mu: "Μ",
            mu: "μ",
            multimap: "⊸",
            mumap: "⊸",
            nabla: "∇",
            Nacute: "Ń",
            nacute: "ń",
            nang: "∠⃒",
            nap: "≉",
            napE: "⩰̸",
            napid: "≋̸",
            napos: "ŉ",
            napprox: "≉",
            natural: "♮",
            naturals: "ℕ",
            natur: "♮",
            nbsp: " ",
            nbump: "≎̸",
            nbumpe: "≏̸",
            ncap: "⩃",
            Ncaron: "Ň",
            ncaron: "ň",
            Ncedil: "Ņ",
            ncedil: "ņ",
            ncong: "≇",
            ncongdot: "⩭̸",
            ncup: "⩂",
            Ncy: "Н",
            ncy: "н",
            ndash: "–",
            nearhk: "⤤",
            nearr: "↗",
            neArr: "⇗",
            nearrow: "↗",
            ne: "≠",
            nedot: "≐̸",
            NegativeMediumSpace: "​",
            NegativeThickSpace: "​",
            NegativeThinSpace: "​",
            NegativeVeryThinSpace: "​",
            nequiv: "≢",
            nesear: "⤨",
            nesim: "≂̸",
            NestedGreaterGreater: "≫",
            NestedLessLess: "≪",
            NewLine: "\n",
            nexist: "∄",
            nexists: "∄",
            Nfr: "𝔑",
            nfr: "𝔫",
            ngE: "≧̸",
            nge: "≱",
            ngeq: "≱",
            ngeqq: "≧̸",
            ngeqslant: "⩾̸",
            nges: "⩾̸",
            nGg: "⋙̸",
            ngsim: "≵",
            nGt: "≫⃒",
            ngt: "≯",
            ngtr: "≯",
            nGtv: "≫̸",
            nharr: "↮",
            nhArr: "⇎",
            nhpar: "⫲",
            ni: "∋",
            nis: "⋼",
            nisd: "⋺",
            niv: "∋",
            NJcy: "Њ",
            njcy: "њ",
            nlarr: "↚",
            nlArr: "⇍",
            nldr: "‥",
            nlE: "≦̸",
            nle: "≰",
            nleftarrow: "↚",
            nLeftarrow: "⇍",
            nleftrightarrow: "↮",
            nLeftrightarrow: "⇎",
            nleq: "≰",
            nleqq: "≦̸",
            nleqslant: "⩽̸",
            nles: "⩽̸",
            nless: "≮",
            nLl: "⋘̸",
            nlsim: "≴",
            nLt: "≪⃒",
            nlt: "≮",
            nltri: "⋪",
            nltrie: "⋬",
            nLtv: "≪̸",
            nmid: "∤",
            NoBreak: "⁠",
            NonBreakingSpace: " ",
            nopf: "𝕟",
            Nopf: "ℕ",
            Not: "⫬",
            not: "¬",
            NotCongruent: "≢",
            NotCupCap: "≭",
            NotDoubleVerticalBar: "∦",
            NotElement: "∉",
            NotEqual: "≠",
            NotEqualTilde: "≂̸",
            NotExists: "∄",
            NotGreater: "≯",
            NotGreaterEqual: "≱",
            NotGreaterFullEqual: "≧̸",
            NotGreaterGreater: "≫̸",
            NotGreaterLess: "≹",
            NotGreaterSlantEqual: "⩾̸",
            NotGreaterTilde: "≵",
            NotHumpDownHump: "≎̸",
            NotHumpEqual: "≏̸",
            notin: "∉",
            notindot: "⋵̸",
            notinE: "⋹̸",
            notinva: "∉",
            notinvb: "⋷",
            notinvc: "⋶",
            NotLeftTriangleBar: "⧏̸",
            NotLeftTriangle: "⋪",
            NotLeftTriangleEqual: "⋬",
            NotLess: "≮",
            NotLessEqual: "≰",
            NotLessGreater: "≸",
            NotLessLess: "≪̸",
            NotLessSlantEqual: "⩽̸",
            NotLessTilde: "≴",
            NotNestedGreaterGreater: "⪢̸",
            NotNestedLessLess: "⪡̸",
            notni: "∌",
            notniva: "∌",
            notnivb: "⋾",
            notnivc: "⋽",
            NotPrecedes: "⊀",
            NotPrecedesEqual: "⪯̸",
            NotPrecedesSlantEqual: "⋠",
            NotReverseElement: "∌",
            NotRightTriangleBar: "⧐̸",
            NotRightTriangle: "⋫",
            NotRightTriangleEqual: "⋭",
            NotSquareSubset: "⊏̸",
            NotSquareSubsetEqual: "⋢",
            NotSquareSuperset: "⊐̸",
            NotSquareSupersetEqual: "⋣",
            NotSubset: "⊂⃒",
            NotSubsetEqual: "⊈",
            NotSucceeds: "⊁",
            NotSucceedsEqual: "⪰̸",
            NotSucceedsSlantEqual: "⋡",
            NotSucceedsTilde: "≿̸",
            NotSuperset: "⊃⃒",
            NotSupersetEqual: "⊉",
            NotTilde: "≁",
            NotTildeEqual: "≄",
            NotTildeFullEqual: "≇",
            NotTildeTilde: "≉",
            NotVerticalBar: "∤",
            nparallel: "∦",
            npar: "∦",
            nparsl: "⫽⃥",
            npart: "∂̸",
            npolint: "⨔",
            npr: "⊀",
            nprcue: "⋠",
            nprec: "⊀",
            npreceq: "⪯̸",
            npre: "⪯̸",
            nrarrc: "⤳̸",
            nrarr: "↛",
            nrArr: "⇏",
            nrarrw: "↝̸",
            nrightarrow: "↛",
            nRightarrow: "⇏",
            nrtri: "⋫",
            nrtrie: "⋭",
            nsc: "⊁",
            nsccue: "⋡",
            nsce: "⪰̸",
            Nscr: "𝒩",
            nscr: "𝓃",
            nshortmid: "∤",
            nshortparallel: "∦",
            nsim: "≁",
            nsime: "≄",
            nsimeq: "≄",
            nsmid: "∤",
            nspar: "∦",
            nsqsube: "⋢",
            nsqsupe: "⋣",
            nsub: "⊄",
            nsubE: "⫅̸",
            nsube: "⊈",
            nsubset: "⊂⃒",
            nsubseteq: "⊈",
            nsubseteqq: "⫅̸",
            nsucc: "⊁",
            nsucceq: "⪰̸",
            nsup: "⊅",
            nsupE: "⫆̸",
            nsupe: "⊉",
            nsupset: "⊃⃒",
            nsupseteq: "⊉",
            nsupseteqq: "⫆̸",
            ntgl: "≹",
            Ntilde: "Ñ",
            ntilde: "ñ",
            ntlg: "≸",
            ntriangleleft: "⋪",
            ntrianglelefteq: "⋬",
            ntriangleright: "⋫",
            ntrianglerighteq: "⋭",
            Nu: "Ν",
            nu: "ν",
            num: "#",
            numero: "№",
            numsp: " ",
            nvap: "≍⃒",
            nvdash: "⊬",
            nvDash: "⊭",
            nVdash: "⊮",
            nVDash: "⊯",
            nvge: "≥⃒",
            nvgt: ">⃒",
            nvHarr: "⤄",
            nvinfin: "⧞",
            nvlArr: "⤂",
            nvle: "≤⃒",
            nvlt: "<⃒",
            nvltrie: "⊴⃒",
            nvrArr: "⤃",
            nvrtrie: "⊵⃒",
            nvsim: "∼⃒",
            nwarhk: "⤣",
            nwarr: "↖",
            nwArr: "⇖",
            nwarrow: "↖",
            nwnear: "⤧",
            Oacute: "Ó",
            oacute: "ó",
            oast: "⊛",
            Ocirc: "Ô",
            ocirc: "ô",
            ocir: "⊚",
            Ocy: "О",
            ocy: "о",
            odash: "⊝",
            Odblac: "Ő",
            odblac: "ő",
            odiv: "⨸",
            odot: "⊙",
            odsold: "⦼",
            OElig: "Œ",
            oelig: "œ",
            ofcir: "⦿",
            Ofr: "𝔒",
            ofr: "𝔬",
            ogon: "˛",
            Ograve: "Ò",
            ograve: "ò",
            ogt: "⧁",
            ohbar: "⦵",
            ohm: "Ω",
            oint: "∮",
            olarr: "↺",
            olcir: "⦾",
            olcross: "⦻",
            oline: "‾",
            olt: "⧀",
            Omacr: "Ō",
            omacr: "ō",
            Omega: "Ω",
            omega: "ω",
            Omicron: "Ο",
            omicron: "ο",
            omid: "⦶",
            ominus: "⊖",
            Oopf: "𝕆",
            oopf: "𝕠",
            opar: "⦷",
            OpenCurlyDoubleQuote: "“",
            OpenCurlyQuote: "‘",
            operp: "⦹",
            oplus: "⊕",
            orarr: "↻",
            Or: "⩔",
            or: "∨",
            ord: "⩝",
            order: "ℴ",
            orderof: "ℴ",
            ordf: "ª",
            ordm: "º",
            origof: "⊶",
            oror: "⩖",
            orslope: "⩗",
            orv: "⩛",
            oS: "Ⓢ",
            Oscr: "𝒪",
            oscr: "ℴ",
            Oslash: "Ø",
            oslash: "ø",
            osol: "⊘",
            Otilde: "Õ",
            otilde: "õ",
            otimesas: "⨶",
            Otimes: "⨷",
            otimes: "⊗",
            Ouml: "Ö",
            ouml: "ö",
            ovbar: "⌽",
            OverBar: "‾",
            OverBrace: "⏞",
            OverBracket: "⎴",
            OverParenthesis: "⏜",
            para: "¶",
            parallel: "∥",
            par: "∥",
            parsim: "⫳",
            parsl: "⫽",
            part: "∂",
            PartialD: "∂",
            Pcy: "П",
            pcy: "п",
            percnt: "%",
            period: ".",
            permil: "‰",
            perp: "⊥",
            pertenk: "‱",
            Pfr: "𝔓",
            pfr: "𝔭",
            Phi: "Φ",
            phi: "φ",
            phiv: "ϕ",
            phmmat: "ℳ",
            phone: "☎",
            Pi: "Π",
            pi: "π",
            pitchfork: "⋔",
            piv: "ϖ",
            planck: "ℏ",
            planckh: "ℎ",
            plankv: "ℏ",
            plusacir: "⨣",
            plusb: "⊞",
            pluscir: "⨢",
            plus: "+",
            plusdo: "∔",
            plusdu: "⨥",
            pluse: "⩲",
            PlusMinus: "±",
            plusmn: "±",
            plussim: "⨦",
            plustwo: "⨧",
            pm: "±",
            Poincareplane: "ℌ",
            pointint: "⨕",
            popf: "𝕡",
            Popf: "ℙ",
            pound: "£",
            prap: "⪷",
            Pr: "⪻",
            pr: "≺",
            prcue: "≼",
            precapprox: "⪷",
            prec: "≺",
            preccurlyeq: "≼",
            Precedes: "≺",
            PrecedesEqual: "⪯",
            PrecedesSlantEqual: "≼",
            PrecedesTilde: "≾",
            preceq: "⪯",
            precnapprox: "⪹",
            precneqq: "⪵",
            precnsim: "⋨",
            pre: "⪯",
            prE: "⪳",
            precsim: "≾",
            prime: "′",
            Prime: "″",
            primes: "ℙ",
            prnap: "⪹",
            prnE: "⪵",
            prnsim: "⋨",
            prod: "∏",
            Product: "∏",
            profalar: "⌮",
            profline: "⌒",
            profsurf: "⌓",
            prop: "∝",
            Proportional: "∝",
            Proportion: "∷",
            propto: "∝",
            prsim: "≾",
            prurel: "⊰",
            Pscr: "𝒫",
            pscr: "𝓅",
            Psi: "Ψ",
            psi: "ψ",
            puncsp: " ",
            Qfr: "𝔔",
            qfr: "𝔮",
            qint: "⨌",
            qopf: "𝕢",
            Qopf: "ℚ",
            qprime: "⁗",
            Qscr: "𝒬",
            qscr: "𝓆",
            quaternions: "ℍ",
            quatint: "⨖",
            quest: "?",
            questeq: "≟",
            quot: '"',
            QUOT: '"',
            rAarr: "⇛",
            race: "∽̱",
            Racute: "Ŕ",
            racute: "ŕ",
            radic: "√",
            raemptyv: "⦳",
            rang: "⟩",
            Rang: "⟫",
            rangd: "⦒",
            range: "⦥",
            rangle: "⟩",
            raquo: "»",
            rarrap: "⥵",
            rarrb: "⇥",
            rarrbfs: "⤠",
            rarrc: "⤳",
            rarr: "→",
            Rarr: "↠",
            rArr: "⇒",
            rarrfs: "⤞",
            rarrhk: "↪",
            rarrlp: "↬",
            rarrpl: "⥅",
            rarrsim: "⥴",
            Rarrtl: "⤖",
            rarrtl: "↣",
            rarrw: "↝",
            ratail: "⤚",
            rAtail: "⤜",
            ratio: "∶",
            rationals: "ℚ",
            rbarr: "⤍",
            rBarr: "⤏",
            RBarr: "⤐",
            rbbrk: "❳",
            rbrace: "}",
            rbrack: "]",
            rbrke: "⦌",
            rbrksld: "⦎",
            rbrkslu: "⦐",
            Rcaron: "Ř",
            rcaron: "ř",
            Rcedil: "Ŗ",
            rcedil: "ŗ",
            rceil: "⌉",
            rcub: "}",
            Rcy: "Р",
            rcy: "р",
            rdca: "⤷",
            rdldhar: "⥩",
            rdquo: "”",
            rdquor: "”",
            rdsh: "↳",
            real: "ℜ",
            realine: "ℛ",
            realpart: "ℜ",
            reals: "ℝ",
            Re: "ℜ",
            rect: "▭",
            reg: "®",
            REG: "®",
            ReverseElement: "∋",
            ReverseEquilibrium: "⇋",
            ReverseUpEquilibrium: "⥯",
            rfisht: "⥽",
            rfloor: "⌋",
            rfr: "𝔯",
            Rfr: "ℜ",
            rHar: "⥤",
            rhard: "⇁",
            rharu: "⇀",
            rharul: "⥬",
            Rho: "Ρ",
            rho: "ρ",
            rhov: "ϱ",
            RightAngleBracket: "⟩",
            RightArrowBar: "⇥",
            rightarrow: "→",
            RightArrow: "→",
            Rightarrow: "⇒",
            RightArrowLeftArrow: "⇄",
            rightarrowtail: "↣",
            RightCeiling: "⌉",
            RightDoubleBracket: "⟧",
            RightDownTeeVector: "⥝",
            RightDownVectorBar: "⥕",
            RightDownVector: "⇂",
            RightFloor: "⌋",
            rightharpoondown: "⇁",
            rightharpoonup: "⇀",
            rightleftarrows: "⇄",
            rightleftharpoons: "⇌",
            rightrightarrows: "⇉",
            rightsquigarrow: "↝",
            RightTeeArrow: "↦",
            RightTee: "⊢",
            RightTeeVector: "⥛",
            rightthreetimes: "⋌",
            RightTriangleBar: "⧐",
            RightTriangle: "⊳",
            RightTriangleEqual: "⊵",
            RightUpDownVector: "⥏",
            RightUpTeeVector: "⥜",
            RightUpVectorBar: "⥔",
            RightUpVector: "↾",
            RightVectorBar: "⥓",
            RightVector: "⇀",
            ring: "˚",
            risingdotseq: "≓",
            rlarr: "⇄",
            rlhar: "⇌",
            rlm: "‏",
            rmoustache: "⎱",
            rmoust: "⎱",
            rnmid: "⫮",
            roang: "⟭",
            roarr: "⇾",
            robrk: "⟧",
            ropar: "⦆",
            ropf: "𝕣",
            Ropf: "ℝ",
            roplus: "⨮",
            rotimes: "⨵",
            RoundImplies: "⥰",
            rpar: ")",
            rpargt: "⦔",
            rppolint: "⨒",
            rrarr: "⇉",
            Rrightarrow: "⇛",
            rsaquo: "›",
            rscr: "𝓇",
            Rscr: "ℛ",
            rsh: "↱",
            Rsh: "↱",
            rsqb: "]",
            rsquo: "’",
            rsquor: "’",
            rthree: "⋌",
            rtimes: "⋊",
            rtri: "▹",
            rtrie: "⊵",
            rtrif: "▸",
            rtriltri: "⧎",
            RuleDelayed: "⧴",
            ruluhar: "⥨",
            rx: "℞",
            Sacute: "Ś",
            sacute: "ś",
            sbquo: "‚",
            scap: "⪸",
            Scaron: "Š",
            scaron: "š",
            Sc: "⪼",
            sc: "≻",
            sccue: "≽",
            sce: "⪰",
            scE: "⪴",
            Scedil: "Ş",
            scedil: "ş",
            Scirc: "Ŝ",
            scirc: "ŝ",
            scnap: "⪺",
            scnE: "⪶",
            scnsim: "⋩",
            scpolint: "⨓",
            scsim: "≿",
            Scy: "С",
            scy: "с",
            sdotb: "⊡",
            sdot: "⋅",
            sdote: "⩦",
            searhk: "⤥",
            searr: "↘",
            seArr: "⇘",
            searrow: "↘",
            sect: "§",
            semi: ";",
            seswar: "⤩",
            setminus: "∖",
            setmn: "∖",
            sext: "✶",
            Sfr: "𝔖",
            sfr: "𝔰",
            sfrown: "⌢",
            sharp: "♯",
            SHCHcy: "Щ",
            shchcy: "щ",
            SHcy: "Ш",
            shcy: "ш",
            ShortDownArrow: "↓",
            ShortLeftArrow: "←",
            shortmid: "∣",
            shortparallel: "∥",
            ShortRightArrow: "→",
            ShortUpArrow: "↑",
            shy: "­",
            Sigma: "Σ",
            sigma: "σ",
            sigmaf: "ς",
            sigmav: "ς",
            sim: "∼",
            simdot: "⩪",
            sime: "≃",
            simeq: "≃",
            simg: "⪞",
            simgE: "⪠",
            siml: "⪝",
            simlE: "⪟",
            simne: "≆",
            simplus: "⨤",
            simrarr: "⥲",
            slarr: "←",
            SmallCircle: "∘",
            smallsetminus: "∖",
            smashp: "⨳",
            smeparsl: "⧤",
            smid: "∣",
            smile: "⌣",
            smt: "⪪",
            smte: "⪬",
            smtes: "⪬︀",
            SOFTcy: "Ь",
            softcy: "ь",
            solbar: "⌿",
            solb: "⧄",
            sol: "/",
            Sopf: "𝕊",
            sopf: "𝕤",
            spades: "♠",
            spadesuit: "♠",
            spar: "∥",
            sqcap: "⊓",
            sqcaps: "⊓︀",
            sqcup: "⊔",
            sqcups: "⊔︀",
            Sqrt: "√",
            sqsub: "⊏",
            sqsube: "⊑",
            sqsubset: "⊏",
            sqsubseteq: "⊑",
            sqsup: "⊐",
            sqsupe: "⊒",
            sqsupset: "⊐",
            sqsupseteq: "⊒",
            square: "□",
            Square: "□",
            SquareIntersection: "⊓",
            SquareSubset: "⊏",
            SquareSubsetEqual: "⊑",
            SquareSuperset: "⊐",
            SquareSupersetEqual: "⊒",
            SquareUnion: "⊔",
            squarf: "▪",
            squ: "□",
            squf: "▪",
            srarr: "→",
            Sscr: "𝒮",
            sscr: "𝓈",
            ssetmn: "∖",
            ssmile: "⌣",
            sstarf: "⋆",
            Star: "⋆",
            star: "☆",
            starf: "★",
            straightepsilon: "ϵ",
            straightphi: "ϕ",
            strns: "¯",
            sub: "⊂",
            Sub: "⋐",
            subdot: "⪽",
            subE: "⫅",
            sube: "⊆",
            subedot: "⫃",
            submult: "⫁",
            subnE: "⫋",
            subne: "⊊",
            subplus: "⪿",
            subrarr: "⥹",
            subset: "⊂",
            Subset: "⋐",
            subseteq: "⊆",
            subseteqq: "⫅",
            SubsetEqual: "⊆",
            subsetneq: "⊊",
            subsetneqq: "⫋",
            subsim: "⫇",
            subsub: "⫕",
            subsup: "⫓",
            succapprox: "⪸",
            succ: "≻",
            succcurlyeq: "≽",
            Succeeds: "≻",
            SucceedsEqual: "⪰",
            SucceedsSlantEqual: "≽",
            SucceedsTilde: "≿",
            succeq: "⪰",
            succnapprox: "⪺",
            succneqq: "⪶",
            succnsim: "⋩",
            succsim: "≿",
            SuchThat: "∋",
            sum: "∑",
            Sum: "∑",
            sung: "♪",
            sup1: "¹",
            sup2: "²",
            sup3: "³",
            sup: "⊃",
            Sup: "⋑",
            supdot: "⪾",
            supdsub: "⫘",
            supE: "⫆",
            supe: "⊇",
            supedot: "⫄",
            Superset: "⊃",
            SupersetEqual: "⊇",
            suphsol: "⟉",
            suphsub: "⫗",
            suplarr: "⥻",
            supmult: "⫂",
            supnE: "⫌",
            supne: "⊋",
            supplus: "⫀",
            supset: "⊃",
            Supset: "⋑",
            supseteq: "⊇",
            supseteqq: "⫆",
            supsetneq: "⊋",
            supsetneqq: "⫌",
            supsim: "⫈",
            supsub: "⫔",
            supsup: "⫖",
            swarhk: "⤦",
            swarr: "↙",
            swArr: "⇙",
            swarrow: "↙",
            swnwar: "⤪",
            szlig: "ß",
            Tab: "	",
            target: "⌖",
            Tau: "Τ",
            tau: "τ",
            tbrk: "⎴",
            Tcaron: "Ť",
            tcaron: "ť",
            Tcedil: "Ţ",
            tcedil: "ţ",
            Tcy: "Т",
            tcy: "т",
            tdot: "⃛",
            telrec: "⌕",
            Tfr: "𝔗",
            tfr: "𝔱",
            there4: "∴",
            therefore: "∴",
            Therefore: "∴",
            Theta: "Θ",
            theta: "θ",
            thetasym: "ϑ",
            thetav: "ϑ",
            thickapprox: "≈",
            thicksim: "∼",
            ThickSpace: "  ",
            ThinSpace: " ",
            thinsp: " ",
            thkap: "≈",
            thksim: "∼",
            THORN: "Þ",
            thorn: "þ",
            tilde: "˜",
            Tilde: "∼",
            TildeEqual: "≃",
            TildeFullEqual: "≅",
            TildeTilde: "≈",
            timesbar: "⨱",
            timesb: "⊠",
            times: "×",
            timesd: "⨰",
            tint: "∭",
            toea: "⤨",
            topbot: "⌶",
            topcir: "⫱",
            top: "⊤",
            Topf: "𝕋",
            topf: "𝕥",
            topfork: "⫚",
            tosa: "⤩",
            tprime: "‴",
            trade: "™",
            TRADE: "™",
            triangle: "▵",
            triangledown: "▿",
            triangleleft: "◃",
            trianglelefteq: "⊴",
            triangleq: "≜",
            triangleright: "▹",
            trianglerighteq: "⊵",
            tridot: "◬",
            trie: "≜",
            triminus: "⨺",
            TripleDot: "⃛",
            triplus: "⨹",
            trisb: "⧍",
            tritime: "⨻",
            trpezium: "⏢",
            Tscr: "𝒯",
            tscr: "𝓉",
            TScy: "Ц",
            tscy: "ц",
            TSHcy: "Ћ",
            tshcy: "ћ",
            Tstrok: "Ŧ",
            tstrok: "ŧ",
            twixt: "≬",
            twoheadleftarrow: "↞",
            twoheadrightarrow: "↠",
            Uacute: "Ú",
            uacute: "ú",
            uarr: "↑",
            Uarr: "↟",
            uArr: "⇑",
            Uarrocir: "⥉",
            Ubrcy: "Ў",
            ubrcy: "ў",
            Ubreve: "Ŭ",
            ubreve: "ŭ",
            Ucirc: "Û",
            ucirc: "û",
            Ucy: "У",
            ucy: "у",
            udarr: "⇅",
            Udblac: "Ű",
            udblac: "ű",
            udhar: "⥮",
            ufisht: "⥾",
            Ufr: "𝔘",
            ufr: "𝔲",
            Ugrave: "Ù",
            ugrave: "ù",
            uHar: "⥣",
            uharl: "↿",
            uharr: "↾",
            uhblk: "▀",
            ulcorn: "⌜",
            ulcorner: "⌜",
            ulcrop: "⌏",
            ultri: "◸",
            Umacr: "Ū",
            umacr: "ū",
            uml: "¨",
            UnderBar: "_",
            UnderBrace: "⏟",
            UnderBracket: "⎵",
            UnderParenthesis: "⏝",
            Union: "⋃",
            UnionPlus: "⊎",
            Uogon: "Ų",
            uogon: "ų",
            Uopf: "𝕌",
            uopf: "𝕦",
            UpArrowBar: "⤒",
            uparrow: "↑",
            UpArrow: "↑",
            Uparrow: "⇑",
            UpArrowDownArrow: "⇅",
            updownarrow: "↕",
            UpDownArrow: "↕",
            Updownarrow: "⇕",
            UpEquilibrium: "⥮",
            upharpoonleft: "↿",
            upharpoonright: "↾",
            uplus: "⊎",
            UpperLeftArrow: "↖",
            UpperRightArrow: "↗",
            upsi: "υ",
            Upsi: "ϒ",
            upsih: "ϒ",
            Upsilon: "Υ",
            upsilon: "υ",
            UpTeeArrow: "↥",
            UpTee: "⊥",
            upuparrows: "⇈",
            urcorn: "⌝",
            urcorner: "⌝",
            urcrop: "⌎",
            Uring: "Ů",
            uring: "ů",
            urtri: "◹",
            Uscr: "𝒰",
            uscr: "𝓊",
            utdot: "⋰",
            Utilde: "Ũ",
            utilde: "ũ",
            utri: "▵",
            utrif: "▴",
            uuarr: "⇈",
            Uuml: "Ü",
            uuml: "ü",
            uwangle: "⦧",
            vangrt: "⦜",
            varepsilon: "ϵ",
            varkappa: "ϰ",
            varnothing: "∅",
            varphi: "ϕ",
            varpi: "ϖ",
            varpropto: "∝",
            varr: "↕",
            vArr: "⇕",
            varrho: "ϱ",
            varsigma: "ς",
            varsubsetneq: "⊊︀",
            varsubsetneqq: "⫋︀",
            varsupsetneq: "⊋︀",
            varsupsetneqq: "⫌︀",
            vartheta: "ϑ",
            vartriangleleft: "⊲",
            vartriangleright: "⊳",
            vBar: "⫨",
            Vbar: "⫫",
            vBarv: "⫩",
            Vcy: "В",
            vcy: "в",
            vdash: "⊢",
            vDash: "⊨",
            Vdash: "⊩",
            VDash: "⊫",
            Vdashl: "⫦",
            veebar: "⊻",
            vee: "∨",
            Vee: "⋁",
            veeeq: "≚",
            vellip: "⋮",
            verbar: "|",
            Verbar: "‖",
            vert: "|",
            Vert: "‖",
            VerticalBar: "∣",
            VerticalLine: "|",
            VerticalSeparator: "❘",
            VerticalTilde: "≀",
            VeryThinSpace: " ",
            Vfr: "𝔙",
            vfr: "𝔳",
            vltri: "⊲",
            vnsub: "⊂⃒",
            vnsup: "⊃⃒",
            Vopf: "𝕍",
            vopf: "𝕧",
            vprop: "∝",
            vrtri: "⊳",
            Vscr: "𝒱",
            vscr: "𝓋",
            vsubnE: "⫋︀",
            vsubne: "⊊︀",
            vsupnE: "⫌︀",
            vsupne: "⊋︀",
            Vvdash: "⊪",
            vzigzag: "⦚",
            Wcirc: "Ŵ",
            wcirc: "ŵ",
            wedbar: "⩟",
            wedge: "∧",
            Wedge: "⋀",
            wedgeq: "≙",
            weierp: "℘",
            Wfr: "𝔚",
            wfr: "𝔴",
            Wopf: "𝕎",
            wopf: "𝕨",
            wp: "℘",
            wr: "≀",
            wreath: "≀",
            Wscr: "𝒲",
            wscr: "𝓌",
            xcap: "⋂",
            xcirc: "◯",
            xcup: "⋃",
            xdtri: "▽",
            Xfr: "𝔛",
            xfr: "𝔵",
            xharr: "⟷",
            xhArr: "⟺",
            Xi: "Ξ",
            xi: "ξ",
            xlarr: "⟵",
            xlArr: "⟸",
            xmap: "⟼",
            xnis: "⋻",
            xodot: "⨀",
            Xopf: "𝕏",
            xopf: "𝕩",
            xoplus: "⨁",
            xotime: "⨂",
            xrarr: "⟶",
            xrArr: "⟹",
            Xscr: "𝒳",
            xscr: "𝓍",
            xsqcup: "⨆",
            xuplus: "⨄",
            xutri: "△",
            xvee: "⋁",
            xwedge: "⋀",
            Yacute: "Ý",
            yacute: "ý",
            YAcy: "Я",
            yacy: "я",
            Ycirc: "Ŷ",
            ycirc: "ŷ",
            Ycy: "Ы",
            ycy: "ы",
            yen: "¥",
            Yfr: "𝔜",
            yfr: "𝔶",
            YIcy: "Ї",
            yicy: "ї",
            Yopf: "𝕐",
            yopf: "𝕪",
            Yscr: "𝒴",
            yscr: "𝓎",
            YUcy: "Ю",
            yucy: "ю",
            yuml: "ÿ",
            Yuml: "Ÿ",
            Zacute: "Ź",
            zacute: "ź",
            Zcaron: "Ž",
            zcaron: "ž",
            Zcy: "З",
            zcy: "з",
            Zdot: "Ż",
            zdot: "ż",
            zeetrf: "ℨ",
            ZeroWidthSpace: "​",
            Zeta: "Ζ",
            zeta: "ζ",
            zfr: "𝔷",
            Zfr: "ℨ",
            ZHcy: "Ж",
            zhcy: "ж",
            zigrarr: "⇝",
            zopf: "𝕫",
            Zopf: "ℤ",
            Zscr: "𝒵",
            zscr: "𝓏",
            zwj: "‍",
            zwnj: "‌"
        };
    }, {} ],
    132: [ function(require, module, exports) {
        "use strict";
        function assign(obj) {
            var sources = Array.prototype.slice.call(arguments, 1);
            sources.forEach(function(source) {
                if (!source) {
                    return;
                }
                Object.keys(source).forEach(function(key) {
                    obj[key] = source[key];
                });
            });
            return obj;
        }
        function _class(obj) {
            return Object.prototype.toString.call(obj);
        }
        function isString(obj) {
            return _class(obj) === "[object String]";
        }
        function isObject(obj) {
            return _class(obj) === "[object Object]";
        }
        function isRegExp(obj) {
            return _class(obj) === "[object RegExp]";
        }
        function isFunction(obj) {
            return _class(obj) === "[object Function]";
        }
        function escapeRE(str) {
            return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
        }
        var defaultOptions = {
            fuzzyLink: true,
            fuzzyEmail: true,
            fuzzyIP: false
        };
        function isOptionsObj(obj) {
            return Object.keys(obj || {}).reduce(function(acc, k) {
                return acc || defaultOptions.hasOwnProperty(k);
            }, false);
        }
        var defaultSchemas = {
            "http:": {
                validate: function(text, pos, self) {
                    var tail = text.slice(pos);
                    if (!self.re.http) {
                        self.re.http = new RegExp("^\\/\\/" + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, "i");
                    }
                    if (self.re.http.test(tail)) {
                        return tail.match(self.re.http)[0].length;
                    }
                    return 0;
                }
            },
            "https:": "http:",
            "ftp:": "http:",
            "//": {
                validate: function(text, pos, self) {
                    var tail = text.slice(pos);
                    if (!self.re.no_http) {
                        self.re.no_http = new RegExp("^" + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, "i");
                    }
                    if (self.re.no_http.test(tail)) {
                        if (pos >= 3 && text[pos - 3] === ":") {
                            return 0;
                        }
                        return tail.match(self.re.no_http)[0].length;
                    }
                    return 0;
                }
            },
            "mailto:": {
                validate: function(text, pos, self) {
                    var tail = text.slice(pos);
                    if (!self.re.mailto) {
                        self.re.mailto = new RegExp("^" + self.re.src_email_name + "@" + self.re.src_host_strict, "i");
                    }
                    if (self.re.mailto.test(tail)) {
                        return tail.match(self.re.mailto)[0].length;
                    }
                    return 0;
                }
            }
        };
        var tlds_2ch_src_re = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]";
        var tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");
        function resetScanCache(self) {
            self.__index__ = -1;
            self.__text_cache__ = "";
        }
        function createValidator(re) {
            return function(text, pos) {
                var tail = text.slice(pos);
                if (re.test(tail)) {
                    return tail.match(re)[0].length;
                }
                return 0;
            };
        }
        function createNormalizer() {
            return function(match, self) {
                self.normalize(match);
            };
        }
        function compile(self) {
            var re = self.re = assign({}, require("./lib/re"));
            var tlds = self.__tlds__.slice();
            if (!self.__tlds_replaced__) {
                tlds.push(tlds_2ch_src_re);
            }
            tlds.push(re.src_xn);
            re.src_tlds = tlds.join("|");
            function untpl(tpl) {
                return tpl.replace("%TLDS%", re.src_tlds);
            }
            re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), "i");
            re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), "i");
            re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), "i");
            re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), "i");
            var aliases = [];
            self.__compiled__ = {};
            function schemaError(name, val) {
                throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
            }
            Object.keys(self.__schemas__).forEach(function(name) {
                var val = self.__schemas__[name];
                if (val === null) {
                    return;
                }
                var compiled = {
                    validate: null,
                    link: null
                };
                self.__compiled__[name] = compiled;
                if (isObject(val)) {
                    if (isRegExp(val.validate)) {
                        compiled.validate = createValidator(val.validate);
                    } else if (isFunction(val.validate)) {
                        compiled.validate = val.validate;
                    } else {
                        schemaError(name, val);
                    }
                    if (isFunction(val.normalize)) {
                        compiled.normalize = val.normalize;
                    } else if (!val.normalize) {
                        compiled.normalize = createNormalizer();
                    } else {
                        schemaError(name, val);
                    }
                    return;
                }
                if (isString(val)) {
                    aliases.push(name);
                    return;
                }
                schemaError(name, val);
            });
            aliases.forEach(function(alias) {
                if (!self.__compiled__[self.__schemas__[alias]]) {
                    return;
                }
                self.__compiled__[alias].validate = self.__compiled__[self.__schemas__[alias]].validate;
                self.__compiled__[alias].normalize = self.__compiled__[self.__schemas__[alias]].normalize;
            });
            self.__compiled__[""] = {
                validate: null,
                normalize: createNormalizer()
            };
            var slist = Object.keys(self.__compiled__).filter(function(name) {
                return name.length > 0 && self.__compiled__[name];
            }).map(escapeRE).join("|");
            self.re.schema_test = RegExp("(^|(?!_)(?:>|" + re.src_ZPCc + "))(" + slist + ")", "i");
            self.re.schema_search = RegExp("(^|(?!_)(?:>|" + re.src_ZPCc + "))(" + slist + ")", "ig");
            self.re.pretest = RegExp("(" + self.re.schema_test.source + ")|" + "(" + self.re.host_fuzzy_test.source + ")|" + "@", "i");
            resetScanCache(self);
        }
        function Match(self, shift) {
            var start = self.__index__, end = self.__last_index__, text = self.__text_cache__.slice(start, end);
            this.schema = self.__schema__.toLowerCase();
            this.index = start + shift;
            this.lastIndex = end + shift;
            this.raw = text;
            this.text = text;
            this.url = text;
        }
        function createMatch(self, shift) {
            var match = new Match(self, shift);
            self.__compiled__[match.schema].normalize(match, self);
            return match;
        }
        function LinkifyIt(schemas, options) {
            if (!(this instanceof LinkifyIt)) {
                return new LinkifyIt(schemas, options);
            }
            if (!options) {
                if (isOptionsObj(schemas)) {
                    options = schemas;
                    schemas = {};
                }
            }
            this.__opts__ = assign({}, defaultOptions, options);
            this.__index__ = -1;
            this.__last_index__ = -1;
            this.__schema__ = "";
            this.__text_cache__ = "";
            this.__schemas__ = assign({}, defaultSchemas, schemas);
            this.__compiled__ = {};
            this.__tlds__ = tlds_default;
            this.__tlds_replaced__ = false;
            this.re = {};
            compile(this);
        }
        LinkifyIt.prototype.add = function add(schema, definition) {
            this.__schemas__[schema] = definition;
            compile(this);
            return this;
        };
        LinkifyIt.prototype.set = function set(options) {
            this.__opts__ = assign(this.__opts__, options);
            return this;
        };
        LinkifyIt.prototype.test = function test(text) {
            this.__text_cache__ = text;
            this.__index__ = -1;
            if (!text.length) {
                return false;
            }
            var m, ml, me, len, shift, next, re, tld_pos, at_pos;
            if (this.re.schema_test.test(text)) {
                re = this.re.schema_search;
                re.lastIndex = 0;
                while ((m = re.exec(text)) !== null) {
                    len = this.testSchemaAt(text, m[2], re.lastIndex);
                    if (len) {
                        this.__schema__ = m[2];
                        this.__index__ = m.index + m[1].length;
                        this.__last_index__ = m.index + m[0].length + len;
                        break;
                    }
                }
            }
            if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) {
                tld_pos = text.search(this.re.host_fuzzy_test);
                if (tld_pos >= 0) {
                    if (this.__index__ < 0 || tld_pos < this.__index__) {
                        if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {
                            shift = ml.index + ml[1].length;
                            if (this.__index__ < 0 || shift < this.__index__) {
                                this.__schema__ = "";
                                this.__index__ = shift;
                                this.__last_index__ = ml.index + ml[0].length;
                            }
                        }
                    }
                }
            }
            if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) {
                at_pos = text.indexOf("@");
                if (at_pos >= 0) {
                    if ((me = text.match(this.re.email_fuzzy)) !== null) {
                        shift = me.index + me[1].length;
                        next = me.index + me[0].length;
                        if (this.__index__ < 0 || shift < this.__index__ || shift === this.__index__ && next > this.__last_index__) {
                            this.__schema__ = "mailto:";
                            this.__index__ = shift;
                            this.__last_index__ = next;
                        }
                    }
                }
            }
            return this.__index__ >= 0;
        };
        LinkifyIt.prototype.pretest = function pretest(text) {
            return this.re.pretest.test(text);
        };
        LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
            if (!this.__compiled__[schema.toLowerCase()]) {
                return 0;
            }
            return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
        };
        LinkifyIt.prototype.match = function match(text) {
            var shift = 0, result = [];
            if (this.__index__ >= 0 && this.__text_cache__ === text) {
                result.push(createMatch(this, shift));
                shift = this.__last_index__;
            }
            var tail = shift ? text.slice(shift) : text;
            while (this.test(tail)) {
                result.push(createMatch(this, shift));
                tail = tail.slice(this.__last_index__);
                shift += this.__last_index__;
            }
            if (result.length) {
                return result;
            }
            return null;
        };
        LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
            list = Array.isArray(list) ? list : [ list ];
            if (!keepOld) {
                this.__tlds__ = list.slice();
                this.__tlds_replaced__ = true;
                compile(this);
                return this;
            }
            this.__tlds__ = this.__tlds__.concat(list).sort().filter(function(el, idx, arr) {
                return el !== arr[idx - 1];
            }).reverse();
            compile(this);
            return this;
        };
        LinkifyIt.prototype.normalize = function normalize(match) {
            if (!match.schema) {
                match.url = "http://" + match.url;
            }
            if (match.schema === "mailto:" && !/^mailto:/i.test(match.url)) {
                match.url = "mailto:" + match.url;
            }
        };
        module.exports = LinkifyIt;
    }, {
        "./lib/re": 133
    } ],
    133: [ function(require, module, exports) {
        "use strict";
        var src_Any = exports.src_Any = require("uc.micro/properties/Any/regex").source;
        var src_Cc = exports.src_Cc = require("uc.micro/categories/Cc/regex").source;
        var src_Z = exports.src_Z = require("uc.micro/categories/Z/regex").source;
        var src_P = exports.src_P = require("uc.micro/categories/P/regex").source;
        var src_ZPCc = exports.src_ZPCc = [ src_Z, src_P, src_Cc ].join("|");
        var src_ZCc = exports.src_ZCc = [ src_Z, src_Cc ].join("|");
        var src_pseudo_letter = "(?:(?!" + src_ZPCc + ")" + src_Any + ")";
        var src_pseudo_letter_non_d = "(?:(?![0-9]|" + src_ZPCc + ")" + src_Any + ")";
        var src_ip4 = exports.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
        exports.src_auth = "(?:(?:(?!" + src_ZCc + ").)+@)?";
        var src_port = exports.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?";
        var src_host_terminator = exports.src_host_terminator = "(?=$|" + src_ZPCc + ")(?!-|_|:\\d|\\.-|\\.(?!$|" + src_ZPCc + "))";
        var src_path = exports.src_path = "(?:" + "[/?#]" + "(?:" + "(?!" + src_ZCc + "|[()[\\]{}.,\"'?!\\-]).|" + "\\[(?:(?!" + src_ZCc + "|\\]).)*\\]|" + "\\((?:(?!" + src_ZCc + "|[)]).)*\\)|" + "\\{(?:(?!" + src_ZCc + "|[}]).)*\\}|" + '\\"(?:(?!' + src_ZCc + '|["]).)+\\"|' + "\\'(?:(?!" + src_ZCc + "|[']).)+\\'|" + "\\'(?=" + src_pseudo_letter + ").|" + "\\.{2,3}[a-zA-Z0-9%/]|" + "\\.(?!" + src_ZCc + "|[.]).|" + "\\-(?!--(?:[^-]|$))(?:-*)|" + "\\,(?!" + src_ZCc + ").|" + "\\!(?!" + src_ZCc + "|[!]).|" + "\\?(?!" + src_ZCc + "|[?])." + ")+" + "|\\/" + ")?";
        var src_email_name = exports.src_email_name = '[\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]+';
        var src_xn = exports.src_xn = "xn--[a-z0-9\\-]{1,59}";
        var src_domain_root = exports.src_domain_root = "(?:" + src_xn + "|" + src_pseudo_letter_non_d + "{1,63}" + ")";
        var src_domain = exports.src_domain = "(?:" + src_xn + "|" + "(?:" + src_pseudo_letter + ")" + "|" + "(?:" + src_pseudo_letter + "(?:-(?!-)|" + src_pseudo_letter + "){0,61}" + src_pseudo_letter + ")" + ")";
        var src_host = exports.src_host = "(?:" + src_ip4 + "|" + "(?:(?:(?:" + src_domain + ")\\.)*" + src_domain_root + ")" + ")";
        var tpl_host_fuzzy = exports.tpl_host_fuzzy = "(?:" + src_ip4 + "|" + "(?:(?:(?:" + src_domain + ")\\.)+(?:%TLDS%))" + ")";
        var tpl_host_no_ip_fuzzy = exports.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + src_domain + ")\\.)+(?:%TLDS%))";
        exports.src_host_strict = src_host + src_host_terminator;
        var tpl_host_fuzzy_strict = exports.tpl_host_fuzzy_strict = tpl_host_fuzzy + src_host_terminator;
        exports.src_host_port_strict = src_host + src_port + src_host_terminator;
        var tpl_host_port_fuzzy_strict = exports.tpl_host_port_fuzzy_strict = tpl_host_fuzzy + src_port + src_host_terminator;
        var tpl_host_port_no_ip_fuzzy_strict = exports.tpl_host_port_no_ip_fuzzy_strict = tpl_host_no_ip_fuzzy + src_port + src_host_terminator;
        exports.tpl_host_fuzzy_test = "localhost|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + src_ZPCc + "|$))";
        exports.tpl_email_fuzzy = "(^|>|" + src_ZCc + ")(" + src_email_name + "@" + tpl_host_fuzzy_strict + ")";
        exports.tpl_link_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|]|" + src_ZPCc + "))" + "((?![$+<=>^`|])" + tpl_host_port_fuzzy_strict + src_path + ")";
        exports.tpl_link_no_ip_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|]|" + src_ZPCc + "))" + "((?![$+<=>^`|])" + tpl_host_port_no_ip_fuzzy_strict + src_path + ")";
    }, {
        "uc.micro/categories/Cc/regex": 139,
        "uc.micro/categories/P/regex": 141,
        "uc.micro/categories/Z/regex": 142,
        "uc.micro/properties/Any/regex": 144
    } ],
    134: [ function(require, module, exports) {
        "use strict";
        var decodeCache = {};
        function getDecodeCache(exclude) {
            var i, ch, cache = decodeCache[exclude];
            if (cache) {
                return cache;
            }
            cache = decodeCache[exclude] = [];
            for (i = 0; i < 128; i++) {
                ch = String.fromCharCode(i);
                cache.push(ch);
            }
            for (i = 0; i < exclude.length; i++) {
                ch = exclude.charCodeAt(i);
                cache[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2);
            }
            return cache;
        }
        function decode(string, exclude) {
            var cache;
            if (typeof exclude !== "string") {
                exclude = decode.defaultChars;
            }
            cache = getDecodeCache(exclude);
            return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
                var i, l, b1, b2, b3, b4, chr, result = "";
                for (i = 0, l = seq.length; i < l; i += 3) {
                    b1 = parseInt(seq.slice(i + 1, i + 3), 16);
                    if (b1 < 128) {
                        result += cache[b1];
                        continue;
                    }
                    if ((b1 & 224) === 192 && i + 3 < l) {
                        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                        if ((b2 & 192) === 128) {
                            chr = b1 << 6 & 1984 | b2 & 63;
                            if (chr < 128) {
                                result += "��";
                            } else {
                                result += String.fromCharCode(chr);
                            }
                            i += 3;
                            continue;
                        }
                    }
                    if ((b1 & 240) === 224 && i + 6 < l) {
                        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
                        if ((b2 & 192) === 128 && (b3 & 192) === 128) {
                            chr = b1 << 12 & 61440 | b2 << 6 & 4032 | b3 & 63;
                            if (chr < 2048 || chr >= 55296 && chr <= 57343) {
                                result += "���";
                            } else {
                                result += String.fromCharCode(chr);
                            }
                            i += 6;
                            continue;
                        }
                    }
                    if ((b1 & 248) === 240 && i + 9 < l) {
                        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
                        b4 = parseInt(seq.slice(i + 10, i + 12), 16);
                        if ((b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128) {
                            chr = b1 << 18 & 1835008 | b2 << 12 & 258048 | b3 << 6 & 4032 | b4 & 63;
                            if (chr < 65536 || chr > 1114111) {
                                result += "����";
                            } else {
                                chr -= 65536;
                                result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023));
                            }
                            i += 9;
                            continue;
                        }
                    }
                    result += "�";
                }
                return result;
            });
        }
        decode.defaultChars = ";/?:@&=+$,#";
        decode.componentChars = "";
        module.exports = decode;
    }, {} ],
    135: [ function(require, module, exports) {
        "use strict";
        var encodeCache = {};
        function getEncodeCache(exclude) {
            var i, ch, cache = encodeCache[exclude];
            if (cache) {
                return cache;
            }
            cache = encodeCache[exclude] = [];
            for (i = 0; i < 128; i++) {
                ch = String.fromCharCode(i);
                if (/^[0-9a-z]$/i.test(ch)) {
                    cache.push(ch);
                } else {
                    cache.push("%" + ("0" + i.toString(16).toUpperCase()).slice(-2));
                }
            }
            for (i = 0; i < exclude.length; i++) {
                cache[exclude.charCodeAt(i)] = exclude[i];
            }
            return cache;
        }
        function encode(string, exclude, keepEscaped) {
            var i, l, code, nextCode, cache, result = "";
            if (typeof exclude !== "string") {
                keepEscaped = exclude;
                exclude = encode.defaultChars;
            }
            if (typeof keepEscaped === "undefined") {
                keepEscaped = true;
            }
            cache = getEncodeCache(exclude);
            for (i = 0, l = string.length; i < l; i++) {
                code = string.charCodeAt(i);
                if (keepEscaped && code === 37 && i + 2 < l) {
                    if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
                        result += string.slice(i, i + 3);
                        i += 2;
                        continue;
                    }
                }
                if (code < 128) {
                    result += cache[code];
                    continue;
                }
                if (code >= 55296 && code <= 57343) {
                    if (code >= 55296 && code <= 56319 && i + 1 < l) {
                        nextCode = string.charCodeAt(i + 1);
                        if (nextCode >= 56320 && nextCode <= 57343) {
                            result += encodeURIComponent(string[i] + string[i + 1]);
                            i++;
                            continue;
                        }
                    }
                    result += "%EF%BF%BD";
                    continue;
                }
                result += encodeURIComponent(string[i]);
            }
            return result;
        }
        encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
        encode.componentChars = "-_.!~*'()";
        module.exports = encode;
    }, {} ],
    136: [ function(require, module, exports) {
        "use strict";
        module.exports = function format(url) {
            var result = "";
            result += url.protocol || "";
            result += url.slashes ? "//" : "";
            result += url.auth ? url.auth + "@" : "";
            if (url.hostname && url.hostname.indexOf(":") !== -1) {
                result += "[" + url.hostname + "]";
            } else {
                result += url.hostname || "";
            }
            result += url.port ? ":" + url.port : "";
            result += url.pathname || "";
            result += url.search || "";
            result += url.hash || "";
            return result;
        };
    }, {} ],
    137: [ function(require, module, exports) {
        "use strict";
        module.exports.encode = require("./encode");
        module.exports.decode = require("./decode");
        module.exports.format = require("./format");
        module.exports.parse = require("./parse");
    }, {
        "./decode": 134,
        "./encode": 135,
        "./format": 136,
        "./parse": 138
    } ],
    138: [ function(require, module, exports) {
        "use strict";
        function Url() {
            this.protocol = null;
            this.slashes = null;
            this.auth = null;
            this.port = null;
            this.hostname = null;
            this.hash = null;
            this.search = null;
            this.pathname = null;
        }
        var protocolPattern = /^([a-z0-9.+-]+:)/i, portPattern = /:[0-9]*$/, simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, delims = [ "<", ">", '"', "`", " ", "\r", "\n", "	" ], unwise = [ "{", "}", "|", "\\", "^", "`" ].concat(delims), autoEscape = [ "'" ].concat(unwise), nonHostChars = [ "%", "/", "?", ";", "#" ].concat(autoEscape), hostEndingChars = [ "/", "?", "#" ], hostnameMaxLen = 255, hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/, hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, hostlessProtocol = {
            javascript: true,
            "javascript:": true
        }, slashedProtocol = {
            http: true,
            https: true,
            ftp: true,
            gopher: true,
            file: true,
            "http:": true,
            "https:": true,
            "ftp:": true,
            "gopher:": true,
            "file:": true
        };
        function urlParse(url, slashesDenoteHost) {
            if (url && url instanceof Url) {
                return url;
            }
            var u = new Url();
            u.parse(url, slashesDenoteHost);
            return u;
        }
        Url.prototype.parse = function(url, slashesDenoteHost) {
            var i, l, lowerProto, hec, slashes, rest = url;
            rest = rest.trim();
            if (!slashesDenoteHost && url.split("#").length === 1) {
                var simplePath = simplePathPattern.exec(rest);
                if (simplePath) {
                    this.pathname = simplePath[1];
                    if (simplePath[2]) {
                        this.search = simplePath[2];
                    }
                    return this;
                }
            }
            var proto = protocolPattern.exec(rest);
            if (proto) {
                proto = proto[0];
                lowerProto = proto.toLowerCase();
                this.protocol = proto;
                rest = rest.substr(proto.length);
            }
            if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
                slashes = rest.substr(0, 2) === "//";
                if (slashes && !(proto && hostlessProtocol[proto])) {
                    rest = rest.substr(2);
                    this.slashes = true;
                }
            }
            if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
                var hostEnd = -1;
                for (i = 0; i < hostEndingChars.length; i++) {
                    hec = rest.indexOf(hostEndingChars[i]);
                    if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
                        hostEnd = hec;
                    }
                }
                var auth, atSign;
                if (hostEnd === -1) {
                    atSign = rest.lastIndexOf("@");
                } else {
                    atSign = rest.lastIndexOf("@", hostEnd);
                }
                if (atSign !== -1) {
                    auth = rest.slice(0, atSign);
                    rest = rest.slice(atSign + 1);
                    this.auth = auth;
                }
                hostEnd = -1;
                for (i = 0; i < nonHostChars.length; i++) {
                    hec = rest.indexOf(nonHostChars[i]);
                    if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
                        hostEnd = hec;
                    }
                }
                if (hostEnd === -1) {
                    hostEnd = rest.length;
                }
                if (rest[hostEnd - 1] === ":") {
                    hostEnd--;
                }
                var host = rest.slice(0, hostEnd);
                rest = rest.slice(hostEnd);
                this.parseHost(host);
                this.hostname = this.hostname || "";
                var ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
                if (!ipv6Hostname) {
                    var hostparts = this.hostname.split(/\./);
                    for (i = 0, l = hostparts.length; i < l; i++) {
                        var part = hostparts[i];
                        if (!part) {
                            continue;
                        }
                        if (!part.match(hostnamePartPattern)) {
                            var newpart = "";
                            for (var j = 0, k = part.length; j < k; j++) {
                                if (part.charCodeAt(j) > 127) {
                                    newpart += "x";
                                } else {
                                    newpart += part[j];
                                }
                            }
                            if (!newpart.match(hostnamePartPattern)) {
                                var validParts = hostparts.slice(0, i);
                                var notHost = hostparts.slice(i + 1);
                                var bit = part.match(hostnamePartStart);
                                if (bit) {
                                    validParts.push(bit[1]);
                                    notHost.unshift(bit[2]);
                                }
                                if (notHost.length) {
                                    rest = notHost.join(".") + rest;
                                }
                                this.hostname = validParts.join(".");
                                break;
                            }
                        }
                    }
                }
                if (this.hostname.length > hostnameMaxLen) {
                    this.hostname = "";
                }
                if (ipv6Hostname) {
                    this.hostname = this.hostname.substr(1, this.hostname.length - 2);
                }
            }
            var hash = rest.indexOf("#");
            if (hash !== -1) {
                this.hash = rest.substr(hash);
                rest = rest.slice(0, hash);
            }
            var qm = rest.indexOf("?");
            if (qm !== -1) {
                this.search = rest.substr(qm);
                rest = rest.slice(0, qm);
            }
            if (rest) {
                this.pathname = rest;
            }
            if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
                this.pathname = "";
            }
            return this;
        };
        Url.prototype.parseHost = function(host) {
            var port = portPattern.exec(host);
            if (port) {
                port = port[0];
                if (port !== ":") {
                    this.port = port.substr(1);
                }
                host = host.substr(0, host.length - port.length);
            }
            if (host) {
                this.hostname = host;
            }
        };
        module.exports = urlParse;
    }, {} ],
    139: [ function(require, module, exports) {
        module.exports = /[\0-\x1F\x7F-\x9F]/;
    }, {} ],
    140: [ function(require, module, exports) {
        module.exports = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804\uDCBD|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;
    }, {} ],
    141: [ function(require, module, exports) {
        module.exports = /[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDE38-\uDE3D]|\uD805[\uDCC6\uDDC1-\uDDC9\uDE41-\uDE43]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F/;
    }, {} ],
    142: [ function(require, module, exports) {
        module.exports = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
    }, {} ],
    143: [ function(require, module, exports) {
        module.exports.Any = require("./properties/Any/regex");
        module.exports.Cc = require("./categories/Cc/regex");
        module.exports.Cf = require("./categories/Cf/regex");
        module.exports.P = require("./categories/P/regex");
        module.exports.Z = require("./categories/Z/regex");
    }, {
        "./categories/Cc/regex": 139,
        "./categories/Cf/regex": 140,
        "./categories/P/regex": 141,
        "./categories/Z/regex": 142,
        "./properties/Any/regex": 144
    } ],
    144: [ function(require, module, exports) {
        module.exports = /[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF]/;
    }, {} ],
    145: [ function(require, module, exports) {
        !function(name, context, definition) {
            if (typeof module != "undefined" && module.exports) module.exports = definition(); else if (typeof define == "function" && define.amd) define(definition); else context[name] = definition();
        }("reqwest", this, function() {
            var context = this;
            if ("window" in context) {
                var doc = document, byTag = "getElementsByTagName", head = doc[byTag]("head")[0];
            } else {
                var XHR2;
                try {
                    var xhr2 = "xhr2";
                    XHR2 = require(xhr2);
                } catch (ex) {
                    throw new Error("Peer dependency `xhr2` required! Please npm install xhr2");
                }
            }
            var httpsRe = /^http/, protocolRe = /(^\w+):\/\//, twoHundo = /^(20\d|1223)$/, readyState = "readyState", contentType = "Content-Type", requestedWith = "X-Requested-With", uniqid = 0, callbackPrefix = "reqwest_" + +new Date(), lastValue, xmlHttpRequest = "XMLHttpRequest", xDomainRequest = "XDomainRequest", noop = function() {}, isArray = typeof Array.isArray == "function" ? Array.isArray : function(a) {
                return a instanceof Array;
            }, defaultHeaders = {
                contentType: "application/x-www-form-urlencoded",
                requestedWith: xmlHttpRequest,
                accept: {
                    "*": "text/javascript, text/html, application/xml, text/xml, */*",
                    xml: "application/xml, text/xml",
                    html: "text/html",
                    text: "text/plain",
                    json: "application/json, text/javascript",
                    js: "application/javascript, text/javascript"
                }
            }, xhr = function(o) {
                if (o["crossOrigin"] === true) {
                    var xhr = context[xmlHttpRequest] ? new XMLHttpRequest() : null;
                    if (xhr && "withCredentials" in xhr) {
                        return xhr;
                    } else if (context[xDomainRequest]) {
                        return new XDomainRequest();
                    } else {
                        throw new Error("Browser does not support cross-origin requests");
                    }
                } else if (context[xmlHttpRequest]) {
                    return new XMLHttpRequest();
                } else if (XHR2) {
                    return new XHR2();
                } else {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }
            }, globalSetupOptions = {
                dataFilter: function(data) {
                    return data;
                }
            };
            function succeed(r) {
                var protocol = protocolRe.exec(r.url);
                protocol = protocol && protocol[1] || context.location.protocol;
                return httpsRe.test(protocol) ? twoHundo.test(r.request.status) : !!r.request.response;
            }
            function handleReadyState(r, success, error) {
                return function() {
                    if (r._aborted) return error(r.request);
                    if (r._timedOut) return error(r.request, "Request is aborted: timeout");
                    if (r.request && r.request[readyState] == 4) {
                        r.request.onreadystatechange = noop;
                        if (succeed(r)) success(r.request); else error(r.request);
                    }
                };
            }
            function setHeaders(http, o) {
                var headers = o["headers"] || {}, h;
                headers["Accept"] = headers["Accept"] || defaultHeaders["accept"][o["type"]] || defaultHeaders["accept"]["*"];
                var isAFormData = typeof FormData === "function" && o["data"] instanceof FormData;
                if (!o["crossOrigin"] && !headers[requestedWith]) headers[requestedWith] = defaultHeaders["requestedWith"];
                if (!headers[contentType] && !isAFormData) headers[contentType] = o["contentType"] || defaultHeaders["contentType"];
                for (h in headers) headers.hasOwnProperty(h) && "setRequestHeader" in http && http.setRequestHeader(h, headers[h]);
            }
            function setCredentials(http, o) {
                if (typeof o["withCredentials"] !== "undefined" && typeof http.withCredentials !== "undefined") {
                    http.withCredentials = !!o["withCredentials"];
                }
            }
            function generalCallback(data) {
                lastValue = data;
            }
            function urlappend(url, s) {
                return url + (/\?/.test(url) ? "&" : "?") + s;
            }
            function handleJsonp(o, fn, err, url) {
                var reqId = uniqid++, cbkey = o["jsonpCallback"] || "callback", cbval = o["jsonpCallbackName"] || reqwest.getcallbackPrefix(reqId), cbreg = new RegExp("((^|\\?|&)" + cbkey + ")=([^&]+)"), match = url.match(cbreg), script = doc.createElement("script"), loaded = 0, isIE10 = navigator.userAgent.indexOf("MSIE 10.0") !== -1;
                if (match) {
                    if (match[3] === "?") {
                        url = url.replace(cbreg, "$1=" + cbval);
                    } else {
                        cbval = match[3];
                    }
                } else {
                    url = urlappend(url, cbkey + "=" + cbval);
                }
                context[cbval] = generalCallback;
                script.type = "text/javascript";
                script.src = url;
                script.async = true;
                if (typeof script.onreadystatechange !== "undefined" && !isIE10) {
                    script.htmlFor = script.id = "_reqwest_" + reqId;
                }
                script.onload = script.onreadystatechange = function() {
                    if (script[readyState] && script[readyState] !== "complete" && script[readyState] !== "loaded" || loaded) {
                        return false;
                    }
                    script.onload = script.onreadystatechange = null;
                    script.onclick && script.onclick();
                    fn(lastValue);
                    lastValue = undefined;
                    head.removeChild(script);
                    loaded = 1;
                };
                head.appendChild(script);
                return {
                    abort: function() {
                        script.onload = script.onreadystatechange = null;
                        err({}, "Request is aborted: timeout", {});
                        lastValue = undefined;
                        head.removeChild(script);
                        loaded = 1;
                    }
                };
            }
            function getRequest(fn, err) {
                var o = this.o, method = (o["method"] || "GET").toUpperCase(), url = typeof o === "string" ? o : o["url"], data = o["processData"] !== false && o["data"] && typeof o["data"] !== "string" ? reqwest.toQueryString(o["data"]) : o["data"] || null, http, sendWait = false;
                if ((o["type"] == "jsonp" || method == "GET") && data) {
                    url = urlappend(url, data);
                    data = null;
                }
                if (o["type"] == "jsonp") return handleJsonp(o, fn, err, url);
                http = o.xhr && o.xhr(o) || xhr(o);
                http.open(method, url, o["async"] === false ? false : true);
                setHeaders(http, o);
                setCredentials(http, o);
                if (context[xDomainRequest] && http instanceof context[xDomainRequest]) {
                    http.onload = fn;
                    http.onerror = err;
                    http.onprogress = function() {};
                    sendWait = true;
                } else {
                    http.onreadystatechange = handleReadyState(this, fn, err);
                }
                o["before"] && o["before"](http);
                if (sendWait) {
                    setTimeout(function() {
                        http.send(data);
                    }, 200);
                } else {
                    http.send(data);
                }
                return http;
            }
            function Reqwest(o, fn) {
                this.o = o;
                this.fn = fn;
                init.apply(this, arguments);
            }
            function setType(header) {
                if (header === null) return undefined;
                if (header.match("json")) return "json";
                if (header.match("javascript")) return "js";
                if (header.match("text")) return "html";
                if (header.match("xml")) return "xml";
            }
            function init(o, fn) {
                this.url = typeof o == "string" ? o : o["url"];
                this.timeout = null;
                this._fulfilled = false;
                this._successHandler = function() {};
                this._fulfillmentHandlers = [];
                this._errorHandlers = [];
                this._completeHandlers = [];
                this._erred = false;
                this._responseArgs = {};
                var self = this;
                fn = fn || function() {};
                if (o["timeout"]) {
                    this.timeout = setTimeout(function() {
                        timedOut();
                    }, o["timeout"]);
                }
                if (o["success"]) {
                    this._successHandler = function() {
                        o["success"].apply(o, arguments);
                    };
                }
                if (o["error"]) {
                    this._errorHandlers.push(function() {
                        o["error"].apply(o, arguments);
                    });
                }
                if (o["complete"]) {
                    this._completeHandlers.push(function() {
                        o["complete"].apply(o, arguments);
                    });
                }
                function complete(resp) {
                    o["timeout"] && clearTimeout(self.timeout);
                    self.timeout = null;
                    while (self._completeHandlers.length > 0) {
                        self._completeHandlers.shift()(resp);
                    }
                }
                function success(resp) {
                    var type = o["type"] || resp && setType(resp.getResponseHeader("Content-Type"));
                    resp = type !== "jsonp" ? self.request : resp;
                    var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type), r = filteredResponse;
                    try {
                        resp.responseText = r;
                    } catch (e) {}
                    if (r) {
                        switch (type) {
                          case "json":
                            try {
                                resp = context.JSON ? context.JSON.parse(r) : eval("(" + r + ")");
                            } catch (err) {
                                return error(resp, "Could not parse JSON in response", err);
                            }
                            break;

                          case "js":
                            resp = eval(r);
                            break;

                          case "html":
                            resp = r;
                            break;

                          case "xml":
                            resp = resp.responseXML && resp.responseXML.parseError && resp.responseXML.parseError.errorCode && resp.responseXML.parseError.reason ? null : resp.responseXML;
                            break;
                        }
                    }
                    self._responseArgs.resp = resp;
                    self._fulfilled = true;
                    fn(resp);
                    self._successHandler(resp);
                    while (self._fulfillmentHandlers.length > 0) {
                        resp = self._fulfillmentHandlers.shift()(resp);
                    }
                    complete(resp);
                }
                function timedOut() {
                    self._timedOut = true;
                    self.request.abort();
                }
                function error(resp, msg, t) {
                    resp = self.request;
                    self._responseArgs.resp = resp;
                    self._responseArgs.msg = msg;
                    self._responseArgs.t = t;
                    self._erred = true;
                    while (self._errorHandlers.length > 0) {
                        self._errorHandlers.shift()(resp, msg, t);
                    }
                    complete(resp);
                }
                this.request = getRequest.call(this, success, error);
            }
            Reqwest.prototype = {
                abort: function() {
                    this._aborted = true;
                    this.request.abort();
                },
                retry: function() {
                    init.call(this, this.o, this.fn);
                },
                then: function(success, fail) {
                    success = success || function() {};
                    fail = fail || function() {};
                    if (this._fulfilled) {
                        this._responseArgs.resp = success(this._responseArgs.resp);
                    } else if (this._erred) {
                        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
                    } else {
                        this._fulfillmentHandlers.push(success);
                        this._errorHandlers.push(fail);
                    }
                    return this;
                },
                always: function(fn) {
                    if (this._fulfilled || this._erred) {
                        fn(this._responseArgs.resp);
                    } else {
                        this._completeHandlers.push(fn);
                    }
                    return this;
                },
                fail: function(fn) {
                    if (this._erred) {
                        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
                    } else {
                        this._errorHandlers.push(fn);
                    }
                    return this;
                },
                "catch": function(fn) {
                    return this.fail(fn);
                }
            };
            function reqwest(o, fn) {
                return new Reqwest(o, fn);
            }
            function normalize(s) {
                return s ? s.replace(/\r?\n/g, "\r\n") : "";
            }
            function serial(el, cb) {
                var n = el.name, t = el.tagName.toLowerCase(), optCb = function(o) {
                    if (o && !o["disabled"]) cb(n, normalize(o["attributes"]["value"] && o["attributes"]["value"]["specified"] ? o["value"] : o["text"]));
                }, ch, ra, val, i;
                if (el.disabled || !n) return;
                switch (t) {
                  case "input":
                    if (!/reset|button|image|file/i.test(el.type)) {
                        ch = /checkbox/i.test(el.type);
                        ra = /radio/i.test(el.type);
                        val = el.value;
                        (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === "" ? "on" : val));
                    }
                    break;

                  case "textarea":
                    cb(n, normalize(el.value));
                    break;

                  case "select":
                    if (el.type.toLowerCase() === "select-one") {
                        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);
                    } else {
                        for (i = 0; el.length && i < el.length; i++) {
                            el.options[i].selected && optCb(el.options[i]);
                        }
                    }
                    break;
                }
            }
            function eachFormElement() {
                var cb = this, e, i, serializeSubtags = function(e, tags) {
                    var i, j, fa;
                    for (i = 0; i < tags.length; i++) {
                        fa = e[byTag](tags[i]);
                        for (j = 0; j < fa.length; j++) serial(fa[j], cb);
                    }
                };
                for (i = 0; i < arguments.length; i++) {
                    e = arguments[i];
                    if (/input|select|textarea/i.test(e.tagName)) serial(e, cb);
                    serializeSubtags(e, [ "input", "select", "textarea" ]);
                }
            }
            function serializeQueryString() {
                return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments));
            }
            function serializeHash() {
                var hash = {};
                eachFormElement.apply(function(name, value) {
                    if (name in hash) {
                        hash[name] && !isArray(hash[name]) && (hash[name] = [ hash[name] ]);
                        hash[name].push(value);
                    } else hash[name] = value;
                }, arguments);
                return hash;
            }
            reqwest.serializeArray = function() {
                var arr = [];
                eachFormElement.apply(function(name, value) {
                    arr.push({
                        name: name,
                        value: value
                    });
                }, arguments);
                return arr;
            };
            reqwest.serialize = function() {
                if (arguments.length === 0) return "";
                var opt, fn, args = Array.prototype.slice.call(arguments, 0);
                opt = args.pop();
                opt && opt.nodeType && args.push(opt) && (opt = null);
                opt && (opt = opt.type);
                if (opt == "map") fn = serializeHash; else if (opt == "array") fn = reqwest.serializeArray; else fn = serializeQueryString;
                return fn.apply(null, args);
            };
            reqwest.toQueryString = function(o, trad) {
                var prefix, i, traditional = trad || false, s = [], enc = encodeURIComponent, add = function(key, value) {
                    value = "function" === typeof value ? value() : value == null ? "" : value;
                    s[s.length] = enc(key) + "=" + enc(value);
                };
                if (isArray(o)) {
                    for (i = 0; o && i < o.length; i++) add(o[i]["name"], o[i]["value"]);
                } else {
                    for (prefix in o) {
                        if (o.hasOwnProperty(prefix)) buildParams(prefix, o[prefix], traditional, add);
                    }
                }
                return s.join("&").replace(/%20/g, "+");
            };
            function buildParams(prefix, obj, traditional, add) {
                var name, i, v, rbracket = /\[\]$/;
                if (isArray(obj)) {
                    for (i = 0; obj && i < obj.length; i++) {
                        v = obj[i];
                        if (traditional || rbracket.test(prefix)) {
                            add(prefix, v);
                        } else {
                            buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
                        }
                    }
                } else if (obj && obj.toString() === "[object Object]") {
                    for (name in obj) {
                        buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
                    }
                } else {
                    add(prefix, obj);
                }
            }
            reqwest.getcallbackPrefix = function() {
                return callbackPrefix;
            };
            reqwest.compat = function(o, fn) {
                if (o) {
                    o["type"] && (o["method"] = o["type"]) && delete o["type"];
                    o["dataType"] && (o["type"] = o["dataType"]);
                    o["jsonpCallback"] && (o["jsonpCallbackName"] = o["jsonpCallback"]) && delete o["jsonpCallback"];
                    o["jsonp"] && (o["jsonpCallback"] = o["jsonp"]);
                }
                return new Reqwest(o, fn);
            };
            reqwest.ajaxSetup = function(options) {
                options = options || {};
                for (var k in options) {
                    globalSetupOptions[k] = options[k];
                }
            };
            return reqwest;
        });
    }, {} ],
    146: [ function(require, module, exports) {
        !function(e, t, n) {
            "use strict";
            !function o(e, t, n) {
                function a(s, l) {
                    if (!t[s]) {
                        if (!e[s]) {
                            var i = "function" == typeof require && require;
                            if (!l && i) return i(s, !0);
                            if (r) return r(s, !0);
                            var u = new Error("Cannot find module '" + s + "'");
                            throw u.code = "MODULE_NOT_FOUND", u;
                        }
                        var c = t[s] = {
                            exports: {}
                        };
                        e[s][0].call(c.exports, function(t) {
                            var n = e[s][1][t];
                            return a(n ? n : t);
                        }, c, c.exports, o, e, t, n);
                    }
                    return t[s].exports;
                }
                for (var r = "function" == typeof require && require, s = 0; s < n.length; s++) a(n[s]);
                return a;
            }({
                1: [ function(o) {
                    var a, r, s, l, i = function(e) {
                        return e && e.__esModule ? e : {
                            "default": e
                        };
                    }, u = o("./modules/handle-dom"), c = o("./modules/utils"), d = o("./modules/handle-swal-dom"), f = o("./modules/handle-click"), p = o("./modules/handle-key"), m = i(p), v = o("./modules/default-params"), y = i(v), h = o("./modules/set-params"), g = i(h);
                    s = l = function() {
                        function o(e) {
                            var t = s;
                            return t[e] === n ? y["default"][e] : t[e];
                        }
                        var s = arguments[0];
                        if (u.addClass(t.body, "stop-scrolling"), d.resetInput(), s === n) return c.logStr("SweetAlert expects at least 1 attribute!"), 
                        !1;
                        var i = c.extend({}, y["default"]);
                        switch (typeof s) {
                          case "string":
                            i.title = s, i.text = arguments[1] || "", i.type = arguments[2] || "";
                            break;

                          case "object":
                            if (s.title === n) return c.logStr('Missing "title" argument!'), !1;
                            i.title = s.title;
                            for (var p in y["default"]) i[p] = o(p);
                            i.confirmButtonText = i.showCancelButton ? "Confirm" : y["default"].confirmButtonText, 
                            i.confirmButtonText = o("confirmButtonText"), i.doneFunction = arguments[1] || null;
                            break;

                          default:
                            return c.logStr('Unexpected type of argument! Expected "string" or "object", got ' + typeof s), 
                            !1;
                        }
                        g["default"](i), d.fixVerticalPosition(), d.openModal(arguments[1]);
                        for (var v = d.getModal(), h = v.querySelectorAll("button"), b = [ "onclick", "onmouseover", "onmouseout", "onmousedown", "onmouseup", "onfocus" ], w = function(e) {
                            return f.handleButton(e, i, v);
                        }, C = 0; C < h.length; C++) for (var S = 0; S < b.length; S++) {
                            var x = b[S];
                            h[C][x] = w;
                        }
                        d.getOverlay().onclick = w, a = e.onkeydown;
                        var k = function(e) {
                            return m["default"](e, i, v);
                        };
                        e.onkeydown = k, e.onfocus = function() {
                            setTimeout(function() {
                                r !== n && (r.focus(), r = n);
                            }, 0);
                        }, l.enableButtons();
                    }, s.setDefaults = l.setDefaults = function(e) {
                        if (!e) throw new Error("userParams is required");
                        if ("object" != typeof e) throw new Error("userParams has to be a object");
                        c.extend(y["default"], e);
                    }, s.close = l.close = function() {
                        var o = d.getModal();
                        u.fadeOut(d.getOverlay(), 5), u.fadeOut(o, 5), u.removeClass(o, "showSweetAlert"), 
                        u.addClass(o, "hideSweetAlert"), u.removeClass(o, "visible");
                        var s = o.querySelector(".sa-icon.sa-success");
                        u.removeClass(s, "animate"), u.removeClass(s.querySelector(".sa-tip"), "animateSuccessTip"), 
                        u.removeClass(s.querySelector(".sa-long"), "animateSuccessLong");
                        var l = o.querySelector(".sa-icon.sa-error");
                        u.removeClass(l, "animateErrorIcon"), u.removeClass(l.querySelector(".sa-x-mark"), "animateXMark");
                        var i = o.querySelector(".sa-icon.sa-warning");
                        return u.removeClass(i, "pulseWarning"), u.removeClass(i.querySelector(".sa-body"), "pulseWarningIns"), 
                        u.removeClass(i.querySelector(".sa-dot"), "pulseWarningIns"), setTimeout(function() {
                            var e = o.getAttribute("data-custom-class");
                            u.removeClass(o, e);
                        }, 300), u.removeClass(t.body, "stop-scrolling"), e.onkeydown = a, e.previousActiveElement && e.previousActiveElement.focus(), 
                        r = n, clearTimeout(o.timeout), !0;
                    }, s.showInputError = l.showInputError = function(e) {
                        var t = d.getModal(), n = t.querySelector(".sa-input-error");
                        u.addClass(n, "show");
                        var o = t.querySelector(".sa-error-container");
                        u.addClass(o, "show"), o.querySelector("p").innerHTML = e, setTimeout(function() {
                            s.enableButtons();
                        }, 1), t.querySelector("input").focus();
                    }, s.resetInputError = l.resetInputError = function(e) {
                        if (e && 13 === e.keyCode) return !1;
                        var t = d.getModal(), n = t.querySelector(".sa-input-error");
                        u.removeClass(n, "show");
                        var o = t.querySelector(".sa-error-container");
                        u.removeClass(o, "show");
                    }, s.disableButtons = l.disableButtons = function() {
                        var e = d.getModal(), t = e.querySelector("button.confirm"), n = e.querySelector("button.cancel");
                        t.disabled = !0, n.disabled = !0;
                    }, s.enableButtons = l.enableButtons = function() {
                        var e = d.getModal(), t = e.querySelector("button.confirm"), n = e.querySelector("button.cancel");
                        t.disabled = !1, n.disabled = !1;
                    }, "undefined" != typeof e ? e.sweetAlert = e.swal = s : c.logStr("SweetAlert is a frontend module!");
                }, {
                    "./modules/default-params": 2,
                    "./modules/handle-click": 3,
                    "./modules/handle-dom": 4,
                    "./modules/handle-key": 5,
                    "./modules/handle-swal-dom": 6,
                    "./modules/set-params": 8,
                    "./modules/utils": 9
                } ],
                2: [ function(e, t, n) {
                    Object.defineProperty(n, "__esModule", {
                        value: !0
                    });
                    var o = {
                        title: "",
                        text: "",
                        type: null,
                        allowOutsideClick: !1,
                        showConfirmButton: !0,
                        showCancelButton: !1,
                        closeOnConfirm: !0,
                        closeOnCancel: !0,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#8CD4F5",
                        cancelButtonText: "Cancel",
                        imageUrl: null,
                        imageSize: null,
                        timer: null,
                        customClass: "",
                        html: !1,
                        animation: !0,
                        allowEscapeKey: !0,
                        inputType: "text",
                        inputPlaceholder: "",
                        inputValue: "",
                        showLoaderOnConfirm: !1
                    };
                    n["default"] = o, t.exports = n["default"];
                }, {} ],
                3: [ function(t, n, o) {
                    Object.defineProperty(o, "__esModule", {
                        value: !0
                    });
                    var a = t("./utils"), r = (t("./handle-swal-dom"), t("./handle-dom")), s = function(t, n, o) {
                        function s(e) {
                            m && n.confirmButtonColor && (p.style.backgroundColor = e);
                        }
                        var u, c, d, f = t || e.event, p = f.target || f.srcElement, m = -1 !== p.className.indexOf("confirm"), v = -1 !== p.className.indexOf("sweet-overlay"), y = r.hasClass(o, "visible"), h = n.doneFunction && "true" === o.getAttribute("data-has-done-function");
                        switch (m && n.confirmButtonColor && (u = n.confirmButtonColor, c = a.colorLuminance(u, -.04), 
                        d = a.colorLuminance(u, -.14)), f.type) {
                          case "mouseover":
                            s(c);
                            break;

                          case "mouseout":
                            s(u);
                            break;

                          case "mousedown":
                            s(d);
                            break;

                          case "mouseup":
                            s(c);
                            break;

                          case "focus":
                            var g = o.querySelector("button.confirm"), b = o.querySelector("button.cancel");
                            m ? b.style.boxShadow = "none" : g.style.boxShadow = "none";
                            break;

                          case "click":
                            var w = o === p, C = r.isDescendant(o, p);
                            if (!w && !C && y && !n.allowOutsideClick) break;
                            m && h && y ? l(o, n) : h && y || v ? i(o, n) : r.isDescendant(o, p) && "BUTTON" === p.tagName && sweetAlert.close();
                        }
                    }, l = function(e, t) {
                        var n = !0;
                        r.hasClass(e, "show-input") && (n = e.querySelector("input").value, n || (n = "")), 
                        t.doneFunction(n), t.closeOnConfirm && sweetAlert.close(), t.showLoaderOnConfirm && sweetAlert.disableButtons();
                    }, i = function(e, t) {
                        var n = String(t.doneFunction).replace(/\s/g, ""), o = "function(" === n.substring(0, 9) && ")" !== n.substring(9, 10);
                        o && t.doneFunction(!1), t.closeOnCancel && sweetAlert.close();
                    };
                    o["default"] = {
                        handleButton: s,
                        handleConfirm: l,
                        handleCancel: i
                    }, n.exports = o["default"];
                }, {
                    "./handle-dom": 4,
                    "./handle-swal-dom": 6,
                    "./utils": 9
                } ],
                4: [ function(n, o, a) {
                    Object.defineProperty(a, "__esModule", {
                        value: !0
                    });
                    var r = function(e, t) {
                        return new RegExp(" " + t + " ").test(" " + e.className + " ");
                    }, s = function(e, t) {
                        r(e, t) || (e.className += " " + t);
                    }, l = function(e, t) {
                        var n = " " + e.className.replace(/[\t\r\n]/g, " ") + " ";
                        if (r(e, t)) {
                            for (;n.indexOf(" " + t + " ") >= 0; ) n = n.replace(" " + t + " ", " ");
                            e.className = n.replace(/^\s+|\s+$/g, "");
                        }
                    }, i = function(e) {
                        var n = t.createElement("div");
                        return n.appendChild(t.createTextNode(e)), n.innerHTML;
                    }, u = function(e) {
                        e.style.opacity = "", e.style.display = "block";
                    }, c = function(e) {
                        if (e && !e.length) return u(e);
                        for (var t = 0; t < e.length; ++t) u(e[t]);
                    }, d = function(e) {
                        e.style.opacity = "", e.style.display = "none";
                    }, f = function(e) {
                        if (e && !e.length) return d(e);
                        for (var t = 0; t < e.length; ++t) d(e[t]);
                    }, p = function(e, t) {
                        for (var n = t.parentNode; null !== n; ) {
                            if (n === e) return !0;
                            n = n.parentNode;
                        }
                        return !1;
                    }, m = function(e) {
                        e.style.left = "-9999px", e.style.display = "block";
                        var t, n = e.clientHeight;
                        return t = "undefined" != typeof getComputedStyle ? parseInt(getComputedStyle(e).getPropertyValue("padding-top"), 10) : parseInt(e.currentStyle.padding), 
                        e.style.left = "", e.style.display = "none", "-" + parseInt((n + t) / 2) + "px";
                    }, v = function(e, t) {
                        if (+e.style.opacity < 1) {
                            t = t || 16, e.style.opacity = 0, e.style.display = "block";
                            var n = +new Date(), o = function(e) {
                                function t() {
                                    return e.apply(this, arguments);
                                }
                                return t.toString = function() {
                                    return e.toString();
                                }, t;
                            }(function() {
                                e.style.opacity = +e.style.opacity + (new Date() - n) / 100, n = +new Date(), +e.style.opacity < 1 && setTimeout(o, t);
                            });
                            o();
                        }
                        e.style.display = "block";
                    }, y = function(e, t) {
                        t = t || 16, e.style.opacity = 1;
                        var n = +new Date(), o = function(e) {
                            function t() {
                                return e.apply(this, arguments);
                            }
                            return t.toString = function() {
                                return e.toString();
                            }, t;
                        }(function() {
                            e.style.opacity = +e.style.opacity - (new Date() - n) / 100, n = +new Date(), +e.style.opacity > 0 ? setTimeout(o, t) : e.style.display = "none";
                        });
                        o();
                    }, h = function(n) {
                        if ("function" == typeof MouseEvent) {
                            var o = new MouseEvent("click", {
                                view: e,
                                bubbles: !1,
                                cancelable: !0
                            });
                            n.dispatchEvent(o);
                        } else if (t.createEvent) {
                            var a = t.createEvent("MouseEvents");
                            a.initEvent("click", !1, !1), n.dispatchEvent(a);
                        } else t.createEventObject ? n.fireEvent("onclick") : "function" == typeof n.onclick && n.onclick();
                    }, g = function(t) {
                        "function" == typeof t.stopPropagation ? (t.stopPropagation(), t.preventDefault()) : e.event && e.event.hasOwnProperty("cancelBubble") && (e.event.cancelBubble = !0);
                    };
                    a.hasClass = r, a.addClass = s, a.removeClass = l, a.escapeHtml = i, a._show = u, 
                    a.show = c, a._hide = d, a.hide = f, a.isDescendant = p, a.getTopMargin = m, a.fadeIn = v, 
                    a.fadeOut = y, a.fireClick = h, a.stopEventPropagation = g;
                }, {} ],
                5: [ function(t, o, a) {
                    Object.defineProperty(a, "__esModule", {
                        value: !0
                    });
                    var r = t("./handle-dom"), s = t("./handle-swal-dom"), l = function(t, o, a) {
                        var l = t || e.event, i = l.keyCode || l.which, u = a.querySelector("button.confirm"), c = a.querySelector("button.cancel"), d = a.querySelectorAll("button[tabindex]");
                        if (-1 !== [ 9, 13, 32, 27 ].indexOf(i)) {
                            for (var f = l.target || l.srcElement, p = -1, m = 0; m < d.length; m++) if (f === d[m]) {
                                p = m;
                                break;
                            }
                            9 === i ? (f = -1 === p ? u : p === d.length - 1 ? d[0] : d[p + 1], r.stopEventPropagation(l), 
                            f.focus(), o.confirmButtonColor && s.setFocusStyle(f, o.confirmButtonColor)) : 13 === i ? ("INPUT" === f.tagName && (f = u, 
                            u.focus()), f = -1 === p ? u : n) : 27 === i && o.allowEscapeKey === !0 ? (f = c, 
                            r.fireClick(f, l)) : f = n;
                        }
                    };
                    a["default"] = l, o.exports = a["default"];
                }, {
                    "./handle-dom": 4,
                    "./handle-swal-dom": 6
                } ],
                6: [ function(n, o, a) {
                    var r = function(e) {
                        return e && e.__esModule ? e : {
                            "default": e
                        };
                    };
                    Object.defineProperty(a, "__esModule", {
                        value: !0
                    });
                    var s = n("./utils"), l = n("./handle-dom"), i = n("./default-params"), u = r(i), c = n("./injected-html"), d = r(c), f = ".sweet-alert", p = ".sweet-overlay", m = function() {
                        var e = t.createElement("div");
                        for (e.innerHTML = d["default"]; e.firstChild; ) t.body.appendChild(e.firstChild);
                    }, v = function(e) {
                        function t() {
                            return e.apply(this, arguments);
                        }
                        return t.toString = function() {
                            return e.toString();
                        }, t;
                    }(function() {
                        var e = t.querySelector(f);
                        return e || (m(), e = v()), e;
                    }), y = function() {
                        var e = v();
                        return e ? e.querySelector("input") : void 0;
                    }, h = function() {
                        return t.querySelector(p);
                    }, g = function(e, t) {
                        var n = s.hexToRgb(t);
                        e.style.boxShadow = "0 0 2px rgba(" + n + ", 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)";
                    }, b = function(n) {
                        var o = v();
                        l.fadeIn(h(), 10), l.show(o), l.addClass(o, "showSweetAlert"), l.removeClass(o, "hideSweetAlert"), 
                        e.previousActiveElement = t.activeElement;
                        var a = o.querySelector("button.confirm");
                        a.focus(), setTimeout(function() {
                            l.addClass(o, "visible");
                        }, 500);
                        var r = o.getAttribute("data-timer");
                        if ("null" !== r && "" !== r) {
                            var s = n;
                            o.timeout = setTimeout(function() {
                                var e = (s || null) && "true" === o.getAttribute("data-has-done-function");
                                e ? s(null) : sweetAlert.close();
                            }, r);
                        }
                    }, w = function() {
                        var e = v(), t = y();
                        l.removeClass(e, "show-input"), t.value = u["default"].inputValue, t.setAttribute("type", u["default"].inputType), 
                        t.setAttribute("placeholder", u["default"].inputPlaceholder), C();
                    }, C = function(e) {
                        if (e && 13 === e.keyCode) return !1;
                        var t = v(), n = t.querySelector(".sa-input-error");
                        l.removeClass(n, "show");
                        var o = t.querySelector(".sa-error-container");
                        l.removeClass(o, "show");
                    }, S = function() {
                        var e = v();
                        e.style.marginTop = l.getTopMargin(v());
                    };
                    a.sweetAlertInitialize = m, a.getModal = v, a.getOverlay = h, a.getInput = y, a.setFocusStyle = g, 
                    a.openModal = b, a.resetInput = w, a.resetInputError = C, a.fixVerticalPosition = S;
                }, {
                    "./default-params": 2,
                    "./handle-dom": 4,
                    "./injected-html": 7,
                    "./utils": 9
                } ],
                7: [ function(e, t, n) {
                    Object.defineProperty(n, "__esModule", {
                        value: !0
                    });
                    var o = '<div class="sweet-overlay" tabIndex="-1"></div><div class="sweet-alert"><div class="sa-icon sa-error">\n      <span class="sa-x-mark">\n        <span class="sa-line sa-left"></span>\n        <span class="sa-line sa-right"></span>\n      </span>\n    </div><div class="sa-icon sa-warning">\n      <span class="sa-body"></span>\n      <span class="sa-dot"></span>\n    </div><div class="sa-icon sa-info"></div><div class="sa-icon sa-success">\n      <span class="sa-line sa-tip"></span>\n      <span class="sa-line sa-long"></span>\n\n      <div class="sa-placeholder"></div>\n      <div class="sa-fix"></div>\n    </div><div class="sa-icon sa-custom"></div><h2>Title</h2>\n    <p>Text</p>\n    <fieldset>\n      <input type="text" tabIndex="3" />\n      <div class="sa-input-error"></div>\n    </fieldset><div class="sa-error-container">\n      <div class="icon">!</div>\n      <p>Not valid!</p>\n    </div><div class="sa-button-container">\n      <button class="cancel" tabIndex="2">Cancel</button>\n      <div class="sa-confirm-button-container">\n        <button class="confirm" tabIndex="1">OK</button><div class="la-ball-fall">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div></div>';
                    n["default"] = o, t.exports = n["default"];
                }, {} ],
                8: [ function(e, t, o) {
                    Object.defineProperty(o, "__esModule", {
                        value: !0
                    });
                    var a = e("./utils"), r = e("./handle-swal-dom"), s = e("./handle-dom"), l = [ "error", "warning", "info", "success", "input", "prompt" ], i = function(e) {
                        var t = r.getModal(), o = t.querySelector("h2"), i = t.querySelector("p"), u = t.querySelector("button.cancel"), c = t.querySelector("button.confirm");
                        if (o.innerHTML = e.html ? e.title : s.escapeHtml(e.title).split("\n").join("<br>"), 
                        i.innerHTML = e.html ? e.text : s.escapeHtml(e.text || "").split("\n").join("<br>"), 
                        e.text && s.show(i), e.customClass) s.addClass(t, e.customClass), t.setAttribute("data-custom-class", e.customClass); else {
                            var d = t.getAttribute("data-custom-class");
                            s.removeClass(t, d), t.setAttribute("data-custom-class", "");
                        }
                        if (s.hide(t.querySelectorAll(".sa-icon")), e.type && !a.isIE8()) {
                            var f = function() {
                                for (var o = !1, a = 0; a < l.length; a++) if (e.type === l[a]) {
                                    o = !0;
                                    break;
                                }
                                if (!o) return logStr("Unknown alert type: " + e.type), {
                                    v: !1
                                };
                                var i = [ "success", "error", "warning", "info" ], u = n;
                                -1 !== i.indexOf(e.type) && (u = t.querySelector(".sa-icon.sa-" + e.type), s.show(u));
                                var c = r.getInput();
                                switch (e.type) {
                                  case "success":
                                    s.addClass(u, "animate"), s.addClass(u.querySelector(".sa-tip"), "animateSuccessTip"), 
                                    s.addClass(u.querySelector(".sa-long"), "animateSuccessLong");
                                    break;

                                  case "error":
                                    s.addClass(u, "animateErrorIcon"), s.addClass(u.querySelector(".sa-x-mark"), "animateXMark");
                                    break;

                                  case "warning":
                                    s.addClass(u, "pulseWarning"), s.addClass(u.querySelector(".sa-body"), "pulseWarningIns"), 
                                    s.addClass(u.querySelector(".sa-dot"), "pulseWarningIns");
                                    break;

                                  case "input":
                                  case "prompt":
                                    c.setAttribute("type", e.inputType), c.value = e.inputValue, c.setAttribute("placeholder", e.inputPlaceholder), 
                                    s.addClass(t, "show-input"), setTimeout(function() {
                                        c.focus(), c.addEventListener("keyup", swal.resetInputError);
                                    }, 400);
                                }
                            }();
                            if ("object" == typeof f) return f.v;
                        }
                        if (e.imageUrl) {
                            var p = t.querySelector(".sa-icon.sa-custom");
                            p.style.backgroundImage = "url(" + e.imageUrl + ")", s.show(p);
                            var m = 80, v = 80;
                            if (e.imageSize) {
                                var y = e.imageSize.toString().split("x"), h = y[0], g = y[1];
                                h && g ? (m = h, v = g) : logStr("Parameter imageSize expects value with format WIDTHxHEIGHT, got " + e.imageSize);
                            }
                            p.setAttribute("style", p.getAttribute("style") + "width:" + m + "px; height:" + v + "px");
                        }
                        t.setAttribute("data-has-cancel-button", e.showCancelButton), e.showCancelButton ? u.style.display = "inline-block" : s.hide(u), 
                        t.setAttribute("data-has-confirm-button", e.showConfirmButton), e.showConfirmButton ? c.style.display = "inline-block" : s.hide(c), 
                        e.cancelButtonText && (u.innerHTML = s.escapeHtml(e.cancelButtonText)), e.confirmButtonText && (c.innerHTML = s.escapeHtml(e.confirmButtonText)), 
                        e.confirmButtonColor && (c.style.backgroundColor = e.confirmButtonColor, c.style.borderLeftColor = e.confirmLoadingButtonColor, 
                        c.style.borderRightColor = e.confirmLoadingButtonColor, r.setFocusStyle(c, e.confirmButtonColor)), 
                        t.setAttribute("data-allow-outside-click", e.allowOutsideClick);
                        var b = e.doneFunction ? !0 : !1;
                        t.setAttribute("data-has-done-function", b), e.animation ? "string" == typeof e.animation ? t.setAttribute("data-animation", e.animation) : t.setAttribute("data-animation", "pop") : t.setAttribute("data-animation", "none"), 
                        t.setAttribute("data-timer", e.timer);
                    };
                    o["default"] = i, t.exports = o["default"];
                }, {
                    "./handle-dom": 4,
                    "./handle-swal-dom": 6,
                    "./utils": 9
                } ],
                9: [ function(t, n, o) {
                    Object.defineProperty(o, "__esModule", {
                        value: !0
                    });
                    var a = function(e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
                        return e;
                    }, r = function(e) {
                        var t = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
                        return t ? parseInt(t[1], 16) + ", " + parseInt(t[2], 16) + ", " + parseInt(t[3], 16) : null;
                    }, s = function() {
                        return e.attachEvent && !e.addEventListener;
                    }, l = function(t) {
                        e.console && e.console.log("SweetAlert: " + t);
                    }, i = function(e, t) {
                        e = String(e).replace(/[^0-9a-f]/gi, ""), e.length < 6 && (e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]), 
                        t = t || 0;
                        var n, o, a = "#";
                        for (o = 0; 3 > o; o++) n = parseInt(e.substr(2 * o, 2), 16), n = Math.round(Math.min(Math.max(0, n + n * t), 255)).toString(16), 
                        a += ("00" + n).substr(n.length);
                        return a;
                    };
                    o.extend = a, o.hexToRgb = r, o.isIE8 = s, o.logStr = l, o.colorLuminance = i;
                }, {} ]
            }, {}, [ 1 ]), "function" == typeof define && define.amd ? define(function() {
                return sweetAlert;
            }) : "undefined" != typeof module && module.exports && (module.exports = sweetAlert);
        }(window, document);
    }, {} ],
    147: [ function(require, module, exports) {
        var createElement = require("./vdom/create-element.js");
        module.exports = createElement;
    }, {
        "./vdom/create-element.js": 159
    } ],
    148: [ function(require, module, exports) {
        var diff = require("./vtree/diff.js");
        module.exports = diff;
    }, {
        "./vtree/diff.js": 179
    } ],
    149: [ function(require, module, exports) {
        var h = require("./virtual-hyperscript/index.js");
        module.exports = h;
    }, {
        "./virtual-hyperscript/index.js": 166
    } ],
    150: [ function(require, module, exports) {
        module.exports = function split(undef) {
            var nativeSplit = String.prototype.split, compliantExecNpcg = /()??/.exec("")[1] === undef, self;
            self = function(str, separator, limit) {
                if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                    return nativeSplit.call(str, separator, limit);
                }
                var output = [], flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + (separator.sticky ? "y" : ""), lastLastIndex = 0, separator = new RegExp(separator.source, flags + "g"), separator2, match, lastIndex, lastLength;
                str += "";
                if (!compliantExecNpcg) {
                    separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
                }
                limit = limit === undef ? -1 >>> 0 : limit >>> 0;
                while (match = separator.exec(str)) {
                    lastIndex = match.index + match[0].length;
                    if (lastIndex > lastLastIndex) {
                        output.push(str.slice(lastLastIndex, match.index));
                        if (!compliantExecNpcg && match.length > 1) {
                            match[0].replace(separator2, function() {
                                for (var i = 1; i < arguments.length - 2; i++) {
                                    if (arguments[i] === undef) {
                                        match[i] = undef;
                                    }
                                }
                            });
                        }
                        if (match.length > 1 && match.index < str.length) {
                            Array.prototype.push.apply(output, match.slice(1));
                        }
                        lastLength = match[0].length;
                        lastLastIndex = lastIndex;
                        if (output.length >= limit) {
                            break;
                        }
                    }
                    if (separator.lastIndex === match.index) {
                        separator.lastIndex++;
                    }
                }
                if (lastLastIndex === str.length) {
                    if (lastLength || !separator.test("")) {
                        output.push("");
                    }
                } else {
                    output.push(str.slice(lastLastIndex));
                }
                return output.length > limit ? output.slice(0, limit) : output;
            };
            return self;
        }();
    }, {} ],
    151: [ function(require, module, exports) {
        "use strict";
        var OneVersionConstraint = require("individual/one-version");
        var MY_VERSION = "7";
        OneVersionConstraint("ev-store", MY_VERSION);
        var hashKey = "__EV_STORE_KEY@" + MY_VERSION;
        module.exports = EvStore;
        function EvStore(elem) {
            var hash = elem[hashKey];
            if (!hash) {
                hash = elem[hashKey] = {};
            }
            return hash;
        }
    }, {
        "individual/one-version": 153
    } ],
    152: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var root = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
            module.exports = Individual;
            function Individual(key, value) {
                if (key in root) {
                    return root[key];
                }
                root[key] = value;
                return value;
            }
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    153: [ function(require, module, exports) {
        "use strict";
        var Individual = require("./index.js");
        module.exports = OneVersion;
        function OneVersion(moduleName, version, defaultValue) {
            var key = "__INDIVIDUAL_ONE_VERSION_" + moduleName;
            var enforceKey = key + "_ENFORCE_SINGLETON";
            var versionValue = Individual(enforceKey, version);
            if (versionValue !== version) {
                throw new Error("Can only have one copy of " + moduleName + ".\n" + "You already have version " + versionValue + " installed.\n" + "This means you cannot install version " + version);
            }
            return Individual(key, defaultValue);
        }
    }, {
        "./index.js": 152
    } ],
    154: [ function(require, module, exports) {
        (function(global) {
            var topLevel = typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : {};
            var minDoc = require("min-document");
            if (typeof document !== "undefined") {
                module.exports = document;
            } else {
                var doccy = topLevel["__GLOBAL_DOCUMENT_CACHE@4"];
                if (!doccy) {
                    doccy = topLevel["__GLOBAL_DOCUMENT_CACHE@4"] = minDoc;
                }
                module.exports = doccy;
            }
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "min-document": 3
    } ],
    155: [ function(require, module, exports) {
        "use strict";
        module.exports = function isObject(x) {
            return typeof x === "object" && x !== null;
        };
    }, {} ],
    156: [ function(require, module, exports) {
        var nativeIsArray = Array.isArray;
        var toString = Object.prototype.toString;
        module.exports = nativeIsArray || isArray;
        function isArray(obj) {
            return toString.call(obj) === "[object Array]";
        }
    }, {} ],
    157: [ function(require, module, exports) {
        var patch = require("./vdom/patch.js");
        module.exports = patch;
    }, {
        "./vdom/patch.js": 162
    } ],
    158: [ function(require, module, exports) {
        var isObject = require("is-object");
        var isHook = require("../vnode/is-vhook.js");
        module.exports = applyProperties;
        function applyProperties(node, props, previous) {
            for (var propName in props) {
                var propValue = props[propName];
                if (propValue === undefined) {
                    removeProperty(node, propName, propValue, previous);
                } else if (isHook(propValue)) {
                    removeProperty(node, propName, propValue, previous);
                    if (propValue.hook) {
                        propValue.hook(node, propName, previous ? previous[propName] : undefined);
                    }
                } else {
                    if (isObject(propValue)) {
                        patchObject(node, props, previous, propName, propValue);
                    } else {
                        node[propName] = propValue;
                    }
                }
            }
        }
        function removeProperty(node, propName, propValue, previous) {
            if (previous) {
                var previousValue = previous[propName];
                if (!isHook(previousValue)) {
                    if (propName === "attributes") {
                        for (var attrName in previousValue) {
                            node.removeAttribute(attrName);
                        }
                    } else if (propName === "style") {
                        for (var i in previousValue) {
                            node.style[i] = "";
                        }
                    } else if (typeof previousValue === "string") {
                        node[propName] = "";
                    } else {
                        node[propName] = null;
                    }
                } else if (previousValue.unhook) {
                    previousValue.unhook(node, propName, propValue);
                }
            }
        }
        function patchObject(node, props, previous, propName, propValue) {
            var previousValue = previous ? previous[propName] : undefined;
            if (propName === "attributes") {
                for (var attrName in propValue) {
                    var attrValue = propValue[attrName];
                    if (attrValue === undefined) {
                        node.removeAttribute(attrName);
                    } else {
                        node.setAttribute(attrName, attrValue);
                    }
                }
                return;
            }
            if (previousValue && isObject(previousValue) && getPrototype(previousValue) !== getPrototype(propValue)) {
                node[propName] = propValue;
                return;
            }
            if (!isObject(node[propName])) {
                node[propName] = {};
            }
            var replacer = propName === "style" ? "" : undefined;
            for (var k in propValue) {
                var value = propValue[k];
                node[propName][k] = value === undefined ? replacer : value;
            }
        }
        function getPrototype(value) {
            if (Object.getPrototypeOf) {
                return Object.getPrototypeOf(value);
            } else if (value.__proto__) {
                return value.__proto__;
            } else if (value.constructor) {
                return value.constructor.prototype;
            }
        }
    }, {
        "../vnode/is-vhook.js": 170,
        "is-object": 155
    } ],
    159: [ function(require, module, exports) {
        var document = require("global/document");
        var applyProperties = require("./apply-properties");
        var isVNode = require("../vnode/is-vnode.js");
        var isVText = require("../vnode/is-vtext.js");
        var isWidget = require("../vnode/is-widget.js");
        var handleThunk = require("../vnode/handle-thunk.js");
        module.exports = createElement;
        function createElement(vnode, opts) {
            var doc = opts ? opts.document || document : document;
            var warn = opts ? opts.warn : null;
            vnode = handleThunk(vnode).a;
            if (isWidget(vnode)) {
                return vnode.init();
            } else if (isVText(vnode)) {
                return doc.createTextNode(vnode.text);
            } else if (!isVNode(vnode)) {
                if (warn) {
                    warn("Item is not a valid virtual dom node", vnode);
                }
                return null;
            }
            var node = vnode.namespace === null ? doc.createElement(vnode.tagName) : doc.createElementNS(vnode.namespace, vnode.tagName);
            var props = vnode.properties;
            applyProperties(node, props);
            var children = vnode.children;
            for (var i = 0; i < children.length; i++) {
                var childNode = createElement(children[i], opts);
                if (childNode) {
                    node.appendChild(childNode);
                }
            }
            return node;
        }
    }, {
        "../vnode/handle-thunk.js": 168,
        "../vnode/is-vnode.js": 171,
        "../vnode/is-vtext.js": 172,
        "../vnode/is-widget.js": 173,
        "./apply-properties": 158,
        "global/document": 154
    } ],
    160: [ function(require, module, exports) {
        var noChild = {};
        module.exports = domIndex;
        function domIndex(rootNode, tree, indices, nodes) {
            if (!indices || indices.length === 0) {
                return {};
            } else {
                indices.sort(ascending);
                return recurse(rootNode, tree, indices, nodes, 0);
            }
        }
        function recurse(rootNode, tree, indices, nodes, rootIndex) {
            nodes = nodes || {};
            if (rootNode) {
                if (indexInRange(indices, rootIndex, rootIndex)) {
                    nodes[rootIndex] = rootNode;
                }
                var vChildren = tree.children;
                if (vChildren) {
                    var childNodes = rootNode.childNodes;
                    for (var i = 0; i < tree.children.length; i++) {
                        rootIndex += 1;
                        var vChild = vChildren[i] || noChild;
                        var nextIndex = rootIndex + (vChild.count || 0);
                        if (indexInRange(indices, rootIndex, nextIndex)) {
                            recurse(childNodes[i], vChild, indices, nodes, rootIndex);
                        }
                        rootIndex = nextIndex;
                    }
                }
            }
            return nodes;
        }
        function indexInRange(indices, left, right) {
            if (indices.length === 0) {
                return false;
            }
            var minIndex = 0;
            var maxIndex = indices.length - 1;
            var currentIndex;
            var currentItem;
            while (minIndex <= maxIndex) {
                currentIndex = (maxIndex + minIndex) / 2 >> 0;
                currentItem = indices[currentIndex];
                if (minIndex === maxIndex) {
                    return currentItem >= left && currentItem <= right;
                } else if (currentItem < left) {
                    minIndex = currentIndex + 1;
                } else if (currentItem > right) {
                    maxIndex = currentIndex - 1;
                } else {
                    return true;
                }
            }
            return false;
        }
        function ascending(a, b) {
            return a > b ? 1 : -1;
        }
    }, {} ],
    161: [ function(require, module, exports) {
        var applyProperties = require("./apply-properties");
        var isWidget = require("../vnode/is-widget.js");
        var VPatch = require("../vnode/vpatch.js");
        var updateWidget = require("./update-widget");
        module.exports = applyPatch;
        function applyPatch(vpatch, domNode, renderOptions) {
            var type = vpatch.type;
            var vNode = vpatch.vNode;
            var patch = vpatch.patch;
            switch (type) {
              case VPatch.REMOVE:
                return removeNode(domNode, vNode);

              case VPatch.INSERT:
                return insertNode(domNode, patch, renderOptions);

              case VPatch.VTEXT:
                return stringPatch(domNode, vNode, patch, renderOptions);

              case VPatch.WIDGET:
                return widgetPatch(domNode, vNode, patch, renderOptions);

              case VPatch.VNODE:
                return vNodePatch(domNode, vNode, patch, renderOptions);

              case VPatch.ORDER:
                reorderChildren(domNode, patch);
                return domNode;

              case VPatch.PROPS:
                applyProperties(domNode, patch, vNode.properties);
                return domNode;

              case VPatch.THUNK:
                return replaceRoot(domNode, renderOptions.patch(domNode, patch, renderOptions));

              default:
                return domNode;
            }
        }
        function removeNode(domNode, vNode) {
            var parentNode = domNode.parentNode;
            if (parentNode) {
                parentNode.removeChild(domNode);
            }
            destroyWidget(domNode, vNode);
            return null;
        }
        function insertNode(parentNode, vNode, renderOptions) {
            var newNode = renderOptions.render(vNode, renderOptions);
            if (parentNode) {
                parentNode.appendChild(newNode);
            }
            return parentNode;
        }
        function stringPatch(domNode, leftVNode, vText, renderOptions) {
            var newNode;
            if (domNode.nodeType === 3) {
                domNode.replaceData(0, domNode.length, vText.text);
                newNode = domNode;
            } else {
                var parentNode = domNode.parentNode;
                newNode = renderOptions.render(vText, renderOptions);
                if (parentNode && newNode !== domNode) {
                    parentNode.replaceChild(newNode, domNode);
                }
            }
            return newNode;
        }
        function widgetPatch(domNode, leftVNode, widget, renderOptions) {
            var updating = updateWidget(leftVNode, widget);
            var newNode;
            if (updating) {
                newNode = widget.update(leftVNode, domNode) || domNode;
            } else {
                newNode = renderOptions.render(widget, renderOptions);
            }
            var parentNode = domNode.parentNode;
            if (parentNode && newNode !== domNode) {
                parentNode.replaceChild(newNode, domNode);
            }
            if (!updating) {
                destroyWidget(domNode, leftVNode);
            }
            return newNode;
        }
        function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
            var parentNode = domNode.parentNode;
            var newNode = renderOptions.render(vNode, renderOptions);
            if (parentNode && newNode !== domNode) {
                parentNode.replaceChild(newNode, domNode);
            }
            return newNode;
        }
        function destroyWidget(domNode, w) {
            if (typeof w.destroy === "function" && isWidget(w)) {
                w.destroy(domNode);
            }
        }
        function reorderChildren(domNode, moves) {
            var childNodes = domNode.childNodes;
            var keyMap = {};
            var node;
            var remove;
            var insert;
            for (var i = 0; i < moves.removes.length; i++) {
                remove = moves.removes[i];
                node = childNodes[remove.from];
                if (remove.key) {
                    keyMap[remove.key] = node;
                }
                domNode.removeChild(node);
            }
            var length = childNodes.length;
            for (var j = 0; j < moves.inserts.length; j++) {
                insert = moves.inserts[j];
                node = keyMap[insert.key];
                domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
            }
        }
        function replaceRoot(oldRoot, newRoot) {
            if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
                oldRoot.parentNode.replaceChild(newRoot, oldRoot);
            }
            return newRoot;
        }
    }, {
        "../vnode/is-widget.js": 173,
        "../vnode/vpatch.js": 176,
        "./apply-properties": 158,
        "./update-widget": 163
    } ],
    162: [ function(require, module, exports) {
        var document = require("global/document");
        var isArray = require("x-is-array");
        var render = require("./create-element");
        var domIndex = require("./dom-index");
        var patchOp = require("./patch-op");
        module.exports = patch;
        function patch(rootNode, patches, renderOptions) {
            renderOptions = renderOptions || {};
            renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch ? renderOptions.patch : patchRecursive;
            renderOptions.render = renderOptions.render || render;
            return renderOptions.patch(rootNode, patches, renderOptions);
        }
        function patchRecursive(rootNode, patches, renderOptions) {
            var indices = patchIndices(patches);
            if (indices.length === 0) {
                return rootNode;
            }
            var index = domIndex(rootNode, patches.a, indices);
            var ownerDocument = rootNode.ownerDocument;
            if (!renderOptions.document && ownerDocument !== document) {
                renderOptions.document = ownerDocument;
            }
            for (var i = 0; i < indices.length; i++) {
                var nodeIndex = indices[i];
                rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], renderOptions);
            }
            return rootNode;
        }
        function applyPatch(rootNode, domNode, patchList, renderOptions) {
            if (!domNode) {
                return rootNode;
            }
            var newNode;
            if (isArray(patchList)) {
                for (var i = 0; i < patchList.length; i++) {
                    newNode = patchOp(patchList[i], domNode, renderOptions);
                    if (domNode === rootNode) {
                        rootNode = newNode;
                    }
                }
            } else {
                newNode = patchOp(patchList, domNode, renderOptions);
                if (domNode === rootNode) {
                    rootNode = newNode;
                }
            }
            return rootNode;
        }
        function patchIndices(patches) {
            var indices = [];
            for (var key in patches) {
                if (key !== "a") {
                    indices.push(Number(key));
                }
            }
            return indices;
        }
    }, {
        "./create-element": 159,
        "./dom-index": 160,
        "./patch-op": 161,
        "global/document": 154,
        "x-is-array": 156
    } ],
    163: [ function(require, module, exports) {
        var isWidget = require("../vnode/is-widget.js");
        module.exports = updateWidget;
        function updateWidget(a, b) {
            if (isWidget(a) && isWidget(b)) {
                if ("name" in a && "name" in b) {
                    return a.id === b.id;
                } else {
                    return a.init === b.init;
                }
            }
            return false;
        }
    }, {
        "../vnode/is-widget.js": 173
    } ],
    164: [ function(require, module, exports) {
        "use strict";
        var EvStore = require("ev-store");
        module.exports = EvHook;
        function EvHook(value) {
            if (!(this instanceof EvHook)) {
                return new EvHook(value);
            }
            this.value = value;
        }
        EvHook.prototype.hook = function(node, propertyName) {
            var es = EvStore(node);
            var propName = propertyName.substr(3);
            es[propName] = this.value;
        };
        EvHook.prototype.unhook = function(node, propertyName) {
            var es = EvStore(node);
            var propName = propertyName.substr(3);
            es[propName] = undefined;
        };
    }, {
        "ev-store": 151
    } ],
    165: [ function(require, module, exports) {
        "use strict";
        module.exports = SoftSetHook;
        function SoftSetHook(value) {
            if (!(this instanceof SoftSetHook)) {
                return new SoftSetHook(value);
            }
            this.value = value;
        }
        SoftSetHook.prototype.hook = function(node, propertyName) {
            if (node[propertyName] !== this.value) {
                node[propertyName] = this.value;
            }
        };
    }, {} ],
    166: [ function(require, module, exports) {
        "use strict";
        var isArray = require("x-is-array");
        var VNode = require("../vnode/vnode.js");
        var VText = require("../vnode/vtext.js");
        var isVNode = require("../vnode/is-vnode");
        var isVText = require("../vnode/is-vtext");
        var isWidget = require("../vnode/is-widget");
        var isHook = require("../vnode/is-vhook");
        var isVThunk = require("../vnode/is-thunk");
        var parseTag = require("./parse-tag.js");
        var softSetHook = require("./hooks/soft-set-hook.js");
        var evHook = require("./hooks/ev-hook.js");
        module.exports = h;
        function h(tagName, properties, children) {
            var childNodes = [];
            var tag, props, key, namespace;
            if (!children && isChildren(properties)) {
                children = properties;
                props = {};
            }
            props = props || properties || {};
            tag = parseTag(tagName, props);
            if (props.hasOwnProperty("key")) {
                key = props.key;
                props.key = undefined;
            }
            if (props.hasOwnProperty("namespace")) {
                namespace = props.namespace;
                props.namespace = undefined;
            }
            if (tag === "INPUT" && !namespace && props.hasOwnProperty("value") && props.value !== undefined && !isHook(props.value)) {
                props.value = softSetHook(props.value);
            }
            transformProperties(props);
            if (children !== undefined && children !== null) {
                addChild(children, childNodes, tag, props);
            }
            return new VNode(tag, props, childNodes, key, namespace);
        }
        function addChild(c, childNodes, tag, props) {
            if (typeof c === "string") {
                childNodes.push(new VText(c));
            } else if (typeof c === "number") {
                childNodes.push(new VText(String(c)));
            } else if (isChild(c)) {
                childNodes.push(c);
            } else if (isArray(c)) {
                for (var i = 0; i < c.length; i++) {
                    addChild(c[i], childNodes, tag, props);
                }
            } else if (c === null || c === undefined) {
                return;
            } else {
                throw UnexpectedVirtualElement({
                    foreignObject: c,
                    parentVnode: {
                        tagName: tag,
                        properties: props
                    }
                });
            }
        }
        function transformProperties(props) {
            for (var propName in props) {
                if (props.hasOwnProperty(propName)) {
                    var value = props[propName];
                    if (isHook(value)) {
                        continue;
                    }
                    if (propName.substr(0, 3) === "ev-") {
                        props[propName] = evHook(value);
                    }
                }
            }
        }
        function isChild(x) {
            return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
        }
        function isChildren(x) {
            return typeof x === "string" || isArray(x) || isChild(x);
        }
        function UnexpectedVirtualElement(data) {
            var err = new Error();
            err.type = "virtual-hyperscript.unexpected.virtual-element";
            err.message = "Unexpected virtual child passed to h().\n" + "Expected a VNode / Vthunk / VWidget / string but:\n" + "got:\n" + errorString(data.foreignObject) + ".\n" + "The parent vnode is:\n" + errorString(data.parentVnode);
            "\n" + "Suggested fix: change your `h(..., [ ... ])` callsite.";
            err.foreignObject = data.foreignObject;
            err.parentVnode = data.parentVnode;
            return err;
        }
        function errorString(obj) {
            try {
                return JSON.stringify(obj, null, "    ");
            } catch (e) {
                return String(obj);
            }
        }
    }, {
        "../vnode/is-thunk": 169,
        "../vnode/is-vhook": 170,
        "../vnode/is-vnode": 171,
        "../vnode/is-vtext": 172,
        "../vnode/is-widget": 173,
        "../vnode/vnode.js": 175,
        "../vnode/vtext.js": 177,
        "./hooks/ev-hook.js": 164,
        "./hooks/soft-set-hook.js": 165,
        "./parse-tag.js": 167,
        "x-is-array": 156
    } ],
    167: [ function(require, module, exports) {
        "use strict";
        var split = require("browser-split");
        var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
        var notClassId = /^\.|#/;
        module.exports = parseTag;
        function parseTag(tag, props) {
            if (!tag) {
                return "DIV";
            }
            var noId = !props.hasOwnProperty("id");
            var tagParts = split(tag, classIdSplit);
            var tagName = null;
            if (notClassId.test(tagParts[1])) {
                tagName = "DIV";
            }
            var classes, part, type, i;
            for (i = 0; i < tagParts.length; i++) {
                part = tagParts[i];
                if (!part) {
                    continue;
                }
                type = part.charAt(0);
                if (!tagName) {
                    tagName = part;
                } else if (type === ".") {
                    classes = classes || [];
                    classes.push(part.substring(1, part.length));
                } else if (type === "#" && noId) {
                    props.id = part.substring(1, part.length);
                }
            }
            if (classes) {
                if (props.className) {
                    classes.push(props.className);
                }
                props.className = classes.join(" ");
            }
            return props.namespace ? tagName : tagName.toUpperCase();
        }
    }, {
        "browser-split": 150
    } ],
    168: [ function(require, module, exports) {
        var isVNode = require("./is-vnode");
        var isVText = require("./is-vtext");
        var isWidget = require("./is-widget");
        var isThunk = require("./is-thunk");
        module.exports = handleThunk;
        function handleThunk(a, b) {
            var renderedA = a;
            var renderedB = b;
            if (isThunk(b)) {
                renderedB = renderThunk(b, a);
            }
            if (isThunk(a)) {
                renderedA = renderThunk(a, null);
            }
            return {
                a: renderedA,
                b: renderedB
            };
        }
        function renderThunk(thunk, previous) {
            var renderedThunk = thunk.vnode;
            if (!renderedThunk) {
                renderedThunk = thunk.vnode = thunk.render(previous);
            }
            if (!(isVNode(renderedThunk) || isVText(renderedThunk) || isWidget(renderedThunk))) {
                throw new Error("thunk did not return a valid node");
            }
            return renderedThunk;
        }
    }, {
        "./is-thunk": 169,
        "./is-vnode": 171,
        "./is-vtext": 172,
        "./is-widget": 173
    } ],
    169: [ function(require, module, exports) {
        module.exports = isThunk;
        function isThunk(t) {
            return t && t.type === "Thunk";
        }
    }, {} ],
    170: [ function(require, module, exports) {
        module.exports = isHook;
        function isHook(hook) {
            return hook && (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") || typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"));
        }
    }, {} ],
    171: [ function(require, module, exports) {
        var version = require("./version");
        module.exports = isVirtualNode;
        function isVirtualNode(x) {
            return x && x.type === "VirtualNode" && x.version === version;
        }
    }, {
        "./version": 174
    } ],
    172: [ function(require, module, exports) {
        var version = require("./version");
        module.exports = isVirtualText;
        function isVirtualText(x) {
            return x && x.type === "VirtualText" && x.version === version;
        }
    }, {
        "./version": 174
    } ],
    173: [ function(require, module, exports) {
        module.exports = isWidget;
        function isWidget(w) {
            return w && w.type === "Widget";
        }
    }, {} ],
    174: [ function(require, module, exports) {
        module.exports = "2";
    }, {} ],
    175: [ function(require, module, exports) {
        var version = require("./version");
        var isVNode = require("./is-vnode");
        var isWidget = require("./is-widget");
        var isThunk = require("./is-thunk");
        var isVHook = require("./is-vhook");
        module.exports = VirtualNode;
        var noProperties = {};
        var noChildren = [];
        function VirtualNode(tagName, properties, children, key, namespace) {
            this.tagName = tagName;
            this.properties = properties || noProperties;
            this.children = children || noChildren;
            this.key = key != null ? String(key) : undefined;
            this.namespace = typeof namespace === "string" ? namespace : null;
            var count = children && children.length || 0;
            var descendants = 0;
            var hasWidgets = false;
            var hasThunks = false;
            var descendantHooks = false;
            var hooks;
            for (var propName in properties) {
                if (properties.hasOwnProperty(propName)) {
                    var property = properties[propName];
                    if (isVHook(property) && property.unhook) {
                        if (!hooks) {
                            hooks = {};
                        }
                        hooks[propName] = property;
                    }
                }
            }
            for (var i = 0; i < count; i++) {
                var child = children[i];
                if (isVNode(child)) {
                    descendants += child.count || 0;
                    if (!hasWidgets && child.hasWidgets) {
                        hasWidgets = true;
                    }
                    if (!hasThunks && child.hasThunks) {
                        hasThunks = true;
                    }
                    if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                        descendantHooks = true;
                    }
                } else if (!hasWidgets && isWidget(child)) {
                    if (typeof child.destroy === "function") {
                        hasWidgets = true;
                    }
                } else if (!hasThunks && isThunk(child)) {
                    hasThunks = true;
                }
            }
            this.count = count + descendants;
            this.hasWidgets = hasWidgets;
            this.hasThunks = hasThunks;
            this.hooks = hooks;
            this.descendantHooks = descendantHooks;
        }
        VirtualNode.prototype.version = version;
        VirtualNode.prototype.type = "VirtualNode";
    }, {
        "./is-thunk": 169,
        "./is-vhook": 170,
        "./is-vnode": 171,
        "./is-widget": 173,
        "./version": 174
    } ],
    176: [ function(require, module, exports) {
        var version = require("./version");
        VirtualPatch.NONE = 0;
        VirtualPatch.VTEXT = 1;
        VirtualPatch.VNODE = 2;
        VirtualPatch.WIDGET = 3;
        VirtualPatch.PROPS = 4;
        VirtualPatch.ORDER = 5;
        VirtualPatch.INSERT = 6;
        VirtualPatch.REMOVE = 7;
        VirtualPatch.THUNK = 8;
        module.exports = VirtualPatch;
        function VirtualPatch(type, vNode, patch) {
            this.type = Number(type);
            this.vNode = vNode;
            this.patch = patch;
        }
        VirtualPatch.prototype.version = version;
        VirtualPatch.prototype.type = "VirtualPatch";
    }, {
        "./version": 174
    } ],
    177: [ function(require, module, exports) {
        var version = require("./version");
        module.exports = VirtualText;
        function VirtualText(text) {
            this.text = String(text);
        }
        VirtualText.prototype.version = version;
        VirtualText.prototype.type = "VirtualText";
    }, {
        "./version": 174
    } ],
    178: [ function(require, module, exports) {
        var isObject = require("is-object");
        var isHook = require("../vnode/is-vhook");
        module.exports = diffProps;
        function diffProps(a, b) {
            var diff;
            for (var aKey in a) {
                if (!(aKey in b)) {
                    diff = diff || {};
                    diff[aKey] = undefined;
                }
                var aValue = a[aKey];
                var bValue = b[aKey];
                if (aValue === bValue) {
                    continue;
                } else if (isObject(aValue) && isObject(bValue)) {
                    if (getPrototype(bValue) !== getPrototype(aValue)) {
                        diff = diff || {};
                        diff[aKey] = bValue;
                    } else if (isHook(bValue)) {
                        diff = diff || {};
                        diff[aKey] = bValue;
                    } else {
                        var objectDiff = diffProps(aValue, bValue);
                        if (objectDiff) {
                            diff = diff || {};
                            diff[aKey] = objectDiff;
                        }
                    }
                } else {
                    diff = diff || {};
                    diff[aKey] = bValue;
                }
            }
            for (var bKey in b) {
                if (!(bKey in a)) {
                    diff = diff || {};
                    diff[bKey] = b[bKey];
                }
            }
            return diff;
        }
        function getPrototype(value) {
            if (Object.getPrototypeOf) {
                return Object.getPrototypeOf(value);
            } else if (value.__proto__) {
                return value.__proto__;
            } else if (value.constructor) {
                return value.constructor.prototype;
            }
        }
    }, {
        "../vnode/is-vhook": 170,
        "is-object": 155
    } ],
    179: [ function(require, module, exports) {
        var isArray = require("x-is-array");
        var VPatch = require("../vnode/vpatch");
        var isVNode = require("../vnode/is-vnode");
        var isVText = require("../vnode/is-vtext");
        var isWidget = require("../vnode/is-widget");
        var isThunk = require("../vnode/is-thunk");
        var handleThunk = require("../vnode/handle-thunk");
        var diffProps = require("./diff-props");
        module.exports = diff;
        function diff(a, b) {
            var patch = {
                a: a
            };
            walk(a, b, patch, 0);
            return patch;
        }
        function walk(a, b, patch, index) {
            if (a === b) {
                return;
            }
            var apply = patch[index];
            var applyClear = false;
            if (isThunk(a) || isThunk(b)) {
                thunks(a, b, patch, index);
            } else if (b == null) {
                if (!isWidget(a)) {
                    clearState(a, patch, index);
                    apply = patch[index];
                }
                apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b));
            } else if (isVNode(b)) {
                if (isVNode(a)) {
                    if (a.tagName === b.tagName && a.namespace === b.namespace && a.key === b.key) {
                        var propsPatch = diffProps(a.properties, b.properties);
                        if (propsPatch) {
                            apply = appendPatch(apply, new VPatch(VPatch.PROPS, a, propsPatch));
                        }
                        apply = diffChildren(a, b, patch, apply, index);
                    } else {
                        apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
                        applyClear = true;
                    }
                } else {
                    apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
                    applyClear = true;
                }
            } else if (isVText(b)) {
                if (!isVText(a)) {
                    apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
                    applyClear = true;
                } else if (a.text !== b.text) {
                    apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
                }
            } else if (isWidget(b)) {
                if (!isWidget(a)) {
                    applyClear = true;
                }
                apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b));
            }
            if (apply) {
                patch[index] = apply;
            }
            if (applyClear) {
                clearState(a, patch, index);
            }
        }
        function diffChildren(a, b, patch, apply, index) {
            var aChildren = a.children;
            var orderedSet = reorder(aChildren, b.children);
            var bChildren = orderedSet.children;
            var aLen = aChildren.length;
            var bLen = bChildren.length;
            var len = aLen > bLen ? aLen : bLen;
            for (var i = 0; i < len; i++) {
                var leftNode = aChildren[i];
                var rightNode = bChildren[i];
                index += 1;
                if (!leftNode) {
                    if (rightNode) {
                        apply = appendPatch(apply, new VPatch(VPatch.INSERT, null, rightNode));
                    }
                } else {
                    walk(leftNode, rightNode, patch, index);
                }
                if (isVNode(leftNode) && leftNode.count) {
                    index += leftNode.count;
                }
            }
            if (orderedSet.moves) {
                apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, orderedSet.moves));
            }
            return apply;
        }
        function clearState(vNode, patch, index) {
            unhook(vNode, patch, index);
            destroyWidgets(vNode, patch, index);
        }
        function destroyWidgets(vNode, patch, index) {
            if (isWidget(vNode)) {
                if (typeof vNode.destroy === "function") {
                    patch[index] = appendPatch(patch[index], new VPatch(VPatch.REMOVE, vNode, null));
                }
            } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
                var children = vNode.children;
                var len = children.length;
                for (var i = 0; i < len; i++) {
                    var child = children[i];
                    index += 1;
                    destroyWidgets(child, patch, index);
                    if (isVNode(child) && child.count) {
                        index += child.count;
                    }
                }
            } else if (isThunk(vNode)) {
                thunks(vNode, null, patch, index);
            }
        }
        function thunks(a, b, patch, index) {
            var nodes = handleThunk(a, b);
            var thunkPatch = diff(nodes.a, nodes.b);
            if (hasPatches(thunkPatch)) {
                patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch);
            }
        }
        function hasPatches(patch) {
            for (var index in patch) {
                if (index !== "a") {
                    return true;
                }
            }
            return false;
        }
        function unhook(vNode, patch, index) {
            if (isVNode(vNode)) {
                if (vNode.hooks) {
                    patch[index] = appendPatch(patch[index], new VPatch(VPatch.PROPS, vNode, undefinedKeys(vNode.hooks)));
                }
                if (vNode.descendantHooks || vNode.hasThunks) {
                    var children = vNode.children;
                    var len = children.length;
                    for (var i = 0; i < len; i++) {
                        var child = children[i];
                        index += 1;
                        unhook(child, patch, index);
                        if (isVNode(child) && child.count) {
                            index += child.count;
                        }
                    }
                }
            } else if (isThunk(vNode)) {
                thunks(vNode, null, patch, index);
            }
        }
        function undefinedKeys(obj) {
            var result = {};
            for (var key in obj) {
                result[key] = undefined;
            }
            return result;
        }
        function reorder(aChildren, bChildren) {
            var bChildIndex = keyIndex(bChildren);
            var bKeys = bChildIndex.keys;
            var bFree = bChildIndex.free;
            if (bFree.length === bChildren.length) {
                return {
                    children: bChildren,
                    moves: null
                };
            }
            var aChildIndex = keyIndex(aChildren);
            var aKeys = aChildIndex.keys;
            var aFree = aChildIndex.free;
            if (aFree.length === aChildren.length) {
                return {
                    children: bChildren,
                    moves: null
                };
            }
            var newChildren = [];
            var freeIndex = 0;
            var freeCount = bFree.length;
            var deletedItems = 0;
            for (var i = 0; i < aChildren.length; i++) {
                var aItem = aChildren[i];
                var itemIndex;
                if (aItem.key) {
                    if (bKeys.hasOwnProperty(aItem.key)) {
                        itemIndex = bKeys[aItem.key];
                        newChildren.push(bChildren[itemIndex]);
                    } else {
                        itemIndex = i - deletedItems++;
                        newChildren.push(null);
                    }
                } else {
                    if (freeIndex < freeCount) {
                        itemIndex = bFree[freeIndex++];
                        newChildren.push(bChildren[itemIndex]);
                    } else {
                        itemIndex = i - deletedItems++;
                        newChildren.push(null);
                    }
                }
            }
            var lastFreeIndex = freeIndex >= bFree.length ? bChildren.length : bFree[freeIndex];
            for (var j = 0; j < bChildren.length; j++) {
                var newItem = bChildren[j];
                if (newItem.key) {
                    if (!aKeys.hasOwnProperty(newItem.key)) {
                        newChildren.push(newItem);
                    }
                } else if (j >= lastFreeIndex) {
                    newChildren.push(newItem);
                }
            }
            var simulate = newChildren.slice();
            var simulateIndex = 0;
            var removes = [];
            var inserts = [];
            var simulateItem;
            for (var k = 0; k < bChildren.length; ) {
                var wantedItem = bChildren[k];
                simulateItem = simulate[simulateIndex];
                while (simulateItem === null && simulate.length) {
                    removes.push(remove(simulate, simulateIndex, null));
                    simulateItem = simulate[simulateIndex];
                }
                if (!simulateItem || simulateItem.key !== wantedItem.key) {
                    if (wantedItem.key) {
                        if (simulateItem && simulateItem.key) {
                            if (bKeys[simulateItem.key] !== k + 1) {
                                removes.push(remove(simulate, simulateIndex, simulateItem.key));
                                simulateItem = simulate[simulateIndex];
                                if (!simulateItem || simulateItem.key !== wantedItem.key) {
                                    inserts.push({
                                        key: wantedItem.key,
                                        to: k
                                    });
                                } else {
                                    simulateIndex++;
                                }
                            } else {
                                inserts.push({
                                    key: wantedItem.key,
                                    to: k
                                });
                            }
                        } else {
                            inserts.push({
                                key: wantedItem.key,
                                to: k
                            });
                        }
                        k++;
                    } else if (simulateItem && simulateItem.key) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key));
                    }
                } else {
                    simulateIndex++;
                    k++;
                }
            }
            while (simulateIndex < simulate.length) {
                simulateItem = simulate[simulateIndex];
                removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key));
            }
            if (removes.length === deletedItems && !inserts.length) {
                return {
                    children: newChildren,
                    moves: null
                };
            }
            return {
                children: newChildren,
                moves: {
                    removes: removes,
                    inserts: inserts
                }
            };
        }
        function remove(arr, index, key) {
            arr.splice(index, 1);
            return {
                from: index,
                key: key
            };
        }
        function keyIndex(children) {
            var keys = {};
            var free = [];
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var child = children[i];
                if (child.key) {
                    keys[child.key] = i;
                } else {
                    free.push(i);
                }
            }
            return {
                keys: keys,
                free: free
            };
        }
        function appendPatch(apply, patch) {
            if (apply) {
                if (isArray(apply)) {
                    apply.push(patch);
                } else {
                    apply = [ apply, patch ];
                }
                return apply;
            } else {
                return patch;
            }
        }
    }, {
        "../vnode/handle-thunk": 168,
        "../vnode/is-thunk": 169,
        "../vnode/is-vnode": 171,
        "../vnode/is-vtext": 172,
        "../vnode/is-widget": 173,
        "../vnode/vpatch": 176,
        "./diff-props": 178,
        "x-is-array": 156
    } ],
    180: [ function(require, module, exports) {
        var events = require("./events");
        function Content() {
            if (!(this instanceof Content)) {
                return new Content();
            }
            this.id = -1;
            this.title = "";
            this._title = "";
            this.keywords = [];
            this.references = [];
            this.icon = "";
            this.text = "";
            this.overview = "";
            this.policy = "";
            this.training = "";
            this.resources = "";
            this.tools = "";
            this.contributions = "";
            this.section = "";
            this.program = "";
            this.page = "";
            this.rabbitHole = "";
            this.type = "Overview";
            this._type = "overview";
            this.modified = new Date();
            this.listItemType = "";
            this.timestamp = null;
            this.level = -1;
        }
        Content.prototype.set = function(data) {
            var name;
            for (name in data) {
                if (this.hasOwnProperty(name)) {
                    if (typeof data[name] === "string") {
                        this[name] = data[name].trim();
                    } else {
                        this[name] = data[name];
                    }
                }
            }
            return this;
        };
        Content.prototype.savePage = function(self) {
            this.set({
                text: this.text.trim(),
                keywords: this.keywords,
                modified: Date && Date.now() || new Date()
            });
            this[this._type] = this.text;
            var data = {
                __metadata: {
                    type: this.listItemType
                },
                Title: this.title,
                Overview: this.overview,
                Policy: this.policy,
                Training: this.training,
                Resources: this.resources,
                Tools: this.tools,
                Contributions: this.contributions
            };
            self.className += " loading";
            var el = self.children[0];
            events.emit("content.save", data, this.id, el);
        };
        module.exports = Content;
    }, {
        "./events": 183
    } ],
    181: [ function(require, module, exports) {
        var pages = require("./pages"), events = require("./events"), DOM = require("./dom"), reqwest = require("reqwest"), sweetAlert = require("sweetalert"), misc = require("./helpers"), inTransition = misc.inTransition, clicked = misc.clicked, reduce = require("lodash/collection/reduce");
        function init() {
            events.emit("page.init");
        }
        events.on("page.init", function() {
            reqwest({
                url: baseURL + phOptionsURI,
                method: "GET",
                type: "json",
                contentType: "application/json",
                withCredentials: phLive,
                headers: {
                    Accept: "application/json;odata=verbose",
                    "text-Type": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose"
                },
                success: function(data) {
                    var options = reduce(data.d.results, function(setup, option) {
                        setup[option.Variable] = option.Value;
                        return setup;
                    }, {});
                    pages.set({
                        options: options
                    });
                },
                error: function(error) {
                    console.log("Error loading settings, will go with defaults.  Error: ", error);
                    console.log("pages.options: ", pages.options);
                },
                complete: function() {
                    events.emit("page.loading");
                }
            });
        });
        events.on("page.loading", function() {
            var timestamp = Date && Date.now() || new Date();
            clicked = parseInt(timestamp, 10);
            reqwest({
                url: sitePath + "/items/?$select=ID,Title,Icon,Section,Program,Page,rabbitHole,Keywords,References,Link,Created,Modified",
                method: "GET",
                type: "json",
                contentType: "application/json",
                withCredentials: phLive,
                headers: {
                    Accept: "application/json;odata=verbose",
                    "text-Type": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose"
                },
                success: function(data) {
                    if (clicked !== parseInt(timestamp, 10)) {
                        return false;
                    }
                    pages.init(data);
                    events.emit("page.loaded");
                    events.emit("page.success");
                    if (pages.options.hideEmptyTabs === true && pages.options.emptyTabsNotify === true && misc.codeMirror) {
                        sweetAlert({
                            title: "Tabs missing?",
                            text: misc.md.render("Only tabs with content in them are visible.  To view all tabs, simply click `Show editor`.\n\n Adjust this behavior through the [Options list](/kj/kx7/PublicHealth/Lists/Options)"),
                            type: "info",
                            html: true,
                            showCancelButton: false,
                            confirmButtonText: "Got it!"
                        });
                    }
                },
                error: function(error) {
                    console.log("error connecting:", error);
                }
            });
        });
        events.on("content.loading", function(path) {
            if (!pages[path]) {
                events.emit("missing", path);
                return false;
            }
            if (inTransition.output) {
                return false;
            }
            inTransition.output = true;
            DOM.output.innerHTML = "<div class='loading'><div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div></div>";
            var timestamp = Date && Date.now() || new Date();
            clicked = parseInt(timestamp, 10);
            reqwest({
                url: sitePath + "/items(" + pages[path].ID + ")",
                method: "GET",
                type: "json",
                contentType: "application/json",
                withCredentials: phLive,
                headers: {
                    Accept: "application/json;odata=verbose",
                    "text-Type": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose"
                },
                success: function(data) {
                    if (clicked !== parseInt(timestamp, 10)) {
                        return false;
                    }
                    events.emit("content.loaded", data);
                },
                error: function(error) {
                    console.log("error connecting:", error);
                }
            });
        });
        events.on("content.create", function(data, path, title) {
            reqwest({
                url: baseURL + phContext + "/_api/contextinfo",
                method: "POST",
                withCredentials: phLive,
                headers: {
                    Accept: "application/json;odata=verbose",
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                },
                success: function(ctx) {
                    reqwest({
                        url: sitePath + "/items",
                        method: "POST",
                        data: JSON.stringify(data),
                        type: "json",
                        contentType: "application/json",
                        withCredentials: phLive,
                        headers: {
                            Accept: "application/json;odata=verbose",
                            "text-Type": "application/json;odata=verbose",
                            "Content-Type": "application/json;odata=verbose",
                            "X-RequestDigest": ctx.d.GetContextWebInformation.FormDigestValue
                        },
                        success: function() {
                            sweetAlert({
                                title: "Success!",
                                text: misc.md.render(title + " was created at [" + path + "](#" + path + ")"),
                                type: "success",
                                showConfirmButton: false,
                                showCancelButton: false,
                                html: true
                            });
                        },
                        error: function(error) {
                            sweetAlert({
                                title: "Failure",
                                text: misc.md.render(title + " **was not** created at *" + path + "*"),
                                type: "fail",
                                showCancelButton: false,
                                html: true
                            });
                            console.log(error);
                        }
                    });
                },
                error: function(error) {
                    sweetAlert({
                        title: "Failure",
                        text: misc.md.render(title + " **was not** created at *" + path + "*"),
                        type: "fail",
                        showCancelButton: false,
                        html: true
                    });
                    console.log("Error getting new digest: ", error);
                }
            });
        });
        events.on("content.save", function(data, id, btnText) {
            btnText.removeAttribute("style");
            btnText.innerHTML = "...saving...";
            if (inTransition.tempSaveText) {
                clearTimeout(inTransition.tempSaveText);
            }
            reqwest({
                url: baseURL + phContext + "/_api/contextinfo",
                method: "POST",
                withCredentials: phLive,
                headers: {
                    Accept: "application/json;odata=verbose",
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                },
                success: function(ctx) {
                    reqwest({
                        url: sitePath + "/items(" + id + ")",
                        method: "POST",
                        data: JSON.stringify(data),
                        type: "json",
                        withCredentials: phLive,
                        headers: {
                            "X-HTTP-Method": "MERGE",
                            Accept: "application/json;odata=verbose",
                            "text-Type": "application/json;odata=verbose",
                            "Content-Type": "application/json;odata=verbose",
                            "X-RequestDigest": ctx.d.GetContextWebInformation.FormDigestValue,
                            "IF-MATCH": "*"
                        },
                        success: function() {
                            btnText.parentNode.className = btnText.parentNode.className.replace(/ ?loading/gi, "");
                            btnText.style.fontWeight = "bold";
                            btnText.innerHTML = "Saved!";
                        },
                        error: function(error) {
                            btnText.parentNode.className = btnText.parentNode.className.replace(/ ?loading/gi, "");
                            btnText.style.color = "#FF2222";
                            btnText.style.fontWeight = "bold";
                            btnText.innerHTML = "Connection error (press F12 for Console)";
                            console["error" || "log"]("Couldn't save due to error: ", error.response);
                        },
                        complete: function() {
                            inTransition.tempSaveText = setTimeout(function() {
                                btnText.removeAttribute("style");
                                btnText.innerHTML = "Save";
                                inTransition.tempSaveText = null;
                            }, 1500);
                        }
                    });
                },
                error: function(error) {
                    btnText.parentNode.className = btnText.parentNode.className.replace(/ ?loading/gi, "");
                    btnText.style.color = "#FF2222";
                    btnText.style.fontWeight = "bold";
                    btnText.innerHTML = "Digest error (press F12 for Console)";
                    console["error" || "log"]("Couldn't save due to error retrieving new digest: ", error.response);
                    console.log("Error getting new digest: ", error);
                },
                complete: function() {
                    inTransition.tempSaveText = setTimeout(function() {
                        btnText.removeAttribute("style");
                        btnText.innerHTML = "Save";
                        inTransition.tempSaveText = null;
                    }, 1500);
                }
            });
        });
        module.exports = init;
    }, {
        "./dom": 182,
        "./events": 183,
        "./helpers": 184,
        "./pages": 188,
        "lodash/collection/reduce": 28,
        reqwest: 145,
        sweetalert: 146
    } ],
    182: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), diff = require("virtual-dom/diff"), patch = require("virtual-dom/patch"), createElement = require("virtual-dom/create-element"), misc = require("./helpers"), codeMirror = misc.codeMirror, pages = require("./pages"), events = require("./events"), renderPage = require("./page"), renderNav = require("./nav"), renderTabs = require("./tabs");
        function DOM() {
            if (!(this instanceof DOM)) {
                return new DOM();
            }
            this.state = {
                fullPage: true,
                cheatSheet: false,
                addingContent: false,
                level: 0
            };
        }
        DOM.prototype.set = function(data) {
            var name;
            for (name in data) {
                if (this.hasOwnProperty(name)) {
                    if (name !== "state") {
                        this[name] = data[name];
                    } else {
                        var opt;
                        for (opt in data.state) {
                            if (this.state.hasOwnProperty(opt)) {
                                this.state[opt] = data.state[opt];
                            }
                        }
                        this.loadContent();
                    }
                }
            }
            return this;
        };
        DOM.prototype.preRender = function() {
            this.navDOM = renderNav();
            this.tabsDOM = this.state.addingContent === false || !misc.inTransition.output ? renderTabs() : null;
            return renderPage(this.navDOM, this.tabsDOM, this);
        };
        DOM.prototype.init = function() {
            var wrapper = phWrapper || document.getElementById("wrapper") || document.getElementById("ph-wrapper");
            this.dirtyDOM = this.preRender();
            this.rootNode = createElement(this.dirtyDOM);
            wrapper.parentNode.replaceChild(this.rootNode, wrapper);
            this.searchInput = document.getElementById("ph-search");
            this.content = document.getElementById("ph-content");
            this.title = document.getElementById("ph-title");
            this.cheatSheet = document.getElementById("cheatSheet");
            this.textarea = document.getElementById("ph-textarea");
            this.output = document.getElementById("ph-output");
            this.reset();
        };
        DOM.prototype.loadContent = function() {
            if (this.state.fullPage && !pages.current[pages.current._type]) {
                events.emit("tab.change", "Overview");
            }
            var refreshDOM = this.preRender();
            var patches = diff(this.dirtyDOM, refreshDOM);
            this.rootNode = patch(this.rootNode, patches);
            this.dirtyDOM = refreshDOM;
            if (codeMirror) {
                this.reset();
                if (!this.state.fullPage) {
                    this.initEditor();
                }
            }
        };
        DOM.prototype.reset = function() {
            if (this.editor) {
                var wrap = this.editor.getWrapperElement();
                wrap.parentNode.removeChild(wrap);
            }
            this.editor = null;
        };
        DOM.prototype.initEditor = function() {
            var self = this;
            this.editor = codeMirror.fromTextArea(this.textarea, {
                mode: "gfm",
                matchBrackets: true,
                lineNumbers: false,
                lineWrapping: true,
                lineSeparator: "\n",
                theme: phEditorTheme,
                extraKeys: {
                    Enter: "newlineAndIndentContinueMarkdownList",
                    "Ctrl-S": function() {
                        var saveButton = document.getElementById("ph-save");
                        if (!misc.inTransition.tempSaveText) pages.current.savePage(saveButton);
                    }
                }
            });
            this.editor.on("change", function(e) {
                var val = e.getValue();
                self.renderOut(val, pages.current.type);
                pages.current.set({
                    text: val
                });
            });
            this.editor.refresh();
        };
        DOM.prototype.renderOut = function(text, type) {
            var regLink = /<a (href="https?:\/\/)/gi;
            type = pages.current.level > 1 ? "## " + type + "\n" : "";
            this.output.innerHTML = misc.md.render(type + text).replace(regLink, "<a target='_blank' $1");
        };
        var dom = new DOM();
        module.exports = dom;
    }, {
        "./events": 183,
        "./helpers": 184,
        "./nav": 186,
        "./page": 187,
        "./pages": 188,
        "./tabs": 189,
        "virtual-dom/create-element": 147,
        "virtual-dom/diff": 148,
        "virtual-dom/h": 149,
        "virtual-dom/patch": 157
    } ],
    183: [ function(require, module, exports) {
        var Events = require("eventemitter2").EventEmitter2, events = new Events({
            wildcard: true
        });
        module.exports = events;
    }, {
        eventemitter2: 2
    } ],
    184: [ function(require, module, exports) {
        function addEvent(evt, element, fnc) {
            return element.addEventListener ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc);
        }
        function removeEvent(evt, element, fnc) {
            return element.removeEventListener ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc);
        }
        var markdownit = require("markdown-it"), md = markdownit({
            typographer: true,
            linkify: true,
            breaks: true,
            xhtmlOut: true,
            quotes: "“”‘’"
        }), inTransition = {
            output: false,
            tempSaveText: null,
            tab: false
        }, clicked = -1, codeMirror;
        try {
            codeMirror = CodeMirror;
        } catch (e) {
            codeMirror = null;
        }
        module.exports = {
            addEvent: addEvent,
            removeEvent: removeEvent,
            md: md,
            inTransition: inTransition,
            clicked: clicked,
            codeMirror: codeMirror
        };
    }, {
        "markdown-it": 78
    } ],
    185: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), diff = require("virtual-dom/diff"), patch = require("virtual-dom/patch"), reqwest = require("reqwest"), sweetAlert = require("sweetalert"), horsey = require("horsey"), Router = require("director/build/director").Router, misc = require("./helpers"), inTransition = misc.inTransition, codeMirror = misc.codeMirror, pages = require("./pages"), events = require("./events"), DOM = require("./dom"), pageInit = require("./data"), router = Router({
            "/": {
                on: function() {
                    events.emit("content.loading", "/");
                }
            },
            "/new": {
                on: function() {
                    events.emit("content.adding");
                }
            },
            "/(\\w+)": {
                on: function(section) {
                    events.emit("content.loading", "/" + section.replace(/\s/g, ""));
                },
                "/(\\w+)": {
                    on: function(section, program) {
                        events.emit("content.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, ""));
                    },
                    "/(\\w+)": {
                        on: function(section, program, page) {
                            events.emit("content.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, ""));
                        },
                        "/(\\w+)": {
                            on: function(section, program, page, rabbitHole) {
                                events.emit("content.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, "") + "/" + rabbitHole.replace(/\s/g, ""));
                            }
                        }
                    }
                }
            }
        }).configure({
            strict: false,
            after: resetPage,
            notfound: function() {
                sweetAlert({
                    title: "Oops",
                    text: "Page doesn't exist.  Sorry :(\n\nI'll redirect you to the homepage instead.",
                    timer: 2e3,
                    showConfirmButton: false,
                    showCancelButton: false,
                    allowOutsideClick: true
                }, function() {
                    router.setRoute("/");
                });
            }
        });
        sweetAlert.setDefaults({
            allowOutsideClick: true,
            showCancelButton: true,
            cancelButtonText: "No",
            confirmButtonText: "Yes!"
        });
        events.on("page.success", function() {
            DOM.init();
            if (window.location.hash) {
                router.init();
            } else {
                router.init("/");
            }
            horsey(DOM.searchInput, {
                suggestions: pages.titles,
                autoHideOnBlur: false,
                limit: 8,
                getValue: function(item) {
                    return item.value;
                },
                getText: function(item) {
                    return item.text;
                },
                set: function(item) {
                    router.setRoute(item);
                    DOM.searchInput.value = "";
                    return false;
                },
                render: function(li, item) {
                    li.innerText = li.textContent = item.renderText;
                }
            });
        });
        events.on("missing", function(path) {
            sweetAlert({
                title: "Uh oh",
                text: path + " doesn't seem to match any of our pages.  Try the search!  For now I'll just load the homepage for you.",
                confirmButtonText: "OK!",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCancelButton: false
            }, function() {
                router.setRoute("/");
            });
        });
        events.on("content.loaded", function(data) {
            var obj = data.d;
            if (!obj) {
                router.setRoute("/");
                return false;
            }
            if (obj.Link) {
                sweetAlert({
                    title: "See ya!",
                    text: "You are now leaving the Public Health Kx.  Bye!",
                    type: "warning",
                    cancelButtonText: "Nah I'll stay",
                    confirmButtonText: "Go!",
                    closeOnConfirm: false,
                    showCancelButton: true,
                    showLoaderOnConfirm: true
                }, function() {
                    window.open(obj.Link, "_blank");
                    return false;
                });
            }
            pages.current.set({
                id: obj.ID,
                title: obj.Title || "",
                _title: obj.Title || "",
                keywords: obj.Keywords && obj.Keywords.results || [],
                references: obj.References && obj.References.results || [],
                icon: obj.Icon || "",
                text: obj.Overview || "",
                overview: obj.Overview || "",
                policy: obj.Policy || "",
                training: obj.Training || "",
                resources: obj.Resources || "",
                tools: obj.Tools || "",
                contributions: obj.Contributions || "",
                section: obj.Section || "",
                program: obj.Program || "",
                page: obj.Page || "",
                rabbitHole: obj.rabbitHole || "",
                type: "Overview",
                _type: "overview",
                modified: new Date(obj.Modified || obj.Created),
                listItemType: obj.__metadata.type,
                timestamp: Date && Date.now() || new Date(),
                level: Number(Boolean(obj.Section)) + Number(Boolean(obj.Program)) + Number(Boolean(obj.Page)) + Number(Boolean(obj.rabbitHole)) || 0
            });
            DOM.loadContent();
            DOM.renderOut(pages.current.text, pages.current.type);
            inTransition.output = null;
            document.title = pages.current.title;
        });
        events.on("tab.change", function(page) {
            var content = {};
            content[pages.current._type] = pages.current.text;
            content.type = page;
            content._type = page.replace(/\s/g, "").toLowerCase().trim();
            content.text = pages.current[content._type];
            pages.current.set(content);
            if (codeMirror) {
                DOM.loadContent();
            }
            DOM.renderOut(content.text, content.type);
        });
        events.on("content.adding", function() {
            DOM.set({
                state: {
                    addingContent: true
                }
            });
            document.querySelector(".ph-btn.ph-create").className += " active";
        });
        function resetPage() {
            DOM.set({
                state: {
                    addingContent: false
                }
            });
        }
        pageInit();
    }, {
        "./data": 181,
        "./dom": 182,
        "./events": 183,
        "./helpers": 184,
        "./pages": 188,
        "director/build/director": 1,
        horsey: 5,
        reqwest: 145,
        sweetalert: 146,
        "virtual-dom/diff": 148,
        "virtual-dom/h": 149,
        "virtual-dom/patch": 157
    } ],
    186: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), codeMirror = require("./helpers").codeMirror, map = require("lodash/collection/map"), pages = require("./pages"), events = require("./events"), hashArray, level, a;
        function renderLink(link) {
            var c = link.href.indexOf(a), attr = {
                style: {}
            };
            if (link.level > 2 && (c < 0 || level < 2)) {
                attr.style = {
                    display: "none"
                };
            }
            return h("li#ph-link-" + link.id + link.className, attr, [ h("a.ph-level-" + link.level + (link.href === window.location.hash ? ".active" : ""), {
                href: link.href,
                target: link.href.charAt(0) !== "#" ? "_blank" : ""
            }, [ !link.icon ? null : h("i.icon.icon-" + link.icon), h("span.link-title", [ String(link.title) ]), h("span.place") ]) ]);
        }
        function renderSection(section) {
            var links = [], i = 0, count = section.links.length;
            for (;i < count; ++i) {
                links[i] = renderLink(section.links[i]);
            }
            return h("li.ph-section.link", [ h("p", [ h("a" + ("#" + section.path === window.location.hash ? ".active" : ""), {
                href: "#" + section.path
            }, [ h("span.link-title", [ String(section.title) ]) ]) ]), h("ul", links) ]);
        }
        function renderNav() {
            var links = [], name;
            hashArray = window.location.hash.slice(1).split(/\//g);
            level = hashArray.length - 1;
            a = hashArray.slice(0, 3).join("/");
            for (name in pages.sections) {
                if (pages.sections.hasOwnProperty(name)) {
                    links.push(renderSection(pages.sections[name]));
                }
            }
            if (codeMirror) {
                links.unshift(h("a.ph-btn.ph-create.loading", {
                    href: "#/new",
                    title: "New section",
                    onclick: function(event) {
                        event = event || window.event;
                        if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
                        events.emit("content.adding");
                        return false;
                    }
                }, [ h("span.btn-title", [ "Add content" ]) ]));
            }
            return h("#ph-nav", [ h(".header", [ h("a" + (window.location.hash === "#/" ? ".active" : ""), {
                href: "#/"
            }, [ h(".logo", [ h("img", {
                src: pages.options.images + "/phLogo64.png",
                alt: "Public Health Home",
                height: "64",
                width: "64"
            }) ]), h("p.text", [ "Public Health", h("br"), h("small", [ "US Air Force" ]) ]) ]) ]), h("#ph-site-pages", [ h("div", [ h("a.site-page", {
                href: "#/leaders"
            }, [ "Leaders" ]), h("a.site-page", {
                href: "#/news"
            }, [ "News" ]), h("a.site-page", {
                href: "#/contact"
            }, [ "Address Book" ]) ]) ]), h("ul.nav", links) ]);
        }
        module.exports = renderNav;
    }, {
        "./events": 183,
        "./helpers": 184,
        "./pages": 188,
        "lodash/collection/map": 26,
        "virtual-dom/h": 149
    } ],
    187: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), pages = require("./pages"), events = require("./events"), misc = require("./helpers"), inTransition = misc.inTransition;
        function renderLoader() {
            return h("#ph-loader.loader-group", [ h(".bigSqr", [ h(".square.first"), h(".square.second"), h(".square.third"), h(".square.fourth") ]), h(".text", [ "loading..." ]) ]);
        }
        function renderAddContent() {
            return h("#ph-content.fullPage.adding-content", [ h("fieldset", [ h("legend", [ "Many things to be added soon" ]), h("label", [ "Title", h("input.ph-title-input", {
                oninput: function(e) {
                    return e;
                }
            }) ]), h("label", [ "Name", h("input.ph-name-input", {
                oninput: function(e) {
                    return e;
                }
            }) ]), h("label", [ "Path", h("input.ph-path-input", {
                oninput: function(e) {
                    return e;
                }
            }) ]) ]) ]);
        }
        function renderEditor(tabsDOM, DOM) {
            return h("#ph-content" + (DOM.state.fullPage ? ".fullPage" : ""), [ h("a.ph-toggle-editor", {
                href: "#",
                role: "button",
                onclick: function(event) {
                    event = event || window.event;
                    if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
                    DOM.set({
                        state: {
                            fullPage: !DOM.state.fullPage
                        }
                    });
                }
            }, [ DOM.state.fullPage ? "Show editor" : "Hide editor" ]), h("h1#ph-title" + (misc.codeMirror ? ".ph-cm" : ""), {
                contentEditable: misc.codeMirror ? true : false,
                oninput: function(e) {
                    if (e.keyCode === 13 || e.keyCode === 27) {
                        this.blur();
                        return false;
                    }
                },
                onblur: function() {
                    var title = this.textContent || this.innerText;
                    title = title.trim();
                    pages.current.set({
                        title: title
                    });
                    if (title !== pages.current._title) {
                        this.style.transition = "border .05s ease-out";
                        this.style.borderBottomColor = "#00B16A";
                    } else {
                        this.removeAttribute("style");
                    }
                }
            }, [ String(pages.current.title || "") ]), tabsDOM, h("#ph-buttons", [ h("a#ph-save.ph-edit-btn.ph-save", {
                href: "#",
                title: "Save",
                onclick: function(event) {
                    event = event || window.event;
                    if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
                    if (!inTransition.tempSaveText) pages.current.savePage(this);
                }
            }, [ h("i.icon.icon-diskette", [ "Save" ]) ]), h("a.ph-edit-btn.ph-cheatsheet", {
                href: "#",
                onclick: function(event) {
                    event = event || window.event;
                    if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
                    DOM.set({
                        state: {
                            cheatSheet: !DOM.state.cheatSheet
                        }
                    });
                    return false;
                }
            }, [ h("i.icon.icon-pen", [ "Markdown help" ]) ]) ]), h("div#cheatSheet", !DOM.state.cheatSheet ? {
                style: {
                    display: "none"
                }
            } : null, [ "This will be a cheat-sheet for markdown.  For now, go to one of these two sites for help:", h("p", [ h("a", {
                target: "_blank",
                href: "http://jbt.github.io/markdown-editor"
            }, [ "http://jbt.github.io/markdown-editor" ]) ]), h("p", [ h("a", {
                target: "_blank",
                href: "http://stackedit.io"
            }, [ "http://stackedit.io" ]) ]) ]), h("#ph-contentWrap", [ h("#ph-input", [ h("textarea#ph-textarea", [ String(pages.current.text || "") ]) ]), h("#ph-output"), h(".clearfix"), h("small.ph-modified-date", [ "Last updated: " + pages.current.modified.toLocaleDateString() ]) ]) ]);
        }
        function renderDefault(tabsDOM) {
            return h("#ph-content.fullPage", [ h("h1#ph-title", [ String(pages.current.title || "") ]), tabsDOM, h("#ph-contentWrap", [ h("#ph-output") ]) ]);
        }
        function renderPage(navDOM, tabsDOM, DOM) {
            return h("#ph-wrapper", [ h("#ph-search-wrap", [ h("label", [ h("input#ph-search", {
                type: "text",
                name: "ph-search",
                placeholder: pages.options.searchPlaceholder
            }) ]) ]), h("#ph-side-nav", [ navDOM ]), misc.codeMirror ? DOM.state.addingContent ? renderAddContent() : renderEditor(tabsDOM, DOM) : renderDefault(tabsDOM) ]);
        }
        module.exports = renderPage;
    }, {
        "./events": 183,
        "./helpers": 184,
        "./pages": 188,
        "virtual-dom/h": 149
    } ],
    188: [ function(require, module, exports) {
        var events = require("./events"), Content = require("./content"), pluck = require("lodash/collection/pluck");
        function Pages() {
            if (!(this instanceof Pages)) {
                return new Pages();
            }
            this.current = new Content();
            this.options = {
                hideEmptyTabs: true,
                searchPlaceholder: "Search using keywords, AFIs or titles...",
                emptyTabsNotify: false,
                images: "/kj/kx7/PublicHealth/SiteAssets/Images"
            };
        }
        Pages.prototype.set = function(data) {
            var name;
            for (name in data) {
                if (this.hasOwnProperty(name)) {
                    if (name !== "options") {
                        this[name] = data[name];
                    } else {
                        var opt;
                        for (opt in data.options) {
                            if (this.options.hasOwnProperty(opt)) {
                                this.options[opt] = data.options[opt] === "yes" ? true : data.options[opt] === "no" ? false : data.options[opt];
                            }
                        }
                    }
                }
            }
            return this;
        };
        Pages.prototype.init = function(data) {
            var urls = [], i = 0, count = data.d.results.length, result, parents = {}, subParents = {};
            this.sections = {};
            for (;i < count; ++i) {
                result = data.d.results[i];
                result.Section = result.Section ? result.Section.replace(/\s/g, "") : "";
                result.Program = result.Program ? result.Program.replace(/\s/g, "") : "";
                result.Page = result.Page ? result.Page.replace(/\s/g, "") : "";
                result.rabbitHole = result.rabbitHole ? result.rabbitHole.replace(/\s/g, "") : "";
                result.Path = "/" + (result.Section !== "" ? result.Section + (result.Program !== "" ? "/" + result.Program + (result.Page !== "" ? "/" + result.Page + (result.rabbitHole !== "" ? "/" + result.rabbitHole : "") : "") : "") : "");
                result.Level = result.Path.split("/").length - 1;
                this[result.Path] = result;
                urls[i] = result.Path;
                if (result.Section !== "" && result.Program === "") {
                    this.sections[result.Section] = {
                        path: !result.Link ? "/" + result.Section : result.Link,
                        title: result.Title,
                        id: result.ID,
                        links: []
                    };
                }
                if (result.rabbitHole !== "") {
                    subParents["/" + result.Section + "/" + result.Program + "/" + result.Page] = ".ph-sub-parent.ph-page.link";
                } else if (result.Page !== "") {
                    parents["/" + result.Section + "/" + result.Program] = ".ph-parent.ph-program.link";
                }
            }
            urls.sort();
            i = 0;
            this.titles = [];
            for (;i < count; ++i) {
                var page = this[urls[i]], isPage = false, className, name = page.rabbitHole || page.Page || page.Program, keywords = page.Keywords && page.Keywords.results || [], references = page.References && page.References.results || [];
                this.titles[i] = {
                    text: page.Title + " " + pluck(keywords, "Label").join(" ") + pluck(references, "Label").join(" "),
                    value: page.Path,
                    renderText: page.Title
                };
                if (page.rabbitHole !== "") {
                    isPage = true;
                    className = ".ph-rabbit-hole.link";
                } else if (page.Page !== "") {
                    isPage = true;
                    className = subParents[page.Path] || ".ph-page.link";
                } else if (page.Program !== "") {
                    className = parents[page.Path] || ".ph-program.link";
                }
                if (page.Program !== "") {
                    this.sections[page.Section].links.push({
                        path: page.Path,
                        href: !page.Link ? "#" + page.Path : page.Link,
                        title: page.Title,
                        level: page.Level,
                        className: className,
                        name: name,
                        id: page.ID,
                        icon: page.Icon || ""
                    });
                }
            }
        };
        Pages.prototype.createContent = function(path, title, newName) {
            var regNormalize = /[^a-zA-Z0-9_-]/g, self = this, title = "Blamo";
            var firstTry = title.replace(regNormalize, "");
            path += "/" + newName.replace(regNormalize, "");
            var pathArray = path.slice(1).split("/");
            var data = {
                __metadata: {
                    type: self.current.listItemType
                },
                Title: title,
                Overview: "### New Page :)\n#### Joy",
                Section: pathArray.shift() || "",
                Program: pathArray.shift() || "",
                Page: pathArray.shift() || "",
                rabbitHole: pathArray.shift() || ""
            };
            events.emit("content.create", data, path, title);
        };
        var pages = new Pages();
        module.exports = pages;
    }, {
        "./content": 180,
        "./events": 183,
        "lodash/collection/pluck": 27
    } ],
    189: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), pages = require("./pages"), events = require("./events"), map = require("lodash/collection/map"), tabs = [ {
            title: "Overview",
            icon: "home"
        }, {
            title: "Policy",
            icon: "notebook"
        }, {
            title: "Training",
            icon: "display1"
        }, {
            title: "Resources",
            icon: "cloud-upload"
        }, {
            title: "Tools",
            icon: "tools"
        }, {
            title: "Contributions",
            icon: "users"
        } ];
        function renderTabs() {
            var style = pages.current.program !== "" ? null : {
                style: {
                    display: "none"
                }
            }, group = map(tabs, function(tab) {
                var tabName = tab.title.replace(/\s/g, "").toLowerCase().trim();
                var className = ".tab-" + tabName + (pages.options.hideEmptyTabs === true && pages.current[tabName].length < 1 ? ".tab-empty" : "") + (pages.current._type === tabName ? ".tab-current" : "");
                return h("li" + className, [ h("div.ph-tab-box", [ h("a.icon.icon-" + tab.icon, {
                    href: "#",
                    onclick: function(e) {
                        e = e || window.event;
                        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
                        events.emit("tab.change", tab.title);
                        return false;
                    }
                }, [ h("span", [ String(tab.title) ]) ]) ]) ]);
            });
            return h("#ph-tabs.ph-tabs.ph-tabs-style-iconbox", [ h("nav", [ h("ul", style, group) ]) ]);
        }
        module.exports = renderTabs;
    }, {
        "./events": 183,
        "./pages": 188,
        "lodash/collection/map": 26,
        "virtual-dom/h": 149
    } ]
}, {}, [ 185 ]);