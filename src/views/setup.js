// @flow
import type { ChooView } from "../app";
const html = require("choo/html");
const { domEventWrap } = require("../dom");
const messages = require("../messages");

const setupView: ChooView = (state, emit) => {
    return html`<div>
    </div>`;
};

module.exports = setupView;
