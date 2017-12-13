'use strict';

class Q {
    constructor() {
    }

    get(source, destination) {
        const winningReward = destination === 0 ? 1000 : undefined;
        const losingReward = destination === 4 ? -5000 : undefined;

        return winningReward || losingReward || 0;
    }

}

module.exports = Q;
