"use strict";
var h = require("virtual-dom/h"),
  app = require("./content3");

var page = {

  savePage: function ( event ) {
    event = event || window.event;
    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
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
  },

  createPage: function  () {
    newModal({
      title: [h("h2", ["New Page"])],
      text: [h("h2", ["Give it a name:"])],
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
            title: [h("h2", [String(inputValue.title)]), h("text", ["' was created"])],
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
  },

  deletePage: function  () {
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
  },

};
