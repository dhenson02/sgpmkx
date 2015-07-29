var h = require("virtual-dom/h"),
  createElement = require("virtual-dom/create-element");

function render ( fhm, comm ) {
  return (
    h("div#navWrap", [
      h("a.header", {
        "href": "#/"
      }, [
        h("div.logo", [
          h("img", {
            "src": "https://jsbin-user-assets.s3.amazonaws.com/dhenson02/phLogo48-gs.png",
            "alt": "Public Health Home",
            "height": "48",
            "width": "48"
          })
        ]),
        h("p.text", [ "Public Health", h("br"), h("small", [ "US Air Force" ]) ])
      ]),
      h("ul", [
        h("li", [
          h("p.root-cat", [
            h("a", {
              "href": "#/Comm"
            }, [ "Community Health" ])
          ]),
          h("hr"),
          h("ul", comm)
        ]),
        h("li", [
          h("p.root-cat", [
            h("a", {
              "href": "#/FHM"
            }, [ "Force Health Management" ])
          ]),
          h("hr"),
          h("ul", fhm)
        ])
      ])
    ])
  );
}

module.exports = render;
