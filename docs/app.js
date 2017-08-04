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
var _templateObject = _taggedTemplateLiteral(["<div><p>", "</p></div>"], ["<div><p>", "</p></div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      
var html = require("choo/html");

var messages = {
    loading: "please wait..."
};

var loading = function () {
    return html(_templateObject, messages.loading);
};

var main = loading;

module.exports = {
    main: main
};
},{"choo/html":undefined}]},{},[1]);
