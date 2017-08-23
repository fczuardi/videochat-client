// @flow
import type { ChooView } from "../../app";

const html = require("choo/html");
const messages = require("../../messages").embed.home;
const styles = require("../../styles");

const homeView: ChooView = (state, emit) => {
    const requestRoom = voiceOnly => event => {
        const publishFirst = true;
        emit(state.events.CHAT_SETTINGS_UPDATE, { voiceOnly, publishFirst });
        emit(state.events.API_ROOM);
    };
    const closeChat = event => {
        console.log("TBD Close Chat");
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
    const buttons = !state.chat.room || !state.chat.room.sessionId
        ? html`
        <div>
            <p>${messages.description}</p>
            <button onclick=${requestRoom(true)}>${messages.voiceCall}</button>
            <button onclick=${requestRoom(false)}>${messages.videoCall}</button>
        </div>
        `
        : html`
        <div>
            <p>${state.chat.roomStatus}</p>
            <button onclick=${closeChat}>${messages.hangup}</button>
        </div>
        `;
    return html`
<div>
    <div>
        ${errorMsg}
        ${buttons}
    </div>
    ${videochat}
</div>`;
};

module.exports = homeView;
