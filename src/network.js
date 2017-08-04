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
        apiCall({ query, variables }, (err, resp, body) => console.log(body));
        emitter.emit("log:info", user);
    });
};

module.exports = {
    apiReducers
};
