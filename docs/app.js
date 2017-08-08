(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "http://localhost:4000/graphql/" } };
},{}],2:[function(require,module,exports){
//      


var _require = require("./network"),
    apiCall = _require.apiCall;

var apiReducers = function (state, emitter) {
    state.api = {};

    emitter.on(state.events.API_PUSHSERVER_PUBKEY, function () {
        var query = "\n        {\n            pushServer {\n                pubKey\n            }\n        }";
        return apiCall({ query: query }, function (err, resp, body) {
            if (err || !body.data.pushServer) {
                if (err) {
                    return emitter.emit(state.events.ERROR_API, err);
                }
                return emitter.emit(state.events.ERROR_API, new Error("API return dont have a pubkey value"));
            }
            return emitter.emit(state.events.WORKER_SERVERKEY, body.data.pushServer.pubKey);
        });
    });

    emitter.on(state.events.API_USER_UPDATE, function (variables) {
        var query = "\n        mutation($id:ID!, $update: UserInput) {\n            updateUser(id:$id, update:$update){\n                id\n                name\n                email\n                groups\n                webPushInfo {\n                    endpoint\n                    key\n                    auth\n                }\n            }\n        }";
        return apiCall({ query: query, variables: variables }, function (err, resp, body) {
            if (err) {
                return emitter.emit(state.events.ERROR_API, err);
            }
            return emitter.emit(state.events.USER_UPDATED, body.data.updateUser);
        });
    });
};

module.exports = apiReducers;
},{"./network":9}],3:[function(require,module,exports){
//      


var app = require("choo")();
var html = require("choo/html");
var eventNames = require("./eventnames");
var notificationsReducer = require("./notifications");
var serviceWorkerReducer = require("./serviceWorker");
var apiReducer = require("./api.app");
var errorReducer = require("./error");
var userReducer = require("./user");
var chatReducer = require("./chat");
var setupView = require("./views/setup");
var loginView = require("./views/login");
var homeView = require("./views/home");

var mainView = function (state, emit) {
    if (state.notifications.permission !== "granted") {
        return setupView(state, emit);
    }
    if (!state.user.id) {
        return loginView(state, emit);
    }
    return homeView(state, emit);
};

app.use(eventNames);
app.use(apiReducer);
app.use(errorReducer);
app.use(notificationsReducer);
app.use(serviceWorkerReducer);
app.use(userReducer);
app.use(chatReducer);
app.route("*", mainView);
app.route("#setup", setupView);
app.route("#home", homeView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./api.app":2,"./chat":4,"./error":6,"./eventnames":7,"./notifications":10,"./serviceWorker":12,"./user":14,"./views/home":15,"./views/login":16,"./views/setup":17,"choo":undefined,"choo/html":undefined}],4:[function(require,module,exports){
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
},{"./opentok":11}],5:[function(require,module,exports){
var config = require("../config.toml");
module.exports = config;
},{"../config.toml":1}],6:[function(require,module,exports){
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
    WORKER_REGISTER: "worker:register",
    WORKER_REGISTERED: "worker:registered",
    WORKER_SERVERKEY: "worker:pushServer:key",
    WORKER_SUBSCRIPTION_INFO: "worker:subscription:info",
    WORKER_SUBSCRIBED: "worker:subscribed",

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
},{"./config":5,"xhr":undefined}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{"@opentok/client":undefined}],12:[function(require,module,exports){
//      


var toUint8Array = require("./urlBase64ToUint8Array");

var workerFilePath = "./sw.js";

var worker = function (state, emitter) {
    state.worker = {
        registration: null
    };

    emitter.on(state.events.WORKER_REGISTER, function () {
        if (!navigator.serviceWorker) {
            return console.error("Browser doesnt have service worker support");
        }
        navigator.serviceWorker.register(workerFilePath).then(function (registration) {
            return emitter.emit(state.events.WORKER_REGISTERED, registration);
        }, console.error);
    });

    emitter.on(state.events.WORKER_REGISTERED, function (registration) {
        state.worker.registration = registration;
        return registration.pushManager.getSubscription().then(function (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIPTION_INFO, subscription);
        });
    });

    emitter.on(state.events.WORKER_SUBSCRIPTION_INFO, function (subscription) {
        if (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIBED, subscription);
        }
        return emitter.emit(state.events.API_PUSHSERVER_PUBKEY);
    });

    emitter.on(state.events.WORKER_SERVERKEY, function (serverKey) {
        var options = {
            userVisibleOnly: true,
            applicationServerKey: toUint8Array(serverKey)
        };
        return state.worker.registration.pushManager.subscribe(options).then(function (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIBED, subscription);
        });
    });

    emitter.on(state.events.WORKER_SUBSCRIBED, function (subscription) {
        var keyBuffer = subscription.getKey("p256dh");
        var authBuffer = subscription.getKey("auth");
        var endpoint = subscription.endpoint;
        var key = btoa(String.fromCharCode.apply(null, new Uint8Array(keyBuffer)));
        var auth = btoa(String.fromCharCode.apply(null, new Uint8Array(authBuffer)));
        var webPushInfo = { endpoint: endpoint, key: key, auth: auth };
        var variables = { id: state.user.username, update: { webPushInfo: webPushInfo } };
        console.log({ variables: variables });
        emitter.emit(state.events.API_USER_UPDATE, variables);
    });
};

