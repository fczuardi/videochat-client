(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<div id=\"main\"></div>"], ["<div id=\"main\"></div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      
var choo = require("choo");
var html = require("choo/html");
var log = require("choo-log");

var _require = require('./views'),
    main = _require.main;

var app = choo();
app.use(log());
app.route('*', main);
app.mount('#main');

if (typeof document === 'undefined' || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(html(_templateObject));
},{"./views":2,"choo":undefined,"choo-log":undefined,"choo/html":undefined}],2:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<div><p>", "</p></div>"], ["<div><p>", "</p></div>"]),
    _templateObject2 = _taggedTemplateLiteral(["\n<label>\n    ", "\n    <input name=", "/>\n</label>"], ["\n<label>\n    ", "\n    <input name=", "/>\n</label>"]),
    _templateObject3 = _taggedTemplateLiteral(["\n<form onsubmit=", ">\n    ", "\n    ", "\n    <input type=\"submit\" value=", " />\n</form>"], ["\n<form onsubmit=", ">\n    ", "\n    ", "\n    <input type=\"submit\" value=", " />\n</form>"]),
    _templateObject4 = _taggedTemplateLiteral(["\n<div>\n    ", "\n</div>"], ["\n<div>\n    ", "\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      


var html = require("choo/html");

var messages = {
    loading: "please wait...",
    form: {
        name: "Name",
        email: "Email",
        signup: "Signup"
    }
};

var domEventWrap = function (cb) {
    return function (event) {
        event.preventDefault();
        cb(event.target);
    };
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
        return emit('signup:formSubmit', { form: form });
    });
    return html(_templateObject4, signupForm({ onSubmit: onSubmit }));
};

// const main = loading;
var main = signup;

module.exports = {
    main: main
};
},{"choo/html":undefined}]},{},[1]);
