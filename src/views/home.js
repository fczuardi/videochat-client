// @flow
import type { ChooView } from "../app";

const html = require("choo/html");
const messages = require("../messages")

const homeView: ChooView = (state, emit) => {
    const onSubmit = event => {
        event.preventDefault();
        const room = JSON.parse(event.target.elements[0].value);
        const publishFirst = true;
        emit(state.events.CHAT_INIT, {room, publishFirst});
    };
    const errorMsg = state.errors.api
        ? html`<p>${state.errors.api.message}</p>`
        : '';
    return html`
<div>
    <div>
        ${errorMsg}
        <dt>${messages.home.user}</dt>
        <dd>${state.user.name} (${state.user.email})</dd>
    </div>
    <div id="publisher"></div>
    <div id="subscriber"></div>
    <form onsubmit=${onSubmit}>
        <textarea name="ot"></textarea>
        <input type="submit" />
    </form>
</div>`;
};

module.exports = homeView;
