// @flow
import type { ChooMiddleware } from './app';

type EventWrapper = (cb: Function) => (event: Event) => void;
const domEventWrap: EventWrapper = cb => event => {
    event.preventDefault();
    cb(event.target);
};

const domReducers: ChooMiddleware = (state, emitter) => {
    emitter.on('signup:formSubmit', form => {
        const name = form.elements.namedItem('name').value
        const email = form.elements.namedItem('email').value
        const user = { name, email }
        emitter.emit('api:signup', user)
    })
}

module.exports = {
    domEventWrap,
    domReducers
}
