function Content () {
  if ( !(this instanceof Content) ) {
    return new Content();
  }
  this.id = -1;
  this.title = "";
  this.text = "";
  this.overview = "";
  this.policy = "";
  this.resources = "";
  this.tools = "";
  this.section = "";
  this.program = "";
  this.page = "";
  this.path = "";
  this.type = "Overview";
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
}

module.exports = Content;
