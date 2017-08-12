// @flow
import type { ChooView } from "../../app";

const html = require("choo/html");
const messages = require("../../messages").app.home;
const styles = require("../../styles");

const homeView: ChooView = (state, emit) => {
    const errorMsg = state.errors.api
        ? html`<p>${state.errors.api.message}</p>`
        : "";
    const onLoad = event => {
        const room = state.chat.room;
        const publishFirst = true;
        if (!room) {
            return null;
        }
        emit(state.events.CHAT_INIT, { room, publishFirst });
    };
    const onLogoutClick = event => {
        emit(state.events.USER_LOGOUT);
    };
    const videochat = html`
        <div id="videos" style=${styles.videoContainer}>
            <div id="publisher" style=${styles.publisherDiv}></div>
            <div id="subscriber" style=${styles.subscriberDiv}></div>
        </div>`;
    videochat.isSameNode = target => target.id === "videos";
    onLoad();
    return html`
<div>
    <div>
        ${errorMsg}
        <div>
            <dt>${messages.user}</dt>
            <dd>${state.user.name} (${state.user.email})</dd>
        </div>
        <button onclick=${onLogoutClick}>${messages.logout}</button>
    </div>
    ${videochat}
</div>`;
};

module.exports = homeView;
