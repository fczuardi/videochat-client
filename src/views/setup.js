// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const messages = require("../messages");

const permissionInfoView = () => html`
<div>
    <p>${messages.setup.permissionDenied}</p>
    <a href="#setup">${messages.back}</a>
</div>
`;

const setupView: ChooView = (state, emit) => {
    const notificationPrompt = () =>
        window.Notification.requestPermission().then(permission => {
            emit(
                "notification:update",
                permission === "granted" ? permission : "denied"
            );
        });

    return html`
<div>
    <h2>${messages.setup.title}</h2>
    <p>${state.notificationPermission}</p>
    <p>${state.notificationPermission !== "denied"
        ? messages.setup.description
        : messages.setup.permissionDenied}</p>
    <button onclick=${notificationPrompt} >
        ${state.notificationPermission !== "denied"
            ? messages.setup.continue
            : messages.setup.tryAgain}
    </button>
</div>
`;
};

module.exports = setupView;
