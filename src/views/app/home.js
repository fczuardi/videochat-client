// @flow
import type { ChooView } from "../../app";

const html = require("choo/html");
const messages = require("../../messages");
const styles = require("../../styles");

const homeView: ChooView = (state, emit) => {
    const errorMsg = state.errors.api
        ? html`<p>${state.errors.api.message}</p>`
        : "";
    const publishFirst = true;
    const onSubmit = event => {
        event.preventDefault();
        const room = JSON.parse(event.target.elements[0].value);
        emit(state.events.CHAT_INIT, { room, publishFirst });
    };
    const onLoad = event => {
        const room = state.chat.room;
        if (!room) {
            return null;
        }
        emit(state.events.CHAT_INIT, { room, publishFirst });
    };
    const manualRoomForm = state.chat.room
        ? state.chat.roomStatus
        : html`
        <form onsubmit=${onSubmit}>
            <textarea name="ot">${JSON.stringify(state.chat.room)}</textarea>
            <input type="submit" />
        </form>`;
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
        <dt>${messages.home.user}</dt>
        <dd>${state.user.name} (${state.user.email})</dd>
    </div>
    ${videochat}
    ${manualRoomForm}
</div>`;
};

module.exports = homeView;
