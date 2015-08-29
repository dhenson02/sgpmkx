var h = require("virtual-dom/h");

function render( style, path, launch ) {
  console.log("path before: ", path);
  path = "#/" + path.join("/");
  console.log("path after: ", path);
  return (
    h("ul#contentTabs", style, [
    /**
     * If using sweetAlert (or other modal/popup), leave commented.
     * No need for a link to its own page (specially since it won't do anything)
     */
      /*h("li.tab", [
        h("a", {
          href: window.location.hash
        }, [ "Overview" ])
      ]),*/
      h("li.tab", [
        h("a", {
          href: "#",
          onclick: function(e) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return launch("Policy");
          }
        }, [ "Policy" ])
      ]),
    /**
     * Calculators
     * Checklists
     * Forms
     * Templates
     * Trackers
     */
      h("li.tab", [
        h("a", {
          href: "#",
          onclick: function(e) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return launch("Tools");
          }
        }, [ "Tools" ])
      ]),
      /*h("li.tab", [
        h("a", {
          href: "#",
          onclick: function(e) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return launch("Contributions");
          }
        }, [ "Contributions" ])
      ]),*/
      h("li.tab", [
        h("a", {
          href: "#",
          onclick: function(e) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return launch("Resources");
          }
        }, [ "Resources" ])
      ])
    ])
  );
}

module.exports = render;
