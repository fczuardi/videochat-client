// @flow
const choo = require("choo");
const html = require("choo/html");
const log = require("choo-log");
const {main} = require('./views');

const app = choo();
app.use(log());
app.route('*', main);
app.mount('#main');

if (typeof document === 'undefined' || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(html`<div id="main"></div>`);

