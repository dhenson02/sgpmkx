function DOMRef () {
  if ( !(this instanceof DOMRef) ) {
    return new DOMRef();
  }
  this.content = document.getElementById("content");
  this.buttons = document.getElementById("buttons");
  this.titleField = document.getElementById("titleField");
  this.contentWrap = document.getElementById("contentWrap");
  this.cheatSheet = document.getElementById("cheatSheet");
  this.input = document.getElementById("input");
  this.textarea = document.getElementById("textarea");
  this.editor = null;
  this.output = document.getElementById("output");
  this.activeLink = document.querySelector("#ph-nav > ul a[href='" + window.location.hash + "']");
  this.set = function ( data ) {
    var name;
    for ( name in data ) {
      if ( this.hasOwnProperty(name) ) {
        this[name] = data[name];
      }
    }
    return this;
  };
  /*reset: function () {
    var name;
    for ( name in this ) {
      if ( this.hasOwnProperty(name) && name !== "reset" && name !== "set" ) {
        this[name] = null;
      }
    }
    nodes = null;
  }*/
}

module.exports = DOMRef;
