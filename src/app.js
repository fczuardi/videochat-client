// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const log = require("choo-log");
const setupView = require("./views/setup");
const { domReducers } = require("./dom");
const { apiReducers } = require("./network");

const mainView = setupView;

app.use(log());
app.use(domReducers);
app.use(apiReducers);
app.route("*", mainView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
