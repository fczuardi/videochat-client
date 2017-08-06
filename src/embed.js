// @flow
import type { ChooView } from "./app";
import type { ChooMiddleware } from "./app";

const app = require("choo")();
const html = require("choo/html");
const apiReducers = require("./network");
const embedView = require("./views/embed");
const uiReducer = require("./embedui");

app.use(apiReducers);
app.use(uiReducer);
app.route("*", embedView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
