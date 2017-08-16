// @flow
import type { ChooMiddleware } from "../../app";

const mdlReducer: ChooMiddleware = (state, emitter) => {
    emitter.on(state.events.RENDER, () => {
        if (window.componentHandler) {
            window.setTimeout(() => {
                window.componentHandler.upgradeDom();
            }, 0);
        }
    });
};

module.exports = mdlReducer;
