'use strict';

const Move = require('./move.js');
const FullMove = require('./fullMove.js');

const { findNeutron, allMoves, applyFullMove, heuristic, PieceKind } = require('./gameutils');

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
    if (fullMoves.length) maxFullMove.moves = fullMoves[0].moves;

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

    return maxFullMove;
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
    if (fullMoves.length) minFullMove.moves = fullMoves[0].moves;

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

    return minFullMove;
}
