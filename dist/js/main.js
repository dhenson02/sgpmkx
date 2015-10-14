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
        bullseye: 5,
        crossvent: 20,
        fuzzysearch: 22,
        sell: 23
    } ],
    5: [ function(require, module, exports) {
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
        "./tailormade": 17,
        "./throttle": 18,
        crossvent: 7
    } ],
    6: [ function(require, module, exports) {
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
    7: [ function(require, module, exports) {
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
        "./eventmap": 8,
        "custom-event": 6
    } ],
    8: [ function(require, module, exports) {
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
    9: [ function(require, module, exports) {
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
        "./getSelectionNullOp": 10,
        "./getSelectionRaw": 11,
        "./getSelectionSynthetic": 12,
        "./isHost": 13
    } ],
    10: [ function(require, module, exports) {
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
    11: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            function getSelectionRaw() {
                return global.getSelection();
            }
            module.exports = getSelectionRaw;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    12: [ function(require, module, exports) {
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
        "./rangeToTextRange": 14
    } ],
    13: [ function(require, module, exports) {
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
    14: [ function(require, module, exports) {
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
    15: [ function(require, module, exports) {
        "use strict";
        var getSelection = require("./getSelection");
        var setSelection = require("./setSelection");
        module.exports = {
            get: getSelection,
            set: setSelection
        };
    }, {
        "./getSelection": 9,
        "./setSelection": 16
    } ],
    16: [ function(require, module, exports) {
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
        "./getSelection": 9,
        "./rangeToTextRange": 14
    } ],
    17: [ function(require, module, exports) {
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
        "./throttle": 18,
        crossvent: 7,
        seleccion: 15,
        sell: 23
    } ],
    18: [ function(require, module, exports) {
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
    19: [ function(require, module, exports) {
        arguments[4][6][0].apply(exports, arguments);
    }, {
        dup: 6
    } ],
    20: [ function(require, module, exports) {
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
        "./eventmap": 21,
        "custom-event": 19
    } ],
    21: [ function(require, module, exports) {
        arguments[4][8][0].apply(exports, arguments);
    }, {
        dup: 8
    } ],
    22: [ function(require, module, exports) {
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
    23: [ function(require, module, exports) {
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
    24: [ function(require, module, exports) {
        function last(array) {
            var length = array ? array.length : 0;
            return length ? array[length - 1] : undefined;
        }
        module.exports = last;
    }, {} ],
    25: [ function(require, module, exports) {
        var arrayMap = require("../internal/arrayMap"), baseCallback = require("../internal/baseCallback"), baseMap = require("../internal/baseMap"), isArray = require("../lang/isArray");
        function map(collection, iteratee, thisArg) {
            var func = isArray(collection) ? arrayMap : baseMap;
            iteratee = baseCallback(iteratee, thisArg, 3);
            return func(collection, iteratee);
        }
        module.exports = map;
    }, {
        "../internal/arrayMap": 28,
        "../internal/baseCallback": 31,
        "../internal/baseMap": 39,
        "../lang/isArray": 67
    } ],
    26: [ function(require, module, exports) {
        var map = require("./map"), property = require("../utility/property");
        function pluck(collection, path) {
            return map(collection, property(path));
        }
        module.exports = pluck;
    }, {
        "../utility/property": 76,
        "./map": 25
    } ],
    27: [ function(require, module, exports) {
        var arrayReduce = require("../internal/arrayReduce"), baseEach = require("../internal/baseEach"), createReduce = require("../internal/createReduce");
        var reduce = createReduce(arrayReduce, baseEach);
        module.exports = reduce;
    }, {
        "../internal/arrayReduce": 29,
        "../internal/baseEach": 32,
        "../internal/createReduce": 50
    } ],
    28: [ function(require, module, exports) {
        function arrayMap(array, iteratee) {
            var index = -1, length = array.length, result = Array(length);
            while (++index < length) {
                result[index] = iteratee(array[index], index, array);
            }
            return result;
        }
        module.exports = arrayMap;
    }, {} ],
    29: [ function(require, module, exports) {
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
    30: [ function(require, module, exports) {
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
    31: [ function(require, module, exports) {
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
        "../utility/identity": 75,
        "../utility/property": 76,
        "./baseMatches": 40,
        "./baseMatchesProperty": 41,
        "./bindCallback": 47
    } ],
    32: [ function(require, module, exports) {
        var baseForOwn = require("./baseForOwn"), createBaseEach = require("./createBaseEach");
        var baseEach = createBaseEach(baseForOwn);
        module.exports = baseEach;
    }, {
        "./baseForOwn": 34,
        "./createBaseEach": 48
    } ],
    33: [ function(require, module, exports) {
        var createBaseFor = require("./createBaseFor");
        var baseFor = createBaseFor();
        module.exports = baseFor;
    }, {
        "./createBaseFor": 49
    } ],
    34: [ function(require, module, exports) {
        var baseFor = require("./baseFor"), keys = require("../object/keys");
        function baseForOwn(object, iteratee) {
            return baseFor(object, iteratee, keys);
        }
        module.exports = baseForOwn;
    }, {
        "../object/keys": 72,
        "./baseFor": 33
    } ],
    35: [ function(require, module, exports) {
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
        "./toObject": 64
    } ],
    36: [ function(require, module, exports) {
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
        "../lang/isObject": 70,
        "./baseIsEqualDeep": 37,
        "./isObjectLike": 61
    } ],
    37: [ function(require, module, exports) {
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
        "../lang/isArray": 67,
        "../lang/isTypedArray": 71,
        "./equalArrays": 51,
        "./equalByTag": 52,
        "./equalObjects": 53
    } ],
    38: [ function(require, module, exports) {
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
        "./baseIsEqual": 36,
        "./toObject": 64
    } ],
    39: [ function(require, module, exports) {
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
        "./baseEach": 32,
        "./isArrayLike": 57
    } ],
    40: [ function(require, module, exports) {
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
        "./baseIsMatch": 38,
        "./getMatchData": 55,
        "./toObject": 64
    } ],
    41: [ function(require, module, exports) {
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
        "../array/last": 24,
        "../lang/isArray": 67,
        "./baseGet": 35,
        "./baseIsEqual": 36,
        "./baseSlice": 45,
        "./isKey": 59,
        "./isStrictComparable": 62,
        "./toObject": 64,
        "./toPath": 65
    } ],
    42: [ function(require, module, exports) {
        function baseProperty(key) {
            return function(object) {
                return object == null ? undefined : object[key];
            };
        }
        module.exports = baseProperty;
    }, {} ],
    43: [ function(require, module, exports) {
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
        "./baseGet": 35,
        "./toPath": 65
    } ],
    44: [ function(require, module, exports) {
        function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
            eachFunc(collection, function(value, index, collection) {
                accumulator = initFromCollection ? (initFromCollection = false, value) : iteratee(accumulator, value, index, collection);
            });
            return accumulator;
        }
        module.exports = baseReduce;
    }, {} ],
    45: [ function(require, module, exports) {
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
    46: [ function(require, module, exports) {
        function baseToString(value) {
            return value == null ? "" : value + "";
        }
        module.exports = baseToString;
    }, {} ],
    47: [ function(require, module, exports) {
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
        "../utility/identity": 75
    } ],
    48: [ function(require, module, exports) {
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
        "./getLength": 54,
        "./isLength": 60,
        "./toObject": 64
    } ],
    49: [ function(require, module, exports) {
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
        "./toObject": 64
    } ],
    50: [ function(require, module, exports) {
        var baseCallback = require("./baseCallback"), baseReduce = require("./baseReduce"), isArray = require("../lang/isArray");
        function createReduce(arrayFunc, eachFunc) {
            return function(collection, iteratee, accumulator, thisArg) {
                var initFromArray = arguments.length < 3;
                return typeof iteratee == "function" && thisArg === undefined && isArray(collection) ? arrayFunc(collection, iteratee, accumulator, initFromArray) : baseReduce(collection, baseCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
            };
        }
        module.exports = createReduce;
    }, {
        "../lang/isArray": 67,
        "./baseCallback": 31,
        "./baseReduce": 44
    } ],
    51: [ function(require, module, exports) {
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
        "./arraySome": 30
    } ],
    52: [ function(require, module, exports) {
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
    53: [ function(require, module, exports) {
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
        "../object/keys": 72
    } ],
    54: [ function(require, module, exports) {
        var baseProperty = require("./baseProperty");
        var getLength = baseProperty("length");
        module.exports = getLength;
    }, {
        "./baseProperty": 42
    } ],
    55: [ function(require, module, exports) {
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
        "../object/pairs": 74,
        "./isStrictComparable": 62
    } ],
    56: [ function(require, module, exports) {
        var isNative = require("../lang/isNative");
        function getNative(object, key) {
            var value = object == null ? undefined : object[key];
            return isNative(value) ? value : undefined;
        }
        module.exports = getNative;
    }, {
        "../lang/isNative": 69
    } ],
    57: [ function(require, module, exports) {
        var getLength = require("./getLength"), isLength = require("./isLength");
        function isArrayLike(value) {
            return value != null && isLength(getLength(value));
        }
        module.exports = isArrayLike;
    }, {
        "./getLength": 54,
        "./isLength": 60
    } ],
    58: [ function(require, module, exports) {
        var reIsUint = /^\d+$/;
        var MAX_SAFE_INTEGER = 9007199254740991;
        function isIndex(value, length) {
            value = typeof value == "number" || reIsUint.test(value) ? +value : -1;
            length = length == null ? MAX_SAFE_INTEGER : length;
            return value > -1 && value % 1 == 0 && value < length;
        }
        module.exports = isIndex;
    }, {} ],
    59: [ function(require, module, exports) {
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
        "../lang/isArray": 67,
        "./toObject": 64
    } ],
    60: [ function(require, module, exports) {
        var MAX_SAFE_INTEGER = 9007199254740991;
        function isLength(value) {
            return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
        }
        module.exports = isLength;
    }, {} ],
    61: [ function(require, module, exports) {
        function isObjectLike(value) {
            return !!value && typeof value == "object";
        }
        module.exports = isObjectLike;
    }, {} ],
    62: [ function(require, module, exports) {
        var isObject = require("../lang/isObject");
        function isStrictComparable(value) {
            return value === value && !isObject(value);
        }
        module.exports = isStrictComparable;
    }, {
        "../lang/isObject": 70
    } ],
    63: [ function(require, module, exports) {
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
        "../lang/isArguments": 66,
        "../lang/isArray": 67,
        "../object/keysIn": 73,
        "./isIndex": 58,
        "./isLength": 60
    } ],
    64: [ function(require, module, exports) {
        var isObject = require("../lang/isObject");
        function toObject(value) {
            return isObject(value) ? value : Object(value);
        }
        module.exports = toObject;
    }, {
        "../lang/isObject": 70
    } ],
    65: [ function(require, module, exports) {
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
        "../lang/isArray": 67,
        "./baseToString": 46
    } ],
    66: [ function(require, module, exports) {
        var isArrayLike = require("../internal/isArrayLike"), isObjectLike = require("../internal/isObjectLike");
        var objectProto = Object.prototype;
        var hasOwnProperty = objectProto.hasOwnProperty;
        var propertyIsEnumerable = objectProto.propertyIsEnumerable;
        function isArguments(value) {
            return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
        }
        module.exports = isArguments;
    }, {
        "../internal/isArrayLike": 57,
        "../internal/isObjectLike": 61
    } ],
    67: [ function(require, module, exports) {
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
        "../internal/getNative": 56,
        "../internal/isLength": 60,
        "../internal/isObjectLike": 61
    } ],
    68: [ function(require, module, exports) {
        var isObject = require("./isObject");
        var funcTag = "[object Function]";
        var objectProto = Object.prototype;
        var objToString = objectProto.toString;
        function isFunction(value) {
            return isObject(value) && objToString.call(value) == funcTag;
        }
        module.exports = isFunction;
    }, {
        "./isObject": 70
    } ],
    69: [ function(require, module, exports) {
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
        "../internal/isObjectLike": 61,
        "./isFunction": 68
    } ],
    70: [ function(require, module, exports) {
        function isObject(value) {
            var type = typeof value;
            return !!value && (type == "object" || type == "function");
        }
        module.exports = isObject;
    }, {} ],
    71: [ function(require, module, exports) {
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
        "../internal/isLength": 60,
        "../internal/isObjectLike": 61
    } ],
    72: [ function(require, module, exports) {
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
        "../internal/getNative": 56,
        "../internal/isArrayLike": 57,
        "../internal/shimKeys": 63,
        "../lang/isObject": 70
    } ],
    73: [ function(require, module, exports) {
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
        "../internal/isIndex": 58,
        "../internal/isLength": 60,
        "../lang/isArguments": 66,
        "../lang/isArray": 67,
        "../lang/isObject": 70
    } ],
    74: [ function(require, module, exports) {
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
        "../internal/toObject": 64,
        "./keys": 72
    } ],
    75: [ function(require, module, exports) {
        function identity(value) {
            return value;
        }
        module.exports = identity;
    }, {} ],
    76: [ function(require, module, exports) {
        var baseProperty = require("../internal/baseProperty"), basePropertyDeep = require("../internal/basePropertyDeep"), isKey = require("../internal/isKey");
        function property(path) {
            return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
        }
        module.exports = property;
    }, {
        "../internal/baseProperty": 42,
        "../internal/basePropertyDeep": 43,
        "../internal/isKey": 59
    } ],
    77: [ function(require, module, exports) {
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
    78: [ function(require, module, exports) {
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
    79: [ function(require, module, exports) {
        var createElement = require("./vdom/create-element.js");
        module.exports = createElement;
    }, {
        "./vdom/create-element.js": 91
    } ],
    80: [ function(require, module, exports) {
        var diff = require("./vtree/diff.js");
        module.exports = diff;
    }, {
        "./vtree/diff.js": 111
    } ],
    81: [ function(require, module, exports) {
        var h = require("./virtual-hyperscript/index.js");
        module.exports = h;
    }, {
        "./virtual-hyperscript/index.js": 98
    } ],
    82: [ function(require, module, exports) {
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
    83: [ function(require, module, exports) {
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
        "individual/one-version": 85
    } ],
    84: [ function(require, module, exports) {
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
    85: [ function(require, module, exports) {
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
        "./index.js": 84
    } ],
    86: [ function(require, module, exports) {
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
    87: [ function(require, module, exports) {
        "use strict";
        module.exports = function isObject(x) {
            return typeof x === "object" && x !== null;
        };
    }, {} ],
    88: [ function(require, module, exports) {
        var nativeIsArray = Array.isArray;
        var toString = Object.prototype.toString;
        module.exports = nativeIsArray || isArray;
        function isArray(obj) {
            return toString.call(obj) === "[object Array]";
        }
    }, {} ],
    89: [ function(require, module, exports) {
        var patch = require("./vdom/patch.js");
        module.exports = patch;
    }, {
        "./vdom/patch.js": 94
    } ],
    90: [ function(require, module, exports) {
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
        "../vnode/is-vhook.js": 102,
        "is-object": 87
    } ],
    91: [ function(require, module, exports) {
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
        "../vnode/handle-thunk.js": 100,
        "../vnode/is-vnode.js": 103,
        "../vnode/is-vtext.js": 104,
        "../vnode/is-widget.js": 105,
        "./apply-properties": 90,
        "global/document": 86
    } ],
    92: [ function(require, module, exports) {
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
    93: [ function(require, module, exports) {
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
        "../vnode/is-widget.js": 105,
        "../vnode/vpatch.js": 108,
        "./apply-properties": 90,
        "./update-widget": 95
    } ],
    94: [ function(require, module, exports) {
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
        "./create-element": 91,
        "./dom-index": 92,
        "./patch-op": 93,
        "global/document": 86,
        "x-is-array": 88
    } ],
    95: [ function(require, module, exports) {
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
        "../vnode/is-widget.js": 105
    } ],
    96: [ function(require, module, exports) {
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
        "ev-store": 83
    } ],
    97: [ function(require, module, exports) {
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
    98: [ function(require, module, exports) {
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
        "../vnode/is-thunk": 101,
        "../vnode/is-vhook": 102,
        "../vnode/is-vnode": 103,
        "../vnode/is-vtext": 104,
        "../vnode/is-widget": 105,
        "../vnode/vnode.js": 107,
        "../vnode/vtext.js": 109,
        "./hooks/ev-hook.js": 96,
        "./hooks/soft-set-hook.js": 97,
        "./parse-tag.js": 99,
        "x-is-array": 88
    } ],
    99: [ function(require, module, exports) {
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
        "browser-split": 82
    } ],
    100: [ function(require, module, exports) {
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
        "./is-thunk": 101,
        "./is-vnode": 103,
        "./is-vtext": 104,
        "./is-widget": 105
    } ],
    101: [ function(require, module, exports) {
        module.exports = isThunk;
        function isThunk(t) {
            return t && t.type === "Thunk";
        }
    }, {} ],
    102: [ function(require, module, exports) {
        module.exports = isHook;
        function isHook(hook) {
            return hook && (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") || typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"));
        }
    }, {} ],
    103: [ function(require, module, exports) {
        var version = require("./version");
        module.exports = isVirtualNode;
        function isVirtualNode(x) {
            return x && x.type === "VirtualNode" && x.version === version;
        }
    }, {
        "./version": 106
    } ],
    104: [ function(require, module, exports) {
        var version = require("./version");
        module.exports = isVirtualText;
        function isVirtualText(x) {
            return x && x.type === "VirtualText" && x.version === version;
        }
    }, {
        "./version": 106
    } ],
    105: [ function(require, module, exports) {
        module.exports = isWidget;
        function isWidget(w) {
            return w && w.type === "Widget";
        }
    }, {} ],
    106: [ function(require, module, exports) {
        module.exports = "2";
    }, {} ],
    107: [ function(require, module, exports) {
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
        "./is-thunk": 101,
        "./is-vhook": 102,
        "./is-vnode": 103,
        "./is-widget": 105,
        "./version": 106
    } ],
    108: [ function(require, module, exports) {
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
        "./version": 106
    } ],
    109: [ function(require, module, exports) {
        var version = require("./version");
        module.exports = VirtualText;
        function VirtualText(text) {
            this.text = String(text);
        }
        VirtualText.prototype.version = version;
        VirtualText.prototype.type = "VirtualText";
    }, {
        "./version": 106
    } ],
    110: [ function(require, module, exports) {
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
        "../vnode/is-vhook": 102,
        "is-object": 87
    } ],
    111: [ function(require, module, exports) {
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
        "../vnode/handle-thunk": 100,
        "../vnode/is-thunk": 101,
        "../vnode/is-vnode": 103,
        "../vnode/is-vtext": 104,
        "../vnode/is-widget": 105,
        "../vnode/vpatch": 108,
        "./diff-props": 110,
        "x-is-array": 88
    } ],
    112: [ function(require, module, exports) {
        var events = require("./events");
        function Content() {
            if (!(this instanceof Content)) {
                return new Content();
            }
            this.id = -1;
            this.title = "";
            this.keywords = [];
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
            this.listItemType = "";
            this.timestamp = null;
            this.level = -1;
        }
        Content.prototype.set = function(data) {
            var name;
            for (name in data) {
                if (this.hasOwnProperty(name)) {
                    this[name] = data[name];
                }
            }
            return this;
        };
        Content.prototype.savePage = function(self) {
            this.set({
                text: this.text.trim()
            });
            this[this.type.toLowerCase()] = this.text;
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
            var el = self.getElementsByTagName("i")[0];
            events.emit("content.save", data, this.id, el);
        };
        module.exports = Content;
    }, {
        "./events": 115
    } ],
    113: [ function(require, module, exports) {
        var pages = require("./pages"), events = require("./events"), reqwest = require("reqwest"), sweetAlert = require("sweetalert"), misc = require("./helpers"), inTransition = misc.inTransition, clicked = misc.clicked, reduce = require("lodash/collection/reduce");
        function init() {
            events.emit("page.init");
        }
        events.on("page.init", function() {
            reqwest({
                url: baseURL + "/_api/lists/getByTitle('Options')/items/?$select=Variable,Value",
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
                    console.log("options: ", options);
                    pages.set({
                        options: options
                    });
                    console.log("pages.options: ", pages.options);
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
                url: sitePath + "/items/?$select=ID,Title,Icon,Section,Program,Page,rabbitHole,Keywords,References,Link",
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
        events.on("content.save", function(data, id, self) {
            self.removeAttribute("style");
            self.innerHTML = "...saving...";
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
                            self.parentNode.className = self.parentNode.className.replace(/ ?loading/gi, "");
                            self.style.fontWeight = "bold";
                            self.innerHTML = "Saved!";
                        },
                        error: function(error) {
                            self.parentNode.className = self.parentNode.className.replace(/ ?loading/gi, "");
                            self.style.color = "#FF2222";
                            self.style.fontWeight = "bold";
                            self.innerHTML = "Connection error (press F12 for Console)";
                            console["error" || "log"]("Couldn't save due to error: ", error.response);
                        },
                        complete: function() {
                            inTransition.tempSaveText = setTimeout(function() {
                                self.removeAttribute("style");
                                self.innerHTML = "Save";
                                inTransition.tempSaveText = null;
                            }, 1500);
                        }
                    });
                },
                error: function(error) {
                    self.parentNode.className = self.parentNode.className.replace(/ ?loading/gi, "");
                    self.style.color = "#FF2222";
                    self.style.fontWeight = "bold";
                    self.innerHTML = "Digest error (press F12 for Console)";
                    console["error" || "log"]("Couldn't save due to error retrieving new digest: ", error.response);
                    console.log("Error getting new digest: ", error);
                },
                complete: function() {
                    inTransition.tempSaveText = setTimeout(function() {
                        self.removeAttribute("style");
                        self.innerHTML = "Save";
                        inTransition.tempSaveText = null;
                    }, 1500);
                }
            });
        });
        module.exports = init;
    }, {
        "./events": 115,
        "./helpers": 116,
        "./pages": 120,
        "lodash/collection/reduce": 27,
        reqwest: 77,
        sweetalert: 78
    } ],
    114: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), diff = require("virtual-dom/diff"), patch = require("virtual-dom/patch"), createElement = require("virtual-dom/create-element"), misc = require("./helpers"), codeMirror = misc.codeMirror, pages = require("./pages"), events = require("./events"), render = require("./page").render, renderEditor = require("./page").editor, renderNav = require("./nav"), renderTabs = require("./tabs");
        function DOM() {
            if (!(this instanceof DOM)) {
                return new DOM();
            }
            this.fullPage = true;
        }
        DOM.prototype.set = function(data) {
            var name;
            for (name in data) {
                if (this.hasOwnProperty(name)) {
                    this[name] = data[name];
                }
            }
            return this;
        };
        DOM.prototype.preRender = function() {
            this.navDOM = renderNav();
            this.tabsDOM = renderTabs();
            return !codeMirror ? render(this.navDOM, this.tabsDOM) : renderEditor(this.navDOM, this.tabsDOM, this);
        };
        DOM.prototype.init = function() {
            var wrapper = phWrapper || document.getElementById("wrapper") || document.getElementById("ph-wrapper");
            this.dirtyDOM = this.preRender();
            this.rootNode = createElement(this.dirtyDOM);
            wrapper.parentNode.replaceChild(this.rootNode, wrapper);
            this.reset();
        };
        DOM.prototype.loadContent = function() {
            if (this.fullPage && !pages.current[pages.current.type.replace(/\s/g, "").toLowerCase()].trim()) {
                events.emit("tab.change", "Overview");
            }
            var refreshDOM = this.preRender();
            var patches = diff(this.dirtyDOM, refreshDOM);
            this.rootNode = patch(this.rootNode, patches);
            this.dirtyDOM = refreshDOM;
            this.reset();
            if (codeMirror) this.initEditor();
        };
        DOM.prototype.reset = function() {
            this.searchInput = document.getElementById("ph-search");
            this.content = document.getElementById("ph-content");
            this.title = document.getElementById("ph-title");
            this.cheatSheet = document.getElementById("cheatSheet");
            this.textarea = document.getElementById("ph-textarea");
            if (this.editor) {
                var wrap = this.editor.getWrapperElement();
                wrap.parentNode.removeChild(wrap);
            }
            this.editor = null;
            this.output = document.getElementById("ph-output");
            var links = this.output.querySelectorAll("a"), total = links.length, i = 0;
            for (;i < total; ++i) {
                misc.addEvent("click", links[i], openExternal);
            }
            function openExternal(event) {
                if (/mailto:|#\//.test(this.href) === false) {
                    event = event || window.event;
                    if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
                    if (event.stopPropagation) event.stopPropagation();
                    window.open(this.href, "_blank");
                }
            }
        };
        DOM.prototype.initEditor = function() {
            var self = this;
            this.editor = codeMirror.fromTextArea(this.textarea, {
                mode: "gfm",
                matchBrackets: true,
                lineNumbers: false,
                lineWrapping: true,
                lineSeparator: "\n",
                theme: pages.options.editorTheme,
                extraKeys: {
                    Enter: "newlineAndIndentContinueMarkdownList"
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
            type = pages.current.level > 1 ? "## " + type + "\n" : "";
            this.output.innerHTML = misc.md.render(type + text);
        };
        var dom = new DOM();
        module.exports = dom;
    }, {
        "./events": 115,
        "./helpers": 116,
        "./nav": 118,
        "./page": 119,
        "./pages": 120,
        "./tabs": 121,
        "virtual-dom/create-element": 79,
        "virtual-dom/diff": 80,
        "virtual-dom/h": 81,
        "virtual-dom/patch": 89
    } ],
    115: [ function(require, module, exports) {
        var Events = require("eventemitter2").EventEmitter2, events = new Events({
            wildcard: true
        });
        module.exports = events;
    }, {
        eventemitter2: 2
    } ],
    116: [ function(require, module, exports) {
        function addEvent(evt, element, fnc) {
            return element.addEventListener ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc);
        }
        function removeEvent(evt, element, fnc) {
            return element.removeEventListener ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc);
        }
        var md = markdownit({
            typographer: true,
            linkify: true,
            breaks: true,
            quotes: "“”‘’"
        }), inTransition = {
            tempSaveText: null
        }, clicked = -1, codeMirror, hideEmptyTabs = true;
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
            codeMirror: codeMirror,
            hideEmptyTabs: hideEmptyTabs
        };
    }, {} ],
    117: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), diff = require("virtual-dom/diff"), patch = require("virtual-dom/patch"), reqwest = require("reqwest"), sweetAlert = require("sweetalert"), horsey = require("horsey"), Router = require("director/build/director").Router, misc = require("./helpers"), inTransition = misc.inTransition, codeMirror = misc.codeMirror, pages = require("./pages"), events = require("./events"), current = pages.current, DOM = require("./dom"), pageInit = require("./data"), router = Router({
            "/": {
                on: function() {
                    events.emit("content.loading", "/");
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
            cancelButtonText: "Nope.",
            confirmButtonText: "Yes!"
        });
        events.on("page.success", function() {
            DOM.init();
            var activeLink = document.querySelector("#ph-nav a[href='" + window.location.hash + "']");
            var tabCurrent = document.querySelector("#ph-tabs a.icon-overview");
            if (activeLink) {
                activeLink.className += " active";
            }
            if (tabCurrent) {
                tabCurrent.parentNode.className += " tab-current";
            }
            var hashArray = window.location.hash.slice(2).split(/\//), i, total;
            if (hashArray.length > 1) {
                var phPage = document.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
                if (phPage) {
                    i = 0;
                    total = phPage.length;
                    for (;i < total; ++i) {
                        phPage[i].removeAttribute("style");
                        phPage[i].parentNode.removeAttribute("style");
                    }
                }
            }
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
        events.on("content.loading", function() {
            if (inTransition.output) {
                return false;
            }
            inTransition.output = DOM.output.innerHTML;
            DOM.output.className += " loading";
            DOM.output.innerHTML = "<div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div>";
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
            var subLinks = document.querySelectorAll(".ph-page.link, .ph-rabbit-hole.link");
            var tabCurrent = document.querySelector(".tab-current");
            var i = 0;
            total = subLinks.length;
            for (;i < total; ++i) {
                subLinks[i].style.display = "none";
            }
            if (tabCurrent) {
                tabCurrent.className = tabCurrent.className.replace(/ ?tab\-current/gi, "");
            }
            current.set({
                id: obj.ID,
                title: obj.Title || "",
                _title: obj.Title || "",
                keywords: obj.Keywords && obj.Keywords.results || [],
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
                listItemType: obj.__metadata.type,
                timestamp: Date && Date.now() || new Date(),
                level: Number(Boolean(obj.Section)) + Number(Boolean(obj.Program)) + Number(Boolean(obj.Page)) + Number(Boolean(obj.rabbitHole)) || 0
            });
            resetPage();
            DOM.renderOut(current.text, current.type);
            var activeLink = document.querySelector("#ph-nav a[href='" + window.location.hash + "']");
            var currentTab = document.querySelector("#ph-tabs .icon-home");
            if (activeLink) {
                activeLink.className += " active";
            }
            if (currentTab) {
                currentTab.parentNode.className += " tab-current";
            }
            var hashArray = window.location.hash.slice(2).split(/\//), total;
            if (hashArray.length > 1) {
                var phPage = document.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
                if (phPage) {
                    i = 0;
                    total = phPage.length;
                    for (;i < total; ++i) {
                        phPage[i].removeAttribute("style");
                        phPage[i].parentNode.removeAttribute("style");
                    }
                }
            }
            DOM.loadContent();
            var regLoading = / ?loading/gi;
            inTransition.output = null;
            DOM.output.className = DOM.output.className.replace(regLoading, "");
        });
        events.on("tab.change", function(page) {
            var content = {};
            content[current.type.replace(/\s/g, "").toLowerCase()] = current.text;
            content.text = current[page.replace(/\s/g, "").toLowerCase()];
            content.type = page;
            current.set(content);
            DOM.renderOut(current.text, current.type);
            if (codeMirror) {
                DOM.loadContent();
            }
        });
        function resetPage() {
            var oldActive = document.querySelectorAll("a.active"), i = 0, total = oldActive.length;
            for (;i < total; ++i) {
                oldActive[i].className = oldActive[i].className.replace(/ ?active/gi, "");
            }
            document.title = pages.current.title;
            DOM.loadContent();
        }
        pageInit();
    }, {
        "./data": 113,
        "./dom": 114,
        "./events": 115,
        "./helpers": 116,
        "./pages": 120,
        "director/build/director": 1,
        horsey: 4,
        reqwest: 77,
        sweetalert: 78,
        "virtual-dom/diff": 80,
        "virtual-dom/h": 81,
        "virtual-dom/patch": 89
    } ],
    118: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), createElement = require("virtual-dom/create-element"), codeMirror = require("./helpers").codeMirror, map = require("lodash/collection/map"), pages = require("./pages"), events = require("./events");
        function renderLink(link) {
            return h("li#ph-link-" + link.id + link.className, link.attr, [ h("a.ph-level-" + link.level, {
                href: link.href,
                target: link.href.charAt(0) !== "#" ? "_blank" : ""
            }, [ !link.icon ? null : h("i.icon.icon-" + link.icon), h("span.link-title", [ String(link.title) ]), h("span.place") ]) ]);
        }
        function renderSection(section) {
            var links = [], i = 0, count = section.links.length;
            for (;i < count; ++i) {
                links[i] = renderLink(section.links[i]);
            }
            return h("li.ph-section.link", [ h("p", [ h("a", {
                href: section.path
            }, [ h("span.link-title", [ String(section.title) ]) ]) ]), h("ul", links) ]);
        }
        function renderNav() {
            var links = [], name;
            for (name in pages.sections) {
                if (pages.sections.hasOwnProperty(name)) {
                    links.push(renderSection(pages.sections[name]));
                }
            }
            if (codeMirror) {
                links.unshift(h("a.ph-btn.ph-create", {
                    href: "#",
                    title: "New section",
                    onclick: function(event) {
                        event = event || window.event;
                        if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
                        var createContent = document.createElement("div");
                        createContent.id = "create-content";
                        var content = document.getElementById("ph-content");
                        content.innerHTML = "";
                        content.appendChild(createContent);
                        var inputFields = function(num) {
                            return h("fieldset", [ h("input.ph-title-input", {
                                oninput: function(e) {
                                    return e;
                                }
                            }) ]);
                        };
                        createContent.appendChild(createElement(inputFields));
                        pages.createContent("");
                    }
                }, [ h("span.btn-title", [ "Add content" ]) ]));
            }
            return h("#ph-nav", [ h(".header", [ h("a", {
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
        "./events": 115,
        "./helpers": 116,
        "./pages": 120,
        "lodash/collection/map": 25,
        "virtual-dom/create-element": 79,
        "virtual-dom/h": 81
    } ],
    119: [ function(require, module, exports) {
        var h = require("virtual-dom/h"), pages = require("./pages"), events = require("./events"), misc = require("./helpers"), inTransition = misc.inTransition;
        function render(navDOM, tabsDOM) {
            return h("#ph-wrapper", [ h("#ph-search-wrap", [ h("label", [ h("input#ph-search", {
                type: "text",
                name: "ph-search",
                placeholder: pages.options.searchPlaceholder
            }) ]) ]), h("#ph-side-nav", [ navDOM ]), h("#ph-content.fullPage", [ h("h1#ph-title", [ String(pages.current.title || "") ]), tabsDOM, h("#ph-contentWrap", [ h("#ph-output") ]) ]) ]);
        }
        function editor(navDOM, tabsDOM, DOM) {
            return h("#ph-wrapper", [ h("#ph-search-wrap", [ h("label", [ h("input#ph-search", {
                type: "text",
                name: "ph-search",
                placeholder: pages.options.searchPlaceholder
            }) ]) ]), h("#ph-side-nav", [ navDOM ]), h("div#ph-content" + (DOM.fullPage ? ".fullPage" : ""), [ h("a.ph-toggle-editor", {
                href: "#",
                role: "button",
                onclick: function(event) {
                    event = event || window.event;
                    if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
                    DOM.fullPage = !DOM.fullPage;
                    DOM.loadContent();
                }
            }, [ DOM.fullPage ? "Show editor" : "Hide editor" ]), h("h1#ph-title", [ String(pages.current.title || "") ]), tabsDOM, h("#ph-buttons", [ h("a.ph-edit-btn.ph-save", {
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
                    if (DOM.cheatSheet.style.display === "none") {
                        DOM.cheatSheet.removeAttribute("style");
                    } else {
                        DOM.cheatSheet.style.display = "none";
                    }
                    return false;
                }
            }, [ h("i.icon.icon-pen", [ "Markdown help" ]) ]) ]), h("#cheatSheet", {
                style: {
                    display: "none"
                }
            }, [ "This will be a cheat-sheet for markdown.  For now, go to one of these two sites for help:", h("p", [ h("a", {
                target: "_blank",
                href: "http://jbt.github.io/markdown-editor"
            }, [ "http://jbt.github.io/markdown-editor" ]) ]), h("p", [ h("a", {
                target: "_blank",
                href: "http://stackedit.io"
            }, [ "http://stackedit.io" ]) ]) ]), h("#ph-contentWrap", [ h("#ph-input", [ h("textarea#ph-textarea", [ String(pages.current.text || "") ]) ]), h("#ph-output") ]) ]) ]);
        }
        module.exports = {
            render: render,
            editor: editor
        };
    }, {
        "./events": 115,
        "./helpers": 116,
        "./pages": 120,
        "virtual-dom/h": 81
    } ],
    120: [ function(require, module, exports) {
        var events = require("./events"), Content = require("./content"), pluck = require("lodash/collection/pluck");
        function Pages() {
            if (!(this instanceof Pages)) {
                return new Pages();
            }
            this.current = new Content();
            this.fullPage = true;
            this.options = {
                hideEmptyTabs: true,
                searchPlaceholder: "Search using keywords, AFIs or titles...",
                emptyTabsNotify: false,
                editorTheme: "base16-light",
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
                            this.options[opt] = data.options[opt] === "yes" ? true : data.options[opt] === "no" ? false : data.options[opt];
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
                        path: !result.Link ? "#/" + result.Section : result.Link,
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
                if (page.Link) {}
                if (page.Program !== "") {
                    this.sections[page.Section].links.push({
                        path: page.Path,
                        href: !page.Link ? "#" + page.Path : page.Link,
                        title: page.Title,
                        level: page.Level,
                        className: className,
                        name: name,
                        id: page.ID,
                        icon: page.Icon || "",
                        attr: isPage ? {
                            style: {
                                display: "none"
                            }
                        } : {}
                    });
                }
            }
        };
        Pages.prototype.createContent = function(path, title, newName) {
            var regNormalize = /[^a-zA-Z0-9_-]/g, self = this, title = "Blamo";
            var firstTry = title.replace(regNormalize, "");
            path += "/" + newName.replace(regNormalize, "");
            var pathArray = path.slice(1).split("/");
            var keywords = null;
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
        "./content": 112,
        "./events": 115,
        "lodash/collection/pluck": 26
    } ],
    121: [ function(require, module, exports) {
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
                var tabName = tab.title.replace(/\s/g, "").toLowerCase();
                var className = ".tab-" + tabName + (pages.options.hideEmptyTabs === true && pages.current[tabName].length < 1 ? ".tab-empty" : "") + (pages.current.type.replace(/\s/g, "").toLowerCase() === tabName ? ".tab-current" : "");
                return h("li" + className, [ h("a.icon.icon-" + tab.icon, {
                    href: "#",
                    onclick: function(e) {
                        e = e || window.event;
                        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
                        events.emit("tab.change", tab.title);
                        return false;
                    }
                }, [ h("span", [ String(tab.title) ]) ]) ]);
            });
            return h("#ph-tabs.ph-tabs.ph-tabs-style-iconbox", [ h("nav", [ h("ul", style, group) ]) ]);
        }
        module.exports = renderTabs;
    }, {
        "./events": 115,
        "./pages": 120,
        "lodash/collection/map": 25,
        "virtual-dom/h": 81
    } ]
}, {}, [ 117 ]);
//# sourceMappingURL=main.js.map