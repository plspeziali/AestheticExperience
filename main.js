const { app, BrowserWindow } = require('electron')
const path = require('node:path')


function createWindow () {
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        autoHideMenuBar: true,
        title: 'Aesthetic Experience - Paolo Speziali',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.maximize();

    win.webContents.setFrameRate(60)

    win.loadFile('index.html')
}


app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})