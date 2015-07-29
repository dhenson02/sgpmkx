;(function ( window, document, reqwest, Router, undefined ) {
  if (!Object.keys) {
    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    Object.keys = (function () {
      'use strict';
      var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [], prop, i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }
  String.prototype.toCamelCase = function() {
    return this
      .toLowerCase()
      .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
      //.replace(/^(.)/, function($1) { return $1.toLowerCase(); })
      .replace(/\s/g, '');
  };
  var h = require("virtual-dom/h"),
    diff = require("virtual-dom/diff"),
    patch = require("virtual-dom/patch"),
    createElement = require("virtual-dom/create-element"),
    util = require("./helpers"),
    Content = require("./store"),
    DOMRef = require("./domStore"),
    renderNav = require("./nav"),
    app = {
      sitePath: window.location.protocol + "//" + window.location.hostname + "/kj/kx7/PublicHealth/_api/lists(guid'4522F7F9-1B5C-4990-9704-991725DEF693')",
      digest: document.getElementById("__REQUESTDIGEST").value,
      pages: {},
      currentContent: new Content(),
      domRefs: new DOMRef(),
      dirtyDOM: null,
      rootNode: null,
      modalDOM: null,
      modalOverlay: null,
      navDOM: null,
      router: null,
      menuItems: null,
      inTransition: {}
    };

  function render () {
    return (
      h("#wrapper", [
        h("div#sideNav", [app.navDOM]),
        h("#content.fullPage", [
          h("#contentWrap", [
            h("#output")
          ])
        ])
      ])
    );
  }

  function renderEditor () {
    return (
      h("#wrapper", [
        h("div#sideNav", [app.navDOM]),
        h("#content.fullPage", [
          h("#buttons", [
            h("#toggleButton.btn", { onclick: toggleEditor, role: "button", style: { display: "none" } }, [
              h("span", ["Toggle Editor"])
            ]),
            h("#cheatSheetButton.btn", { onclick: toggleCheatSheet, role: "button" }, [
              h("span", ["Cheat Sheet"])
            ]),
            h("#saveButton.btn", { onclick: savePage, role: "button" }, [
              h("span", ["Save"])
            ]),
            h("#createButton.btn", { onclick: createPage, role: "button" }, [
              h("span", ["New"])
            ]),
            h("#deleteButton.btn", { onclick: deletePage, role: "button" }, [
              h("span", ["Delete"])
            ])
          ]),
          h("#cheatSheet", { style: { display: "none" } }, ["This will be a cheat-sheet for markdown"]),
          h("#contentWrap", [
            h("#input", [
              h("label#titleFieldLabel", [
                "Page title: ",
                h("input#titleField", { onkeyup: updateTitle, value: String(app.currentContent.title || ""), type: "text" })
              ]),
              h("textarea#textarea", [String(app.currentContent.text || "")])
            ]),
            h("#output")
          ])
        ])
      ])
    );
  }

  function loadingSomething ( status, target ) {
    if ( status === true ) {
      if ( app.inTransition[target] === true ) {
        return false;
      }
      app.inTransition[target] = true;
      if ( util.regLoading.test(target.className) === false ) {
        target.className += " loading";
      }
    }
    else {
      setTimeout(function() {
        app.inTransition[target] = false;
        target.className = target.className.replace(util.regLoading, "");
      }, 200);
    }
  }

  function savePage ( event ) {
    event = event || window.event;
    //event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var self = event.currentTarget || event.srcElement || this;
    try {
      console.log("currentTarget: " + event.currentTarget.nodeName);} catch(e) { try {
      console.log("srcElement: " + event.srcElement.nodeName);} catch(e) { try {
      console.log("this: " + this.nodeName); } catch (e) {
    }}}
    if (self.nodeName === "#text" || self.nodeType === 3 || self.childNodes.length < 1) {
      self = self.parentNode.parentNode;
    }
    if (self.nodeName === "span") {
      self = self.parentNode;
    }
    app.currentContent.set({
      title: app.currentContent.title.trim(),
      text: app.currentContent.text.trim()
    });
    if (app.currentContent.text === app.currentContent.originalText &&
      app.currentContent.title === app.currentContent.originalTitle ) {
      if( !util.regNoChange.test(self.className) ) {
        self.className += " nochange";
      }
      try {
        self.childNodes[0].innerHTML = "No change";
      } catch (e) {
        console.log(e); console.log(self); console.log(self.childNodes[0]);
      }

      if (app.domRefs.buttons.tempSaveText) {
        clearTimeout(app.domRefs.buttons.tempSaveText);
      }
      app.domRefs.buttons.tempSaveText = setTimeout(function() {
        try { self.childNodes[0].innerHTML = "Save"; } catch (e) {console.log(e, self, self.childNodes[0]);}
        self.className = self.className.replace(util.regNoChange, "");
      }, 2000);
      return false;
    }
    else {
      loadingSomething(true, app.domRefs.contentWrap);
    }
    reqwest({
      url: app.sitePath + "/items(" + app.currentContent.id + ")",
      method: "POST",
      data: JSON.stringify({
        '__metadata': {
          'type': app.currentContent.listItemType
        },
        'Title': app.currentContent.title,
        'Text': app.currentContent.text
      }),
      type: "json",
      contentType: "application/json",
      withCredentials: true,
      headers: {
        "X-HTTP-Method": "MERGE",
        "Accept": "application/json;odata=verbose",
        "text-Type": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": app.digest,
        "IF-MATCH": "*"
      },
      success: function() {
        newModal({
          title: [h("h2", [String(app.currentContent.title) + " updated!"])],
          text: [h("strong", [String(app.currentContent.category.join('/'))]), h("text", [" has been updated with the changes you just made."])],
          type: "success",
          showCancelButton: false
        });
      },
      error: util.connError,
      complete: function () {
        loadingSomething(false, app.domRefs.contentWrap);
      }
    });
  }

  function createPage () {
    newModal({
      title: [h("h2", ["New Page"])],
      text: [h("text", ["Give it a name:"])],
      selectLabel: [h("text", ["Select the parent category"])],
      type: "new"
    }, function ( inputValue ) {
      if ( "object" !== typeof inputValue ) {
        return false;
      }
      loadingSomething(true, app.domRefs.contentWrap);
      reqwest({
        url: app.sitePath + "/items",
        method: "POST",
        data: JSON.stringify({
          '__metadata': {
            'type': app.currentContent.listItemType
          },
          'Title': inputValue.title,
          'Text': '## New Page :)',
          'Category': inputValue.category
        }),
        type: "json",
        contentType: "application/json",
        withCredentials: true,
        headers: {
          "Accept": "application/json;odata=verbose",
          "text-Type": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": app.digest
        },
        success: function() {
          newModal({
            title: [h("h2", [String(inputValue.title)]), h("text", [" was created"])],
            text: [h("text", ["Your page is located at "]), h("strong", [String(inputValue.category)]), h("text", ["**.\nGo fill it in!"])],
            type: "success",
            okText: "Take me",
            showCancelButton: false
          }, function() {
            app.router.setRoute(inputValue.category);
          });
        },
        error: util.connError,
        complete: function () {
          loadingSomething(false, app.domRefs.contentWrap);
        }
      });
    });
  }

  function deletePage () {
    app.currentContent.title = app.currentContent.title.trim();
    var category = app.currentContent.category.join("/");
    newModal({
      title: [h("p", ["DELETE"]), h("strong", [String(app.currentContent.title)]), h("text", [", Path: " + category])],
      text: [h("em", ["You might wanna check with someone first."])],
      type: "warning"
    }, function( choice ) {
      if ( choice === false ) {
        return false;
      }
      loadingSomething(true, app.domRefs.contentWrap);
      reqwest({
        url: app.sitePath + "/items(" + app.currentContent.id + ")",
        method: "POST",
        type: "json",
        contentType: "application/json",
        withCredentials: true,
        headers: {
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE",
          "Accept": "application/json;odata=verbose",
          "text-Type": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": app.digest
        },
        success: function() {
          newModal({
            title: [h("h2", [String(app.currentContent.title) + " deleted!"])],
            text: [h("strong", [String(category)]), h("text", [" is no longer in use."])],
            type: "success",
            showCancelButton: false
          }, function() {
            app.currentContent.category.pop();
            app.router.setRoute(app.currentContent.category.join("/"));
          });
        },
        error: util.connError,
        complete: function () {
          loadingSomething(false, app.domRefs.contentWrap);
        }
      });
    });
  }

  function updateTitle () {
    var val = app.domRefs.titleField.value;
    app.domRefs.output.innerHTML = util.md.render("# " + val + "\n" + app.currentContent.text);
    app.currentContent.set({ title: val });
  }

  function newModal ( options, callback ) {
    options = {
      title: options.title || [h("h2", ["Info"])],
      text: options.text || [h("text", ["Click OK to continue"])],
      selectLabel: options.selectLabel || [h("text", ["Select the parent category"])],
      type: options.type || "success",
      path: options.path || [h("text", [String(app.currentContent.category.join("/"))])],
      okText: options.okText || "OK!",
      showCancelButton: (typeof options.showCancelButton === "boolean") ? options.showCancelButton : true,
      closeOnConfirm: (typeof options.closeOnConfirm === "boolean") ? options.closeOnConfirm : true
    };
    callback = ( "function" === typeof callback ) ? callback : null;

    var freshDOM = freshModal(options, callback);
    var patches = diff(app.modalDOM, freshDOM);
    app.modalOverlay = patch(app.modalOverlay, patches);
    app.modalDOM = freshDOM;
    util.addEvent("keyup", document, handleCancel);
  }

  function handleOk ( event, callback ) {
    event = event || window.event;
    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var keyCode = event.keyCode || event.which || event.charCode || null;
    if ( event.type === "keyup" && keyCode === 13 || event.type === "click" ) {
      if ( !callback ) {
        return false;
      }
      var title = document.getElementById("modalInput").value.trim();
      var category = document.getElementById("menuItems").value + title.toCamelCase();
      if ( title && category ) {
        callback({
          title: title,
          category: category
        });
      }
      else {
        callback(true);
      }
      modalSuicide();
      return false;
    }
  }

  function handleCancel ( event, callback ) {
    event = event || window.event;
    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var self = event.currentTarget || event.srcElement || this;
    var keyCode = event.keyCode || event.which || event.charCode || null;
    if (self.nodeName === "span") {
      self = self.parentNode;
    }
    // For self test: regModalBg.test(self.className)
    if (  ( event.type === "click" && ( self === event.target || self === event.srcElement ) ) ||
      ( event.type === "keyup" && keyCode === 27 ) ) {
      if ( callback ) { callback(); }
      modalSuicide();
      return false;
    }
  }

  function handleChange ( event, options, callback ) {
    event = event || window.event;
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    //var self = event.currentTarget || event.srcElement || this;
    var title = document.getElementById("modalInput").value.trim();
    options.path = document.getElementById("menuItems").value + "/" + title.toCamelCase();
    var refreshDOM = freshModal( options, callback);
    var patches = diff(app.modalDOM, refreshDOM);
    app.modalOverlay = patch(app.modalOverlay, patches);
    app.modalDOM = refreshDOM;
    //document.getElementById("newPath").innerHTML = category + "/" + title;
    return false;
  }

  function freshModal ( options, callback ) {
    function ok ( event ) {
      handleOk(event, callback);
    }
    function cancel ( event ) {
      handleCancel(event, callback);
    }
    function change ( event ) {
      handleChange(event, options, callback);
    }
    return (
      h(".modalOverlay", { style: { zIndex: 7 } }, [
        h(".modalBg", { onclick: cancel }),
        h(".modal", [
          h(".header", options.title),
          h("label", options.text.concat([
            ( options.type === "new" ) && (h("input#modalInput", { type: "text", tabIndex: 0, autofocus: "", onchange: change, onkeyup: ok })) || null
          ])),
          (options.selectLabel) && h("label", options.selectLabel.concat([
            ( options.type === "new" ) && (h("select#menuItems", { tabIndex: 1, onkeyup: ok, onchange: change }, app.menuItems || null)) || null
          ])),
          h("blockquote#newPath", options.path),
          h(".modalButtons", [
            h(".okButton.btn", { tabIndex: 2, onclick: ok, role: "button" }, [
              h("span", [String(options.okText || "OK!")])
            ]),
            ( options.showCancelButton ) && h(".cancelButton.btn", { tabIndex: 3, onclick: cancel, role: "button" }, [
              h("span", ["Nope."])
            ]) || null
          ])
        ])
      ])
    );
  }

  function modalSuicide () {
    app.modalOverlay.style.display = "none";
    var destroyModal = h(".modalOverlay", { style: { display: "none", zIndex: -1 }});
    var patches = diff(app.modalDOM, destroyModal);
    app.modalOverlay = patch(app.modalOverlay, patches);
    app.modalDOM = destroyModal;
    util.removeEvent("keyup", document, handleCancel);
  }

  function toggleEditor () {
    var hasFullPage = util.regFullPage.test(app.domRefs.content.className);
    app.domRefs.contentWrap.className = "";
    app.domRefs.cheatSheet.className = "";
    if ( hasFullPage ) {
      app.domRefs.content.className = app.domRefs.content.className.replace(util.regFullPage, "");
      //app.domRefs.titleField.removeAttribute("disabled");
      app.domRefs.editor.refresh();
    }
    else {
      app.domRefs.content.className = app.domRefs.content.className + " fullPage";
      //app.domRefs.titleField.setAttribute("disabled", "disabled");
    }
    return false;
  }

  function toggleCheatSheet () {
    if ( app.domRefs.cheatSheet.style.display === "none" ) {
      app.domRefs.cheatSheet.removeAttribute("style");
    }
    else {
      app.domRefs.cheatSheet.style.display = "none";
    }
    //app.domRefs.contentWrap.className = ( hasCheatSheet ) ? app.domRefs.contentWrap.className.replace(util.regCheatSheet, "") : app.domRefs.contentWrap.className + " cheatSheet";
    return false;
  }

  function update ( e ) {
    var val = e.getValue();
    app.domRefs.output.innerHTML = util.md.render("# " + app.currentContent.title + "\n" + val);
    app.currentContent.set({ text: val });
  }

  function insertContent ( content ) {
    console.log("Start inserting content...");
    app.domRefs.output.innerHTML = util.md.render("# " + content.title + "\n" + content.text);
    console.log("Supposedly finished inserting content.");
  }

  function pageSetup () {
    console.log("Begin pageSetup...");
    app.dirtyDOM = ( !CodeMirror ) ? render() : renderEditor();
    app.rootNode = createElement(app.dirtyDOM);

    try {
      var wrapperTmp = document.getElementById("wrapper");
      wrapperTmp.parentNode.replaceChild(app.rootNode, wrapperTmp);
    }
    catch ( e ) {
      try {
        wrapperTmp = document.getElementById("content");
        wrapperTmp.style.display = "none";
        wrapperTmp.parentNode.appendChild(app.rootNode);
      }
      catch ( e ) {
        document.body.appendChild(app.rootNode);
      }
    }
    if ( CodeMirror ) {
      app.modalDOM = h(".modalOverlay", { style: {display: "none", opacity: 0 }});
      app.modalOverlay = createElement(app.modalDOM);
      document.body.appendChild(app.modalOverlay);
    }
    console.log("Create new domRefs...");
    app.domRefs = new DOMRef();
    console.log("Setup new domRefs...");
    app.domRefs.set();
    console.log("Start routing stuff...");
    if ( window.location.hash ) {
      app.router.init();
    }
    else {
      // Just for debugging - change to main page later.
      app.router.init("/fhm/pha");
    }
  }

  function setupEditor () {
    console.log("Loading editor...");
    var refreshDOM = renderEditor();
    var patches = diff(app.dirtyDOM, refreshDOM);
    app.rootNode = patch(app.rootNode, patches);
    app.dirtyDOM = refreshDOM;
    app.domRefs = new DOMRef();
    app.domRefs.set({
      editor: CodeMirror.fromTextArea(app.domRefs.textarea, {
        mode: 'gfm',
        lineNumbers: false,
        matchBrackets: true,
        lineWrapping: true,
        theme: "neo",
        extraKeys: { "Enter": "newlineAndIndentContinueMarkdownList" }
      })
    });
    app.domRefs.editor.on("change", update);
    //app.domRefs.editor.refresh();
    app.domRefs.buttons.childNodes[0].removeAttribute("style");
    console.log("Editor loaded");
  }

  function resetPage () {
    var wrap,
      refreshDOM,
      modalRefreshDOM,
      patches;
    if ( app.domRefs.editor ) {
      wrap = app.domRefs.editor.getWrapperElement();
      wrap.parentNode.removeChild(wrap);
      app.domRefs.set({
        editor: null
      });
      refreshDOM = renderEditor();
      modalRefreshDOM = h(".modalOverlay", { style: {display: "none", opacity: 0 }});
      patches = diff(app.modalDOM, modalRefreshDOM);
      if (patches.length > 1) {
        app.modalOverlay = patch(app.modalOverlay, patches);
        app.modalDOM = modalRefreshDOM;
        modalSuicide();
      }
    }
    else {
      refreshDOM = render();
    }
    patches = diff(app.dirtyDOM, refreshDOM);
    app.rootNode = patch(app.rootNode, patches);
    app.dirtyDOM = refreshDOM;

    app.domRefs = new DOMRef();
    app.domRefs.set();
  }

  function getList () {
    console.log("Getting list...");
    reqwest({
      url: app.sitePath + "/items/?$select=Title,Category",
      method: "GET",
      type: "json",
      contentType: "application/json",
      withCredentials: true,
      headers: {
        "Accept": "application/json;odata=verbose",
        "text-Type": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose"
      },
      success: function ( data ) {
        /**
         * This is incredibly roundabout - I'll make it more refined when other
         * stuff has been completed.  No sense in wasting time on it just yet.
         */
        var results = data.d.results,
          pages = {},
          fhm = [],
          fhmLinks = [],
          comm = [],
          commLinks = [],
          i = 0,
          count = results.length,
          page;
        for ( ; i < count; ++i ) {
          page = results[i];
          pages[page.Category] = page.Title;
          if ( /^\/fhm\//i.test(page.Category) ) {
            // This one is Force Health
            fhm.push(
              h("option", { value: page.Category }, [String(page.Title)])
            );
            fhmLinks.push(
              h("li", [
                h("a", { href: "#" + page.Category }, [String(page.Title)]),
                h("hr")
              ])
            )
          }
          if ( /^\/comm\//i.test(page.Category) ) {
            // This is Comm
            comm.push(
              h("option", { value: page.Category }, [String(page.Title)])
            );
            commLinks.push(
              h("li", [
                h("a", { href: "#" + page.Category }, [String(page.Title)]),
                h("hr")
              ])
            )
          }
        }
        app.menuItems = [
          h("option", { value: "/FHM" }, ["Force Health Management"]),
          h("optgroup", { label: "--Sub-Cateogries--" }, fhm),
          h("option", { value: "/Comm" }, ["Community Health"]),
          h("optgroup", { label: "--Sub-Cateogries--" }, comm)
        ];
        app.navDOM = renderNav(fhmLinks, commLinks);
        console.log("Getting list internals complete.");
        pageSetup();
      },
      error: util.connError
    });
  }

  function init ( path ) {
    console.log("Begin init...");
    reqwest({
      url: app.sitePath + "/items/?$filter=Category eq '" + path + "'&$select=ID,Title,Text,References,Category",
      method: "GET",
      type: "json",
      contentType: "application/json",
      withCredentials: true,
      headers: {
        "Accept": "application/json;odata=verbose",
        "text-Type": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose"
      },
      success: function ( data ) {
        if ( !data.d.results[0] ) {
          loadingSomething(false, app.domRefs.output);
          return false;
        }
        var obj = data.d.results[0];
        app.currentContent = new Content({
          id: obj.ID,
          title: obj.Title || "",
          text: obj.Text || "",
          references: obj.References.results || [],
          category: obj.Category.split("/"),
          contentType: "Content",
          listItemType: obj.__metadata.type,
          timestamp: (Date && Date.now() || new Date())
        });
        app.currentContent.set();
        insertContent(app.currentContent);
        loadingSomething(false, app.domRefs.output);
      },
      error: util.connError,
      complete: function () {
        if ( CodeMirror ) {
          setupEditor();
        }
      }
    });
  }

  app.router = Router({
      '/new': {
        on: function () {

        }
      },
      '/(\\w+)': {

        '/(\\w+)': {

          /*'/(content|faq|forms|resources)': {
            //once: getList,
            on: function ( root, sub, type ) {
              loadingSomething(true, app.domRefs.output);
              init("/" + root + "/" + sub, (type) ? type : "Content");
            }

          },*/

          //once: getList,
          on: function ( root, sub ) {
            loadingSomething(true, app.domRefs.output);
            init("/" + root + "/" + sub);
          }
        },

        //once: getList,
        on: function ( root ) {
          /*var keys = Object.keys(app.pages);
           var path = keys.indexOf(root);
           console.log("1: root start = " + root);
           if ( keys && keys.length > 1 && path > -1 ) {
           root = keys[path];
           }
           else if ( !keys ) {
           console.log("race condition exists.  site nav list is too slow vs. this route handler");
           return false;
           }
           else {
           console.log("location unavailable - this is the level 1 route handler");
           return false;
           }
           console.log("1: root transform = " + root);*/
          loadingSomething(true, app.domRefs.output);
          init("/" + root);
        }
      }
    }
  ).configure({
    //convert_handler_in_init: true,
    strict: false,/*
     recurse: "forward",*/
    after: resetPage,
    notfound: function () {
      console.log("location unavailable - this is the notfound() handler");
      console.log("Forwarding to Travel Med for kicks");
      app.router.setRoute("/FHM/travelMedicine");
    }
  });

  getList();

  module.exports = app;

})(window, document, reqwest, Router);
