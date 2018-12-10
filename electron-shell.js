const path = require('path')
const url = require('url')
const Module = require('module')
const fs = require('original-fs')
const { app } = require('electron')
const WindowManager = require('./WindowManager')
const addZip = require('./electron-zip-support')

function showSplash(appUpdater, name){
  let splash = WindowManager.createWindow({
    width: 400,
    height: 100,
    frame: false
  }, {
    name: name,
    progress: 0
  })
  splash.loadFile(path.join(__dirname, 'ui', 'download-splash.html'))

  appUpdater.on('update-progress', (app, progress) => {
    splash.update({
      progress
    })
  })
  return splash
}

let win

// downloads the app.zip from github to memory and starts it in a renderer
const hotLoading = async (appUpdater) => {
  const app = await appUpdater.getLatest()

  // console.log('app found', app)
  let splash = showSplash(appUpdater, app.name)

  // allow renderer to access files within zip in memory
  const result = await appUpdater.download(app)
  addZip(result.data)

  // create window for app
  win = WindowManager.createWindow()
  let ui = url.format({
    slashes: true,
    protocol: 'file:', // even though not 100% correct we are using file and not a custom protocol for the moment
    pathname: '.zip/index.html', // path does only exist in memory
  })
  win.loadURL(ui)

  splash.close()
}

/*
* the "packaged" app is the one that was shipped with this shell / which was part of the installation bundle
* contrary: updated apps are downloaded and cached by the updater some time after installation and are not always available
*/
function loadPackagedApp() {

  let files = fs.readdirSync(__dirname)
  let appPath = files.find(file => file.endsWith('.zip') || file.endsWith('.asar'))
  appPath = path.join(__dirname, appPath)

  if (!fs.existsSync(appPath)) {
    throw new Error("Bad installation: application is missing or cannot be found")
    return
  }

  // WARNING: due to NPM insecurity main-script loading is deactivated ...
  /*
  // start main script
  // TODO allow script to be renamed? use main from package.json?
  let mainScript = path.join(packagedApp, 'main.js')
  // FIXME unless patched, fs will not work on .zip archives
  if (!fs.existsSync(mainScript)) {
    // fatal
    throw new Error("Bad application: application has no entry point")
  }
  // FIXME Module._load(mainScript, Module, true)
  */



  // ... INSTEAD the shell provides a browser window for the app and loads the index.html

  // Create a browser window for the app
  win = WindowManager.createWindow()

  let ui = url.format({
    slashes: true,
    protocol: 'file:',
    pathname: path.resolve(appPath, 'index.html')
  })

  win.loadURL(ui)

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}


function startElectronShell(appUpdater){

  app.on('web-contents-created', (event, contents) => {
  
    // https://electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      // Strip away preload scripts if unused or verify their location is legitimate
      delete webPreferences.preload
      delete webPreferences.preloadURL
  
      // Disable Node.js integration
      webPreferences.nodeIntegration = false
  
      // Verify URL being loaded
      if (!params.src.startsWith('https://yourapp.com/')) {
        event.preventDefault()
      }
    })
  
    // https://electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)
      if (parsedUrl.origin !== 'https://my-own-server.com') {
        event.preventDefault()
      }
    })
  
    // https://electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
    contents.on('new-window', (event, navigationUrl) => {
      // In this example, we'll ask the operating system
      // to open this event's url in the default browser.
      event.preventDefault()
  
      shell.openExternal(navigationUrl)
    })
  
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  // TODO for now, always hot-load to avoid inconsistencies
  hotLoading(appUpdater)

}


module.exports = startElectronShell