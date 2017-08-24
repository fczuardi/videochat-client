require("toml-require").install();
const config = require("./config.toml");
const { concurrent } = require("nps-utils");

const vendors = [
    "choo",
    "choo/html",
    "choo-log",
    "xhr",
    "@opentok/client",
    "xtend"
];

const transforms = ["unflowify", "tomlify", "es2040"].map(
    t => "transform " + t
);

const appArgs = [
    "entry src/app.js",
    "outfile docs/app.js",
    "no-bundle-external",
    ...transforms
];

const embedArgs = [
    "entry src/embed.js",
    "outfile docs/embed.js",
    "no-bundle-external",
    ...transforms
];

const timestamp = Date.now();

const configAppHtmlArgs = Object.keys(config.app.html).map(
    k => `--data-${k}="${config.app.html[k]}"`
);

const appHtmlArgs = configAppHtmlArgs.concat([`--data-timestamp=${timestamp}`]);

module.exports = {
    scripts: {
        default: "nps build && http-server docs",
        dev: {
            app:
                "budo --dir src src/app.js --" +
                ["", ...transforms].join(" --"),
            embed:
                "budo --dir src src/embed.js --" +
                ["", ...transforms].join(" --")
        },
        build: concurrent.nps(
            "bundle.app",
            "bundle.embed",
            "bundle.vendors",
            "html.app",
            "html.embed",
            "cp.worker"
        ),
        bundle: {
            app: "browserify " + ["", ...appArgs].join(" --"),
            embed: "browserify " + ["", ...embedArgs].join(" --"),
            vendors:
                "browserify " +
                ["", ...vendors].join(" -r ") +
                " --outfile docs/vendors.js"
        },
        html: {
            app:
                "variable-replacer index.html docs/app.html --data-client=app " +
                appHtmlArgs.join(" "),
            embed:
                "variable-replacer index.html docs/embed.html --data-client=embed " +
                appHtmlArgs.join(" ")
        },
        cp: {
            worker: "cpy src/sw.js docs"
        },
        test: "flow",
        fmt: {
            default: "prettier --write --tab-width 4",
            all: 'prettier --write --tab-width 4 "src/**/*.js" "*.js"'
        }
    }
};
