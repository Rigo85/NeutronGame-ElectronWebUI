<<<<<<< HEAD
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
=======
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
>>>>>>> c35ffb33dda4c8b9a05be2f668a4ba47ce93e149
