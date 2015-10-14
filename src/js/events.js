var Events = require("eventemitter2").EventEmitter2,
	events = new Events({ wildcard: true });

module.exports = events;
