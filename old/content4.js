//(function ( window, document, $, reqwest, Router, markdownit ) {
"use strict";

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
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
function addEvent ( evt, element, fnc ) {
  return ((element.addEventListener) ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc));
}
function removeEvent ( evt, element, fnc ) {
  return ((element.removeEventListener) ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc));
}
function loadingSomething ( status, target ) {
  if ( status === true ) {
    if ( inTransition[target] === true ) {
      return false;
    }
    /* consider storing pointer info to element in use inside `item` to execute $.velocity.("finish") */
    inTransition[target] = true;
    if ( regLoading.test(target.className) === false ) {
      target.className += " loading";
    }
  }
  else {
    setTimeout(function() {
      inTransition[target] = false;
      target.className = target.className.replace(regLoading, "");
    }, 200);
  }
}
function connError ( error ) {
  console.log("error connecting - " + error);
}
/*function Tree ( nodes ) {
  return {
    nodes: nodes,
    digest: document.getElementById("__REQUESTDIGEST").value,
    fragment: document.createDocumentFragment(),
    head: document.getElementsByTagName("head")[0],
    init: function () {
      var name;
      nodes = nodes || this.nodes;
      for ( name in nodes ) {
        this[name] = document.createElement(nodes[name].type);
        this[name].id = nodes[name].id || "";
        this[name].className = nodes[name].className;
      }
      return this.domSetup();
    },
    domSetup: function () {
      var name;
      for ( name in nodes ) {
        if ( this.hasOwnProperty(name) ) {
          var parent = this[nodes[name].parentID];
          if ( !nodes[name].before && !nodes[name].after ) {
            parent.appendChild(this[name]);
          }
          else if ( nodes[name].before ) {
            parent.insertBefore(this[nodes[name].before], this[name]);
          }
          else if ( nodes[name].after ) {
            parent.insertBefore(this[name], this[nodes[name].after]);
          }
          if ( !nodes[name].parentID ) {
            this.fragment.appendChild(this[name]);
          }
        }
      }
      return this.fragment;
    },
    reset: function ( nodes ) {
      var name;
      nodes = nodes || this.nodes;
      for ( name in nodes ) {
        if ( this.hasOwnProperty(name) ) {
          if ( this[name].parentNode ) {
            this[name].parentNode.removeChild(this[name]);
            delete this[name];
          }
          /!*this[name] = nodes[name].id ?
            document.getElementById(nodes[name].id) :
            nodes[name].className ?
              document.querySelectorAll(nodes[name].className) :
              document.getElementsByTagName(nodes[name].type);*!/
        }
      }
      return this.init(nodes);
    }
  };
}*/

var h = require("virtual-dom/h"),
  diff = require("virtual-dom/diff"),
  patch = require("virtual-dom/patch"),
  createElement = require("virtual-dom/create-element"),
  regLoading = / ?loading/g,
  regFullPage = / ?fullPage/g,
  regCheatSheet = / ?cheatSheet/g,
  regNoChange = / ?nochange/g,
  sitePath = "/kj/kx7/PublicHealth/",
/*  pageDOM = new Tree({
    wrapper: {type: "div", id: "wrapper"},
    content: {type: "div", id: "content", className: "fullPage", parentID: "wrapper"},
    buttons: {type: "div", id: "buttons", parentID: "content", before: "contentWrap"},
    contentWrap: {type: "div", id: "contentWrap", parentID: "content", before: "modalOverlay", after: "buttons"},
    output: {type: "div", id: "output", parentID: "contentWrap", after: "input"},
    modalOverlay: {type: "div", id: "modalOverlay", parentID: "content", after: "contentWrap"},
    menuItems: {type:"select", id: "menuItems", className: "menuItems", parentID: "modal", before: "modalButtons", after: "modalTitleInput"},
    menuGroup: {type:"optgroup", parentID: "menuItems"}
  }),*/
  md = markdownit({
    highlight: function ( code, lang ) {
      if ( lang && hljs.getLanguage(lang) ) {
        try {return hljs.highlight(lang, code).value;} catch ( e ) {}
      } return '';}
  }),
  pages = {},
  $contentWrap,
  digest = document.getElementById("__REQUESTDIGEST").value,
  buttons,
  editor,
  inTransition = {},
  animating = false,
  currentContent,
  dirtyDOM,
  rootNode,
  refreshDOM,
  patches,
  domRefs;

