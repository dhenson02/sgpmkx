function Content ( page ) {
  try {
    var originalTitle = page.title;
    var originalText = page.text;
    var originalReferences = page.references;
  } catch (e) {
    console.log("Please give me some data.");
  }
  return {
    page: page || this,
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
    set: function ( data ) {
      var name;
      data = data || page || this.page;
      for ( name in data ) {
        if ( this.hasOwnProperty(name) ) {
          this[name] = data[name];
        }
      }
      return this;
    },
    reset: function() {
      var name;
      for ( name in page ) {
        if ( this.hasOwnProperty(name) ) {
          this[name] = null;
        }
      }
      page = null;
    }
  };
}

module.exports = Content;
