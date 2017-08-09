// @flow
import type { ChooView } from "../../app";
const html = require("choo/html");
const messages = require("../../messages");

const setupView: ChooView = (state, emit) => {
    const notificationPrompt = () =>
        window.Notification.requestPermission().then(permission => {
            emit(
                state.events.SETUP_PERMISSION_UPDATE,
                permission === "granted" ? permission : "denied"
            );
        });

    return html`
<div>
    <h2>${messages.setup.title}</h2>
    <p>${state.setup.permission !== "denied"
        ? messages.setup.description
        : messages.setup.permissionDenied}</p>
    <button onclick=${notificationPrompt} >
        ${state.setup.permission !== "denied"
            ? messages.setup.continue
            : messages.setup.tryAgain}
    </button>
</div>
`;
};

module.exports = setupView;