function DOMRef ( nodes ) {
  var blankModal = renderModal({});
  return {
    nodes: nodes,
    content: null,
    buttons: null,
    titleField: null,
    contentWrap: null,
    $contentWrap: $(this.contentWrap),
    input: null,
    output: null,
    currentModal: nodes.currentModal || blankModal,
    modalOverlay: createElement(this.currentModal),
    $modalOverlay: $(this.modalOverlay),
    menuItems: null,
    init: function () {
      var name;
      nodes = nodes || this.nodes;
      for ( name in nodes ) {
        if ( this.hasOwnProperty(name) ) {
          this[name] = nodes[name];
        }
      }
      return this;
    },
    update: function ( data ) {
      for ( var label in data ) {
        if ( this.hasOwnProperty(label) ) {
          this[label] = data[label];
        }
      }
      return this;
    }
  };
}

function Content ( page ) {
  var originalTitle = page.title;
  var originalText = page.text;
  var originalReferences = page.references;
  return {
    page: page,
    id: -1,
    title: "",
    text: "",
    references: [],
    category: [],
    contentType: "Content",
    listItemType: "",
    timestamp: null,
    originalTitle: originalTitle || "",
    originalText: originalText || "",
    originalReferences: originalReferences || [],
    init: function () {
      var name;
      page = page || this.page;
      for ( name in page ) {
        if ( this.hasOwnProperty(name) ) {
          this[name] = page[name];
        }
      }
      return this;
    },
    update: function ( data ) {
      for ( var label in data ) {
        if ( this.hasOwnProperty(label) ) {
          this[label] = data[label];
        }
      }
      return this;
    }
  };
}


function pageSetup ( rootNode ) {
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
    catch ( err ) {
      document.body.appendChild(rootNode);
    }
  }
  /* Get rid of the ugly nav on the left if it's there */
  try { var leftNav = document.getElementById("leftnav");
    leftNav.parentNode.removeChild(leftNav);} catch (e) {}

  domRefs = ( !CodeMirror ) ?
    new DOMRef({
      content: document.getElementById("content"),
      contentWrap: document.getElementById("contentWrap"),
      $contentWrap: $(this.contentWrap),
      output: document.getElementById("output"),
    }).init() :
    new DOMRef({
      content: document.getElementById("content"),
      buttons: document.getElementById("buttons"),
      titleField: document.getElementById("titleField"),
      contentWrap: document.getElementById("contentWrap"),
      $contentWrap: $(this.contentWrap),
      input: document.getElementById("input"),
      output: document.getElementById("output"),
    }).init();
  domRefs.content.appendChild(domRefs.modalOverlay);
}

function insertContent ( content ) {
  domRefs.output.innerHTML = md.render("# " + content.originalTitle + "\n" + content.originalText);
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

  var newModal = renderModal(options);
  patches = diff(domRefs.currentModal, newModal);
  domRefs.modalOverlay = patch(domRefs.modalOverlay, patches);
  domRefs.currentModal = newModal;
  domRefs.$modalOverlay.velocity({ opacity: 1 }, { duration: 75, display: "block" });
}

