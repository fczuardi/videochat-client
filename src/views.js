// @flow
const html = require("choo/html");

const messages = {
    loading: "please wait..."
}

const loading = () => html`<div><p>${messages.loading}</p></div>`;

const main = loading;

module.exports = {
    main
}
