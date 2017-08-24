// @flow
import type { ChooView } from "../../app";

const html = require("choo/html");
const messages = require("../../messages").app.home;
const styles = require("../../styles");

const homeView: ChooView = (state, emit) => {
    const onLoad = event => {
        const room = state.chat.room;
        if (!room) {
            return null;
        }
        const publishFirst = true;
        emit(state.events.CHAT_SETTINGS_UPDATE, { publishFirst });
        emit(state.events.CHAT_INIT, { room });
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
    const classNames = {
        switch: "mdl-switch mdl-js-switch mdl-js-ripple-effect",
        switchInput: "mdl-switch__input",
        switchLabel: "mdl-switch__label",
        button: "mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect"
    }
    return html`
<div>
    <div>
        <h3>${messages.greetings(state.user.name)}</h3>
        <p>
            ${messages.description}
        </p>
        <label for="isAvailable" class=${classNames.switch}>
            <input
                class=${classNames.switchInput}
                type="checkbox"
                id="isAvailable"
            />
            <span class=${classNames.switchLabel} >
                ${messages.available(state.user.isAvailable)}
            </span>
        </label>
        <div style="margin-top: 30px">
            <button
                class=${classNames.button}
                onclick=${onLogoutClick}
            >
                ${messages.logout}
            </button>
        </div>
    </div>
    ${videochat}
</div>`;
};

module.exports = homeView;
