'use strict';

const _ = require('lodash');

const Move = require('./move.js');
const FullMove = require('./fullMove.js');

/**
 * Piece kind.
 */
exports.PieceKind = {
    BLACK: 1,
    WHITE: 2,
    NEUTRON: 3,
    CELL: 4,
    SBLACK: 5,
    SWHITE: 6,
    SCELL: 7,
    SNEUTRON: 8
};

/**
 * Direction.
 */
exports.Direction = {
    NORTH: 1,
    SOUTH: 2,
    EAST: 3,
    WEST: 4,
    NORTHEAST: 5,
    NORTHWEST: 6,
    SOUTHEAST: 7,
    SOUTHWEST: 8
};

/**
 * Find neutron.
 * @param {*} board 
 */
exports.findNeutron = (board) => {
    function _find(b, r, c) {
        if (b[r][c] === exports.PieceKind.NEUTRON) return new Move(r, c, exports.PieceKind.NEUTRON);
        if (r === 5) return undefined;
        const _c = (c + 1) % 5;
        const _r = r + (!_c ? 1 : 0);

        return _find(b, _r, _c);
    }

    return _find(board, 0, 0);
}

/**
 * Stocastic function.
 * @param {*} board 
 */
exports.heuristic = (board) => {
    const neutron = exports.findNeutron(board);

    if (neutron.row === 4) return Number.MIN_SAFE_INTEGER;
    if (neutron.row === 0) return Number.MAX_SAFE_INTEGER;

    const neutronMoves = exports.moves(neutron, board);

    const count = neutronMoves
        .map(move => {
            if (move.row === 4) return -5000;
            if (move.row === 0) return 1000;
            return 0;
        })
        .reduce((acc, c) => acc + c, 0);

    return count;
}

/**
 * Find pieces of some kind.
 * @param {*} pieceKind 
 * @param {*} board 
 */
exports.findPieces = (pieceKind, board) => {
    return Array
        .from(Array(25).keys())
        .map(i => {
            const row = parseInt(i / 5);
            const col = i % 5;

            return board[row][col] === pieceKind ? new Move(row, col, pieceKind) : undefined;
        })
        .filter(m => m);
}

/**
 * Find all moves.
 * @param {*} pieceKind 
 * @param {*} board 
 */
exports.allMoves = (pieceKind, board) => {
    const neutron = exports.findNeutron(board);
    let lastNeutron = neutron;
    const playerHome = pieceKind == exports.PieceKind.BLACK ? 0 : 4;
    const opponentHome = pieceKind == exports.PieceKind.BLACK ? 4 : 0;
    //todo ver esto
    const neutronMoves = exports.moves(neutron, board).filter(move => move.row !== opponentHome);

    //todo revisar esto
    neutronMoves.sort((o1, o2) => {
        if (o1.row === playerHome || o2.row === opponentHome) return -1;
        if (o2.row === playerHome || o1.row === opponentHome) return 1;
        return 0;
    });

    const pieces = exports.findPieces(pieceKind, board);

    const allFullMoves = _.flatMap(neutronMoves, neutronMove => {
        exports.applyMove(lastNeutron, neutron, board);
        exports.applyMove(neutron, neutronMove, board);
        lastNeutron = neutronMove;

        return _.flatMap(pieces, piece => exports.moves(piece, board)
            .map(pieceMove => new FullMove([neutron, neutronMove, piece, pieceMove], 0)));
    });

    exports.applyMove(lastNeutron, neutron, board);

    return allFullMoves;
}

/**
 * Get the movements for the selected chip.
 * @param {*} startPoint 
 * @param {*} board 
 */
exports.moves = (startPoint, board) => {
    const directions = [
        exports.Direction.NORTH, exports.Direction.SOUTH,
        exports.Direction.EAST, exports.Direction.WEST,
        exports.Direction.NORTHEAST, exports.Direction.NORTHWEST,
        exports.Direction.SOUTHEAST, exports.Direction.SOUTHWEST];

    return directions
        .map(direction => exports.checkMove(startPoint, direction, board))
        .filter(m => m);
}

/**
 * Check the move in some direction.
 * @param {*} move 
 * @param {*} direction 
 * @param {*} board 
 */
exports.checkMove = (move, direction, board) => {
    function _check(row, col, incR, incC, board) {
        if (!exports.inBounds(row, incR) ||
            !exports.inBounds(col, incC) ||
            board[row + incR][col + incC] !== exports.PieceKind.CELL) return { row: row, col: col };
        return _check(row + incR, col + incC, incR, incC, board);
    }

    const { row, col } = _check(move.row, move.col, exports.getRowMove(direction), exports.getColMove(direction), board);

    return row === move.row && col === move.col ? null : new Move(row, col, move.kind);
}

/**
 * Get increment in rows.
 * @param {*} direction 
 */
exports.getRowMove = (direction) => {
    const result = {};
    result[exports.Direction.NORTH] = -1;
    result[exports.Direction.SOUTH] = 1;
    result[exports.Direction.NORTHEAST] = -1;
    result[exports.Direction.NORTHWEST] = -1;
    result[exports.Direction.SOUTHEAST] = 1;
    result[exports.Direction.SOUTHWEST] = 1;

    return result[direction] || 0;
}

