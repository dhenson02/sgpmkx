var h = require("virtual-dom/h"),
  createElement = require("virtual-dom/create-element");

function render ( fhm, comm ) {
  return (
    h("div#navWrap.nav", [
      h("a.header", {
        "href": "land.aspx"
      }, [
        h("div.logo", [
          h("img", {
            "src": "/kj/kx7/PublicHealth/SiteAssets/Pages/landing/phLogo48-gs.png",
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
            h("span", /*{
              "href": "#/Comm"
            },*/ [ "Community Health" ])
          ]),
          h("hr"),
          h("ul", comm)
        ]),
        h("li", [
          h("p.root-cat", [
            h("span", /*{
              "href": "#/FHM"
            },*/ [ "Force Health Management" ])
          ]),
          h("hr"),
          h("ul", fhm)
        ])
      ])
    ])
  );
}

module.exports = render;
