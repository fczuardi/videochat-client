// @flow
import type { ChooView } from "../app";
const html = require("choo/html");

const homeView: ChooView = () => html`
<div>
    <iframe
        src="https://tokbox.com/embed/embed/ot-embed.js?embedId=6e6ac6ff-c40a-433c-8c86-0198cc7fee5c&room=DEFAULT_ROOM&iframe=true"
        width=800
        height=640>
    </iframe>
</div>`;

module.exports = homeView;
