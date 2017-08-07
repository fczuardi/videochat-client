// @flow
import type { ChooMiddleware } from "./app";

const {apiCall} = require('./network')

const apiReducers: ChooMiddleware = (state, emitter) => {
    state.api = {
    },
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
        return apiCall({ query, variables }, (err, resp, body) =>
            console.log(body)
        );
    });
};

module.exports = apiReducers;


