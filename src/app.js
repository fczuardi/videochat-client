// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const choo = require("choo");
const html = require("choo/html");
const log = require("choo-log");
const { main } = require("./views");
const { domReducers } = require("./dom");
const { apiReducers } = require("./network");

const app = choo();
app.use(log());
app.use(domReducers);
app.use(apiReducers);
app.route("*", main);
app.mount("#main");

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(html`<div id="main"></div>`);
