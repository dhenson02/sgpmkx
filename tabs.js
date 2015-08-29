var h = require("virtual-dom/h");

function render( style, launch ) {
  return (
    h("ul#contentTabs", style, [
      h("li.tab", [
        h("a", {
          href: "#",
          onclick: function(e) {
            e = e || window.event;
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return launch("Overview");
          }
        }, [ "Overview" ])
      ]),
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
