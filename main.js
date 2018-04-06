const electron = require('electron');
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain, dialog } = electron;

const core = require('./libs/js/mainCore.js');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({ icon: 'icon.ico' });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('close', () => app.quit());

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

ipcMain.on('cell:click', (e, id) => {
    const m = /(.*)-(\d)-(\d)/g.exec(id);
    core.onCellClicked(parseInt(m[2]), parseInt(m[3]))
        .then(obj => mainWindow.webContents.send('board:updated', obj))
        .catch(e => console.error(e));
});

ipcMain.on('reload', event =>
    event.sender.send('board:updated', { board: core.board, moves: core.movements, endgame: { success: false } }));

ipcMain.on('game:new', event => {
    // core.newGame();
    // event.sender.send('board:updated', { board: core.board, moves: core.movements, endgame: { success: false } });
    newGame();
});

ipcMain.on('game:save', event =>
    core.saveGame());

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New game',
                accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
                click() {
                    newGame();
                }
            },
            {
                label: 'Save game',
                accelerator: process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
                click() {
                    saveGame();
                }
            },
            {
                label: 'Load game',
                accelerator: process.platform == 'darwin' ? 'Command+O' : 'Ctrl+O',
                click() {
                    loadGame();
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    if (confirm('Are you sure you want to close the game?'))
                        app.quit();
                }
            }
        ]
    },
    {
        label: '?',
        submenu: [
            {
                label: 'About',
                click() {
                    aboutDialog();
                }
            }
        ]
    }
];

if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'producction') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

function aboutDialog() {
    const filename = 'info.txt';
    new Promise((resolve, reject) => {
        require('fs').readFile('info.txt', 'utf8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    })
        .then(data => dialog.showMessageBox(mainWindow, {
            buttons: ['Ok'],
            title: 'About dialog',
            message: data
        }));
}

function newGame() {
    core.newGame();
    mainWindow.webContents.send('board:updated', { board: core.board, moves: core.movements, endgame: { success: false } });
}

function saveGame() {
    dialog.showSaveDialog(
        mainWindow,
        { title: 'Save the game' },
        filename => {
            if (!filename) {
                dialog.showMessageBox(mainWindow, {
                    buttons: ['Ok'],
                    title: 'Information',
                    message: 'The filename is needed to save the game.'
                });
            } else {
                core.saveGame(filename);
            }
        });
}

function loadGame() {
    dialog.showOpenDialog(
        mainWindow,
        { title: 'Load game', properties: ['openFile'] },
        files => {
            if (!files || !files.length) {
                dialog.showMessageBox(mainWindow, {
                    buttons: ['Ok'],
                    title: 'Information',
                    message: 'The filename is needed to load the game.'
                });
            } else {
                core
                .loadGame(files[0])
                .then(() => mainWindow.webContents.send('board:updated', { board: core.board, moves: core.movements, endgame: { success: false } }));                
            }
        }
    );
}
