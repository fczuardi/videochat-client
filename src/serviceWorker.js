// @flow
import type { ChooMiddleware } from "./app";

const toUint8Array = require("./urlBase64ToUint8Array");

const WORKER_REGISTER = "worker:register";
const WORKER_REGISTERED = "worker:registered";
const WORKER_SERVERKEY = "worker:pushServer:key";
const WORKER_SUBSCRIPTION_INFO = "worker:subscription:info";
const WORKER_SUBSCRIBED = "worker:subscribed";

const workerFilePath = "./sw.js";

const worker: ChooMiddleware = (state, emitter) => {
    state.worker = {
        registration: null
    };

    state.events.WORKER_REGISTER = WORKER_REGISTER;
    state.events.WORKER_REGISTERED = WORKER_REGISTERED;
    state.events.WORKER_SERVERKEY = WORKER_SERVERKEY;
    state.events.WORKER_SUBSCRIPTION_INFO = WORKER_SUBSCRIPTION_INFO;
    state.events.WORKER_SUBSCRIBED = WORKER_SUBSCRIBED;

    emitter.on(state.events.WORKER_REGISTER, () => {
        if (!navigator.serviceWorker) {
            return console.error("Browser doesnt have service worker support");
        }
        navigator.serviceWorker
            .register(workerFilePath)
            .then(
                registration =>
                    emitter.emit(state.events.WORKER_REGISTERED, registration),
                console.error
            );
    });

    emitter.on(state.events.WORKER_REGISTERED, registration => {
        state.worker.registration = registration;
        return registration.pushManager
            .getSubscription()
            .then(subscription =>
                emitter.emit(
                    state.events.WORKER_SUBSCRIPTION_INFO,
                    subscription
                )
            );
    });

    emitter.on(state.events.WORKER_SUBSCRIPTION_INFO, subscription => {
        if (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIBED, subscription);
        }
        return emitter.emit(state.events.API_PUSHSERVER_PUBKEY);
    });

    emitter.on(state.events.WORKER_SERVERKEY, serverKey => {
        const options = {
            userVisibleOnly: true,
            applicationServerKey: toUint8Array(serverKey)
        };
        return state.worker.registration.pushManager
            .subscribe(options)
            .then(subscription =>
                emitter.emit(state.events.WORKER_SUBSCRIBED, subscription)
            );
    });

    emitter.on(state.events.WORKER_SUBSCRIBED, subscription => {
        const keyBuffer = subscription.getKey("p256dh");
        const authBuffer = subscription.getKey("auth");
        const endpoint = subscription.endpoint;
        const key = btoa(
            String.fromCharCode.apply(null, new Uint8Array(keyBuffer))
        );
        const auth = btoa(
            String.fromCharCode.apply(null, new Uint8Array(authBuffer))
        );
        const webPushInfo = { endpoint, key, auth };
        const variables = { id: state.user.id, update: { webPushInfo } };
        emitter.emit(state.events.API_USER_UPDATE, variables);
    });
};

module.exports = worker;