/*function newModal ( options, cb ) {
  try { destroyModal(); } catch(e) {}

  if ( "function" !== typeof cb ) {
    cb = null;
  }

  var modalTitleInput, modalCategorySelect,
    modalOverlay = document.createElement("div"),
    $modalOverlay = $(modalOverlay),
    modalBg = document.createElement("div"),
    header = document.createElement("div"),
    label = document.createElement("label"),
    modal = document.createElement("div"),
    modalButtons = document.createElement("div"),
    okButton = document.createElement("div"),
    okSpan = document.createElement("span"),
    cancelButton = document.createElement("div"),
    cancelSpan = document.createElement("span"),
    opts = {
      title: options.title || "## Info",
      text: options.text || "Click OK to continue",
      type: options.type || "success",
      okText: options.okText || "OK!",
      showCancelButton: (typeof options.showCancelButton === "boolean") ? options.showCancelButton : true,
      closeOnConfirm: (typeof options.closeOnConfirm === "boolean") ? options.closeOnConfirm : true
    };
  modalOverlay.id = "modalOverlay";
  modalOverlay.className = "modalOverlay " + opts.type;
  modalBg.id = "modalBg";
  modalBg.className = "modalBg";
  modal.id = "modal";
  modal.className = "modal";
  okButton.className = "btn";
  okButton.id = "okButton";
  modalButtons.className = "modalButtons";
  header.className = "header";
  header.innerHTML = md.render(opts.title);
  label.innerHTML = md.render(opts.text);
  label.setAttribute("for", "modalTitleInput");
  modal.appendChild(header);
  modal.appendChild(label);

  if ( opts.type === "new" ) {
    modalTitleInput = document.createElement("input");
    modalTitleInput.id = "modalTitleInput";
    modalTitleInput.name = "titleInput";
    modalTitleInput.setAttribute("type", "text");
    modalTitleInput.setAttribute("tab-index", "1");
    // This is where we add all the options to this thing by looping over pages[].
    modalCategorySelect = menuItems;
    modalCategorySelect.id = "modalCategorySelect";
    modalCategorySelect.name = "root";
    modal.appendChild(modalTitleInput);
    modal.appendChild(modalCategorySelect);
  }

  okSpan.appendChild(txt(opts.okText));
  okButton.appendChild(okSpan);
  modalButtons.appendChild(okButton);

  if ( opts.showCancelButton !== false ) {
    cancelSpan.appendChild(txt("Nope."));
    cancelButton.className = "btn";
    cancelButton.id = "cancelButton";
    cancelButton.appendChild(cancelSpan);
    modalButtons.appendChild(cancelButton);
  }

  modal.appendChild(modalButtons);
  modalOverlay.appendChild(modalBg);
  modalOverlay.appendChild(modal);
  modalOverlay.style.opacity = 0;
  addEvent("click", modalBg, handleCancel);
  if (opts.type === "new") {
    modalTitleInput.focus();
    addEvent("keyup", modalTitleInput, handleOk);
    addEvent("keyup", modalCategorySelect, handleOk);
    addEvent("change", modalTitleInput, handleOk);
    addEvent("change", modalCategorySelect, handleOk);
  }
  addEvent("click", okButton, handleOk);
  if (opts.showCancelButton !== false) {
    addEvent("click", cancelButton, handleCancel);
  }
  addEvent("keyup", document, handleCancel);

  content.appendChild(modalOverlay);
  domRefs.$modalOverlay.velocity({ opacity: 1 }, { duration: 75, display: "block" });

  function handleAppend ( event ) {
    event = event || window.event;
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var val = {
      title: modalTitleInput.value.trim(),
      rootCategory: modalCategorySelect.value
    };
    pathLabel.innerHTML = val.rootCategory + "/" + val.title.toCamelCase();
    return false;
  }

  function handleOk ( event ) {
    event = event || window.event;
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var keyCode = event.keyCode || event.which || event.charCode || null,
      val;
    if ( keyCode == 13 || event.type === "click" ) {
      if ( !cb ) {
        destroyModal();
        return true;
      }
      if ( opts.type === "new" ) {
        val = {
          title: modalTitleInput.value.trim(),
          rootCategory: modalCategorySelect.value
        };
        if ( val.title && val.rootCategory ) {
          cb(val);
        }
        else {
          if ( !val.title ) {
            modalTitleInput.style.borderColor = "red";
            return false;
          }
          if ( !val.rootCategory ) {
            modalCategorySelect.style.borderColor = "red";
            return false;
          }
        }
      }
      else {
        cb(true);
      }
      destroyModal();
    }
  }

  function handleCancel ( event ) {
    event = event || window.event;
    //     event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var self = event.currentTarget || event.srcElement || this;
    var keyCode = event.keyCode || event.which || event.charCode || null;
    if ( keyCode === 27 || self === modalBg || event.type === "click" ) {
      destroyModal();
    }
  }

  function destroyModal () {
    $modalOverlay.velocity({ opacity: 0 }, { duration: 75, display: "none" });
    removeEvent("click", modalBg, handleCancel);
    if ( opts.type === "new" ) {
      removeEvent("keyup", modalTitleInput, handleOk);
      removeEvent("keyup", modalCategorySelect, handleOk);
      removeEvent("change", modalTitleInput, handleOk);
      removeEvent("change", modalCategorySelect, handleOk);
    }
    removeEvent("click", okButton, handleOk);
    if ( opts.showCancelButton ) {
      removeEvent("click", cancelButton, handleCancel);
    }
    removeEvent("keyup", document, handleCancel);
    modalOverlay.parentNode.removeChild(modalOverlay);
    modalOverlay = null;
    $modalOverlay = null;
    return false;
  }
}*/

