var Events = require("event");
Events.prototype.emit = Events.prototype.fire;
var events = new Events({});
module.exports = events;
