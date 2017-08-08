(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "http://localhost:4000/graphql/" } };
},{}],2:[function(require,module,exports){
//      


var _require = require("./network"),
    apiCall = _require.apiCall;

var apiReducers = function (state, emitter) {
    state.api = {};

    emitter.on(state.events.API_ROOM, function () {
        var query = "\n        {\n            room {\n                apiKey\n                sessionId\n                token\n            }\n        }";
        emitter.emit(state.events.CHAT_ROOM_UPDATE, "requesting");
        return apiCall({ query: query }, function (err, resp, body) {
            if (err || !body.data.room) {
                if (err) {
                    emitter.emit(state.events.ERROR_API, err);
                }
                return emitter.emit(state.events.CHAT_ROOM_UPDATE, "disconnected");
            }
            var room = body.data.room;
            var publishFirst = false;
            return emitter.emit(state.events.CHAT_INIT, { room: room, publishFirst: publishFirst });
        });
    });
};

module.exports = apiReducers;
},{"./network":9}],3:[function(require,module,exports){
//      


var opentok = require("./opentok");

var chatReducer = function (state, emitter) {
    state.chat = {
        room: null,
        publishFirst: false
    };

    emitter.on(state.events.CHAT_INIT, function (_ref) {
        var room = _ref.room,
            publishFirst = _ref.publishFirst;

        state.chat.room = room;
        state.publishFirst = publishFirst;
        opentok(state, emitter);
    });
};

module.exports = chatReducer;
},{"./opentok":10}],4:[function(require,module,exports){
var config = require("../config.toml");
module.exports = config;
},{"../config.toml":1}],5:[function(require,module,exports){
//      


var app = require("choo")();
var html = require("choo/html");
var eventNames = require("./eventNames");
var uiReducer = require("./ui.embed");
var apiReducer = require("./api.embed");
var errorReducer = require("./error");
var chatReducer = require("./chat");
var embedView = require("./views/embed");

app.use(eventNames);
app.use(uiReducer);
app.use(apiReducer);
app.use(errorReducer);
app.use(chatReducer);
app.route("*", embedView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./api.embed":2,"./chat":3,"./error":6,"./eventNames":7,"./ui.embed":11,"./views/embed":12,"choo":undefined,"choo/html":undefined}],6:[function(require,module,exports){
//      


var ERROR_API = "error:api";

var errorReducer = function (state, emitter) {
    state.errors = {
        api: null
    };

    state.events.ERROR_API = ERROR_API;

    var clearApiError = function () {
        state.errors.api = null;
    };

    emitter.on(state.events.API_PUSHSERVER_PUBKEY, clearApiError);
    emitter.on(state.events.API_ROOM, clearApiError);
    emitter.on(state.events.API_USER_UPDATE, clearApiError);

    emitter.on(ERROR_API, function (err) {
        console.error(err);
        state.errors.api = err;
    });
};

module.exports = errorReducer;
},{}],7:[function(require,module,exports){
//      

var eventNames = {
    ERROR_API: "error:api",

    API_ROOM: "api:room",
    API_PUSHSERVER_PUBKEY: "api:pushServer:pubKey",
    API_USER_UPDATE: "api:updateUser",

    CHAT_INIT: "chat:init",
    CHAT_ROOM_UPDATE: "chat:room:update",

    USER_LOGIN: "user:login",
    USER_UPDATED: "user:updated"
};

var events = function (state) {
    Object.keys(eventNames).forEach(function (key) {
        state.events[key] = eventNames[key];
    });
};

module.exports = events;
},{}],8:[function(require,module,exports){
module.exports = {
    setup: {
        title: "Setup",
        description: "Please allow notifications from this app.",
        continue: "Continue",
        permissionDenied: "You have denied the permission.",
        tryAgain: "Try Again"
    },
    login: {
        userId: "Your user ID",
        userIdPlaceholder: "3c3fc788-2e41-4abb-9153-8a3f01d49990",
        login: "Login"
    },
    home: {
        user: "User"
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
},{}],9:[function(require,module,exports){
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
},{"./config":4,"xhr":undefined}],10:[function(require,module,exports){
//      
var OT = require("@opentok/client");

var initializeSession = function (state, emitter) {
    var _state$chat$room = state.chat.room,
        apiKey = _state$chat$room.apiKey,
        sessionId = _state$chat$room.sessionId,
        token = _state$chat$room.token;

    emitter.emit(state.events.RENDER);
    if (!apiKey || !sessionId || !token) {
        return;
    }
    var handleResponse = function (status) {
        return function (error) {
            if (error) {
                alert(error.message);
            }
            if (status) {
                emitter.emit(state.events.CHAT_ROOM_UPDATE, status);
            }
        };
    };
    var session = OT.initSession(apiKey, sessionId);

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
            if (state.chat.publishFirst) {
                session.publish(initPublisher(), handleResponse());
            }
            handleResponse("waiting")();
            // Subscribe to a newly created stream
            session.on("streamCreated", function (event) {
                // Create a publisher
                if (!state.chat.publishFirst) {
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
},{"@opentok/client":undefined}],11:[function(require,module,exports){
//      


var uiReducer = function (state, emitter) {
    state.ui = {
        roomSatus: "disconnected"
    };

    emitter.on(state.events.CHAT_ROOM_UPDATE, function (newStatus) {
        state.ui.roomStatus = newStatus;
        if (newStatus !== "connected") {
            return emitter.emit(state.events.RENDER);
        }
        return console.log({ newStatus: newStatus });
    });
};

module.exports = uiReducer;
},{}],12:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<p>", "</p>"], ["<p>", "</p>"]),
    _templateObject2 = _taggedTemplateLiteral(["\n<div>\n    <div>\n        ", "\n        <p> ", " </p>\n        <button onclick=", ">", "</button>\n        <textarea>", "</textarea>\n    </div>\n    <div id=\"videos\">\n        <div id=\"publisher\"></div>\n        <div id=\"subscriber\"></div>\n    </div>\n</div>"], ["\n<div>\n    <div>\n        ", "\n        <p> ", " </p>\n        <button onclick=", ">", "</button>\n        <textarea>", "</textarea>\n    </div>\n    <div id=\"videos\">\n        <div id=\"publisher\"></div>\n        <div id=\"subscriber\"></div>\n    </div>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../messages");

var homeView = function (state, emit) {
    var requestRoom = function (event) {
        emit(state.events.API_ROOM);
    };
    var errorMsg = state.errors.api ? html(_templateObject, state.errors.api.message) : "";
    return html(_templateObject2, errorMsg, state.ui.roomStatus, requestRoom, messages.embed.call, JSON.stringify(state.chat.room));
};

module.exports = homeView;
},{"../messages":8,"choo/html":undefined}]},{},[5]);
