require("toml-require").install();
const config = require("./config.toml");
const { concurrent } = require("nps-utils");

const vendors = ["choo", "choo/html", "choo-log", "xhr"];

const transforms = ["unflowify", "tomlify", "es2040"].map(
    t => "transform " + t
);

const appArgs = [
    "entry src/app.js",
    "outfile docs/app.js",
    "no-bundle-external",
    ...transforms
];

const appHtmlArgs = Object.keys(config.app.html).map(k => `--data-${k}="${config.app.html[k]}"`);

module.exports = {
  scripts: {
    default: 'nps build && http-server docs',
    dev: {
        app: "budo --dir src src/app.js --" + ["", ...transforms].join(" --")
    },
    build: concurrent.nps('bundle.app', 'bundle.vendors', 'html'),
    bundle: {
        app: "browserify " + ["", ...appArgs].join(" --"),
        vendors:
            "browserify " +
            ["", ...vendors].join(" -r ") +
            " --outfile docs/vendors.js"
    },
    html: "variable-replacer index.html docs " + appHtmlArgs.join(" "),
    test: 'flow',
    fmt: 'prettier --write --tab-width 4'
  }
};
