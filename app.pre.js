
var h = require("virtual-dom/h"),
  diff = require("virtual-dom/diff"),
  patch = require("virtual-dom/patch"),
  createElement = require("virtual-dom/create-element"),
  markdownit = require("markdown-it"),
  h2h = require("html2hscript"),
  md = markdownit({
    highlight: function ( code, lang ) {
      if ( lang && hljs.getLanguage(lang) ) {
        try {return hljs.highlight(lang, code).value;} catch ( e ) {}
      } return '';}
  });
function Item ( page ) {
  return {
    page: page,
    init: function () {
      this.id = this.page.id || -1;
      this.title = this.page.title || "";
      this.text = this.page.text || "";
      this.references = this.page.references || [];
      this.category = this.page.category || [];
      this.originalTitle = this.page.title || "";
      this.originalText = this.page.text || "";
      this.contentType = this.page.contentType || "Content";
      this.listItemType = this.page.listItemType || "";
      this.timestamp = this.page.timestamp || null;
      return this;
    },
    update: function ( data ) {
      for ( var label in data ) {
        if ( this.hasOwnProperty(label)) {
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
}


var item = new Item({
  id: 2,
  originalTitle: "Title",
  originalText: "Text",
  references: [ "AFI48-123", "AFI44-170" ],
  timestamp: (Date.now() || new Date()),
  category: "/fhm/pha".split("/"),
  contentType: "Content",
  text: "Text",
  title: "Title",
  listItemType: "DP.Speshul"
});


var dirtyDOM,
  rootNode,
  refresh,
  patches;
item.init();
h2h(md.render("# " + item.title + "\n" + item.text), function(err, hscript) {
  "use strict";
  console.log(hscript);
  dirtyDOM = render(hscript);
  console.log(dirtyDOM);
  rootNode = createElement(dirtyDOM);
  pageSetup(rootNode);
});

function render ( content ) {
  console.log(createElement(new Function("h('div', ['We out'])")));
  return (
    h("#wrapper", [
      h("#content.fullPage", [
        h("#buttons"),
        h("#contentWrap", [
            h("#output"),
              content
          ]
        )
      ])
    ])
  );
}

function flushDOM ( content ) {
  "use strict";
  h2h(md.render("# " + content.title + "YES???\n" + content.text), function(err, hscript) {
    console.log(hscript);
    refresh = render(hscript);
    console.log(refresh);
    patches = diff(dirtyDOM, refresh);
    rootNode = patch(rootNode, patches);
    dirtyDOM = refresh;
  });
}

flushDOM(item);
