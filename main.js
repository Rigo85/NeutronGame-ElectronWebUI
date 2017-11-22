const electron = require('electron');
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron;

const core = require('./libs/js/mainCore.js');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({});
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

ipcMain.on('reload', event => event.sender.send('board:updated', { board: core.board, moves: core.movements }));

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New game',
                accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
                click() {
                    //llamar a la función q guarda.

                }
            },
            {
                label: 'Save game',
                accelerator: process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
                click() {
                    //llamar a la función q guarda.

                }
            },
            {
                label: 'Load game',
                accelerator: process.platform == 'darwin' ? 'Command+O' : 'Ctrl+O',
                click() {
                    //llamar a la función que carga.
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
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
