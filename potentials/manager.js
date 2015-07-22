define(function () {
  "use strict";

  var app = require("./content3b"),
    h = require("virtual-dom/h"),
    diff = require("virtual-dom/diff"),
    patch = require("virtual-dom/patch"),
    createElement = require("virtual-dom/create-element"),
    DOMRef = require("./domStore"),
    Content = require("./store"),
    regFullPage = / ?fullPage/g,
    regCheatSheet = / ?cheatSheet/g,
    regNoChange = / ?nochange/g,
    manage = {};

  app.digest = document.getElementById("__REQUESTDIGEST").value;

  manage.newModal = function ( options, callback ) {
    options = {
      title: options.title || "## Info",
      text: options.text || "Click OK to continue",
      type: options.type || "success",
      okText: options.okText || "OK!",
      showCancelButton: (typeof options.showCancelButton === "boolean") ? options.showCancelButton : true,
      closeOnConfirm: (typeof options.closeOnConfirm === "boolean") ? options.closeOnConfirm : true
    };

    callback = ( "function" === typeof callback ) ? callback : null;

    var freshDOM = modalRender(options, callback);
    var patches = diff(app.modalDOM, freshDOM);
    app.modalOverlay = patch(app.modalOverlay, patches);
    app.modalDOM = freshDOM;
    //app.domRefs = new DOMRef();
    //app.domRefs.set();
    $(app.modalOverlay).velocity({ opacity: 1 }, { duration: 75, display: "block" });
    addEvent("keyup", document, handleCancel);
  };

  manage.handleOk = function ( event, callback ) {
    event = event || window.event;
    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var self = event.currentTarget || event.srcElement || this;
    var keyCode = event.keyCode || event.which || event.charCode || null;
    if (self.nodeName === "span") {
      self = self.parentNode;
    }
    if ( event.type === "keyup" && keyCode === 13 || event.type === "click" ) {
      if ( !callback ) {
        return false;
      }
      var title = document.getElementById("modalInput").value.trim();
      //var category = document.getElementById("menuItems").value + title.replace(/\s/, "");
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
  };

  manage.handleCancel = function ( event, callback ) {
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
  };

  manage.modalRender = function ( options, callback ) {
    function ok ( event ) {
      handleOk(event, callback);
    }
    function cancel ( event ) {
      handleCancel(event, callback);
    }
    return (
      h(".modalOverlay", { style: { zIndex: 7 } }, [
        h(".modalBg", { onclick: cancel }),
        h(".modal", [
          h(".header", [
            h("h2", [String(options.title || "")])
          ]),
          h("label", [
            String(options.text || ""),
            ( options.type === "new" ) && (h("input.modalInput", { type: "text", tabIndex: 0, autofocus: "", onkeyup: ok })) || null,
            ( options.type === "new" ) && (h("select.menuItems", { tabIndex: 1, onkeyup: ok }, [app.menuItems || null])) || null
          ]),
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
  };

  manage.modalSuicide = function () {
    $(app.modalOverlay).velocity({ opacity: 0 }, { duration: 75, display: "none" });
    var destroyModal = h(".modalOverlay", { style: { display: "none", opacity: 0 }});
    var patches = diff(app.modalDOM, destroyModal);
    app.modalOverlay = patch(app.modalOverlay, patches);
    app.modalDOM = destroyModal;
    removeEvent("keyup", document, handleCancel);
  };

  manage.toggleEditor = function () {
    if (app.animating) {
      return false;
    }
    app.animating = true;
    var hasFullPage = regFullPage.test(app.domRefs.content.className);
    var className = ( hasFullPage ) ? app.domRefs.content.className.replace(regFullPage, "") : app.domRefs.content.className + " fullPage";
    app.domRefs.$contentWrap.velocity({ opacity: 0 }, { duration: 50,
      complete: function () {
        app.domRefs.content.className = className;
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
  };

  manage.toggleCheatSheet = function () {
    if (app.animating) {
      return false;
    }
    app.animating = true;
    var hasCheatSheet = regCheatSheet.test(app.domRefs.contentWrap.className);
    var className = ( hasCheatSheet ) ? "" : "cheatSheet";
    var contentWrapClass = ( hasCheatSheet ) ? app.domRefs.contentWrap.className.replace(regCheatSheet, "") : app.domRefs.contentWrap.className + " cheatSheet";
    app.domRefs.$contentWrap.velocity({ opacity: 0 }, { duration: 50,
      complete: function () {
        app.domRefs.cheatSheet.className = className;
        app.domRefs.contentWrap.className = contentWrapClass;
        app.domRefs.$contentWrap.velocity({ opacity: 1 }, { duration: 75,
          complete: function () {
            app.animating = false;
          }
        });
      }
    });
    return false;
  };

  manage.savePage = function ( event ) {
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
  };

  manage.createPage = function () {
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
  };

  manage.deletePage = function () {
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
  };

  manage.updateTitle = function () {
    var val = app.domRefs.titleField.value;
    app.domRefs.output.innerHTML = md.render("# " + val + "\n" + app.currentContent.text);
    app.currentContent.set({ title: val });
  };

  manage.update = function ( e ) {
    var val = e.getValue();
    app.domRefs.output.innerHTML = md.render("# " + app.currentContent.title + "\n" + val);
    app.currentContent.set({ text: val });
  };

  manage.resetEditor = function () {
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
    }
    patches = diff(app.dirtyDOM, refreshDOM);
    app.rootNode = patch(app.rootNode, patches);
    app.dirtyDOM = refreshDOM;

    modalRefreshDOM = h(".modalOverlay", { style: {display: "none", opacity: 0 }});
    patches = diff(app.modalDOM, modalRefreshDOM);
    app.modalOverlay = patch(app.modalOverlay, patches);
    app.modalDOM = modalRefreshDOM;

    app.domRefs = new DOMRef();
    app.domRefs.set();
    modalSuicide();
  };

  manage.renderEditor = function () {
    return (
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
  };

  return manage;
});
