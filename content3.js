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

  function render ( target ) {
    var node = (
      h("#wrapper", [
        h("#content.fullPage", [
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
              ]),
              h("input#titleField", { onkeyup: updateTitle, value: String(app.currentContent.title || ""), type: "text" })
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
    //event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var self = event.currentTarget || event.srcElement || this;

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
      if( !regNoChange.test(self.className) ) {
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
          title: [h("h2", [String(app.currentContent.title) + " updated!"])],
          text: [h("strong", [String(app.currentContent.category.join('/'))]), h("text", [" has been updated with the changes you just made."])],
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
        url: app.sitePath + "_api/lists/getByTitle('" + app.currentContent.contentType + "')/items",
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
      title: [h("p", ["DELETE"]), h("strong", [String(app.currentContent.title)]), h("text", [", Path: " + category])],
      text: [h("em", ["You might wanna check with someone first."])],
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
            title: [h("h2", [String(app.currentContent.title) + " deleted!"])],
            text: [h("strong", [String(category)]), h("text", [" is no longer in use."])],
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

  function updateTitle () {
    var val = app.domRefs.titleField.value;
    app.domRefs.output.innerHTML = md.render("# " + val + "\n" + app.currentContent.text);
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
    $(app.modalOverlay).velocity({ opacity: 1 }, { duration: 150, display: "block" });
    addEvent("keyup", document, handleCancel);
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
      h(".modalOverlay", { style: { zIndex: 7, opacity: 0, display: "none" } }, [
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
    $(app.modalOverlay).velocity({ opacity: 0 }, { duration: 150, display: "none",
      complete: function () {
        var destroyModal = h(".modalOverlay", { style: { display: "none", opacity: 0 }});
        var patches = diff(app.modalDOM, destroyModal);
        app.modalOverlay = patch(app.modalOverlay, patches);
        app.modalDOM = destroyModal;
        removeEvent("keyup", document, handleCancel);
      }
    });
  }

  function toggleEditor () {
    if (app.animating) {
      return false;
    }
    app.animating = true;
    var hasFullPage = regFullPage.test(app.domRefs.content.className);
    var className = ( hasFullPage ) ? app.domRefs.content.className.replace(regFullPage, "") : app.domRefs.content.className + " fullPage";
    $(app.domRefs.contentWrap).velocity({ opacity: 0 }, { duration: 150, display: "none",
      complete: function () {
        app.domRefs.content.className = className;
        app.domRefs.contentWrap.className = "";
        app.domRefs.cheatSheet.className = "";
        if ( hasFullPage ) {
          app.domRefs.titleField.removeAttribute("disabled");
        }
        else {
          app.domRefs.titleField.setAttribute("disabled", "disabled");
        }
        $(app.domRefs.contentWrap).velocity({ opacity: 1 }, { duration: 150, display: "block",
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
    var className = ( hasCheatSheet ) ? "" : "cheatSheet";
    var contentWrapClass = ( hasCheatSheet ) ? app.domRefs.contentWrap.className.replace(regCheatSheet, "") : app.domRefs.contentWrap.className + " cheatSheet";
    $(app.domRefs.contentWrap).velocity({ opacity: 0 }, { duration: 150, display: "none",
      complete: function () {
        app.domRefs.cheatSheet.className = className;
        app.domRefs.contentWrap.className = contentWrapClass;
        $(app.domRefs.contentWrap).velocity({ opacity: 1 }, { duration: 150, display: "block",
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
      patches;
    if ( app.domRefs.editor ) {
      wrap = app.domRefs.editor.getWrapperElement();
      wrap.parentNode.removeChild(wrap);
      app.domRefs.set({
        editor: null
      });
      refreshDOM = render("editor");
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

  function update ( e ) {
    var val = e.getValue();
    app.domRefs.output.innerHTML = md.render("# " + app.currentContent.title + "\n" + val);
    app.currentContent.set({ text: val });
  }

  function insertContent ( content ) {
    app.domRefs.output.innerHTML = md.render("# " + content.title + "\n" + content.text);
  }

  function pageSetup () {
    app.dirtyDOM = ( !CodeMirror ) ? render() : render("editor");
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

    app.domRefs = new DOMRef();
    app.domRefs.set();
    app.router.init();
    getList();
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
    app.domRefs.editor.refresh();
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
          fhm = [],
          comm = [];
        while ( page = data.d.results.shift() ) {
          pages[page.Category] = page.Title;
          if ( page.Category.charAt(1) === "F" || page.Category.charAt(1) === "f" ) {
            // This one is Force Health
            fhm.push(
              h("option", { value: page.Category }, [String(page.Title)])
            );
          }
          else {
            // Hopefully this is Comm
            comm.push(
              h("option", { value: page.Category }, [String(page.Title)])
            );
          }
        }
        app.menuItems = [
          h("optgroup", { label: "Force Health Management" }, fhm),
          h("optgroup", { label: "Community Health" }, comm)
        ];
      },
      error: connError
    });
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
      }
    });
  }

  app.router = Router({

      '/(fhm|comm)': {

        '/(\\w+)': {

          '/(content|faq|forms|resources)': {
            //once: getList,
            on: function ( root, sub, type ) {
              loadingSomething(true, app.domRefs.output);
              init("/" + root + "/" + sub, (type) ? type : "Content");
            }
          }
        },

        //once: getList,
        on: function ( root, sub ) {
          // If there's no default, forward to the content page.
          app.router.setRoute("/" + root + "/" + sub + "/Content");
          //loadingSomething(true, app.domRefs.output);
          //init(root, sub);
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
        init(root, "Content");
      }
    }
  ).configure({
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

  pageSetup();

  module.exports = app;

})(window, document, jQuery, reqwest, Router, markdownit);
