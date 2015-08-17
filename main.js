//var reQ = require("requirejs");
try {var codeMirror = CodeMirror} catch (e) {var codeMirror = null;}
/*if (!Object.keys) {
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
}*/
var h = require("virtual-dom/h"),
  diff = require("virtual-dom/diff"),
  patch = require("virtual-dom/patch"),
  createElement = require("virtual-dom/create-element"),
  reqwest = require("reqwest"),
  Router = require("director/build/director").Router,
  console = console || require("console"),
  util = require("./helpers"),
  Content = require("./store"),
  DOMRef = require("./domStore"),
  renderNav = require("./nav"),
  baseURL = window.location.protocol + "//" + window.location.hostname + "/kj/kx7/PublicHealth",
  app = {
    sitePath: baseURL + "/_api/lists(guid'4522F7F9-1B5C-4990-9704-991725DEF693')",
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

function render ( navDOM ) {
  return (
    h("#wrapper", [
      h("#sideNav", [navDOM]),
      h("#content.fullPage", [
        h("#contentWrap", [
          h("#output")
        ])
      ])
    ])
  );
}

function renderEditor ( navDOM, title, text ) {
  return (
    h("#wrapper", [
      h("#sideNav", [navDOM]),
      h("#content.fullPage", [
        h("#buttons", [
          h("#toggleButton.btn", { onclick: toggleEditor, role: "button", style: { display: "none" } }, [
            h("span", ["Toggle Editor"])
          ]),
          h("div.clearfix"),
          h("#cheatSheetButton.btn", { onclick: toggleCheatSheet, role: "button" }, [
            h("span", ["Cheat Sheet"])
          ]),
          h("#saveButton.btn", { onclick: savePage, role: "button" }, [
            h("span", ["Save"])
          ]),
          h("#createButton.btn", { onclick: createPage, role: "button" }, [
            h("span", ["New"])
          ])
        ]),
        h("#cheatSheet", { style: { display: "none" } }, ["This will be a cheat-sheet for markdown"]),
        h("#contentWrap", [
          h("#input", [
            h("label#titleFieldLabel", [
              "Page title: ",
              h("input#titleField", { onkeyup: updateTitle, value: String(title || ""), type: "text" })
            ]),
            h("textarea#textarea", [String(text || "")])
          ]),
          h("#output")
        ])
      ])
    ])
  );
}

function renderLink ( category, title, li, attr, hr, id, parent, handleNav ) {
  return h(li, attr, [
    h("a", {
      href: "#" + category,
      onclick: handleNav,
      "data-id": id,
      "data-parent": parent
    }, [
      String(title),
      h("span")
    ]),
    hr
  ]);
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
    app.inTransition[target] = false;
    target.className = target.className.replace(util.regLoading, "");
  }
}

function savePage ( event ) {
  event = event || window.event;
  //event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
  event.preventDefault ? event.preventDefault() : (event.returnValue = false);
  //var self = event.currentTarget || event.srcElement || this;
  var self = this;
  //try {
  //  console.log("currentTarget: " + event.currentTarget.nodeName);} catch(e) { try {
  //  console.log("srcElement: " + event.srcElement.nodeName);} catch(e) { try {
  //  console.log("this: " + this.nodeName); } catch (e) {
  //}}}
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
    } catch (e) {}

    if (app.domRefs.buttons.tempSaveText) {
      clearTimeout(app.domRefs.buttons.tempSaveText);
    }
    app.domRefs.buttons.tempSaveText = setTimeout(function() {
      try { self.childNodes[0].innerHTML = "Save"; } catch (e) {}
      self.className = self.className.replace(util.regNoChange, "");
    }, 2000);
    return false;
  }
  else {
    loadingSomething(true, self);
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
      console.log("Successfully saved changes.");
      /*newModal({
        title: [h("h2", [String(app.currentContent.title) + " updated!"])],
        text: [h("strong", [String(app.currentContent.category.join('/'))]), h("text", [" has been updated with the changes you just made."])],
        type: "success",
        showCancelButton: false
      });*/
    },
    error: util.connError,
    complete: function () {
      loadingSomething(false, self);
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

  var freshDOM = renderModal(options, callback);
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
      modalSuicide();
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
  var refreshDOM = renderModal( options, callback);
  var patches = diff(app.modalDOM, refreshDOM);
  app.modalOverlay = patch(app.modalOverlay, patches);
  app.modalDOM = refreshDOM;
  //document.getElementById("newPath").innerHTML = category + "/" + title;
  return false;
}

