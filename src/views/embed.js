// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const messages = require("../messages").embed.home;
const styles = require('../styles');

const homeView: ChooView = (state, emit) => {
    const requestRoom = event => {
        emit(state.events.API_ROOM);
    };
    const errorMsg = state.errors.api
        ? html`<p>${state.errors.api.message}</p>`
        : "";
    const videochat = html`
        <div id="videos" style=${styles.videoContainer}>
            <div id="publisher" style=${styles.publisherDiv}></div>
            <div id="subscriber" style=${styles.subscriberDiv}></div>
        </div>`;
    videochat.isSameNode = target => target.id === "videos";
    return html`
<div>
    <div>
        ${errorMsg}
        <p>${state.ui.roomStatus}</p>
        <button onclick=${requestRoom}>${messages.call}</button>
    </div>
    ${videochat}
</div>`;
};

module.exports = homeView;
