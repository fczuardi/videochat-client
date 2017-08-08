// @flow
import type { ChooMiddleware } from "./app";

const { apiCall } = require("./network");

const apiReducers: ChooMiddleware = (state, emitter) => {
    state.api = {};

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
                    return emitter.emit(state.events.ERROR_API, err)
                }
                return emitter.emit(state.events.ERROR_API, new Error(
                    "API return dont have a pubkey value"
                ));
            }
            return emitter.emit(
                state.events.WORKER_SERVERKEY,
                body.data.pushServer.pubKey
            );
        });
    });

    emitter.on(state.events.API_USER_UPDATE, variables => {
        const query = `
        mutation($id:ID!, $update: UserInput) {
            updateUser(id:$id, update:$update){
                id
                name
                email
                groups
                webPushInfo {
                    endpoint
                    key
                    auth
                }
            }
        }`;
        return apiCall({ query, variables }, (err, resp, body) => {
            if (err) {
                return emitter.emit(state.events.ERROR_API, err)
            }
            return emitter.emit(state.events.USER_UPDATED, body.data.updateUser);
        });
    });
};

module.exports = apiReducers;
