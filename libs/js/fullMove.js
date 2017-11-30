'use strict';

class FullMove {

    constructor(moves, score) {
        this.moves = moves;
        this.score = score;
        FullMove.prototype.toString = this.toString;
    }

    kind2Name(pieceKind) {
        const names = { 1: 'BLACK', 2: 'WHITE', 3: 'NEUTRON' };
        return names[pieceKind] || 'NO KIND';
    }

    toString() {
        if (this.moves.length) {
            const piece1Kind = this.kind2Name(this.moves[1].kind);
            const piece2Kind = this.kind2Name(this.moves[3].kind);
            return `${piece1Kind}: ${this.moves[0].toString()}-${this.moves[1].toString()}, ` +
                `${piece2Kind}: ${this.moves[2].toString()}-${this.moves[3].toString()}`;
        }

        return `EMPTY FULLMOVE with score = ${this.score}`;
    }

    empty() {
        return !moves.length;
    }
}

module.exports = FullMove;
