try {var codeMirror = CodeMirror} catch (e) {var codeMirror = null;}
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
  sitePath = baseURL + "/_api/lists/getByTitle('Content')",
  digest = document.getElementById("__REQUESTDIGEST").value,
  pages = {},
  currentContent = new Content(),
  domRefs = new DOMRef(),
  dirtyDOM = null,
  rootNode = null,
  navDOM = null,
  tabsDOM = null,
  router = null,
  inTransition = {};

sweetAlert.setDefaults({
  allowOutsideClick: true,
  showCancelButton: true,
  cancelButtonText: "Nope.",
  confirmButtonText: "Yes!"
});

function render ( navDOM, tabsDOM ) {
  return (
    h("#wrapper", [
      h("#sideNav", [
        navDOM
      ]),
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
      h("#sideNav", [
        navDOM
      ]),
      h("#content.fullPage", [
        h("#buttons", [
          h("button#toggleButton.btn", { onclick: toggleEditor, style: { display: "none" } }, ["Toggle Editor"]),
          h("div.clearfix"),
          h("button#cheatSheetButton.btn", { onclick: toggleCheatSheet, type: "button" }, ["Cheat Sheet"]),
          h("button#saveButton.btn", { onclick: savePage, type: "button" }, ["Save"]),
          h("button#createButton.btn", { onclick: createPage, type: "button" }, ["New"])
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

function renderLink ( path, title, li, attr, hr ) {
  return h(li, attr, [
    h("a", {
      href: path
    }, [
      String(title),
      h("span")
    ]),
    hr
  ]);
}

function startLoader ( target ) {
  if ( inTransition[target] === true ) {
    return false;
  }
  inTransition[target] = true;
  if ( util.regLoading.test(target.className) === false ) {
    inTransition["tmp"] = target.innerHTML;
    target.innerHTML = "<div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div>";
    target.className += " loading";
  }
}

function stopLoader ( target ) {
  inTransition[target] = false;
  target.className = target.className.replace(util.regLoading, "");
}

function savePage ( event ) {
  var self = this;
  event = event || window.event;
  //event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
  if ( event.preventDefault ) event.preventDefault();
  else event.returnValue = false;
  currentContent.set({
    title: currentContent.title.trim(),
    text: currentContent.text.trim()
  });

  var textDiff = (currentContent.text !== currentContent._text);
  var titleDiff = (currentContent.title !== currentContent._title);

  if ( textDiff || titleDiff ) {
    self.innerHTML = "...saving...";
    reqwest({
      url: sitePath + "/items(" + currentContent.id + ")",
      method: "POST",
      data: JSON.stringify({
        '__metadata': {
          'type': currentContent.listItemType
        },
        'Title': currentContent.title,
        'Text': currentContent.text,
        'Resources': currentContent.resources,
        'Tools': currentContent.tools,
        'Policy': currentContent.policy
      }),
      type: "json",
      contentType: "application/json",
      withCredentials: true,
      headers: {
        "X-HTTP-Method": "MERGE",
        "Accept": "application/json;odata=verbose",
        "text-Type": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
        "IF-MATCH": "*"
      },
      success: function () {
        self.style.fontWeight = "bold";
        self.innerHTML = "Saved!";
        if ( titleDiff ) getList();
      },
      error: function () {
        self.style.color = "#F22";
        self.style.fontWeight = "bold";
        self.innerHTML = "Failed!";
      },
      complete: function () {
        if ( !inTransition.tempSaveText ) {
          inTransition.tempSaveText = setTimeout(function () {
            self.removeAttribute("style");
            self.innerHTML = "Save";
          }, 1500);
        }
      }
    });
  }
  else {
    if ( !util.regNoChange.test(self.className) ) {
      self.className += " nochange";
    }
    self.innerHTML = "No change";
    if ( inTransition.tempSaveText ) {
      clearTimeout(inTransition.tempSaveText);
    }
    inTransition.tempSaveText = setTimeout(function () {
      self.className = self.className.replace(util.regNoChange, "");
      self.innerHTML = "Save";
    }, 1500);
  }
  return false;
}

function createPage ( event ) {
  if ( event.preventDefault ) event.preventDefault();
  else event.returnValue = false;
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
      var path = location + title;
    }
    else {
      path = location + "/" + title;
    }
    sweetAlert({
      title: "Confirm",
      text: "Your page will have the title: <p style=\'font-weight:bold;\'>" + inputValue + "</p>Page location: <p style=\'font-weight:bold;\'>" + path + "</p>",
      closeOnConfirm: false,
      showCancelButton: true,
      showLoaderOnConfirm: true,
      html: true,
      type: "warning"
    }, function () {
      var section = currentContent.section || title;
      var program = currentContent.program || ((currentContent.section) ? title : "Home");
      var page = (currentContent.program) ? title : "Home";
      reqwest({
        url: sitePath + "/items",
        method: "POST",
        data: JSON.stringify({
          '__metadata': {
            'type': currentContent.listItemType
          },
          'Title': inputValue,
          'Text': '### New Page :)\n#### Joy',
          'Section': section,
          'Program': program,
          'Page': page,
          'Path': path
        }),
        type: "json",
        contentType: "application/json",
        withCredentials: true,
        headers: {
          "Accept": "application/json;odata=verbose",
          "text-Type": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest
        },
        success: function() {
          sweetAlert({
            title: "Success!",
            text: inputValue + " was created at " + path,
            type: "success",
            showCancelButton: false,
            showConfirmButton: false,
            timer: 2000
          }, function () {
            router.setRoute(path);
          });
        },
        error: util.connError
      });
    });
  });
}

function updateTitle ( reset ) {
  var val = ( typeof reset === "string" ) ? reset : domRefs.titleField.value;
  domRefs.output.innerHTML = util.md.render("# " + val + "\n" + currentContent.text);
  currentContent.set({ title: val });
}

/*
function handleChange ( event, options, callback ) {
  event = event || window.event;
  event.preventDefault ? event.preventDefault() : event.returnValue = false;
  //var self = event.currentTarget || event.srcElement || this;
  var title = document.getElementById("modalInput").value.trim();
  options.path = document.getElementById("menuItems").value + "/" + title.toCamelCase();
  var refreshDOM = renderModal( options, callback);
  var patches = diff(modalDOM, refreshDOM);
  modalOverlay = patch(modalOverlay, patches);
  modalDOM = refreshDOM;
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
  var hasFullPage = util.regFullPage.test(domRefs.content.className);
  domRefs.contentWrap.className = "";
  domRefs.cheatSheet.className = "";
  if ( hasFullPage ) {
    domRefs.content.className = domRefs.content.className.replace(util.regFullPage, "");
    //domRefs.titleField.removeAttribute("disabled");
    domRefs.editor.refresh();
  }
  else {
    domRefs.content.className = domRefs.content.className + " fullPage";
    //domRefs.titleField.setAttribute("disabled", "disabled");
  }
  return false;
}

function toggleCheatSheet () {
  if ( domRefs.cheatSheet.style.display === "none" ) {
    domRefs.cheatSheet.removeAttribute("style");
  }
  else {
    domRefs.cheatSheet.style.display = "none";
  }
  return false;
}

function update ( e ) {
  var val = e.getValue();
  domRefs.output.innerHTML = util.md.render("# " + currentContent.title + "\n" + val);
  currentContent.set({ text: val });
}

function insertContent ( title, text ) {
  domRefs.output.innerHTML = util.md.render("# " + title + "\n" + text);
}

function pageSetup () {
  dirtyDOM = ( !codeMirror ) ? render(navDOM, tabsDOM) : renderEditor(navDOM, tabsDOM, currentContent.title, currentContent.text);
  rootNode = createElement(dirtyDOM);

  try {
    var wrapperTmp = document.getElementById("wrapper");
    wrapperTmp.parentNode.replaceChild(rootNode, wrapperTmp);
  }
  catch ( e ) {
    try {
      wrapperTmp = document.getElementById("content");
      wrapperTmp.style.display = "none";
      wrapperTmp.parentNode.appendChild(rootNode);
    }
    catch ( e ) {
      document.body.appendChild(rootNode);
    }
  }
  domRefs = new DOMRef();
  domRefs.set();
  if ( window.location.hash ) {
    router.init();
  }
  else {
    router.init("/");
  }
  try {rootNode.querySelector("#navWrap a[href='" + window.location.hash + "']").className += " active";}
  catch (e) {console.log(e);}
  try {
    var hashArray = window.location.hash.slice(2).split(/\//);
    if ( hashArray.length > 1 ) {
      var subCat = rootNode.querySelectorAll("#navWrap a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
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
  var refreshDOM = renderEditor(navDOM, tabsDOM, currentContent.title, currentContent.text);
  var patches = diff(dirtyDOM, refreshDOM);
  rootNode = patch(rootNode, patches);
  dirtyDOM = refreshDOM;
  domRefs = new DOMRef();
  domRefs.set({
    editor: codeMirror.fromTextArea(domRefs.textarea, {
      mode: 'gfm',
      lineNumbers: false,
      matchBrackets: true,
      lineWrapping: true,
      theme: "mdn-like",
      extraKeys: { "Enter": "newlineAndIndentContinueMarkdownList" }
    })
  });
  domRefs.editor.on("change", update);
  domRefs.editor.refresh();
  domRefs.buttons.childNodes[0].removeAttribute("style");
  console.log("Editor loaded");
}

function resetPage () {
  var oldActive = rootNode.querySelectorAll("a.active"),
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
    if ( domRefs.editor ) {
      wrap = domRefs.editor.getWrapperElement();
      wrap.parentNode.removeChild(wrap);
      domRefs.set({
        editor: null
      });
    }
    refreshDOM = renderEditor(navDOM, tabsDOM, currentContent.title, currentContent.text);
  }
  else {
    refreshDOM = render(navDOM, tabsDOM);
  }
  patches = diff(dirtyDOM, refreshDOM);
  rootNode = patch(rootNode, patches);
  dirtyDOM = refreshDOM;
  domRefs = new DOMRef();
  domRefs.set();
}

function getList () {
  reqwest({
    url: sitePath + "/items/?$select=ID,Title,Section,Program,Page,Path",
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
        pages[results[i].Path] = results[i];
        urls[i] = results[i].Path;
      }
      var sortedUrls = urls.sort();
      for (i = 0; i < count; ++i) {
        /**
         * Should be able to turn this into an autonomous loop so "FHM" / "Comm"
         * aren't dependencies hard-coded (unlike the rest of the code).
         */
        page = pages[sortedUrls[i]];
        var path = "#" + page.Path;
        if ( /^#\/fhm\//i.test(path) ) {
          if ( !(/^#\/fhm\/(\w+)$/i.test(path)) ) {
            fhmLinks.push(
              renderLink(path, page.Title, "li.sub-cat", {style: { display: "none" }}, null)
            );
          }
          else {
            fhmLinks.push(
              renderLink(path, page.Title, "li", null, h("hr"))
            );
          }
        }
        if ( /^#\/comm\//i.test(path) ) {
          if ( !(/^#\/comm\/(\w+)$/i.test(path)) ) {
            commLinks.push(
              renderLink(path, page.Title, "li.sub-cat", {style: { display: "none" }}, null)
            );
          }
          else {
            commLinks.push(
              renderLink(path, page.Title, "li", null, h("hr"))
            );
          }
        }
        if ( /^https?:\/\//i.test(page.Path) ) {
          // Placeholder for when there are URLs instead of paths.
          renderLink(path, page.Title, "li", null, h("hr"))
        }
      }
      navDOM = renderNav(commLinks, fhmLinks);
      pageSetup();
    },
    error: util.connError
  });
}

function init ( path ) {
  console.log("Begin init...");
  reqwest({
    //url: sitePath + "/items/?$filter=Path eq '" + path + "'&$select=ID,Title,Text,Resources,Tools,Section,Program,Page,Path,Policy",
    url: sitePath + "/items(" + pages[path].ID + ")?$select=ID,Title,Text,Resources,Tools,Section,Program,Page,Path,Policy",
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
        router.setRoute("/");
        return false;
      }
      var subLinks = rootNode.querySelectorAll("#navWrap .sub-cat");
      i = 0;
      total = subLinks.length;
      for ( ; i < total; ++i ) {
        subLinks[i].style.display = "none";
      }
      console.log("obj: ", obj);
      currentContent.set({
        id: obj.ID,
        title: obj.Title || "",
        text: obj.Text || "",
        policy: obj.Policy || "",
        resources: obj.Resources || "",
        tools: obj.Tools || "",
        //contributions: obj.Contributions || "",
        section: obj.Section || "Home",
        program: obj.Program || "Home",
        page: obj.Page || "Home",
        path: obj.Path.split("/"),
        type: "Content",
        listItemType: obj.__metadata.type,
        timestamp: (Date && Date.now() || new Date())
      });
      var tabsStyle = ( currentContent.program !== "" && currentContent.program !== "Home" ) ? {} : {style:{display:"none"}};
      tabsDOM = renderTabs(tabsStyle, function( page ) {
        console.log("cctnt.pol: ", currentContent.policy);
        sweetAlert({
          title: page,
          text: util.md.render(currentContent[page.toLowerCase()]),
          html: true,
          type: "info",
          showConfirmButton: false,
          showCancelButton: false
        });
      });
      insertContent(currentContent.title, currentContent.text);
      stopLoader(domRefs.output);

      try {rootNode.querySelector("#navWrap a[href='" + window.location.hash + "']").className = "active";}
      catch (e) {}
      try {
        var hashArray = window.location.hash.slice(2).split(/\//);
        var subCat = rootNode.querySelectorAll("#navWrap a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
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

router = Router({
  /*'/new': {
    on: function () {

    }
  },*/
  '/': {
    on: function () {
      startLoader(domRefs.output);
      init("/");
    }
  },
  '/(\\w+)': {
    //once: getList,
    on: function ( root ) {
      startLoader(domRefs.output);
      init("/" + root);
    },
    '/(\\w+)': {
      //once: getList,
      on: function ( root, sub ) {
        startLoader(domRefs.output);
        init("/" + root + "/" + sub);
      },
      '/(\\w+)': {
        //once: getList,
        on: function ( root, sub, inner ) {
          startLoader(domRefs.output);
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
      text: "Page doesn't exist.  Sorry :(\n\nLet\'s go back!",
      timer: 2000,
      showConfirmButton: false,
      allowOutsideClick: true
    }, function() {
      router.setRoute("/");
    });
  }
});

getList();
