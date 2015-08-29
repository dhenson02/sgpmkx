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
  sweetAlert = require("sweetalert"),
  util = require("./helpers"),
  Content = require("./store"),
  DOMRef = require("./domStore"),
  renderNav = require("./nav"),
  renderTabs = require("./tabs"),
  baseURL = _spPageContextInfo.webAbsoluteUrl,
  app = {
    //sitePath: baseURL + "/_api/lists(guid'4522F7F9-1B5C-4990-9704-991725DEF693')",
    sitePath: baseURL + "/_api/lists/getByTitle('Content')",
    digest: document.getElementById("__REQUESTDIGEST").value,
    pages: {},
    currentContent: new Content(),
    domRefs: new DOMRef(),
    dirtyDOM: null,
    rootNode: null,
    navDOM: null,
    tabsDOM: null,
    router: null,
    menuItems: null,
    inTransition: {}
  };

function render ( navDOM, tabsDOM ) {
  return (
    h("#wrapper", [
      h("#sideNav", [navDOM]),
      h("#content.fullPage", [
        h("#contentWrap", [
          h("#output"),
          tabsDOM
        ])
      ])
    ])
  );
}

function renderEditor ( navDOM, tabsDOM, title, text ) {
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
          h("#output"),
          tabsDOM
        ])
      ])
    ])
  );
}

function renderLink ( category, title, li, attr, hr ) {
  return h(li, attr, [
    h("a", {
      href: "#" + category
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
      app.inTransition["tmp"] = target.innerHTML;
      target.innerHTML = "<div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div>";
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
  var self = this;
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
  if (app.currentContent.text === app.currentContent._text &&
    app.currentContent.title === app.currentContent._title ) {
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
    }, 1500);
    return false;
  }
  else {
    //loadingSomething(true, self);
    self.innerHTML = "<span>...saving...</span>";
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
      self.innerHTML = "<span style=\'font-weight:bold;\'>Saved!</span>";
      getList();
    },
    error: function() {
      self.innerHTML = "<span style=\'font-weight:bold; color: #F22;\'>Could not save</span>";
    },
    complete: function () {
      if ( !app.domRefs.buttons.saveReset ) {
        app.domRefs.buttons.saveReset = setTimeout(function() {
          self.innerHTML = "<span>Save</span>";
        }, 1500);
      }
    }
  });
}

function createPage () {
  var location = window.location.hash.slice(1);
  sweetAlert({
    title: "New page",
    text: "Give it a name:",
    type: "input",
    closeOnConfirm: false,
    showCancelButton: true
  }, function ( inputValue ) {
    if ( inputValue === false ) {
      return false;
    }
    if ( inputValue === "" ) {
      sweetAlert.showInputError("Please enter a page title!");
      return false;
    }
    var title = inputValue.toCamelCase();

    if ( location === "/" ) {
      var category = location + title;
    }
    else {
      category = location + "/" + title;
    }
    sweetAlert({
      title: "Confirm",
      text: "Your page will have the title: <p style=\'font-weight:bold;\'>" + inputValue + "</p>Page location: <p style=\'font-weight:bold;\'>" + category + "</p>",
      closeOnConfirm: false,
      showCancelButton: true,
      showLoaderOnConfirm: true,
      html: true,
      type: "warning"
    }, function () {
      reqwest({
        url: app.sitePath + "/items",
        method: "POST",
        data: JSON.stringify({
          '__metadata': {
            'type': app.currentContent.listItemType
          },
          'Title': inputValue,
          'Text': 'New Page :)\n### Joy',
          'Category': category
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
          sweetAlert({
            title: "Success!",
            text: inputValue + " was created at " + category,
            type: "success",
            showCancelButton: false,
            showConfirmButton: false,
            timer: 2000
          }, function () {
            app.router.setRoute(category);
          });
        },
        error: util.connError
      });
    });
  });
}

function updateTitle ( reset ) {
  var val = ( typeof reset === "string" ) ? reset : app.domRefs.titleField.value;
  app.domRefs.output.innerHTML = util.md.render("# " + val + "\n" + app.currentContent.text);
  app.currentContent.set({ title: val });
}

/*
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
*/

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
  app.dirtyDOM = ( !codeMirror ) ? render(app.navDOM, app.tabsDOM) : renderEditor(app.navDOM, app.tabsDOM, app.currentContent.title, app.currentContent.text);
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
  app.domRefs = new DOMRef();
  app.domRefs.set();
  if ( window.location.hash ) {
    app.router.init();
  }
  else {
    app.router.init("/");
  }
  try {app.rootNode.querySelector("#navWrap a[href='" + window.location.hash + "']").className += " active";}
  catch (e) {console.log(e);}
  try {
    var hashArray = window.location.hash.slice(2).split(/\//);
    if ( hashArray.length > 1 ) {
      var subCat = app.rootNode.querySelectorAll("#navWrap a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
      if ( subCat ) {
        var i = 0, total = subCat.length;
        for ( ; i < total; ++i ) {
          subCat[i].parentNode.removeAttribute("style");
        }
      }
    }
  } catch (e) {console.log(e);}

}

function setupEditor () {
  console.log("Loading editor...");
  var refreshDOM = renderEditor(app.navDOM, app.tabsDOM, app.currentContent.title, app.currentContent.text);
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
      theme: "mdn-like",
      extraKeys: { "Enter": "newlineAndIndentContinueMarkdownList" }
    })
  });
  app.domRefs.editor.on("change", update);
  app.domRefs.editor.refresh();
  app.domRefs.buttons.childNodes[0].removeAttribute("style");
  console.log("Editor loaded");
}

