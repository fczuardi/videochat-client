(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "http://localhost:4000/graphql/" } };
},{}],2:[function(require,module,exports){
var config = require("../config.toml");
module.exports = config;
},{"../config.toml":1}],3:[function(require,module,exports){
//      


var app = require("choo")();
var html = require("choo/html");
var apiReducers = require("./network");
var embedView = require("./views/embed");

app.use(apiReducers);
app.route("*", embedView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./network":5,"./views/embed":7,"choo":undefined,"choo/html":undefined}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
//      


var xhr = require("xhr");
var config = require("./config");
var opentok = require("./opentok");

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
    emitter.on("api:room", function () {
        var query = "\n        {\n            room {\n                apiKey\n                sessionId\n                token\n            }\n        }";
        return apiCall({ query: query }, function (err, resp, body) {
            if (err) {
                emitter.emit("log:error", err);
                return state;
            }
            state.room = body.data.room;
            emitter.emit("render");
            emitter.emit("opentok:initialize", state.room);
        });
    });
    emitter.on("opentok:initialize", function (_ref) {
        var apiKey = _ref.apiKey,
            sessionId = _ref.sessionId,
            token = _ref.token;

        console.log({ apiKey: apiKey });
        console.log({ sessionId: sessionId });
        console.log({ token: token });
        opentok({ apiKey: apiKey, sessionId: sessionId, token: token });
    });
    emitter.on("api:signup", function (user) {
        var query = "\n        mutation ($user: UserInput){\n            createUser(user: $user) {\n                id\n                name\n                email\n            }\n        }";
        var variables = { user: user };
        emitter.emit("log:info", user);
        return apiCall({ query: query, variables: variables }, function (err, resp, body) {
            return console.log(body);
        });
    });
};

module.exports = apiReducers;
},{"./config":2,"./opentok":6,"xhr":undefined}],6:[function(require,module,exports){
//      
var OT = require("@opentok/client");
// Handling all of our errors here by alerting them
function handleError(error) {
    if (error) {
        alert(error.message);
    }
}

var initializeSession = function (_ref) {
    var apiKey = _ref.apiKey,
        sessionId = _ref.sessionId,
        token = _ref.token;

    if (!apiKey || !sessionId || !token) {
        return;
    }
    var session = OT.initSession(apiKey, sessionId);
    // Connect to the session
    session.connect(token, function (error) {
        // If the connection is successful, publish to the session
        if (error) {
            handleError(error);
        } else {
            // Subscribe to a newly created stream
            session.on("streamCreated", function (event) {
                // Create a publisher
                var publisher = OT.initPublisher("publisher", {
                    insertMode: "append",
                    width: "100%",
                    height: "100%"
                }, handleError);
                session.publish(publisher, handleError);
                session.subscribe(event.stream, "subscriber", {
                    insertMode: "append",
                    width: "100%",
                    height: "100%"
                }, handleError);
            });
        }
    });
};

module.exports = initializeSession;
},{"@opentok/client":undefined}],7:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div id=\"videos\">\n    <div id=\"publisher\"></div>\n    <div id=\"subscriber\"></div>\n    <button onclick=", ">", "</button>\n</div>"], ["\n<div id=\"videos\">\n    <div id=\"publisher\"></div>\n    <div id=\"subscriber\"></div>\n    <button onclick=", ">", "</button>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../messages");

var homeView = function (state, emit) {
    var requestRoom = function (event) {
        emit("api:room");
    };
    return html(_templateObject, requestRoom, messages.embed.call);
};

module.exports = homeView;
},{"../messages":4,"choo/html":undefined}]},{},[3]);