module.exports = worker;
},{"./urlBase64ToUint8Array":13}],13:[function(require,module,exports){
// from https://github.com/web-push-libs/web-push
function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
module.exports = urlBase64ToUint8Array;
},{}],14:[function(require,module,exports){
//      


var extend = require("xtend");

var userReducer = function (state, emitter) {
    state.user = {
        username: null,
        id: null
    };

    emitter.on(state.events.USER_LOGIN, function (username) {
        state.user.username = username;
        emitter.emit(state.events.WORKER_REGISTER);
    });

    emitter.on(state.events.ERROR_API, function () {
        return emitter.emit(state.events.RENDER);
    });

    emitter.on(state.events.USER_UPDATED, function (user) {
        state.user = extend(state.user, user);
        emitter.emit(state.events.RENDER);
    });
};

module.exports = userReducer;
},{"xtend":undefined}],15:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<p>", "</p>"], ["<p>", "</p>"]),
    _templateObject2 = _taggedTemplateLiteral(["\n<div>\n    <div>\n        ", "\n        <dt>", "</dt>\n        <dd>", " (", ")</dd>\n    </div>\n    <div id=\"publisher\"></div>\n    <div id=\"subscriber\"></div>\n    <form onsubmit=", ">\n        <textarea name=\"ot\"></textarea>\n        <input type=\"submit\" />\n    </form>\n</div>"], ["\n<div>\n    <div>\n        ", "\n        <dt>", "</dt>\n        <dd>", " (", ")</dd>\n    </div>\n    <div id=\"publisher\"></div>\n    <div id=\"subscriber\"></div>\n    <form onsubmit=", ">\n        <textarea name=\"ot\"></textarea>\n        <input type=\"submit\" />\n    </form>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      


var html = require("choo/html");
var messages = require("../messages");

var homeView = function (state, emit) {
    var onSubmit = function (event) {
        event.preventDefault();
        var room = JSON.parse(event.target.elements[0].value);
        var publishFirst = true;
        emit(state.events.CHAT_INIT, { room: room, publishFirst: publishFirst });
    };
    var errorMsg = state.errors.api ? html(_templateObject, state.errors.api.message) : "";
    return html(_templateObject2, errorMsg, messages.home.user, state.user.name, state.user.email, onSubmit);
};

module.exports = homeView;
},{"../messages":8,"choo/html":undefined}],16:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<p>", ""], ["<p>", ""]),
    _templateObject2 = _taggedTemplateLiteral(["\n<div>\n    ", "\n    <form onsubmit=", ">\n        <label>\n            ", "\n            <input\n                name=\"userId\"\n                placeholder=", "></input>\n        </label>\n        <input type=\"submit\" value=", "/>\n    </form>\n</div>"], ["\n<div>\n    ", "\n    <form onsubmit=", ">\n        <label>\n            ", "\n            <input\n                name=\"userId\"\n                placeholder=", "></input>\n        </label>\n        <input type=\"submit\" value=", "/>\n    </form>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../messages");

var loginView = function (state, emit) {
    var onSubmit = function (event) {
        event.preventDefault();
        var id = event.target.elements[0].value.trim();
        emit(state.events.USER_LOGIN, id);
    };
    var errorMsg = state.errors.api ? html(_templateObject, state.errors.api.message) : "";
    return html(_templateObject2, errorMsg, onSubmit, messages.login.userId, messages.login.userIdPlaceholder, messages.login.login);
};

module.exports = loginView;
},{"../messages":8,"choo/html":undefined}],17:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    <h2>", "</h2>\n    <p>", "</p>\n    <p>", "</p>\n    <button onclick=", " >\n        ", "\n    </button>\n</div>\n"], ["\n<div>\n    <h2>", "</h2>\n    <p>", "</p>\n    <p>", "</p>\n    <button onclick=", " >\n        ", "\n    </button>\n</div>\n"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../messages");

// const permissionInfoView = () => html`
// <div>
// <p>${messages.setup.permissionDenied}</p>
// <a href="#setup">${messages.back}</a>
// </div>
// `;

var setupView = function (state, emit) {
    var notificationPrompt = function () {
        return window.Notification.requestPermission().then(function (permission) {
            emit("notification:update", permission === "granted" ? permission : "denied");
        });
    };

    return html(_templateObject, messages.setup.title, state.notifications.permission, state.notifications.permission !== "denied" ? messages.setup.description : messages.setup.permissionDenied, notificationPrompt, state.notifications.permission !== "denied" ? messages.setup.continue : messages.setup.tryAgain);
};

module.exports = setupView;
},{"../messages":8,"choo/html":undefined}]},{},[3]);
