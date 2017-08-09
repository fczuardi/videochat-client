// @flow
import type { ChooView } from "./app";
import type { ChooMiddleware } from "./app";

const app = require("choo")();
const html = require("choo/html");
const eventNames = require("./eventNames");
const defaultView = require("./views/embed/default");
const embedView = require("./views/embed/home");
const errorReducer = require("./reducers/error");
const chatReducer = require("./reducers/chat");
const apiReducer = require("./reducers/embed/api");

app.use(eventNames);
app.use(apiReducer);
app.use(errorReducer);
app.use(chatReducer);
app.route("/videochat-client/embed.html#group/:groupId", embedView);
app.route("/videochat-client/embed.html", embedView);
app.route("#group/:groupId", embedView);
// app.route("*", defaultView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
