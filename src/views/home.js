// @flow
import type { ChooView } from "../app";
const html = require("choo/html");

const homeView: ChooView = (state, emit) => {
    const onSubmit = event => {
        event.preventDefault();
        const room = JSON.parse(event.target.elements[0].value);
        state.publishFirst = true;
        emit("opentok:initialize", room);
    };
    return html`
<div>
    <div id="publisher"></div>
    <div id="subscriber"></div>
    <form onsubmit=${onSubmit}>
        <textarea name="ot"></textarea>
        <input type="submit" />
    </form>
</div>`;
};

module.exports = homeView;
