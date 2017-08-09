// @flow
import type { ChooView } from "../../app";
const html = require("choo/html");
const messages = require("../../messages").app.login;

const loginView: ChooView = (state, emit) => {
    const onSubmit = event => {
        event.preventDefault();
        const username = event.target.elements[0].value.trim();
        const saveLocally = event.target.elements[1].checked;
        emit(state.events.USER_LOGIN, {username, saveLocally});
    };
    const errorMsg = state.errors.api
        ? html`<p>${state.errors.api.message}`
        : "";
    const saveLocally = state.user.saveLocally;
    const labelStyle = "display:block;"
    return html`
<div>
    ${errorMsg}
    <form onsubmit=${onSubmit}>
        <label style=${labelStyle}>
            ${messages.userId}
            <input
                name="userId"
                placeholder=${messages.userIdPlaceholder}></input>
        </label>
        <label style=${labelStyle}>
            ${messages.remember}
            <input
                type="checkbox"
                name="saveLocally"
                checked=${saveLocally}></input>
        </label>
        <input type="submit" value=${messages.login}/>
    </form>
</div>`;
};

module.exports = loginView;
