'use strict';

const util = require('util');
const _ = require('lodash');

const Move = require('./move.js');
const FullMove = require('./fullMove.js');

//Piece kind.
const PieceKind = {
    BLACK: 1,
    WHITE: 2,
    NEUTRON: 3,
    CELL: 4,
    SBLACK: 5,
    SWHITE: 6,
    SCELL: 7,
    SNEUTRON: 8
};

//Direction.
const Direction = {
    NORTH: 1,
    SOUTH: 2,
    EAST: 3,
    WEST: 4,
    NORTHEAST: 5,
    NORTHWEST: 6,
    SOUTHEAST: 7,
    SOUTHWEST: 8
};

var selectedChip = undefined;

//start board.
exports.board = [
    [PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK],
    [PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL],
    [PieceKind.CELL, PieceKind.CELL, PieceKind.NEUTRON, PieceKind.CELL, PieceKind.CELL],
    [PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL],
    [PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE]];

//Pieces rotation.  
const rotation = [PieceKind.NEUTRON, PieceKind.WHITE];

//
var whoMove = 0;

function getWhoMove() {
    return rotation[whoMove];
}

function updateWhoMove() {
    whoMove = (whoMove + 1) % 2;
}

//Update the board with some moves.
function updateBoard(moves, board) {
    const trans = {};
    trans[PieceKind.BLACK] = PieceKind.BLACK;
    trans[PieceKind.WHITE] = PieceKind.WHITE;
    trans[PieceKind.NEUTRON] = PieceKind.NEUTRON;
    trans[PieceKind.CELL] = PieceKind.CELL;
    trans[PieceKind.SBLACK] = PieceKind.BLACK;
    trans[PieceKind.SWHITE] = PieceKind.WHITE;
    trans[PieceKind.SNEUTRON] = PieceKind.NEUTRON;
    trans[PieceKind.SCELL] = PieceKind.CELL;

    const trans2 = {};
    trans2[PieceKind.BLACK] = PieceKind.SBLACK;
    trans2[PieceKind.WHITE] = PieceKind.SWHITE;
    trans2[PieceKind.NEUTRON] = PieceKind.SNEUTRON;
    trans2[PieceKind.CELL] = PieceKind.SCELL;

    Array
        .from(Array(25).keys())
        .forEach(i => {
            const row = parseInt(i / 5);
            const col = i % 5;

            board[row][col] = trans[board[row][col]];
        });

    moves.forEach(m => board[m.row][m.col] = trans2[board[m.row][m.col]]);
}

//Get the movements for the selected chip.
function moves(startPoint, board) {
    const directions = [
        Direction.NORTH, Direction.SOUTH,
        Direction.EAST, Direction.WEST,
        Direction.NORTHEAST, Direction.NORTHWEST,
        Direction.SOUTHEAST, Direction.SOUTHWEST];

    return directions
        .map(direction => checkMove(startPoint, direction, board))
        .filter(m => m);
}

//Check the move in some direction.
function checkMove(move, direction, board) {
    function _check(row, col, incR, incC, board) {
        if (!inBounds(row, incR) ||
            !inBounds(col, incC) ||
            board[row + incR][col + incC] !== PieceKind.CELL) return { row: row, col: col };
        return _check(row + incR, col + incC, incR, incC, board);
    }

    const { row, col } = _check(move.row, move.col, getRowMove(direction), getColMove(direction), board);

    return row === move.row && col === move.col ? null : new Move(row, col, move.kind);
}

//Get increment in rows.
function getRowMove(direction) {
    const result = {};
    result[Direction.NORTH] = -1;
    result[Direction.SOUTH] = 1;
    result[Direction.NORTHEAST] = -1;
    result[Direction.NORTHWEST] = -1;
    result[Direction.SOUTHEAST] = 1;
    result[Direction.SOUTHWEST] = 1;

    return result[direction] || 0;
}

//Get increment in columns.
function getColMove(direction) {
    const result = {};
    result[Direction.WEST] = -1;
    result[Direction.EAST] = 1;
    result[Direction.NORTHEAST] = 1;
    result[Direction.NORTHWEST] = -1;
    result[Direction.SOUTHEAST] = 1;
    result[Direction.SOUTHWEST] = -1;

    return result[direction] || 0;
}

//Check bounds.
function inBounds(value, inc) {
    return value + inc >= 0 && value + inc < 5;
}

//Apply move on some board.
function applyMove(from, to, board) {
    board[to.row][to.col] = to.kind;
    if (from.col * 5 + from.row != to.col * 5 + to.row)
        board[from.row][from.col] = PieceKind.CELL;
}

//
function applyFullMove(fullMove, board, apply = true) {
    applyMove(fullMove.moves[apply ? 0 : 3], fullMove.moves[apply ? 1 : 2], board);
    applyMove(fullMove.moves[apply ? 2 : 1], fullMove.moves[apply ? 3 : 0], board);
}

//Find neutron.
function findNeutron(board) {
    function _find(b, r, c) {
        if (b[r][c] === PieceKind.NEUTRON) return new Move(r, c, PieceKind.NEUTRON);
        if (r === 5) return undefined;
        const _c = (c + 1) % 5;
        const _r = r + (!_c ? 1 : 0);

        return _find(b, _r, _c);
    }

    return _find(board, 0, 0);
}

