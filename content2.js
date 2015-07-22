;(function ( window, document, $, reqwest, Router, markdownit ) {
  var h = require("virtual-dom/h"),
    diff = require("virtual-dom/diff"),
    patch = require("virtual-dom/patch"),
    createElement = require("virtual-dom/create-element"),
    Content = require("./store"),
    DOMRef = require("./domStore"),
    app = {
      sitePath: "https://kx.afms.mil/kj/kx7/PublicHealth/",
      digest: document.getElementById("__REQUESTDIGEST").value,
      pages: {},
      currentContent: new Content(),
      domRefs: new DOMRef(),
      dirtyDOM: null,
      rootNode: null,
      modalDOM: null,
      modalOverlay: null,
      router: null,
      menuItems: null,
      animating: false,
      inTransition: {}
    };

  function render ( target, params ) {
    var node = (
      h("#wrapper", [
        h("#content.fullPage", [
          h("#modalOverlay"),
          h("#contentWrap", [
            h("#output")
          ])
        ])
      ])
    );
    if ( target === "editor" ) {
      node = (
        h("#wrapper", [
          h("#content.fullPage", [
            h("#buttons", [
              h("input#titleField", { onkeyup: updateTitle, value: String(app.currentContent.title || ""), type: "text" }),
              h("#toggleButton.btn", { onclick: toggleEditor, role: "button" }, [
                h("span", ["Toggle Editor"])
              ]),
              h("#cheatSheetButton.btn", { onclick: toggleCheatSheet, role: "button" }, [
                h("span", ["Cheat Sheet"])
              ]),
              h("#deleteButton.btn", { onclick: deletePage, role: "button" }, [
                h("span", ["Delete"])
              ]),
              h("#createButton.btn", { onclick: createPage, role: "button" }, [
                h("span", ["New"])
              ]),
              h("#saveButton.btn", { onclick: savePage, role: "button" }, [
                h("span", ["Save"])
              ])
            ]),
            h("#cheatSheet", ["This will be a cheat-sheet for markdown"]),
            h("#contentWrap", [
              h("#input", [
                h("textarea#textarea", [String(app.currentContent.text || "")])
              ]),
              h("#output")
            ])
          ])
        ])
      );
    }

    if ( target === "modal" ) {
      node = (
        h("#modalOverlay", [
          h(".modalBg", { onclick: handleCancel }),
          h(".modal", [
            h(".header", [
              h("h2", [String(params.title)])
            ]),
            h("label", [
              String(params.text),
              ( params.type === "new" ) && (h("input#modalInput", { type: "text" })) || null,
              ( params.type === "new" ) && (h("select#menuItems", [ app.menuItems ])) || null
            ]),
            h(".modalButtons", [
              h(".okButton.btn", { onclick: handleOk }, [
                h("span", [String(params.okText)])
              ]),
              ( params.showCancelButton ) && h(".cancelButton.btn", { onclick: handleCancel }, [
                h("span", ["Nope."])
              ]) || null
            ])
          ])
        ])
      );
    }
    return node;
  }

  function loadingSomething ( status, target ) {
    if ( status === true ) {
      if ( app.inTransition[target] === true ) {
        return false;
      }
      /* consider storing pointer info to element in use inside `item` to execute $.velocity.("finish") */
      app.inTransition[target] = true;
      if ( regLoading.test(target.className) === false ) {
        target.className += " loading";
      }
    }
    else {
      setTimeout(function() {
        app.inTransition[target] = false;
        target.className = target.className.replace(regLoading, "");
      }, 200);
    }
  }

  function savePage ( event ) {
    event = event || window.event;
    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var self = event.currentTarget || event.srcElement || this;

    if (self.nodeName === "span") {
      self = self.parentNode;
    }
    app.currentContent.set({
      title: app.currentContent.title.trim(),
      text: app.currentContent.text.trim()
    });
    if (app.currentContent.text === app.currentContent.originalText &&
      app.currentContent.title === app.currentContent.originalTitle ) {
      if( !regNoChange.test(self.className) ) {
        self.className += " nochange";
      }
      self.childNodes[0].innerHTML = "No change";

      if (app.domRefs.buttons.tempSaveText) {
        clearTimeout(app.domRefs.buttons.tempSaveText);
      }
      app.domRefs.buttons.tempSaveText = setTimeout(function() {
        self.childNodes[0].innerHTML = "Save";
        self.className = self.className.replace(regNoChange, "");
      }, 2000);
      return false;
    }
    else {
      loadingSomething(true, app.domRefs.contentWrap);
    }
    reqwest({
      url: app.sitePath + "_api/lists/getByTitle('" + app.currentContent.contentType + "')/items(" + app.currentContent.id + ")",
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
          title: "## " + app.currentContent.title + " updated!",
          text: "**" + app.currentContent.category.join('/') + "** has been updated with the changes you just made.",
          type: "success",
          showCancelButton: false
        });
      },
      error: connError,
      complete: function () {
        loadingSomething(false, app.domRefs.contentWrap);
      }
    });
  }

  function createPage () {
    newModal({
      title: "## New Page",
      text: "Give it a name:",
      type: "new"
    }, function ( inputValue ) {
      if ( "object" !== typeof inputValue ) {
        return false;
      }
      loadingSomething(true, app.domRefs.contentWrap);
      var category = inputValue.rootCategory + "/" + inputValue.title.toCamelCase();
      reqwest({
        url: app.sitePath + "_api/lists/getByTitle('" + app.currentContent.contentType + "')/items",
        method: "POST",
        data: JSON.stringify({
          '__metadata': {
            'type': app.currentContent.listItemType
          },
          'Title': inputValue.title,
          'Text': '## New Page :)',
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
          newModal({
            title: "## '" + inputValue.title + "' was created",
            text: "Your page is located at **" + category + "**.\nGo fill it in!",
            type: "success",
            okText: "Take me",
            showCancelButton: false
          }, function() {
            app.router.setRoute(category);
          });
        },
        error: connError,
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
      title: "## DELETE\n**" + app.currentContent.title + "**, Path: " + category,
      text: "*You might wanna check with someone first.*\n",
      type: "warning"
    }, function( choice ) {
      if ( choice === false ) {
        return false;
      }
      loadingSomething(true, app.domRefs.contentWrap);
      reqwest({
        url: app.sitePath + "_api/lists/getByTitle('" + app.currentContent.contentType + "')/items(" + app.currentContent.id + ")",
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
            title: "## " + app.currentContent.title + " deleted!",
            text: "**" + category + "** is no longer in use.",
            type: "success",
            showCancelButton: false
          }, function() {
            app.currentContent.category.pop();
            app.router.setRoute(app.currentContent.category.join("/"));
          });
        },
        error: connError,
        complete: function () {
          loadingSomething(false, app.domRefs.contentWrap);
        }
      });
    });
  }

  function handleCancel ( event ) {

  }

  function handleOk ( event ) {

  }

  function updateTitle () {
    var val = app.domRefs.titleField.value;
    app.domRefs.output.innerHTML = md.render("# " + val + "\n" + app.currentContent.text);
    app.currentContent.set({ title: val });
  }

  function newModal ( options, callback ) {
    options = {
      title: options.title || "## Info",
      text: options.text || "Click OK to continue",
      type: options.type || "success",
      okText: options.okText || "OK!",
      showCancelButton: (typeof options.showCancelButton === "boolean") ? options.showCancelButton : true,
      closeOnConfirm: (typeof options.closeOnConfirm === "boolean") ? options.closeOnConfirm : true
    };
    callback = ( "function" === typeof callback ) ? callback : null;

    // addEvent("keyup", document, handleCancel);

    var newModal = render("modal", options);
    var patches = diff(app.dirtyDOM, newModal);
    app.rootNode = patch(app.rootNode, patches);
    app.dirtyDOM = newModal;
    app.domRefs = new DOMRef();
    app.domRefs.set();
    $(app.domRefs.modalOverlay).velocity({ opacity: 1 }, { duration: 75, display: "block" });
  }

  function toggleEditor () {
    if (app.animating) {
      return false;
    }
    app.animating = true;
    var hasFullPage = regFullPage.test(app.domRefs.content.className);
    app.domRefs.$contentWrap.velocity({ opacity: 0 }, { duration: 50,
      complete: function () {
        app.domRefs.content.className = ( hasFullPage ) ? app.domRefs.content.className.replace(regFullPage, "") : app.domRefs.content.className + " fullPage";
        app.domRefs.contentWrap.className = "";
        app.domRefs.$contentWrap.velocity({ opacity: 1 }, { duration: 75,
          complete: function () {
            if ( hasFullPage ) {
              app.domRefs.editor.refresh();
            }
            app.animating = false;
          }
        });
      }
    });
    return false;
  }

  function toggleCheatSheet () {
    if (app.animating) {
      return false;
    }
    app.animating = true;
    var hasCheatSheet = regCheatSheet.test(app.domRefs.contentWrap.className);
    var className = ( hasCheatSheet ) ? "" : " cheatSheet";
    app.domRefs.$contentWrap.velocity({ opacity: 0 }, { duration: 50,
      complete: function () {
        app.domRefs.contentWrap.className = className;
        app.domRefs.cheatSheet.className = className;
        //app.domRefs.contentWrap.className = ( hasCheatSheet ) ? app.domRefs.contentWrap.className.replace(regCheatSheet, "") : app.domRefs.contentWrap.className + " cheatSheet";
        app.domRefs.$contentWrap.velocity({ opacity: 1 }, { duration: 75,
          complete: function () {
            app.animating = false;
          }
        });
      }
    });
    return false;
  }

  function resetPage () {
    var wrap,
      refreshDOM,
      modalRefreshDOM,
      modalPatches,
      patches;
    if ( app.domRefs.editor ) {
      wrap = app.domRefs.editor.getWrapperElement();
      wrap.parentNode.removeChild(wrap);
      app.domRefs.set({
        editor: null
      });
      refreshDOM = render("editor");
    }
    else {
      refreshDOM = render();
    }
    patches = diff(app.dirtyDOM, refreshDOM);
    app.rootNode = patch(app.rootNode, patches);
    app.dirtyDOM = refreshDOM;

    modalRefreshDOM = render("modal", {});
    modalPatches = diff(app.modalDOM, modalRefreshDOM);
    app.modalOverlay = patch(app.modalOverlay, modalPatches);
    app.modalDOM = modalRefreshDOM;

    app.domRefs = new DOMRef();
    app.domRefs.set();
  }

  function update ( e ) {
    var val = e.getValue();
    app.domRefs.output.innerHTML = md.render("# " + app.currentContent.title + "\n" + val);
    app.currentContent.set({ text: val });
  }

  function insertContent ( content ) {
    app.domRefs.output.innerHTML = md.render("# " + content.title + "\n" + content.text);
    loadingSomething(false, app.domRefs.output);
  }

  function pageSetup () {
    /* Get rid of the ugly nav on the left if it's there */
    try { var leftNav = document.getElementById("leftnav");
      leftNav.parentNode.removeChild(leftNav);} catch (e) {}

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
    document.body.appendChild(app.modalOverlay);

    app.domRefs = new DOMRef();
    app.domRefs.set();
  }

  function getList () {
    reqwest({
      url: app.sitePath + "_api/lists(guid'4522F7F9-1B5C-4990-9704-991725DEF693')/items/?$select=Title,Category",
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
        var page,
          pages = {},
          options = [];
        while ( page = data.d.results.shift() ) {
          pages[page.Category] = page.Title;
          options.push(
            h("option", { value: page.Category }, [String(page.Title)])
          );
        }
        app.menuItems = h("optgroup", options);
      },
      error: connError,
      complete: function () {
        pageSetup();
        app.router.init();
      }
    });
  }

  function setupEditor ( content ) {
    var refreshDOM = render("editor", content);
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
      }),
      $contentWrap: $(app.domRefs.contentWrap)
    });
    app.domRefs.editor.on("change", update);
    loadingSomething(false, app.domRefs.contentWrap);
    app.domRefs.editor.refresh();
  }

  function init ( path, type ) {
    reqwest({
      url: app.sitePath + "_api/lists/getByTitle('" + type + "')/items/?$filter=Category eq '" + path + "'&$select=ID,Title,Text,References,Category",
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
          return false;
        }
        var obj = data.d.results[0];
        app.currentContent = new Content ({
          id: obj.ID,
          title: obj.Title || "",
          text: obj.Text || "",
          references: obj.References.results || [],
          category: obj.Category.split("/"),
          contentType: type,
          listItemType: obj.__metadata.type,
          timestamp: (Date && Date.now() || new Date())
        });
        app.currentContent.set();
        insertContent(app.currentContent);
        loadingSomething(false, app.domRefs.output);
      },
      error: connError,
      complete: function () {
        if ( CodeMirror ) {
          setupEditor(app.currentContent);
        }
        //insertContent(app.currentContent);
        //loadingSomething(false, app.domRefs.output);
      }
    });
  }

  app.dirtyDOM = ( !CodeMirror ) ? render() : render("editor");
  app.rootNode = createElement(app.dirtyDOM);

  app.modalDOM = render("modal", {});
  app.modalOverlay = createElement(app.modalDOM);

  app.router = Router({

    '/(fhm|comm)': {

      '/(\\w+)': {

        '/(content|faq|forms|resources)': {
          //once: getList,
          on: function ( root, sub, type ) {
            console.log("--3: root = " + root + " / sub = " + sub + " / type = " + type);
            loadingSomething(true, app.domRefs.output);
            init("/" + root + "/" + sub, (type) ? type : "Content");
          }
        }
      }

    /*//once: getList,
     on: function ( root, sub ) {
     // If there's no default, forward to the content page.
     app.router.setRoute("/" + root + "/" + sub + "/Content");
     //loadingSomething(true, app.domRefs.output);
     //init(root, sub);
     }
     },

     //once: getList,
     on: function ( root ) {
     var keys = Object.keys(app.pages);
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
     console.log("1: root transform = " + root);
     loadingSomething(true, app.domRefs.output);
     init(root, "Content");
     }*/
  }
  }).configure({
    //convert_handler_in_init: true,
    strict: false,/*
    recurse: "forward",*/
    after: resetPage,
    notfound: function () {
      console.log("location unavailable - this is the notfound handler");
      console.log("forwarding to PHA for kicks");
      app.router.setRoute("/fhm/pha/content");
    }
  });

  getList();
  //app.router.init();

  module.exports = app;

})(window, document, jQuery, reqwest, Router, markdownit);
