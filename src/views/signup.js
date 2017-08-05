// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const messages = require("../messages");

const textInput = ({ label, name }) => html`
<label>
    ${label}
    <input name=${name}/>
</label>`;

const signupForm = ({ onSubmit }) => html`
<form onsubmit=${onSubmit}>
    ${textInput({ label: messages.form.name, name: "name" })}
    ${textInput({ label: messages.form.email, name: "email" })}
    <input type="submit" value=${messages.form.signup} />
</form>`;

const signupView: ChooView = (state, emit) => {
    const onSubmit = event => {
        event.preventDefault();
        const formElements = event.target.elements;
        const name = formElements.namedItem("name").value;
        const email = formElements.namedItem("email").value;
        const user = { name, email };
        emit("api:signup", user);
    };
    return html`
<div>
    ${signupForm({ onSubmit })}
    <a href="#">back</a>
</div>`;
};

module.exports = signupView;
