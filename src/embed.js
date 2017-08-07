// @flow
import type { ChooView } from "./app";
import type { ChooMiddleware } from "./app";

const app = require("choo")();
const html = require("choo/html");
const uiReducer = require("./ui.embed");
const apiReducers = require("./api.embed");
const chatReducers = require("./chat");
const embedView = require("./views/embed");

app.use(uiReducer);
app.use(apiReducers);
app.use(chatReducers);
app.route("*", embedView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
