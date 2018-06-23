'use strict';

const Events = require('event');
Events.prototype.emit = Events.prototype.fire;

const events = new Events({});

const setupListeners = ( triggers, useNetwork = false ) => {

    const eventMap = new Map([
        [ 'page.loading', require('./page-loading') ],
        [ 'content.loading', require('./content-loading') ],
        [ 'content.create', require('./content-create') ],
        [ 'content.save', require('./content-save') ],
        [ 'title.save', require('./title-save') ],
        [ 'tags.save', require('./tags-save') ],
    ]);

    for ( const trigger of triggers ) {
        const event = eventMap.get(trigger);

        const {
            handler,
            networkHandler
        } = event;

        events.on(
            trigger,
            !useNetwork ? handler : networkHandler
        );
    }

    return events;
};

module.exports = {
    emitEvent: events.emit.bind(events),
    setupListeners,
    listenFor: events.on.bind(events),
    events
};
