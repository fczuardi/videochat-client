const { concurrent } = require("nps-utils");

const transforms = ["unflowify", "tomlify", "es2040"].map(
    t => "transform " + t
);

const appArgs = [
    "entry src/app.js",
    "outfile docs/app.js",
    "no-bundle-external",
    ...transforms
];

module.exports = {
  scripts: {
    default: 'nps bundle && http-server docs',
    dev: {
        app: "budo --dir src src/app.js"
    },
    bundle: {
        default: concurrent.nps(
            "bundle.app",
            "bundle.vendors"
        ),
        app: "browserify " + ["", ...appArgs].join(" --"),
        vendors: ''
    },
    test: 'flow',
    fmt: 'prettier --write --tab-width 4'
  }
};
