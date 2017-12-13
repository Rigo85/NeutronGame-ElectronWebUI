'use strict';

class Q {
    constructor() {
        this.q = {};
    }

    get(source, destination) {
        const row = this.q[source] || {};
        return row[destination] || 0;
    }

    set(source, destination, value) {
        this.q[source] = this.q[source] || {};
        this.q[source][destination] = value;
    }
}

module.exports = Q;