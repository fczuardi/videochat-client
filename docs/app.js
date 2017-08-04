(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "http://localhost:4000/graphql/" } };
},{}],2:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<div id=\"main\"></div>"], ["<div id=\"main\"></div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      


var choo = require("choo");
var html = require("choo/html");
var log = require("choo-log");

var _require = require("./views"),
    main = _require.main;

var _require2 = require("./dom"),
    domReducers = _require2.domReducers;

var _require3 = require("./network"),
    apiReducers = _require3.apiReducers;

var app = choo();
app.use(log());
app.use(domReducers);
app.use(apiReducers);
app.route("*", main);
app.mount("#main");

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(html(_templateObject));
},{"./dom":4,"./network":5,"./views":6,"choo":undefined,"choo-log":undefined,"choo/html":undefined}],3:[function(require,module,exports){
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
    emitter.on('signup:formSubmit', function (form) {
        var name = form.elements.namedItem('name').value;
        var email = form.elements.namedItem('email').value;
        var user = { name: name, email: email };
        emitter.emit('api:signup', user);
    });
};

module.exports = {
    domEventWrap: domEventWrap,
    domReducers: domReducers
};
},{}],5:[function(require,module,exports){
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
},{"./config":3,"xhr":undefined}],6:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<div><p>", "</p></div>"], ["<div><p>", "</p></div>"]),
    _templateObject2 = _taggedTemplateLiteral(["\n<label>\n    ", "\n    <input name=", "/>\n</label>"], ["\n<label>\n    ", "\n    <input name=", "/>\n</label>"]),
    _templateObject3 = _taggedTemplateLiteral(["\n<form onsubmit=", ">\n    ", "\n    ", "\n    <input type=\"submit\" value=", " />\n</form>"], ["\n<form onsubmit=", ">\n    ", "\n    ", "\n    <input type=\"submit\" value=", " />\n</form>"]),
    _templateObject4 = _taggedTemplateLiteral(["\n<div>\n    ", "\n</div>"], ["\n<div>\n    ", "\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");

var _require = require('./dom'),
    domEventWrap = _require.domEventWrap;

var messages = {
    loading: "please wait...",
    form: {
        name: "Name",
        email: "Email",
        signup: "Signup"
    }
};

var loading = function () {
    return html(_templateObject, messages.loading);
};

var textInput = function (_ref) {
    var label = _ref.label,
        name = _ref.name;
    return html(_templateObject2, label, name);
};

var signupForm = function (_ref2) {
    var onSubmit = _ref2.onSubmit;
    return html(_templateObject3, onSubmit, textInput({ label: messages.form.name, name: "name" }), textInput({ label: messages.form.email, name: "email" }), messages.form.signup);
};

var signup = function (state, emit) {
    var onSubmit = domEventWrap(function (form) {
        return emit("signup:formSubmit", form);
    });
    return html(_templateObject4, signupForm({ onSubmit: onSubmit }));
};

// const main = loading;
var main = signup;

module.exports = {
    main: main
};
},{"./dom":4,"choo/html":undefined}]},{},[2]);