function resetPage () {
  var oldActive = app.rootNode.querySelectorAll("a.active"),
    i = 0,
    total = oldActive.length;
  for ( ; i < total; ++i ) {
    oldActive[i].className = oldActive[i].className.replace(/ ?active/gi, "");
  }
  console.log("PAGE RESET");
  var wrap,
    refreshDOM,
    patches;
  if ( codeMirror ) {
    if ( app.domRefs.editor ) {
      wrap = app.domRefs.editor.getWrapperElement();
      wrap.parentNode.removeChild(wrap);
      app.domRefs.set({
        editor: null
      });
    }
    refreshDOM = renderEditor(app.navDOM, app.tabsDOM, app.currentContent.title, app.currentContent.text);
  }
  else {
    refreshDOM = render(app.navDOM, app.tabsDOM);
  }
  patches = diff(app.dirtyDOM, refreshDOM);
  app.rootNode = patch(app.rootNode, patches);
  app.dirtyDOM = refreshDOM;
  app.domRefs = new DOMRef();
  app.domRefs.set();
}

function getList () {
  reqwest({
    url: app.sitePath + "/items/?$select=ID,Title,Category,Section,Program,Page,Path",
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
      var results = data.d.results,
        urls = [],
        fhmLinks = [],
        commLinks = [],
        i = 0,
        count = results.length,
        page;
      for ( ; i < count; ++i ) {
        app.pages[results[i].Category] = results[i];
        urls[i] = results[i].Category;
      }
      var sortedUrls = urls.sort();
      for (i = 0; i < count; ++i) {
        /**
         * Should be able to turn this into an autonomous loop so "FHM" / "Comm"
         * aren't dependencies hard-coded (unlike the rest of the code).
         */
        page = app.pages[sortedUrls[i]];
        if ( /^\/fhm\//i.test(page.Category) ) {
          if ( !(/^\/fhm\/(\w+)$/i.test(page.Category)) ) {
            fhmLinks.push(
              renderLink(page.Category, page.Title, "li.sub-cat", {style: { display: "none" }}, null)
            );
          }
          else {
            fhmLinks.push(
              renderLink(page.Category, page.Title, "li", null, h("hr"))
            );
          }
        }
        if ( /^\/comm\//i.test(page.Category) ) {
          if ( !(/^\/comm\/(\w+)$/i.test(page.Category)) ) {
            commLinks.push(
              renderLink(page.Category, page.Title, "li.sub-cat", {style: { display: "none" }}, null)
            );
          }
          else {
            commLinks.push(
              renderLink(page.Category, page.Title, "li", null, h("hr"))
            );
          }
        }
        if ( /^https?:\/\//i.test(page.Path) ) {
          // Placeholder for when there are URLs instead of paths.
        }
      }
      app.navDOM = renderNav(commLinks, fhmLinks);
      pageSetup();
    },
    error: util.connError
  });
}

function init ( path ) {
  console.log("Begin init...");
  reqwest({
    //url: app.sitePath + "/items/?$filter=Category eq '" + path + "'&$select=ID,Title,Text,References,Resources,Tools,Category,Section,Program,Page,Path",
    url: app.sitePath + "/items(" + app.pages[path].ID + ")?$select=ID,Title,Text,References,Resources,Tools,Category,Section,Program,Page,Path",
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
      var obj = data.d;
      if ( !obj ) {
      //if ( !data.d.results[0] ) {
        app.router.setRoute("/");
        return false;
      }
      //var obj = data.d.results[0];
      var subLinks = app.rootNode.querySelectorAll("#navWrap .sub-cat");
      i = 0;
      total = subLinks.length;
      for ( ; i < total; ++i ) {
        subLinks[i].style.display = "none";
      }
      console.log("obj: ", obj);
      app.currentContent.set({
        id: obj.ID,
        title: obj.Title || "",
        text: obj.Text || "",
        //references: obj.References.results || [],
        policy: obj.Policy || "",
        resources: obj.Resources || "",
        tools: obj.Tools || "",
        //contributions: obj.Contributions || "",
        category: obj.Category.split("/"),
        section: obj.Section || "",
        program: obj.Program || "",
        page: obj.Page || "",
        path: (obj.Path) ? obj.Path.split("/") : obj.Category.split("/"),
        type: "Content",
        listItemType: obj.__metadata.type,
        timestamp: (Date && Date.now() || new Date())
      });
      var tabsStyle = ( app.currentContent.program !== "" && app.currentContent.program !== "Home" ) ? {} : {style:{display:"none"}};
      app.tabsDOM = renderTabs(tabsStyle, app.currentContent.path, function( page ) {
        console.log("app.cctnt.pol: ", app.currentContent.policy);
        sweetAlert({
          title: page,
          text: util.md.render(app.currentContent[page.toLowerCase()]),
          html: true,
          type: "info",
          showConfirmButton: false,
          showCloseButton: false,
          allowOutsideClick: true,
          closeOnConfirm: true
        });
      });
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
  /*'/new': {
    on: function () {

    }
  },*/
  '/': {
    on: function () {
      loadingSomething(true, app.domRefs.output);
      init("/");
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
}).configure({
  strict: false,
  after: resetPage,
  notfound: function () {
    sweetAlert({
      title: "Oops",
      text: "Page doesn't exist.  Sorry :(",
      timer: 3000,
      showConfirmButton: false
    }, function() {
      app.router.setRoute("/");
    });
  }
});

getList();

//module.exports = app;
