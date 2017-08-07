// @flow
import type { ChooMiddleware } from "./app";

const { apiCall } = require("./network");

const API_PUSHSERVER_PUBKEY = "api:pushServer:pubKey";

const apiReducers: ChooMiddleware = (state, emitter) => {
    state.api = {};
    state.events.API_PUSHSERVER_PUBKEY = API_PUSHSERVER_PUBKEY;

    emitter.on(state.events.API_PUSHSERVER_PUBKEY, () => {
        const query = `
        {
            pushServer {
                pubKey
            }
        }`;
        return apiCall({ query }, (err, resp, body) => {
            if (err || !body.data.pushServer) {
                if (err) {
                    console.error(err);
                }
                return console.error("API return dont have a pubkey value");
            }
            return emitter.emit(
                state.events.WORKER_SERVERKEY,
                body.data.pushServer.pubKey
            );
        });
    });
};

module.exports = apiReducers;
