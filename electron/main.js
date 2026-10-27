// SamityPro Desktop Application Main Process (Electron)
// Cross-platform support for Windows (x64) and macOS (Intel / Apple Silicon)

const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'SamityPro - ডিজিটাল সমবায় ও সমিতি ব্যবস্থাপনা সফটওয়্যার',
    icon: path.join(__dirname, '../public/favicon.ico'),
    backgroundColor: '#020617', // Slate 950
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
    show: false,
  });

  // Target local server or cloud production
  const startUrl = process.env.ELECTRON_START_URL || 
                   process.env.CAPACITOR_SERVER_URL || 
                   'http://localhost:3000';

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external link clicks in system default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Build Desktop Application Menu
  const menuTemplate = [
    {
      label: 'ফাইল (File)',
      submenu: [
        { label: 'পুনরায় লোড (Reload)', role: 'reload' },
        { label: 'জোরপূর্বক রিলোড (Force Reload)', role: 'forceReload' },
        { type: 'separator' },
        { label: 'প্রস্থান (Exit)', role: 'quit' }
      ]
    },
    {
      label: 'সম্পাদনা (Edit)',
      submenu: [
        { label: 'আনডু (Undo)', role: 'undo' },
        { label: 'রিডু (Redo)', role: 'redo' },
        { type: 'separator' },
        { label: 'কাট (Cut)', role: 'cut' },
        { label: 'কপি (Copy)', role: 'copy' },
        { label: 'পেস্ট (Paste)', role: 'paste' },
        { label: 'সব নির্বাচন (Select All)', role: 'selectAll' }
      ]
    },
    {
      label: 'ভিউ (View)',
      submenu: [
        { label: 'আসল সাইজ (Actual Size)', role: 'resetZoom' },
        { label: 'জুম ইন (Zoom In)', role: 'zoomIn' },
        { label: 'জুম আউট (Zoom Out)', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'ফুলস্ক্রিন (Full Screen)', role: 'togglefullscreen' },
        { label: 'ডেভেলপার টুলস (DevTools)', role: 'toggleDevTools' }
      ]
    },
    {
      label: 'সাহায্য (Help)',
      submenu: [
        {
          label: 'SamityPro অফিশিয়াল পোর্টাল',
          click: async () => {
            await shell.openExternal('https://github.com/sajjadhossan/samitypro');
          }
        },
        {
          label: 'সংস্করণ v2.0.0 (Version Info)',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'SamityPro Desktop',
              message: 'SamityPro Desktop Edition v2.0.0',
              detail: 'বাণিজ্যিক গ্রেড ডিজিটাল সমবায়, সমিতি ও ক্ষুদ্রঋণ ব্যবস্থাপনা সফটওয়্যার।\n© 2026 SamityPro. All rights reserved.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
