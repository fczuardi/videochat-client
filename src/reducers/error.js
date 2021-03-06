// @flow
import type { ChooMiddleware } from "../app";

const ERROR_API = "error:api";

type ErrorReducer = (snackbar: Object | void) => ChooMiddleware;
const errorReducer: ErrorReducer = snackbar => (state, emitter) => {
    state.errors = {
        api: null
    };

    state.events.ERROR_API = ERROR_API;

    const clearApiError = () => {
        state.errors.api = null;
    };

    emitter.on(state.events.API_PUSHSERVER_PUBKEY, clearApiError);
    emitter.on(state.events.API_ROOM, clearApiError);
    emitter.on(state.events.API_USER_UPDATE, clearApiError);

    emitter.on(ERROR_API, err => {
        console.error(err);
        state.errors.api = err;
        emitter.emit(state.events.RENDER);
        if (!snackbar || !snackbar.MaterialSnackbar) {
            return null;
        }
        snackbar.MaterialSnackbar.showSnackbar({
            message: err
        });
    });
};

module.exports = errorReducer;
