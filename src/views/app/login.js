// @flow
import type { ChooView } from "../../app";
const html = require("choo/html");
const messages = require("../../messages").app.login;

const loginView: ChooView = (state, emit) => {
    const onSubmit = event => {
        event.preventDefault();
        const username = event.target.elements[0].value.trim();
        const saveLocally = true;
        emit(state.events.USER_LOGIN, { username, saveLocally });
    };
    const classNames = {
        textfield:
            "mdl-textfield mdl-js-textfield mdl-textfield--floating-label",
        textfieldInput: "mdl-textfield__input",
        textfieldLabel: "mdl-textfield__label",
        submit:
            "mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--accent"
    };
    return html`
<div>
    <h3>
        ${messages.heading}
    </h3>
    <form
        onsubmit=${onSubmit}
    >
        <div class=${classNames.textfield}>
            <input
                class=${classNames.textfieldInput}
                id="userId"
            />
            <label
                class=${classNames.textfieldLabel}
                for="userId"
            >
                ${messages.userId}
            </label>
        </div>
        <button
            type="submit"
            class=${classNames.submit}
        >${messages.login}</button>
    </form>
</div>`;
};

module.exports = loginView;
