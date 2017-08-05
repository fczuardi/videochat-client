// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const messages = require("../messages");

const homeView: ChooView = (state, emit) => {
    const requestRoom = (event) => {
        emit("api:room")
    }
    console.log({state})
    return html`
<div id="videos">
    <div id="publisher"></div>
    <div id="subscriber"></div>
    <button onclick=${requestRoom}>${messages.embed.call}</button>
</div>`;
}

module.exports = homeView;