/**
 * Get increment in columns.
 * @param {*} direction 
 */
exports.getColMove = (direction) => {
    const result = {};
    result[exports.Direction.WEST] = -1;
    result[exports.Direction.EAST] = 1;
    result[exports.Direction.NORTHEAST] = 1;
    result[exports.Direction.NORTHWEST] = -1;
    result[exports.Direction.SOUTHEAST] = 1;
    result[exports.Direction.SOUTHWEST] = -1;

    return result[direction] || 0;
}

/**
 * Check bounds. 
 * @param {*} value 
 * @param {*} inc 
 */
exports.inBounds = (value, inc) => {
    return value + inc >= 0 && value + inc < 5;
}

/**
 * Apply move on some board.
 * @param {*} from 
 * @param {*} to 
 * @param {*} board 
 */
exports.applyMove = (from, to, board) => {
    board[to.row][to.col] = to.kind;
    if (from.col * 5 + from.row != to.col * 5 + to.row)
        board[from.row][from.col] = exports.PieceKind.CELL;
}

/**
 * Apply full move.
 * @param {*} fullMove 
 * @param {*} board 
 * @param {*} apply 
 */
exports.applyFullMove = (fullMove, board, apply = true) => {
    exports.applyMove(fullMove.moves[apply ? 0 : 3], fullMove.moves[apply ? 1 : 2], board);
    exports.applyMove(fullMove.moves[apply ? 2 : 1], fullMove.moves[apply ? 3 : 0], board);
}

/**
 * Update the board with some moves.
 * @param {*} moves 
 * @param {*} board 
 */
exports.updateBoard = (moves, board) => {
    const trans = {};
    trans[exports.PieceKind.BLACK] = exports.PieceKind.BLACK;
    trans[exports.PieceKind.WHITE] = exports.PieceKind.WHITE;
    trans[exports.PieceKind.NEUTRON] = exports.PieceKind.NEUTRON;
    trans[exports.PieceKind.CELL] = exports.PieceKind.CELL;
    trans[exports.PieceKind.SBLACK] = exports.PieceKind.BLACK;
    trans[exports.PieceKind.SWHITE] = exports.PieceKind.WHITE;
    trans[exports.PieceKind.SNEUTRON] = exports.PieceKind.NEUTRON;
    trans[exports.PieceKind.SCELL] = exports.PieceKind.CELL;

    const trans2 = {};
    trans2[exports.PieceKind.BLACK] = exports.PieceKind.SBLACK;
    trans2[exports.PieceKind.WHITE] = exports.PieceKind.SWHITE;
    trans2[exports.PieceKind.NEUTRON] = exports.PieceKind.SNEUTRON;
    trans2[exports.PieceKind.CELL] = exports.PieceKind.SCELL;

    Array
        .from(Array(25).keys())
        .forEach(i => {
            const row = parseInt(i / 5);
            const col = i % 5;

            board[row][col] = trans[board[row][col]];
        });

    moves.forEach(m => board[m.row][m.col] = trans2[board[m.row][m.col]]);
}

/**
 * Board to string utility.
 * @param {*} board 
 */
exports.tableToString = (board) => {
    console.log(Array
        .from(Array(5).keys())
        .reduce((acc, i) => acc.concat(`||${board[i].map(exports.pieceToString).join('|')}||\n`), ''));
}

/**
 * Piece to string utility.
 * @param {*} pieceKind 
 */
exports.pieceToString = (pieceKind) => {
    if (pieceKind === exports.PieceKind.BLACK) return 'B';
    if (pieceKind === exports.PieceKind.WHITE) return 'W';
    if (pieceKind === exports.PieceKind.NEUTRON) return 'N';
    return ' ';
}

exports.getState = board => {
    const neutron = exports.findNeutron(board);

    if (neutron.row === 0) return Number.MAX_SAFE_INTEGER;
    if (neutron.row === 4) return Number.MIN_SAFE_INTEGER;

    const moves = exports.moves(neutron, board);

    const { cB, cW } = moves.reduce((acc, c) => {
        return Object.assign(acc, { cB: c.row === 0 ? acc.cB + 1 : acc.cB, cW: c.row === 4 ? acc.cW + 1 : acc.cW });
    }, { cB: 0, cW: 0 });

    let hash = 1;
    hash = hash * 3 + cB;
    hash = hash * 5 + cW;
    hash = hash * 7 + moves.length;

    return hash;
}

/**
 * Game over verification.
 * @param {*} neutronDestination 
 * @param {*} pieceKind 
 */
exports.checkGameOver = (neutronDestination, pieceKind, board) => {
    const neutronMoves = exports.moves(neutronDestination, board);
    if (!neutronMoves.length) return { success: true, kind: pieceKind };
    if (!neutronDestination.row) return { success: true, kind: exports.PieceKind.BLACK };
    if (neutronDestination.row === 4) return { success: true, kind: exports.PieceKind.WHITE };
    return { success: false, kind: 4 };
}