function renderLoader () {
  "use strict";
  return (
    h(".loader-group", [
      h(".bigSqr", [
        h(".square.first"),
        h(".square.second"),
        h(".square.third"),
        h(".square.fourth")
      ]),
      h(".text", ["loading..."])
    ])
  );
}

function renderModal ( options, callback ) {
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
        ( options.type === "new" ) && (options.selectLabel) && h("label", options.selectLabel.concat([
          ( options.type === "new" ) && (h("select#menuItems", { tabIndex: 1, onkeyup: ok, onchange: change }, app.menuItems || null)) || null
        ])),
        ( options.type === "new" ) && h("blockquote#newPath", options.path),
        h(".modalButtons", [
          h(".okButton.btn", { tabIndex: 2, onclick: (options.type !== "new") ? cancel : ok, role: "button" }, [
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

function insertContent ( title, text ) {
  app.domRefs.output.innerHTML = util.md.render("# " + title + "\n" + text);
}

function pageSetup () {
  app.dirtyDOM = ( !codeMirror ) ? render(app.navDOM) : renderEditor(app.navDOM, app.currentContent.title, app.currentContent.text);
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
  if ( codeMirror ) {
    app.modalDOM = h(".modalOverlay", { style: {display: "none", opacity: 0 }});
    app.modalOverlay = createElement(app.modalDOM);
    document.body.appendChild(app.modalOverlay);
  }
  app.domRefs = new DOMRef();
  app.domRefs.set();
  if ( window.location.hash ) {
    app.router.init();
  }
  else {
    app.router.init("/");
  }
  try {app.rootNode.querySelector("#navWrap a[href='" + window.location.hash + "']").className = "active";}
  catch (e) {console.log(e);}
  try {
    var hashArray = window.location.hash.slice(2).split(/\//);
    if ( hashArray.length > 1 ) {
      var subCat = app.rootNode.querySelectorAll("#navWrap a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
      if ( subCat ) {
        var i = 0, total = subCat.length;
        for ( ; i < total; ++i ) {
          subCat[i].parentNode.removeAttribute("style");
          //subCat[i].parentNode.className += " sub-cat--open";
        }
      }
    }
  } catch (e) {console.log("Failed to add sub-cat--open");}

}

function setupEditor () {
  console.log("Loading editor...");
  var refreshDOM = renderEditor(app.navDOM, app.currentContent.title, app.currentContent.text);
  var patches = diff(app.dirtyDOM, refreshDOM);
  app.rootNode = patch(app.rootNode, patches);
  app.dirtyDOM = refreshDOM;
  app.domRefs = new DOMRef();
  app.domRefs.set({
    editor: codeMirror.fromTextArea(app.domRefs.textarea, {
      mode: 'gfm',
      lineNumbers: false,
      matchBrackets: true,
      lineWrapping: true,
      theme: "neo",
      extraKeys: { "Enter": "newlineAndIndentContinueMarkdownList" }
    })
  });
  app.domRefs.editor.on("change", update);
  app.domRefs.editor.refresh();
  app.domRefs.buttons.childNodes[0].removeAttribute("style");
  console.log("Editor loaded");
}

function resetPage () {
  console.log("PAGE RESET");
  var wrap,
    refreshDOM,
    modalRefreshDOM,
    patches;
  if ( codeMirror ) {
    if ( app.domRefs.editor ) {
      wrap = app.domRefs.editor.getWrapperElement();
      wrap.parentNode.removeChild(wrap);
      app.domRefs.set({
        editor: null
      });
    }
    refreshDOM = renderEditor(app.navDOM, app.currentContent.title, app.currentContent.text);
    modalRefreshDOM = h(".modalOverlay", { style: {display: "none", opacity: 0 }});
    patches = diff(app.modalDOM, modalRefreshDOM);
    if (patches.length > 1) {
      app.modalOverlay = patch(app.modalOverlay, patches);
      app.modalDOM = modalRefreshDOM;
      modalSuicide();
    }
  }
  else {
    refreshDOM = render(app.navDOM);
  }
  patches = diff(app.dirtyDOM, refreshDOM);
  app.rootNode = patch(app.rootNode, patches);
  app.dirtyDOM = refreshDOM;
  app.domRefs = new DOMRef();
  app.domRefs.set();
}

function getList () {
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
      function handleNav () {
        var oldActive = app.rootNode.querySelectorAll("a.active"),
          i = 0,
          total = oldActive.length;
        for ( ; i < total; ++i ) {
          oldActive[i].className = oldActive[i].className.replace(/ ?active/g, "");
        }
        try {
          var categoryOld = window.location.hash.slice(2).split("/")[1],
            categoryNew = this.getAttribute("href").slice(2).split("/")[1];
          if ( / ?sub-cat/gi.test(this.parentNode.className) === false && categoryOld !== categoryNew ) {
            var oldSubCat = app.rootNode.querySelectorAll("#navWrap .sub-cat");
            i = 0;
            total = oldSubCat.length;
            for ( ; i < total; ++i ) {
              oldSubCat[i].style.display = "none";
            }
          }
        } catch (e) {
          oldSubCat = app.rootNode.querySelectorAll("#navWrap .sub-cat");
          i = 0;
          total = oldSubCat.length;
          for ( ; i < total; ++i ) {
            oldSubCat[i].style.display = "none";
          }
        }
      }
      var results = data.d.results,
        pages = {},
        fhm = [],
        fhmLinks = [],
        comm = [],
        commLinks = [],
        i = 0,
        li,
        attr,
        hr,
        idArray,
        id,
        parent,
        count = results.length,
        page;
      for ( ; i < count; ++i ) {
        li = "li";
        attr = null;
        hr = h("hr");
        page = results[i];
        pages[page.Category] = page.Title;
        idArray = page.Category.slice(1).split(/\//g);
        id = idArray.pop();
        if ( /^\/fhm\//i.test(page.Category) ) {
          fhm.push(
            h("option", { value: page.Category }, [String(page.Title)])
          );
          parent = idArray.pop();
          if ( !(/^\/fhm\/(\w+)$/i.test(page.Category)) ) {
            li = "li.sub-cat";
            hr = null;
            attr = {
              style: {
                display: "none"
              }
            };
          }
          fhmLinks.push(
            renderLink(page.Category, page.Title, li, attr, hr, id, parent, handleNav)
          );
        }
        if ( /^\/comm\//i.test(page.Category) ) {
          comm.push(
            h("option", { value: page.Category }, [String(page.Title)])
          );
          parent = idArray.pop();
          if ( !(/^\/comm\/(\w+)$/i.test(page.Category)) ) {
            li = "li.sub-cat";
            hr = null;
            attr = {
              style: {
                display: "none"
              }
            };
          }
          commLinks.push(
            renderLink(page.Category, page.Title, li, attr, hr, id, parent, handleNav)
          );
        }
      }
      app.menuItems = [
        h("option", { value: "/FHM" }, ["Force Health Management"]),
        h("optgroup", { label: "Sub-Cateogries" }, fhm),
        h("option", { value: "/Comm" }, ["Community Health"]),
        h("optgroup", { label: "Sub-Cateogries" }, comm)
      ];
      app.navDOM = renderNav(fhmLinks, commLinks);
      console.log(pages);
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
        //loadingSomething(false, app.domRefs.output);
        // This next line is just for debugging.  Something better will replace it later.
        window.location.href = baseURL + "/Pages/main.aspx";
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
      insertContent(app.currentContent.title, app.currentContent.text);
      loadingSomething(false, app.domRefs.output);

      try {app.rootNode.querySelector("#navWrap a[href='" + window.location.hash + "']").className = "active";}
      catch (e) {}
      try {
        var hashArray = window.location.hash.slice(2).split(/\//);
        var subCat = app.rootNode.querySelectorAll("#navWrap a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
        if ( subCat ) {
          var i = 0;
          var total = subCat.length;
          for ( ; i < total; ++i ) {
            subCat[i].parentNode.style.display = "";
            subCat[i].parentNode.removeAttribute("style");
          }
        }
      } catch (e) {}

    },
    error: util.connError,
    complete: function () {
      if ( codeMirror ) {
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
      //once: getList,
      on: function ( root ) {
        loadingSomething(true, app.domRefs.output);
        init("/" + root);
      },
      '/(\\w+)': {
        //once: getList,
        on: function ( root, sub ) {
          loadingSomething(true, app.domRefs.output);
          init("/" + root + "/" + sub);
        },
        '/(\\w+)': {
          //once: getList,
          on: function ( root, sub, inner ) {
            loadingSomething(true, app.domRefs.output);
            init("/" + root + "/" + sub + "/" + inner);
          }
        }
      }
    }
  }
).configure({
  strict: false,
  after: resetPage,
  notfound: function () {
    window.location.href = baseURL + "/Pages/main.aspx";
  }
});

getList();

module.exports = app;
