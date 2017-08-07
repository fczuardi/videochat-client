(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "http://localhost:4000/graphql/" } };
},{}],2:[function(require,module,exports){
//      


var _require = require("./network"),
    apiCall = _require.apiCall;

var apiReducers = function (state, emitter) {
    state.api = {}, emitter.on("api:room", function () {
        var query = "\n        {\n            room {\n                apiKey\n                sessionId\n                token\n            }\n        }";
        emitter.emit("room:update", "requesting");
        return apiCall({ query: query }, function (err, resp, body) {
            if (err || !body.data.room) {
                if (err) {
                    console.error(err);
                }
                return emitter.emit("room:update", "disconnected");
            }
            return emitter.emit("opentok:initialize", body.data.room);
        });
    });
};

module.exports = apiReducers;
},{"./network":7}],3:[function(require,module,exports){
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
},{"./opentok":8}],4:[function(require,module,exports){
var config = require("../config.toml");
module.exports = config;
},{"../config.toml":1}],5:[function(require,module,exports){
//      


var app = require("choo")();
var html = require("choo/html");
var uiReducer = require("./ui.embed");
var apiReducers = require("./api.embed");
var chatReducers = require("./chat");
var embedView = require("./views/embed");

app.use(uiReducer);
app.use(apiReducers);
app.use(chatReducers);
app.route("*", embedView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./api.embed":2,"./chat":3,"./ui.embed":9,"./views/embed":10,"choo":undefined,"choo/html":undefined}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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

module.exports = {
    apiCall: apiCall
};
},{"./config":4,"xhr":undefined}],8:[function(require,module,exports){
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
},{"@opentok/client":undefined}],9:[function(require,module,exports){
//      


var uiReducer = function (state, emitter) {
    state.ui = {
        roomSatus: "disconnected"
    }, emitter.on("room:update", function (newStatus) {
        state.ui.roomStatus = newStatus;
        if (newStatus !== "connected") {
            return emitter.emit(state.events.RENDER);
        }
        return console.log({ newStatus: newStatus });
    });
};

module.exports = uiReducer;
},{}],10:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    <div>\n        <p> ", " </p>\n        <button onclick=", ">", "</button>\n        <textarea>", "</textarea>\n    </div>\n    <div id=\"videos\">\n        <div id=\"publisher\"></div>\n        <div id=\"subscriber\"></div>\n    </div>\n</div>"], ["\n<div>\n    <div>\n        <p> ", " </p>\n        <button onclick=", ">", "</button>\n        <textarea>", "</textarea>\n    </div>\n    <div id=\"videos\">\n        <div id=\"publisher\"></div>\n        <div id=\"subscriber\"></div>\n    </div>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../messages");

var homeView = function (state, emit) {
    var requestRoom = function (event) {
        emit("api:room");
    };
    return html(_templateObject, state.ui.roomStatus, requestRoom, messages.embed.call, JSON.stringify(state.chat.room));
};

module.exports = homeView;
},{"../messages":6,"choo/html":undefined}]},{},[5]);
