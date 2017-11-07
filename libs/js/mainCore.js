'use strict';

const util = require('util');

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

//    
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
function moves(row, col, board) {
    const directions = [
        Direction.NORTH, Direction.SOUTH,
        Direction.EAST, Direction.WEST,
        Direction.NORTHEAST, Direction.NORTHWEST,
        Direction.SOUTHEAST, Direction.SOUTHWEST];

    return directions
        .map(direction => checkMove(row, col, direction, board))
        .filter(m => m);
}

//Check the move in some direction.
function checkMove(row, col, direction, board) {
    const incRow = getRowMove(direction);
    const incCol = getColMove(direction);
    let newRow = row;
    let newCol = col;

    while (inBounds(newRow, incRow) && inBounds(newCol, incCol) &&
        board[newRow + incRow][newCol + incCol] == PieceKind.CELL) {
        newRow += incRow;
        newCol += incCol;
    }

    return newRow === row && newCol === col ? null : { row: newRow, col: newCol };
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
    board[to.row][to.col] = board[from.row][from.col];
    board[from.row][from.col] = PieceKind.CELL;
}

exports.onCellClicked = function (row, col) {
    return new Promise((resolve, reject) => {
        if (exports.board[row][col] === getWhoMove()) {
            const m = moves(row, col, exports.board);
            updateBoard(m.concat({ row: row, col: col }), exports.board);
            selectedChip = { row: row, col: col };
        } else if (exports.board[row][col] == PieceKind.SCELL) {
            applyMove(selectedChip, { row: row, col: col }, exports.board);
            updateBoard([], exports.board);
            updateWhoMove();
            selectedChip = undefined;
        } else {
            updateBoard([], exports.board);
            selectedChip = undefined;
        }
        resolve(exports.board);
    });
}
