// @flow
import type { ChooMiddleware } from "./app";

const toUint8Array = require("./urlBase64ToUint8Array");

const WORKER_REGISTERED = "worker:registered";
const WORKER_SERVERKEY = "worker:pushServer:key";
const WORKER_SUBSCRIPTION_INFO = "worker:subscription:info";
const WORKER_SUBSCRIBED = "worker:subscribed";

const workerFilePath = "./sw.js";

const worker: ChooMiddleware = (state, emitter) => {
    state.worker = {
        registration: null,
        subscription: null
    };

    state.events.WORKER_REGISTERED = WORKER_REGISTERED;
    state.events.WORKER_SERVERKEY = WORKER_SERVERKEY;
    state.events.WORKER_SUBSCRIPTION_INFO = WORKER_SUBSCRIPTION_INFO;
    state.events.WORKER_SUBSCRIBED = WORKER_SUBSCRIBED;

    emitter.on(state.events.WORKER_REGISTERED, registration => {
        state.worker.registration = registration;
        console.log({ registration });
        // get push subscription
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
        console.log("eventName", state.events.API_PUSHSERVER_PUBKEY);
        return emitter.emit(state.events.API_PUSHSERVER_PUBKEY);
    });

    emitter.on(state.events.WORKER_SERVERKEY, serverKey => {
        console.log({ serverKey });
        const options = {
            userVisibleOnly: true,
            applicationServerKey: toUint8Array(serverKey)
        };
        console.log({ options });
        return state.worker.registration.pushManager
            .subscribe(options)
            .then(subscription =>
                emitter.emit(state.events.WORKER_SUBSCRIBED, subscription)
            );
    });

    emitter.on(state.events.WORKER_SUBSCRIBED, subscription => {
        console.log({ subscription });
        state.worker.subscription = subscription;
        emitter.emit(state.events.RENDER);
    });

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
};

module.exports = worker;
