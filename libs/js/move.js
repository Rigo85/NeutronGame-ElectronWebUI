'use strict';

class Move {

    constructor(row, col, kind) {
        this.row = row;
        this.col = col;
        this.kind = kind;

        Move.prototype.toString = this.toString;
    }

    clone() {
        return new Move(this.row, this.col, this.kind);
    }

    toString() {
        const chars = ['a', 'b', 'c', 'd', 'e'];
        return `${chars[this.col]}${5 - this.row}`;
    }

}

module.exports = Move;
