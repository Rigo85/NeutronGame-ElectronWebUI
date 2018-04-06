'use strict';

const Move = require('./move.js');
const FullMove = require('./fullMove.js');
exports.states = new Set();

const { findNeutron, allMoves, applyFullMove, heuristic, PieceKind, getState } = require('./gameutils');

/**
 * Maximum function
 * @param {*} board 
 * @param {*} depth 
 * @param {*} alpha 
 * @param {*} beta 
 * @param {*} player 
 */
exports.maxValue = (board, depth, alpha, beta, player) => {
    const neutron = findNeutron(board);
    if (!depth || neutron.row == 0 || neutron.row == 4) return new FullMove([], heuristic(board));

    const fullMoves = allMoves(player, board);

    const maxFullMove = new FullMove([], alpha);

    fullMoves.forEach(fullMove => {
        applyFullMove(fullMove, board);

        const minFullMove = exports.minValue(board, depth - 1, maxFullMove.score, beta, player === PieceKind.BLACK ? PieceKind.WHITE : PieceKind.BLACK);

        if (minFullMove.score > maxFullMove.score) {
            maxFullMove.score = minFullMove.score;
            maxFullMove.moves = fullMove.moves;
        }

        applyFullMove(fullMove, board, false);

        if (maxFullMove.score >= beta) {
            fullMove.score = beta;
            return fullMove;
        }
    });

    if (maxFullMove.empty() && fullMoves.length) {
        const temp = fullMoves.map(fullMove => {
            applyFullMove(fullMove, board);
            const h = heuristic(board);
            applyFullMove(fullMove, board, false);
            fullMove.score = h;
            return fullMove;
        });

        return temp.reduce((acc, c) => c.score > acc.score ? c : acc, new FullMove([], Number.MIN_SAFE_INTEGER));
    } else {
        return maxFullMove;
    }
}

/**
 * Minimum function
 * @param {*} board 
 * @param {*} depth 
 * @param {*} alpha 
 * @param {*} beta 
 * @param {*} player 
 */
exports.minValue = (board, depth, alpha, beta, player) => {
    const neutron = findNeutron(board);
    if (!depth || neutron.row == 0 || neutron.row == 4) return new FullMove([], heuristic(board));

    const fullMoves = allMoves(player, board);

    const minFullMove = new FullMove([], beta);

    fullMoves.forEach(fullMove => {
        applyFullMove(fullMove, board);

        const maxFullMove = exports.maxValue(board, depth - 1, alpha, minFullMove.score, player === PieceKind.BLACK ? PieceKind.WHITE : PieceKind.BLACK);

        if (maxFullMove.score < minFullMove.score) {
            minFullMove.score = maxFullMove.score;
            minFullMove.moves = fullMove.moves;
        }

        applyFullMove(fullMove, board, false);

        if (alpha >= minFullMove.score) {
            fullMove.score = alpha;
            return fullMove;
        }
    });

    if (minFullMove.empty() && fullMoves.length) {
        const temp = fullMoves.map(fullMove => {
            applyFullMove(fullMove, board);
            const h = heuristic(board);
            applyFullMove(fullMove, board, false);
            fullMove.score = h;
            return fullMove;
        });

        return temp.reduce((acc, c) => c.score < acc.score ? c : acc, new FullMove([], Number.MAX_SAFE_INTEGER));
    } else {
        return minFullMove;
    }
}
