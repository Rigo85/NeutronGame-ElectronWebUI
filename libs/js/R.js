'use strict';

class R {
    constructor() {
    }

    get(source, destination) {
        const winningReward = destination === Number.MAX_SAFE_INTEGER ? 1000 : undefined;
        const losingReward = destination === Number.MIN_SAFE_INTEGER ? -5000 : undefined;

        return winningReward || losingReward || 0;
    }

}

module.exports = R;
