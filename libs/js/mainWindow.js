'use strict';

const electron = require('electron');
const path = require("path");
const { ipcRenderer, remote } = electron;
const { PieceKind } = require(path.resolve('libs/js/gameutils'));

window.onload = function () {
    ipcRenderer.send('reload');
};


//TODO usar un loading gif cuando se esté calculando la jugada.

const rows = ['5', '4', '3', '2', '1', ''];
const cols = ['', 'A', 'B', 'C', 'D', 'E'];
const chipKind = {};
chipKind[PieceKind.BLACK] = {
    kind: 'b',
    className: 'btn-floating btn-small waves-effect waves-light deep-purple darken-2'
};
chipKind[PieceKind.WHITE] = {
    kind: 'w',
    className: 'btn-floating btn-small waves-effect waves-light blue lighten-4'
};
chipKind[PieceKind.NEUTRON] = {
    kind: 'n',
    className: 'btn-floating btn-small waves-effect waves-light red darken-4'
};
chipKind[PieceKind.CELL] = {
    kind: 'c',
    className: 'btn-small waves-effect waves-light grey'
};
chipKind[PieceKind.SBLACK] = {
    kind: 'sb',
    className: 'btn-floating btn-small waves-effect waves-light grey darken-2'
};
chipKind[PieceKind.SWHITE] = {
    kind: 'sw',
    className: 'btn-floating btn-small waves-effect waves-light grey lighten-4'
};
chipKind[PieceKind.SCELL] = {
    kind: 'sc',
    className: 'btn-small waves-effect waves-light brown lighten-4'
};
chipKind[PieceKind.SNEUTRON] = {
    kind: 'sn',
    className: 'btn-floating btn-small waves-effect waves-light red lighten-2'
};

//Create board and chips.
function createChip(pieceKind, row, col) {
    const div = document.createElement("div");
    div.style.border = '1px solid black';
    div.className = 'btn-small waves-effect waves-light grey cell';

    const child = document.createElement('a');
    child.className = chipKind[pieceKind].className;
    child.id = `${chipKind[pieceKind].kind}-${row}-${col - 1}`;
    child.style = "height:48px;width:48px;";

    child.addEventListener('click', e => {
        ipcRenderer.send('cell:click', e.target.id);
    });

    div.appendChild(child);

    return div;
}

//Create headers.
function createHeader(row, col) {
    const div = document.createElement("div");
    div.className = 'cell';

    let child;
    if (row === 5) {
        child = document.createElement('a');
        child.text = cols[col];
        child.className = 'btn-flat disabled';
        child.style = "width:50px;padding: 0 0 0 0;";
    } else if (!col) {
        child = document.createElement('a');
        child.text = rows[row];
        child.className = 'btn-flat disabled';
        child.style = "height:50px;width:50px;padding: 0 0 0 0;";
    }

    div.appendChild(child);

    return div;
}

function kind2Name(pieceKind) {
    const names = { 1: 'BLACK', 2: 'WHITE', 3: 'NEUTRON' };
    return names[pieceKind] || 'NO KIND';
}

function moveToString(move) {
    const chars = ['a', 'b', 'c', 'd', 'e'];
    return `${chars[move.col]}${5 - move.row}`;
}

function fullMoveToString(fullMove) {
    if (fullMove.moves.length) {
        const piece1Kind = kind2Name(fullMove.moves[1].kind);
        const piece2Kind = kind2Name(fullMove.moves[3].kind);
        return `${piece1Kind}: ${moveToString(fullMove.moves[0])}-${moveToString(fullMove.moves[1])}, ` +
            `${piece2Kind}: ${moveToString(fullMove.moves[2])}-${moveToString(fullMove.moves[3])}`;
    }

    return `EMPTY FULLMOVE with score = ${score}`;
}

/**
 *  
 * @param {moves to update the moves <ul> list.} moves 
 */
function updateMovements(moves) {
    const movements = document.getElementById("movements");
    movements.innerHTML = '';

    moves
        .map(m => {
            const li = document.createElement('li');
            li.className = 'collection-item';
            li.appendChild(document.createTextNode(fullMoveToString(m)));

            return li;
        })
        .forEach(li => movements.appendChild(li));

    $('#movements').animate({ scrollTop: $('#movements').prop("scrollHeight") }, 500);
}

/**
 * Refresh view on board changes.
 */
ipcRenderer.on('board:updated', (event, { board, moves, endgame }) => {
    document.getElementById("neutronBoard").innerHTML = '';
    //TODO mostrar la jugada final en el tablero antes de reiniciar.
    Array
        .from(Array(36).keys())
        .map(i => {
            const row = parseInt(i / 6);
            const col = i % 6;
            if (row > 4 || !col) return createHeader(row, col);
            return createChip(board[row][col - 1], row, col);
        })
        .forEach(d => document.getElementById("neutronBoard").appendChild(d));

    updateMovements(moves);

    if (endgame.success) {
        if (confirm(`${kind2Name(endgame.kind)} wins!, do you want to save this game?`)) {
            ipcRenderer.send('game:save');
        }
        ipcRenderer.send('game:new');
    }
});

function tableToString(board) {
    console.log(Array
        .from(Array(5).keys())
        .reduce((acc, i) => acc.concat(`||${board[i].map(pieceToString).join('|')}||\n`), ''));
}

function pieceToString(pieceKind) {
    if (pieceKind === PieceKind.BLACK) return 'B';
    if (pieceKind === PieceKind.WHITE) return 'W';
    if (pieceKind === PieceKind.NEUTRON) return 'N';
    return ' ';
}