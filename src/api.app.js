// @flow
import type { ChooMiddleware } from "./app";

const { apiCall } = require("./network");

const API_PUSHSERVER_PUBKEY = "api:pushServer:pubKey";
const API_USER_UPDATE = "api:updateUser";

const apiReducers: ChooMiddleware = (state, emitter) => {
    state.api = {};
    state.events.API_PUSHSERVER_PUBKEY = API_PUSHSERVER_PUBKEY;
    state.events.API_USER_UPDATE = API_USER_UPDATE;

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
                return console.error(err);
            }
            return emitter.emit(state.events.USER_UPDATED, body.data.updateUser);
        });
    });
};

module.exports = apiReducers;
