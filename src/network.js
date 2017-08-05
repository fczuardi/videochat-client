// @flow
import type { ChooMiddleware } from "./app";

const xhr = require("xhr");
const config = require("./config");

type APICall = (body: Object, cb: Function) => any;
const apiCall: APICall = (body, cb) =>
    xhr(
        {
            uri: config.api.url,
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            json: true,
            body
        },
        cb
    );

const apiReducers: ChooMiddleware = (state, emitter) => {
    emitter.on("api:room", () => {
        const query = `
        {
            room {
                apiKey
                sessionId
                token
            }
        }`;
        return apiCall({query}, (err, resp, body) => {
            if (err) {
                emitter.emit('log:error', err)
                return state;
            }
            state.room = body.data.room
            emitter.emit("render")
        })
    }),
    emitter.on("api:signup", user => {
        const query = `
        mutation ($user: UserInput){
            createUser(user: $user) {
                id
                name
                email
            }
        }`;
        const variables = { user };
        emitter.emit("log:info", user);
        return apiCall({ query, variables }, (err, resp, body) => console.log(body));
    });
};

module.exports = {
    apiReducers
};