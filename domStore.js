function DOMRef ( nodes ) {
  return {
    nodes: nodes,
    content: document.getElementById("content"),
    buttons: document.getElementById("buttons"),
    titleField: document.getElementById("titleField"),
    contentWrap: document.getElementById("contentWrap"),
    cheatSheet: document.getElementById("cheatSheet"),
    input: document.getElementById("input"),
    textarea: document.getElementById("textarea"),
    editor: null,
    output: document.getElementById("output"),
    set: function ( data ) {
      var name;
      data = data || nodes || this.nodes;
      for ( name in data ) {
        if ( this.hasOwnProperty(name) ) {
          this[name] = data[name];
        }
      }
      return this;
    },
    reset: function() {
      var name;
      for ( name in nodes ) {
        if ( this.hasOwnProperty(name) ) {
          this[name] = null;
        }
      }
      nodes = null;
    }
  };
}

module.exports = DOMRef;
