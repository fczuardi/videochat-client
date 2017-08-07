(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//      


var app = require("choo")();
var html = require("choo/html");
// const apiReducers = require("./api.app");
var notificationsReducer = require("./notifications");
var chatReducers = require("./chat");
var setupView = require("./views/setup");
var homeView = require("./views/home");

var mainView = function (state, emit) {
    return state.notifications.permission !== "granted" ? setupView(state, emit) : homeView(state, emit);
};

// app.use(apiReducers);
app.use(notificationsReducer);
app.use(chatReducers);
app.route("*", mainView);
app.route("#setup", setupView);
app.route("#home", homeView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./chat":2,"./notifications":4,"./views/home":6,"./views/setup":7,"choo":undefined,"choo/html":undefined}],2:[function(require,module,exports){
//      


var opentok = require("./opentok");

var chatReducer = function (state, emitter) {
    state.chat = {
        room: null
    };
    emitter.on("opentok:initialize", function (room) {
        state.chat.room = room;
        opentok(room, emitter, state.publishFirst);
    });
};

module.exports = chatReducer;
},{"./opentok":5}],3:[function(require,module,exports){
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
    },
    embed: {
        call: "Call"
    }
};
},{}],4:[function(require,module,exports){
//      


var notifications = function (state, emitter) {
    state.notifications = {
        permission: window.Notification.permission
    }, emitter.on("notification:update", function (permission) {
        state.notifications.permission = permission;
        if (permission === "denied") {
            return emitter.emit(state.events.RENDER);
        }
        emitter.emit("pushState", "#home");
    });
};

module.exports = notifications;
},{}],5:[function(require,module,exports){
//      
var OT = require("@opentok/client");

var initializeSession = function (_ref, emitter) {
    var apiKey = _ref.apiKey,
        sessionId = _ref.sessionId,
        token = _ref.token;
    var publishFirst = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    emitter.emit("render");
    if (!apiKey || !sessionId || !token) {
        return;
    }
    var handleResponse = function (status) {
        return function (error) {
            if (error) {
                alert(error.message);
            }
            if (status) {
                emitter.emit("room:update", status);
            }
        };
    };
    var session = OT.initSession(apiKey, sessionId);
    //
    var initPublisher = function () {
        return OT.initPublisher("publisher", {
            insertMode: "append",
            width: "100%",
            height: "100%"
        }, handleResponse());
    };
    // Connect to the session
    session.connect(token, function (error) {
        // If the connection is successful, publish to the session
        if (error) {
            handleResponse()(error);
        } else {
            if (publishFirst) {
                session.publish(initPublisher(), handleResponse());
            }
            handleResponse("waiting")();
            // Subscribe to a newly created stream
            session.on("streamCreated", function (event) {
                // Create a publisher
                if (!publishFirst) {
                    session.publish(initPublisher(), handleResponse());
                }
                session.subscribe(event.stream, "subscriber", {
                    insertMode: "append",
                    width: "100%",
                    height: "100%"
                }, handleResponse("connected"));
            });
        }
    });
};

module.exports = initializeSession;
},{"@opentok/client":undefined}],6:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    <div id=\"publisher\"></div>\n    <div id=\"subscriber\"></div>\n    <form onsubmit=", ">\n        <textarea name=\"ot\"></textarea>\n        <input type=\"submit\" />\n    </form>\n</div>"], ["\n<div>\n    <div id=\"publisher\"></div>\n    <div id=\"subscriber\"></div>\n    <form onsubmit=", ">\n        <textarea name=\"ot\"></textarea>\n        <input type=\"submit\" />\n    </form>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");

var homeView = function (state, emit) {
    var onSubmit = function (event) {
        event.preventDefault();
        var room = JSON.parse(event.target.elements[0].value);
        state.publishFirst = true;
        emit("opentok:initialize", room);
    };
    return html(_templateObject, onSubmit);
};

module.exports = homeView;
},{"choo/html":undefined}],7:[function(require,module,exports){
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

    return html(_templateObject2, messages.setup.title, state.notifications.permission, state.notifications.permission !== "denied" ? messages.setup.description : messages.setup.permissionDenied, notificationPrompt, state.notifications.permission !== "denied" ? messages.setup.continue : messages.setup.tryAgain);
};

module.exports = setupView;
},{"../messages":3,"choo/html":undefined}]},{},[1]);
