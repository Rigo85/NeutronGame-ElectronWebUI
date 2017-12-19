'use strict';

const util = require('util');

const { applyFullMove, PieceKind, moves, newBoard, findNeutron, getState, allMoves } = require('./gameutils');
const { maxValue } = require('./minimax');
const _Q = require('./Q');
const _R = require('./R');

function q_learning(episodes = 100) {
    const R = new _R();
    const Q = new _Q();
    const learningRate = 0.2;
    const discountFactor = 0.8;

    Q.load('Q.json').then(() => {
        Array
            .from(Array(episodes).keys())
            .map(i => {
                const board = newBoard();
                playEpisode(board, R, Q, learningRate, discountFactor);
                console.log(`ending episode ${i}`);
            });

        Q.save('Q.json');
        console.log(util.inspect(Q));
    });
}

function playEpisode(board, R, Q, learningRate, discountFactor) {
    if (gameOver(board)) return;

    //obtener posibles movimientos.
    const fullMoves = allMoves(PieceKind.WHITE, board);

    //si no hay movimientos acaba el episodio.
    if (!fullMoves.length) return;

    //obtener el estado.
    const state = getState(board);

    //seleccionar movimiento de forma aleatoria y aplicarlo.
    applyFullMove(fullMoves[Math.trunc(Math.random() * fullMoves.length)], board);

    //Simular la jugada del contrario para obtener el sgte estado.
    const machineFullMove = maxValue(board, 3, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, PieceKind.BLACK);

    //si no hay movimiento acaba el episodio.
    if (machineFullMove.empty()) return;

    //aplicar el movimiento del rival.
    applyFullMove(machineFullMove, board);

    //obtener el sgte estado. 
    const nextState = getState(board);
    const fullMovesNextState = allMoves(PieceKind.WHITE, board);

    if (!fullMovesNextState.length) return;

    const maxReward = getMaxReward(fullMovesNextState, board, nextState, Q);

    //actualizar Q.
    const value = learningRate * (R.get(state, nextState) + discountFactor * maxReward - Q.get(state, nextState));
    if (value) {
        console.log(`R(s,a)=${R.get(state, nextState)} maxReward=${maxReward} Q(s,a)=${Q.get(state, nextState)} value =${value}`);
        Q.set(state, nextState, value);
    }

    applyFullMove(machineFullMove, board, false);

    //aplicar jugada del rival.
    applyFullMove(machineFullMove, board);

    //volver a repetir hasta que culmine el episodio.
    playEpisode(board, R, Q, learningRate, discountFactor);
}

function gameOver(board) {
    const neutron = findNeutron(board);
    const neutronMoves = moves(neutron, board);
    if (!neutronMoves.length) return true;
    return neutron.row === 0 || neutron.row === 4 ? true : false;
}

function getMaxReward(fullMovesNextState, board, nextState, Q) {
    return Math.max.apply(
        null,
        fullMovesNextState.map(fullMove => {
            applyFullMove(fullMove, board);

            //Simular la jugada del contrario para obtener el sgte estado.
            const machineFullMove = maxValue(board, 3, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, PieceKind.BLACK);
            if (machineFullMove.empty()) {
                applyFullMove(fullMove, board, false);
                return 0;
            } else {
                applyFullMove(machineFullMove, board);
                const tempState = getState(board);
                applyFullMove(machineFullMove, board, false);

                applyFullMove(fullMove, board, false);
                return Q.get(nextState, tempState);
            }
        }));
}

q_learning(1000);
