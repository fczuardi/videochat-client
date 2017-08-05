(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "http://localhost:4000/graphql/" } };
},{}],2:[function(require,module,exports){
//      


var app = require("choo")();
var log = require("choo-log");
var setupView = require("./views/setup");

var _require = require("./dom"),
    domReducers = _require.domReducers;

var _require2 = require("./network"),
    apiReducers = _require2.apiReducers;

var mainView = setupView;

app.use(log());
app.use(domReducers);
app.use(apiReducers);
app.route("*", mainView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./dom":4,"./network":6,"./views/setup":7,"choo":undefined,"choo-log":undefined}],3:[function(require,module,exports){
var config = require("../config.toml");
module.exports = config;
},{"../config.toml":1}],4:[function(require,module,exports){
//      


var domEventWrap = function (cb) {
    return function (event) {
        event.preventDefault();
        cb(event.target);
    };
};

var domReducers = function (state, emitter) {
    emitter.on("signup:formSubmit", function (form) {
        var name = form.elements.namedItem("name").value;
        var email = form.elements.namedItem("email").value;
        var user = { name: name, email: email };
        emitter.emit("api:signup", user);
    });
};

module.exports = {
    domEventWrap: domEventWrap,
    domReducers: domReducers
};
},{}],5:[function(require,module,exports){
module.exports = {
    loading: "please wait...",
    form: {
        name: "Name",
        email: "Email",
        signup: "Signup"
    }
};
},{}],6:[function(require,module,exports){
//      


var xhr = require("xhr");
var config = require("./config");

var apiCall = function (body, cb) {
    return xhr({
        uri: config.api.url,
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        json: true,
        body: body
    }, cb);
};

var apiReducers = function (state, emitter) {
    emitter.on("api:signup", function (user) {
        var query = "\nmutation ($user: UserInput){\n  createUser(user: $user) {\n    id\n    name\n    email\n  }\n}";
        var variables = { user: user };
        apiCall({ query: query, variables: variables }, function (err, resp, body) {
            return console.log(body);
        });
        emitter.emit("log:info", user);
    });
};

module.exports = {
    apiReducers: apiReducers
};
},{"./config":3,"xhr":undefined}],7:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<div>\n    </div>"], ["<div>\n    </div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");

var _require = require("../dom"),
    domEventWrap = _require.domEventWrap;

var messages = require("../messages");

var setupView = function (state, emit) {
    return html(_templateObject);
};

module.exports = setupView;
},{"../dom":4,"../messages":5,"choo/html":undefined}]},{},[2]);
