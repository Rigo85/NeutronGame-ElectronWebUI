'use strict';

const path = require('path');
const jsonfile = require('jsonfile');
const moment = require('moment');

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

    save(_filename) {
        const filename = _filename || path.join(process.cwd(), `Q-${moment().format().replace(/[:.]/g, '-')}.json`);

        jsonfile.writeFile(
            filename,
            {
                q: this.q
            },
            { spaces: 2 },
            err => {
                if (err) console.error(err);
            });
    }

    load(filename) {
        return new Promise((resolve, reject) => {
            jsonfile.readFile(filename, (err, obj) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.q = obj.q || {};
                resolve(true);
            });
        });
    }
}

module.exports = Q;