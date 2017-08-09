(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "http://localhost:4000/graphql/" }, "opentok": { "publisherProperties": { "width": 100, "height": 100 }, "subscriberProperties": { "width": "100%", "height": "100%" } } };
},{}],2:[function(require,module,exports){
var config = require("../config.toml");
module.exports = config;
},{"../config.toml":1}],3:[function(require,module,exports){
//      


var app = require("choo")();
var html = require("choo/html");
var eventNames = require("./eventNames");
var defaultView = require("./views/embed/default");
var embedView = require("./views/embed/home");
var errorReducer = require("./reducers/error");
var chatReducer = require("./reducers/chat");
var apiReducer = require("./reducers/embed/api");

app.use(eventNames);
app.use(apiReducer);
app.use(errorReducer);
app.use(chatReducer);
app.route("*", defaultView);
app.route("#group/:groupId", embedView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./eventNames":4,"./reducers/chat":8,"./reducers/embed/api":9,"./reducers/error":10,"./views/embed/default":12,"./views/embed/home":13,"choo":undefined,"choo/html":undefined}],4:[function(require,module,exports){
//      

var eventNames = {
    SETUP_PERMISSION_UPDATE: "setupp:notification:updated",

    WORKER_REGISTER: "worker:register",
    WORKER_REGISTERED: "worker:registered",
    WORKER_SERVERKEY: "worker:pushServer:key",
    WORKER_SUBSCRIPTION_INFO: "worker:subscription:info",
    WORKER_SUBSCRIBED: "worker:subscribed",

    ERROR_API: "error:api",

    API_ROOM: "api:room",
    API_PUSHSERVER_PUBKEY: "api:pushServer:pubKey",
    API_USER_UPDATE: "api:updateUser",
    API_NOTIFYGROUP: "api:notifyGroup",

    CHAT_ROOM_UPDATE: "chat:update",
    CHAT_INIT: "chat:init",
    CHAT_ROOMSTATUS_UPDATE: "chat:roomstatus:update",

    USER_LOGIN: "user:login",
    USER_UPDATED: "user:updated"
};

var events = function (state) {
    Object.keys(eventNames).forEach(function (key) {
        state.events[key] = eventNames[key];
    });
};

module.exports = events;
},{}],5:[function(require,module,exports){
module.exports = {
    embed: {
        default: {
            title: "Page not found",
            description: "maybe you forgot to include the goup ID. Example: localhost:9966/#group/ebf1139e-b168-4e15-8095-a70ec444c0d3"
        },
        home: {
            call: "Call"
        }
    },
    app: {
        login: {
            userId: "Secret",
            userIdPlaceholder: "3c3fc788-2e41-4abb-9153-8a3f01d49990",
            login: "Login",
            remember: "Remember login"
        }
    },
    setup: {
        title: "Setup",
        description: "Please allow notifications from this app.",
        continue: "Continue",
        permissionDenied: "You have denied the permission.",
        tryAgain: "Try Again"
    },
    home: {
        user: "User"
    },
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

module.exports = {
    apiCall: apiCall
};
},{"./config":2,"xhr":undefined}],7:[function(require,module,exports){
//      
var OT = require("@opentok/client");
var extend = require("xtend");
var config = require("./config");

var initializeSession = function (state, emitter) {
    var _state$chat$room = state.chat.room,
        apiKey = _state$chat$room.apiKey,
        sessionId = _state$chat$room.sessionId,
        token = _state$chat$room.token;

    if (!apiKey || !sessionId || !token) {
        return;
    }
    var handleResponse = function (status) {
        return function (error) {
            if (error) {
                alert(error.message);
            }
            if (status) {
                emitter.emit(state.events.CHAT_ROOMSTATUS_UPDATE, status);
            }
        };
    };
    var session = OT.initSession(apiKey, sessionId);

    var initPublisher = function () {
        var name = state.user && state.user.name || "";
        var pubOptions = extend(config.opentok.publisherProperties, {
            insertMode: "append",
            name: name
        });
        return OT.initPublisher("publisher", pubOptions, handleResponse());
    };

    session.connect(token, function (error) {
        if (error) {
            handleResponse()(error);
        } else {
            if (state.chat.publishFirst) {
                session.publish(initPublisher(), handleResponse());
            }
            handleResponse("waiting")();
            session.on("streamCreated", function (event) {
                if (!state.chat.publishFirst) {
                    session.publish(initPublisher(), handleResponse());
                }
                var subOptions = extend(config.opentok.subscriberProperties, {
                    insertMode: "append"
                });
                session.subscribe(event.stream, "subscriber", subOptions, handleResponse("connected"));
            });
        }
    });
};

module.exports = initializeSession;
},{"./config":2,"@opentok/client":undefined,"xtend":undefined}],8:[function(require,module,exports){
//      


var opentok = require("../opentok");

var chatReducer = function (state, emitter) {
    state.chat = {
        room: null,
        roomSatus: "disconnected",
        publishFirst: false
    };

    emitter.on(state.events.CHAT_ROOMSTATUS_UPDATE, function (newStatus) {
        state.chat.roomStatus = newStatus;
        return emitter.emit(state.events.RENDER);
    });

    emitter.on(state.events.CHAT_ROOM_UPDATE, function (room) {
        state.chat.room = room;
    });

    emitter.on(state.events.CHAT_INIT, function (_ref) {
        var room = _ref.room,
            publishFirst = _ref.publishFirst;

        state.chat.room = room;
        state.chat.publishFirst = publishFirst;
        opentok(state, emitter);
    });

    emitter.on(state.events.CHAT_ROOMSTATUS_UPDATE, function (status) {
        if (status !== "waiting" || state.chat.publishFirst) {
            return null;
        }
        return emitter.emit(state.events.API_NOTIFYGROUP, {
            groupId: state.params.groupId,
            room: state.chat.room
        });
    });
};

module.exports = chatReducer;
},{"../opentok":7}],9:[function(require,module,exports){
//      


var _require = require("../../network"),
    apiCall = _require.apiCall;

var apiReducers = function (state, emitter) {
    state.api = {};

    emitter.on(state.events.API_ROOM, function () {
        var query = "\n        {\n            room {\n                apiKey\n                sessionId\n                token\n            }\n        }";
        emitter.emit(state.events.CHAT_ROOMSTATUS_UPDATE, "requesting");
        return apiCall({ query: query }, function (err, resp, body) {
            if (err || !body.data.room) {
                if (err) {
                    emitter.emit(state.events.ERROR_API, err);
                }
                return emitter.emit(state.events.CHAT_ROOMSTATUS_UPDATE, "disconnected");
            }
            var room = body.data.room;
            var publishFirst = false;
            return emitter.emit(state.events.CHAT_INIT, { room: room, publishFirst: publishFirst });
        });
    });
    emitter.on(state.events.API_NOTIFYGROUP, function (_ref) {
        var groupId = _ref.groupId,
            room = _ref.room;

        var query = "\n        mutation($groupId:ID!, $payload:String){\n            notifyUserGroup(id:$groupId, payload:$payload)\n        }";
        var roomEncoded = JSON.stringify(room);
        var payload = JSON.stringify({
            title: "Support call",
            options: {
                body: "From group " + groupId,
                data: room
            }
        });
        var variables = { groupId: groupId, payload: payload };
        return apiCall({ query: query, variables: variables }, function (err, resp, body) {
            if (err) {
                emitter.emit(state.events.ERROR_API, err);
                return emitter.emit(state.events.CHAT_ROOMSTATUS_UPDATE, "disconnected");
            }
            return console.log(body.data);
        });
    });
};

module.exports = apiReducers;
},{"../../network":6}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
//      
module.exports = {
    videoContainer: "\nposition: relative;\nmax-width: 405px;\nmargin: auto;\nheight: 240px; \n    ",
    publisherDiv: "\nposition: absolute;\nz-index: 2;\nbottom: 0;\nright: 0;\noverflow:hidden;\nborder-radius: 100px;\n    ",
    subscriberDiv: "\noverflow: hidden;\nheight: 100%;\nborder-radius: 10px;\n    "
};
},{}],12:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    <h1>", "</h1>\n    <p>", "</p>\n</div>"], ["\n<div>\n    <h1>", "</h1>\n    <p>", "</p>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../../messages").embed.default;

var defaultView = function (state, emit) {
    return html(_templateObject, messages.title, messages.description);
};

module.exports = defaultView;
},{"../../messages":5,"choo/html":undefined}],13:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<p>", "</p>"], ["<p>", "</p>"]),
    _templateObject2 = _taggedTemplateLiteral(["\n        <div id=\"videos\" style=", ">\n            <div id=\"publisher\" style=", "></div>\n            <div id=\"subscriber\" style=", "></div>\n        </div>"], ["\n        <div id=\"videos\" style=", ">\n            <div id=\"publisher\" style=", "></div>\n            <div id=\"subscriber\" style=", "></div>\n        </div>"]),
    _templateObject3 = _taggedTemplateLiteral(["\n<div>\n    <div>\n        ", "\n        <p>", "</p>\n        <button onclick=", ">", "</button>\n    </div>\n    ", "\n</div>"], ["\n<div>\n    <div>\n        ", "\n        <p>", "</p>\n        <button onclick=", ">", "</button>\n    </div>\n    ", "\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      


var html = require("choo/html");
var messages = require("../../messages").embed.home;
var styles = require("../../styles");

var homeView = function (state, emit) {
    var requestRoom = function (event) {
        emit(state.events.API_ROOM);
    };
    var errorMsg = state.errors.api ? html(_templateObject, state.errors.api.message) : "";
    var videochat = html(_templateObject2, styles.videoContainer, styles.publisherDiv, styles.subscriberDiv);
    videochat.isSameNode = function (target) {
        return target.id === "videos";
    };
    return html(_templateObject3, errorMsg, state.chat.roomStatus, requestRoom, messages.call, videochat);
};

module.exports = homeView;
},{"../../messages":5,"../../styles":11,"choo/html":undefined}]},{},[3]);