//TODO comentar en pseudo-código la heurística.
//
function heuristic(board, pieceKind) {
    let blacks = 0;
    let whites = 0;
    let goalBlacks = 0;
    let goalWhites = 0;

    const neutron = findNeutron(board);
    if (neutron.row === 0) return 1000;
    if (neutron.row === 4) return -1000;

    const _moves = moves(neutron, board);
    goalBlacks += _moves.filter(m => m.row === 0).length * 100;
    goalWhites += _moves.filter(m => m.row === 4).length * 100;

    if (pieceKind === PieceKind.WHITE && goalWhites !== 0) return -goalWhites;
    if (pieceKind === PieceKind.BLACK && goalBlacks !== 0) return goalBlacks;
    if (pieceKind === PieceKind.BLACK && goalWhites !== 0) whites += 100;

    const emptySpacesInBlacks = board[0].reduce((acc, c) => acc + (c === PieceKind.CELL ? 1 : 0), 0);
    const emptySpacesInWhites = board[4].reduce((acc, c) => acc + (c === PieceKind.CELL ? 1 : 0), 0);

    Array
        .from(Array(25).keys())
        .forEach(i => {
            const row = parseInt(i / 5);
            const col = i % 5;

            if (board[row][col] === PieceKind.BLACK) blacks += moves(new Move(row, col), board).length;
            if (board[row][col] === PieceKind.WHITE) whites += moves(new Move(row, col), board).length;
        });

    return (blacks * emptySpacesInBlacks) - (whites * emptySpacesInWhites);
}

//
function findPieces(pieceKind, board) {
    return Array
        .from(Array(25).keys())
        .map(i => {
            const row = parseInt(i / 5);
            const col = i % 5;

            return board[row][col] === pieceKind ? new Move(row, col, pieceKind) : undefined;
        })
        .filter(m => m);
}

//
function allMoves(pieceKind, board) {
    const neutron = findNeutron(board);
    let lastNeutron = neutron;
    const playerHome = pieceKind == PieceKind.BLACK ? 0 : 4;
    const opponentHome = pieceKind == PieceKind.BLACK ? 4 : 0;
    const neutronMoves = moves(neutron, board);

    neutronMoves.sort((o1, o2) => {
        if (o1.row === playerHome || o2.row === opponentHome) return -1;
        if (o2.row === playerHome || o1.row === opponentHome) return 1;
        return 0;
    });

    const pieces = findPieces(pieceKind, board);

    const allFullMoves = _.flatMap(neutronMoves, neutronMove => {
        applyMove(lastNeutron, neutron, board);
        applyMove(neutron, neutronMove, board);
        lastNeutron = neutronMove;

        return _.flatMap(pieces, piece => moves(piece, board)
            .map(pieceMove => new FullMove([neutron, neutronMove, piece, pieceMove], 0)));
    });

    applyMove(lastNeutron, neutron, board);

    return allFullMoves;
}

//
function maxValue(board, depth, alpha, beta, player) {
    if (!depth) return new FullMove([], heuristic(board));

    let maxFullMove = null;
    const fullMoves = allMoves(player, board);

    let newAlpha = alpha;

    fullMoves.forEach(fullMove => {
        applyFullMove(fullMove, board);
        let minFullMove = null;

        if (fullMove.moves[1].row === 0 || fullMove.moves[1].row === 4) {
            minFullMove = new FullMove([], heuristic(board, player));
        } else {
            minFullMove = minValue(board, depth - 1, newAlpha, beta, player === PieceKind.BLACK ? PieceKind.WHITE : PieceKind.BLACK);
        }

        applyFullMove(fullMove, board, false);

        if (minFullMove !== null && minFullMove.score > newAlpha) {
            newAlpha = minFullMove.score;
            maxFullMove = fullMove;
            maxFullMove.score = newAlpha;
        }

        if (newAlpha >= beta) {
            fullMove.score = newAlpha;
            return fullMove;
        }
    });

    return maxFullMove;
}

//
function minValue(board, depth, alpha, beta, player) {
    if (depth === 0) return new FullMove([], heuristic(board, player));

    let minFullMove = null;
    const fullMoves = allMoves(player, board);
    let newBeta = beta;

    fullMoves.forEach(fullMove => {
        applyFullMove(fullMove, board);
        let maxFullMove = null;

        if (fullMove.moves[1].row === 0 || fullMove.moves[1].row === 4) {
            maxFullMove = new FullMove([], heuristic(board, player));
        } else {
            maxFullMove = maxValue(board, depth - 1, alpha, newBeta, player === PieceKind.BLACK ? PieceKind.WHITE : PieceKind.BLACK);
        }

        applyFullMove(fullMove, board, false);

        if (maxFullMove !== null && maxFullMove.score < beta) {
            newBeta = maxFullMove.score;
            minFullMove = fullMove;
            minFullMove.score = newBeta;
        }

        if (alpha >= newBeta) {
            fullMove.score = newBeta;
            return fullMove;
        }
    });

    return minFullMove;
}

exports.onCellClicked = function (row, col) {
    return new Promise((resolve, reject) => {
        if (exports.board[row][col] === getWhoMove()) {
            updateBoard([], exports.board);
            const move = new Move(row, col, getWhoMove());
            const m = moves(move, exports.board);
            updateBoard(m.concat(move), exports.board);
            selectedChip = move;
        } else if (exports.board[row][col] == PieceKind.SCELL) {

            applyMove(selectedChip, new Move(row, col, selectedChip.kind), exports.board);
            updateBoard([], exports.board);

            if (getWhoMove() === PieceKind.WHITE) {
                //list de movimientos
                const machineFullMove = maxValue(
                    exports.board,
                    4,
                    Number.MIN_SAFE_INTEGER,
                    Number.MAX_SAFE_INTEGER,
                    PieceKind.BLACK);

                if (machineFullMove !== null) {
                    //list de movs.
                    applyFullMove(machineFullMove, exports.board);
                    updateBoard([], exports.board);
                }
            }
            
            updateWhoMove();
            selectedChip = undefined;
            //checkGameOver
        } else {
            updateBoard([], exports.board);
            selectedChip = undefined;
        }
        resolve(exports.board);
    });
}

