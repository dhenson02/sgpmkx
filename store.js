function Content () {
  if ( !(this instanceof Content) ) {
    return new Content();
  }
  this.id = -1;
  this.title = "";
  this.text = "";
  //this.references = [];
  this.policy = "";
  this.resources = "";
  this.tools = "";
  this.category = [];
  this.section = "";
  this.program = "";
  this.page = "";
  this.path = "";
  this.type = "Content";
  this.listItemType = "";
  this.timestamp = null;
  this.set = function ( data ) {
    var name;
    for ( name in data ) {
      if ( this.hasOwnProperty(name) ) {
        // Keep previous version for comparison/diff.
        this["_"+name] = this[name];
        this[name] = data[name];
      }
    }
    return this;
  };
  /*reset: function() {
    var name;
    for ( name in this ) {
      if ( this.hasOwnProperty(name) && name !== "reset" && name !== "set" ) {
        this[name] = null;
      }
    }
  }*/
}

module.exports = Content;