function init ( id, type ) {
  reqwest({
    url: "https://kx.afms.mil" + sitePath + "_api/lists/getByTitle('" + type + "')/items/?$filter=Category eq '" + id + "'&$select=ID,Title,Text,References,Category",
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
      var obj = data.d.results[0];
      currentContent = new Content ({
        id: obj.ID,
        title: obj.Title || "",
        text: obj.Text || "",
        references: obj.References.results || [],
        category: obj.Category.split("/"),
        contentType: type,
        listItemType: obj.__metadata.type,
        timestamp: (Date && Date.now() || new Date())
      }).init();
    },
    error: connError,
    complete: function () {
      //contentWrap.innerHTML = "";
      //domRefs.output.innerHTML = md.render("# " + item.originalTitle + "\n" + item.originalText);
      insertContent(currentContent);
      if ( !CodeMirror ) {
        fastdom.write(function() {
          try { loadingSomething(false, domRefs.output) } catch (e) {
            try { loadingSomething(false, domRefs.contentWrap); } catch ( e ) {
            } }
        });
      }
      else {
        loadingSomething(true, domRefs.contentWrap);
        var titleField,
          toggler,
          cheatSheetButton,
          deleteButton,
          create,
          save,
          spans = [
            document.createElement("span"),
            document.createElement("span"),
            document.createElement("span"),
            document.createElement("span"),
            document.createElement("span")
          ],
          input,
          cheatSheet,
          textarea;

        //editorCSS = document.createElement("link");
        //editorCSS.type = "text/css";
        //editorCSS.rel = "stylesheet";
        //editorCSS.href = sitePath + "Pages/Dev/editor.min.css";
        //head.appendChild(editorCSS);

        spans[0].appendChild(txt("Toggle Editor"));
        spans[1].appendChild(txt("Cheat Sheet"));
        spans[2].appendChild(txt("Delete"));
        spans[3].appendChild(txt("New"));
        spans[4].appendChild(txt("Save"));

        titleField = document.createElement("input");
        titleField.id = "titleField";
        titleField.value = currentContent.originalTitle;
        titleField.setAttribute("type", "text");
        titleField.setAttribute("tab-index", "1");

        toggler = document.createElement("div");
        toggler.id = "toggler";
        toggler.appendChild(spans[0]);
        toggler.setAttribute("role", "button");
        toggler.className = "btn";

        cheatSheetButton = document.createElement("div");
        cheatSheetButton.id = "cheatSheetButton";
        cheatSheetButton.appendChild(spans[1]);
        cheatSheetButton.setAttribute("role", "button");
        cheatSheetButton.className = "btn";

        deleteButton = document.createElement("div");
        deleteButton.id = "deleteButton";
        deleteButton.appendChild(spans[2]);
        deleteButton.setAttribute("role", "button");
        deleteButton.className = "btn";

        create = document.createElement("div");
        create.id = "create";
        create.appendChild(spans[3]);
        create.setAttribute("role", "button");
        create.className = "btn";

        save = document.createElement("div");
        save.id = "save";
        save.appendChild(spans[4]);
        save.setAttribute("role", "button");
        save.className = "btn";

        addEvent("keyup", titleField, titleEdit);
        addEvent("click", toggler, toggleEditor);
        addEvent("click", cheatSheetButton, toggleCheatSheet);
        addEvent("click", deleteButton, deletePage);
        addEvent("click", create, createPage);
        addEvent("click", save, savePage);

        fragment.appendChild(titleField);
        fragment.appendChild(toggler);
        fragment.appendChild(cheatSheetButton);
        fragment.appendChild(deleteButton);
        fragment.appendChild(create);
        fragment.appendChild(save);

        domRefs.buttons.innerHTML = "";
        domRefs.buttons.appendChild(fragment);

        cheatSheet = document.createElement("div");
        cheatSheet.id = "cheatSheet";
        cheatSheet.appendChild(txt("Delightful!"));

        textarea = document.createElement("textarea");
        textarea.id = "textarea";
        textarea.appendChild(txt(currentContent.originalText));

        input = document.createElement("div");
        input.id = "input";
        input.appendChild(textarea);

        fragment.appendChild(domRefs.buttons);
        fragment.appendChild(cheatSheet);
        content.insertBefore(fragment, domRefs.contentWrap);

        domRefs.contentWrap.insertBefore(input, domRefs.output);
        if ( !editor ) {
          fastdom.write(function() {
            editor = CodeMirror.fromTextArea(textarea, {
              mode: 'gfm',
              lineNumbers: false,
              matchBrackets: true,
              lineWrapping: true,
              //theme: "mdn-like",
              theme: "neo",
              extraKeys: { "Enter": "newlineAndIndentContinueMarkdownList" }
            });
            editor.on("change", update);
          });
          fastdom.defer(function() {
            loadingSomething(false, domRefs.contentWrap);
          });
        }
      }

      function titleEdit () {
        domRefs.output.innerHTML = md.render("# " + domRefs.titleField.value + "\n" + currentContent.text);
        currentContent.title = domRefs.titleField.value;
      }

      function update ( e ) {
        currentContent.text = e.getValue();
        domRefs.output.innerHTML = md.render("# " + currentContent.title + "\n" + currentContent.text);
      }

      function savePage ( event ) {
        event = event || window.event;
        event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
        event.preventDefault ? event.preventDefault() : (event.returnValue = false);
        var self = event.currentTarget || event.srcElement || this;

        if (self.nodeName === "span") {
          self = self.parentNode;
        }
        currentContent.title = currentContent.title.trim();
        currentContent.text = currentContent.text.trim();
        if (currentContent.text === currentContent.originalText &&
            currentContent.title === currentContent.originalTitle ) {
          if( !regNoChange.test(self.className) ) {
            self.className += " nochange";
          }
          self.childNodes[0].innerHTML = "No change";

          if (domRefs.buttons.tempSaveText) {
            clearTimeout(domRefs.buttons.tempSaveText);
          }
          domRefs.buttons.tempSaveText = setTimeout(function() {
            self.childNodes[0].innerHTML = "Save";
            self.className = self.className.replace(regNoChange, "");
          }, 2000);
          return false;
        }
        else {
          loadingSomething(true, domRefs.contentWrap);
        }
        reqwest({
          url: "https://kx.afms.mil" + sitePath + "_api/lists/getByTitle('" + currentContent.contentType + "')/items(" + currentContent.id + ")",
          method: "POST",
          data: JSON.stringify({
            '__metadata': {
              'type': currentContent.listItemType
            },
            'Title': currentContent.title,
            'Text': currentContent.text
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
          success: function() {
            newModal({
              title: "## " + currentContent.title + " updated!",
              text: "**" + currentContent.category.join('/') + "** has been updated with the changes you just made.",
              type: "success",
              showCancelButton: false
            });
          },
          error: connError,
          complete: function () {
            loadingSomething(false, domRefs.contentWrap);
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
          loadingSomething(true, domRefs.contentWrap);
          var category = inputValue.rootCategory + "/" + inputValue.title.toCamelCase();
          reqwest({
            url: "https://kx.afms.mil" + sitePath + "_api/lists/getByTitle('" + currentContent.contentType + "')/items",
            method: "POST",
            data: JSON.stringify({
              '__metadata': {
                'type': currentContent.listItemType
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
              "X-RequestDigest": digest
            },
            success: function() {
              newModal({
                title: "## '" + inputValue.title + "' was created",
                text: "Your page is located at **" + category + "**.\nGo fill it in!",
                type: "success",
                okText: "Take me",
                showCancelButton: false
              }, function() {
                router.setRoute(category);
              });
            },
            error: connError,
            complete: function () {
              loadingSomething(false, domRefs.contentWrap);
            }
          });
        });
      }

      function deletePage () {
        currentContent.title = currentContent.title.trim();
        var category = currentContent.category.join("/");
        newModal({
          title: "## DELETE\n**" + currentContent.title + "**, Path: " + category,
          text: "*You might wanna check with someone first.*\n",
          type: "warning"
        }, function( choice ) {
          if ( choice === false ) {
            return false;
          }
          loadingSomething(true, domRefs.contentWrap);
          reqwest({
            url: "https://kx.afms.mil" + sitePath + "_api/lists/getByTitle('" + currentContent.contentType + "')/items(" + currentContent.id + ")",
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
              "X-RequestDigest": digest
            },
            success: function() {
              newModal({
                title: "## " + currentContent.title + " deleted!",
                text: "**" + category + "** is no longer in use.",
                type: "success",
                showCancelButton: false
              }, function() {
                currentContent.category.pop();
                router.setRoute(currentContent.category.join("/"));
              });
            },
            error: connError,
            complete: function () {
              loadingSomething(false, domRefs.contentWrap);
            }
          });
        });
      }

      function toggleEditor () {
        if (animating === true) {
          return false;
        }
        animating = true;
        var hasFullPage = regFullPage.test(domRefs.content.className);
        domRefs.$contentWrap.velocity({ opacity: 0 }, { duration: 50,
          complete: function () {
            domRefs.content.className = ( hasFullPage ) ? domRefs.content.className.replace(regFullPage, "") : domRefs.content.className + " fullPage";
            domRefs.contentWrap.className = "";
            domRefs.$contentWrap.velocity({ opacity: 1 }, { duration: 75,
              complete: function () {
                if ( hasFullPage ) {
                  domRefs.editor.refresh();
                }
                animating = false;
              }
            });
          }
        });
        return false;
      }

      function toggleCheatSheet () {
        if (animating === true) {
          return false;
        }
        animating = true;
        var hasCheatSheet = regCheatSheet.test(domRefs.contentWrap.className);
        domRefs.$contentWrap.velocity({ opacity: 0 }, { duration: 50,
          complete: function () {
            domRefs.contentWrap.className = ( hasCheatSheet ) ? domRefs.contentWrap.className.replace(regCheatSheet, "") : domRefs.contentWrap.className + " cheatSheet";
            domRefs.$contentWrap.velocity({ opacity: 1 }, { duration: 75,
              complete: function () {
                animating = false;
              }
            });
          }
        });
        return false;
      }
    }

  });
}

function navList () {
  reqwest({
    url: "https://kx.afms.mil" + sitePath + "_api/lists(guid'4522F7F9-1B5C-4990-9704-991725DEF693')/items/?$select=Title,Category",
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
      var page = null,
        options = [];
      while ( page = data.d.results.shift() ) {
        pages[page.Category] = page.Title;
        options.push(
          h("option", {value: page.Category}, [page.Title])
        );
      }
      domRefs.menuItems = createElement(
        h("select#menuItems", [
            h("optgroup", options)
          ]
        )
      );
      /*var page,
        optionTmp,
        fragment = document.createDocumentFragment(),
        group = document.createElement("optgroup");
      menuItems = document.createElement("select");
      while ( page = data.d.results.shift() ) {
        pages[page.Category] = page.Title;
        optionTmp = document.createElement("option");
        optionTmp.innerHTML = page.Title;
        optionTmp.value = page.Category;
        fragment.appendChild(optionTmp);
      }
      group.label = "Public Health";
      group.appendChild(fragment);
      menuItems.appendChild(group);*/
    },
    error: connError
  });
}

function resetPage () {
  refreshDOM = ( !CodeMirror ) ? render() : renderEditor();
  patches = diff(dirtyDOM, refreshDOM);
  rootNode = patch(rootNode, patches);
  dirtyDOM = refreshDOM;
}

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

function renderEditor () {
  return (
    h("#wrapper", [
      h("#content.fullPage", [
        h("#buttons", [
          h("input#titleField", { "ev-keyup": titleEdit, value: "" }),
          h("#toggler", { "ev-click": toggleEditor } [ h("span", ["Toggle Editor"]) ]),
          h("#cheatSheetButton", { "ev-click": toggleCheatSheet } [ h("span", ["Cheat Sheet"]) ]),
          h("#deleteButton", { "ev-click": deletePage } [ h("span", ["Delete"]) ]),
          h("#create", { "ev-click": createPage } [ h("span", ["New"]) ]),
          h("#save", { "ev-click": savePage } [ h("span", ["Save"]) ])
        ]),
        h("#cheatSheet"),
        h("#contentWrap", [
          h("#input", [
            h("textarea#textarea")
          ]),
          h("#output")
        ])
      ])
    ])
  );
}

function renderModal ( options ) {
  return (
    h("#modalOverlay", [
      h("#modalBg", { "ev-click": handleCancel }),
      h("#modal", [
        h("div.header", [String(options.title)]),
        h("label", [
          String(options.text),
          ( options.type === "new" ) && (h("input#modalTitleInput", { type: "text" })) || null,
          ( options.type === "new" ) && (h("select#modalCategorySelect")) || null
        ]),
        h("#modalButtons.modalButtons", [
          h("#okButton.btn", { "ev-click": handleOk }, [
            h("span", [String(options.okText)])
          ]),
          ( options.showCancelButton ) && h("#cancelButton.btn", { "ev-click": handleCancel }, [
            h("span", [String("Nope.")])
          ]) || null
        ])
      ])
    ])
  );
}

dirtyDOM = render();
rootNode = createElement(dirtyDOM);
pageSetup(rootNode);

var router = Router({

  '/(fhm|comm)': {

    '/(\\w+)': {

      '/(content|faq|forms|resources)': {
        once: navList,
        on: function ( root, sub, type ) {
          console.log("--3: root = " + root + " / sub = " + sub + " / type = " + type);
          loadingSomething(true, domRefs.output);
          init("/" + root + "/" + sub, (type) ? type : "Content");
        }
      },

      once: navList,
      on: function ( root, sub ) {
        var keys = Object.keys(pages);
        var path = keys.indexOf(root);
        console.log("--2: root start = " + root + " / sub start = " + sub);
        if ( path > -1 ) {
          root = keys[path];
        }
        else {
          root = "/" + root + "/" + sub;
          sub = "Content";
        }
        console.log("--2: root transform = " + root + " / sub transform? = " + sub);
        loadingSomething(true, domRefs.output);
        init(root, sub);
      }
    },

    once: navList,
    on: function ( root ) {
      var keys = Object.keys(pages);
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
      loadingSomething(true, domRefs.output);
      init(root, "Content");
    }
  }
}).configure({
  //convert_handler_in_init: true,
  strict: false,/*
  recurse: "forward",*/
  html5history: true,
  after: resetPage,
  notfound: function () {
    console.log("location unavailable - this is the notfound handler");
  }
});

router.init();


//})(window, document, jQuery, reqwest, Router, markdownit);
