;(function ( window, document, $, reqwest, Router, markdownit, req ) {
  req.config({
    baseUrl: "https://kx.afms.mil/kj/kx7/PublicHealth/Pages/Dev",
    paths: {
      helpers: '../../SiteAssets/Pages/testmgr/helpers',
      manage: 'manage'
    }
  });
  req(['manage', 'helpers'], function( manage ) {
    "use strict";
    var h = require("virtual-dom/h"),
      diff = require("virtual-dom/diff"),
      patch = require("virtual-dom/patch"),
      createElement = require("virtual-dom/create-element"),
      Content = require("./store-dist"),
      DOMRef = require("./domStore-dist"),
      app = {
        sitePath: "https://kx.afms.mil/kj/kx7/PublicHealth/",
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

    function render () {
      return (
        h("#wrapper", [
          h("#content.fullPage", [
            h("#contentWrap", [
              h("#output")
            ])
          ])
        ])
      );
    }

    app.loadingSomething = function ( status, target ) {
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
    };

    app.resetPage = function () {
      var refreshDOM,
        patches;
      if ( !CodeMirror ) {
        refreshDOM = render();
        patches = diff(app.dirtyDOM, refreshDOM);
        app.rootNode = patch(app.rootNode, patches);
        app.dirtyDOM = refreshDOM;
        app.domRefs = new DOMRef();
        app.domRefs.set();
      }
      else {
        resetEditor();
      }
    };

    function insertContent ( content ) {
      app.domRefs.output.innerHTML = md.render("# " + content.title + "\n" + content.text);
      app.loadingSomething(false, app.domRefs.output);
    }

    app.pageSetup = function () {
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
        document.body.appendChild(app.modalOverlay);
      }
      app.domRefs = new DOMRef();
      app.domRefs.set();
      getList();
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
      app.loadingSomething(false, app.domRefs.contentWrap);
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
          app.loadingSomething(false, app.domRefs.output);
        },
        error: connError,
        complete: function () {
          if ( CodeMirror ) {
            manager.setupEditor(app.currentContent);
          }
        }
      });
    }

    if ( CodeMirror ) {
      app.dirtyDOM = renderEditor();
      app.rootNode = createElement(app.dirtyDOM);

      app.modalDOM = h(".modalOverlay", { style: {display: "none", opacity: 0 }});
      app.modalOverlay = createElement(app.modalDOM);
    }
    else {
      app.dirtyDOM = app.render();
      app.rootNode = createElement(app.dirtyDOM);
    }

    app.router = Router({

      '/(fhm|comm)': {

        '/(\\w+)': {

          '/(content|faq|forms|resources)': {
            //once: getList,
            on: function ( root, sub, type ) {
              console.log("--3: root = " + root + " / sub = " + sub + " / type = " + type);
              app.loadingSomething(true, app.domRefs.output);
              init("/" + root + "/" + sub, (type) ? type : "Content");
            }
          }
        }

      /*//once: getList,
       on: function ( root, sub ) {
       // If there's no default, forward to the content page.
       app.router.setRoute("/" + root + "/" + sub + "/Content");
       //app.loadingSomething(true, app.domRefs.output);
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
       app.loadingSomething(true, app.domRefs.output);
       init(root, "Content");
       }*/
    }
    }).configure({
      //convert_handler_in_init: true,
      strict: false,/*
      recurse: "forward",*/
      after: app.resetPage,
      notfound: function () {
        console.log("location unavailable - this is the notfound handler");
        console.log("forwarding to PHA for kicks");
        app.router.setRoute("/fhm/pha/content");
      }
    });

    app.pageSetup();
    //app.router.init();

    module.exports = app;

  });
})(window, document, jQuery, reqwest, Router, markdownit, require("requirejs"));
