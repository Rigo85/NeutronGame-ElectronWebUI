'use strict';

class Q {
    constructor() {
        this._q = {};
    }

    get(source, destination) {
        const row = this._q[source] || {};
        return row[destination] || 0;
    }

    set(source, destination) {
        
    }
}

module.exports = Q;