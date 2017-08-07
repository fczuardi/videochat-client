// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const messages = require("../messages");

const loginView: ChooView = (state, emit) => {
    const onSubmit = event => {
        event.preventDefault();
        const id = event.target.elements[0].value.trim();
        console.log({ id });
        console.log(state.events);
        emit(state.events.USER_LOGIN, id);
    };
    return html`
<div>
    <form onsubmit=${onSubmit}>
        <label>
            ${messages.login.userId}
            <input
                name="userId"
                placeholder=${messages.login.userIdPlaceholder}></input>
        </label>
        <input type="submit" value=${messages.login.login}/>
    </form>
</div>`;
};

module.exports = loginView;
