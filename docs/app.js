(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//      


var app = require("choo")();
var log = require("choo-log");
var html = require("choo/html");
var setupView = require("./views/setup");
var homeView = require("./views/home");

var notifications = function (state, emitter) {
    state.notificationPermission = window.Notification.permission, emitter.on("notification:update", function (permission) {
        state.notificationPermission = permission;
        if (permission === "denied") {
            return emitter.emit("render");
        }
        emitter.emit("pushState", "#home");
    });
};

var mainView = function (state, emit) {
    return state.notificationPermission !== "granted" ? setupView(state, emit) : homeView(state, emit);
};

app.use(log());
app.use(notifications);
app.route("*", mainView);
app.route("#setup", setupView);
app.route("#home", homeView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./views/home":3,"./views/setup":4,"choo":undefined,"choo-log":undefined,"choo/html":undefined}],2:[function(require,module,exports){
module.exports = {
    setup: {
        title: "Setup",
        description: "Please allow notifications from this app.",
        continue: "Continue",
        permissionDenied: "You have denied the permission.",
        tryAgain: "Try Again"
    },
    loading: "please wait...",
    form: {
        name: "Name",
        email: "Email",
        signup: "Signup"
    }
};
},{}],3:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    TBD\n</div>"], ["\n<div>\n    TBD\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");

var homeView = function () {
    return html(_templateObject);
};

module.exports = homeView;
},{"choo/html":undefined}],4:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    <p>", "</p>\n    <a href=\"#setup\">", "</a>\n</div>\n"], ["\n<div>\n    <p>", "</p>\n    <a href=\"#setup\">", "</a>\n</div>\n"]),
    _templateObject2 = _taggedTemplateLiteral(["\n<div>\n    <h2>", "</h2>\n    <p>", "</p>\n    <p>", "</p>\n    <button onclick=", " >\n        ", "\n    </button>\n</div>\n"], ["\n<div>\n    <h2>", "</h2>\n    <p>", "</p>\n    <p>", "</p>\n    <button onclick=", " >\n        ", "\n    </button>\n</div>\n"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../messages");

var permissionInfoView = function () {
    return html(_templateObject, messages.setup.permissionDenied, messages.back);
};

var setupView = function (state, emit) {
    var notificationPrompt = function () {
        return window.Notification.requestPermission().then(function (permission) {
            emit("notification:update", permission === "granted" ? permission : "denied");
        });
    };

    return html(_templateObject2, messages.setup.title, state.notificationPermission, state.notificationPermission !== "denied" ? messages.setup.description : messages.setup.permissionDenied, notificationPrompt, state.notificationPermission !== "denied" ? messages.setup.continue : messages.setup.tryAgain);
};

module.exports = setupView;
},{"../messages":2,"choo/html":undefined}]},{},[1]);
