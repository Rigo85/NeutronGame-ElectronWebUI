'use strict';

const electron = require('electron');
const { ipcRenderer, remote } = electron;

window.onload = function () {
    ipcRenderer.send('reload');
};

//
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

//Refresh view on board changes.
ipcRenderer.on('board:updated', (event, board) => {
    document.getElementById("neutronBoard").innerHTML = '';

    Array
        .from(Array(36).keys())
        .map(i => {
            const row = parseInt(i / 6);
            const col = i % 6;
            if (row > 4 || !col) return createHeader(row, col);
            return createChip(board[row][col - 1], row, col);
        })
        .forEach(d => document.getElementById("neutronBoard").appendChild(d));
});

