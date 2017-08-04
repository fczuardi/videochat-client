// @flow
type ChooView = (Object, Function) => HTMLElement;

const html = require("choo/html");

const messages = {
    loading: "please wait...",
    form: {
        name: "Name",
        email: "Email",
        signup: "Signup"
    }
};

const domEventWrap = cb => event => {
    event.preventDefault();
    cb(event.target);
}

const loading = () => html`<div><p>${messages.loading}</p></div>`;

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

const signup: ChooView = (state, emit) => {
    const onSubmit = domEventWrap(form => emit('signup:formSubmit', {form}));
    return html`
<div>
    ${signupForm({ onSubmit })}
</div>`;
};

// const main = loading;
const main = signup;

module.exports = {
    main
};
