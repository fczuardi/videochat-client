// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const messages = require("../messages");

const homeView: ChooView = (state, emit) => {
    const requestRoom = event => {
        emit("api:room");
    };
    return html`
<div>
    <div>
        <p> ${state.ui.roomStatus} </p>
        <button onclick=${requestRoom}>${messages.embed.call}</button>
        <textarea>${JSON.stringify(state.chat.room)}</textarea>
    </div>
    <div id="videos">
        <div id="publisher"></div>
        <div id="subscriber"></div>
    </div>
</div>`;
};

module.exports = homeView;
