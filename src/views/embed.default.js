// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const messages = require("../messages").embed.default;

const defaultView: ChooView = (state, emit) => {
    return html`
<div>
    <h1>${messages.title}</h1>
    <p>${messages.description}</p>
</div>`;
};

module.exports = defaultView;
