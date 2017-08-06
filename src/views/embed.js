// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const messages = require("../messages");

const homeView: ChooView = (state, emit) => {
    const requestRoom = event => {
        emit("api:room");
    };
    return html`
<div id="videos">
    <p> ${state.roomStatus} </p>
    <div id="publisher"></div>
    <div id="subscriber"></div>
    <button onclick=${requestRoom}>${messages.embed.call}</button>
    <textarea>${JSON.stringify(state.room)}</textarea>
</div>`;
};

module.exports = homeView;
