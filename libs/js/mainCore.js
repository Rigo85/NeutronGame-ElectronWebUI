'use strict';

const util = require('util');

const path = require('path');
const jsonfile = require('jsonfile');
const moment = require('moment');

const Move = require('./move.js');
const FullMove = require('./fullMove.js');
const { applyFullMove, PieceKind, updateBoard, moves, applyMove, checkGameOver } = require('./gameutils');
const { maxValue } = require('./minimax');

/**
 * Selected chip
 */
var selectedChip = undefined;

/**
 * Game board.
 */
exports.board = [
    [PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK],
    [PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL],
    [PieceKind.CELL, PieceKind.CELL, PieceKind.NEUTRON, PieceKind.CELL, PieceKind.CELL],
    [PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL],
    [PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE]];

/**
 * Pieces rotation.
 */
const rotation = [PieceKind.NEUTRON, PieceKind.WHITE];

/**
 * Movements
 */
exports.movements = [];

/**
 * movements's turn.
 */
var whoMove = 0;

/**
 * Neutron: initial position.
 */
var neutronFrom;

/**
 * Neutron: final position.
 */
var neutronTo;

/**
 * Get the player in turn.
 */
function getWhoMove() {
    return rotation[whoMove];
}

/**
 * Update players's turn.
 */
function updateWhoMove() {
    whoMove = (whoMove + 1) % 2;
}

/**
 * New game.
 */
exports.newGame = () => {
    exports.board = [
        [PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK, PieceKind.BLACK],
        [PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL],
        [PieceKind.CELL, PieceKind.CELL, PieceKind.NEUTRON, PieceKind.CELL, PieceKind.CELL],
        [PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL, PieceKind.CELL],
        [PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE, PieceKind.WHITE]];
    exports.movements = [];
    whoMove = 0;
    selectedChip = undefined;
    neutronFrom = undefined;
    neutronTo = undefined;
}

/**
 * Save game.
 * @param {*} filename 
 */
exports.saveGame = (filename) => {
    filename = filename || path.join(process.cwd(), `neutron-game-${moment().format().replace(/[:.]/g, '-')}.json`);

    jsonfile.writeFile(
        filename,
        {
            board: exports.board,
            movements: exports.movements,
            whoMove: whoMove,
            selectedChip: selectedChip,
            neutronFrom: neutronFrom,
            neutronTo: neutronTo
        },
        { spaces: 2 },
        err => {
            //TODO do this on mainwindow..
            if (err) console.error(err);
        });
}

/**
 * Load game.
 * @param {*} filename 
 */
exports.loadGame = (filename) => {
    return new Promise((resolve, reject) => {
        jsonfile.readFile(filename, (err, obj) => {
            if (err) {
                reject(err);
                return;
            }

            exports.board = obj.board || exports.board;
            exports.movements = obj.movements || exports.movements;
            whoMove = obj.whoMove;
            selectedChip = obj.selectedChip;
            neutronFrom = obj.neutronFrom;
            neutronTo = obj.neutronTo;
            resolve(true);
        })
    });

}

/**
 * Cell click event.
 * @param {*} row 
 * @param {*} col 
 */
exports.onCellClicked = function (row, col) {
    return new Promise((resolve, reject) => {
        let endGame;
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
                endGame = checkGameOver(neutronTo, PieceKind.WHITE, exports.board);
                exports.movements.push(new FullMove([neutronFrom, neutronTo, selectedChip, new Move(row, col, selectedChip.kind)], 0));

                if (!endGame.success) {
                    
                    const machineFullMove = maxValue(exports.board,3,Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,PieceKind.BLACK);

                    if (!machineFullMove.empty()) {
                        exports.movements.push(machineFullMove);
                        neutronTo = machineFullMove.moves[1];
                        applyFullMove(machineFullMove, exports.board);
                        updateBoard([], exports.board);
                        endGame = checkGameOver(machineFullMove.moves[1], PieceKind.BLACK, exports.board);
                    } else {
                        endGame = { success: true, kind: PieceKind.WHITE };
                    }
                }
            } else {
                neutronFrom = selectedChip;
                neutronTo = new Move(row, col, selectedChip.kind);
                endGame = checkGameOver(neutronTo, PieceKind.WHITE, exports.board);
            }

            updateWhoMove();
            selectedChip = undefined;

        } else {
            updateBoard([], exports.board);
            selectedChip = undefined;
        }
        resolve({ board: exports.board, moves: exports.movements, endgame: endGame || { success: false } });
    });
}
