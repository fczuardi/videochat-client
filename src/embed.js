// @flow
import type { ChooView } from "./app";
import type { ChooMiddleware } from "./app";

const app = require("choo")();
const html = require("choo/html");
const eventNames = require("./eventNames");
const uiReducer = require("./ui.embed");
const apiReducer = require("./api.embed");
const errorReducer = require("./error");
const chatReducer = require("./chat");
const defaultView = require("./views/embed.default");
const embedView = require("./views/embed");

app.use(eventNames);
app.use(uiReducer);
app.use(apiReducer);
app.use(errorReducer);
app.use(chatReducer);
app.route("*", defaultView);
app.route("#group/:groupId", embedView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
