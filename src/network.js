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

module.exports = {
    apiCall
}
