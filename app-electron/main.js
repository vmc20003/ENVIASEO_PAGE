const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');

// Variables globales
let mainWindow;
let backendProcesses = [];

// Función para crear la ventana principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false,
    title: 'Sistema de Gestión de Asistencia - Enviaseo E.S.P.'
  });

  // Cargar la aplicación
  const startUrl = `file://${path.join(__dirname, '../frontend/build/index.html')}`;
  mainWindow.loadURL(startUrl);

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Función para iniciar los backends
function startBackendServers() {
  console.log('Iniciando servidores backend...');
  
  const backendPaths = [
    { name: 'backend', path: path.join(__dirname, '../backend') },
    { name: 'backend-alcaldia', path: path.join(__dirname, '../backend-alcaldia') },
    { name: 'backend-enviaseo-control-acceso', path: path.join(__dirname, '../backend-enviaseo-control-acceso') }
  ];

  backendPaths.forEach(({ name, path: backendPath }) => {
    const process = spawn('npm', ['start'], {
      cwd: backendPath,
      shell: true,
      detached: false
    });

    process.stdout.on('data', (data) => {
      console.log(`${name}: ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`${name} error: ${data}`);
    });

    backendProcesses.push(process);
  });
}

// Función para detener los backends
function stopBackendServers() {
  console.log('Deteniendo servidores backend...');
  backendProcesses.forEach(process => {
    if (process && !process.killed) {
      process.kill();
    }
  });
  backendProcesses = [];
}

// Crear menú de la aplicación
function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nueva Sesión',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Sistema',
      submenu: [
        {
          label: 'Verificar Actualizaciones',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Actualizaciones',
              message: 'Verificando actualizaciones disponibles...'
            });
          }
        },
        {
          label: 'Reiniciar Servicios',
          click: () => {
            stopBackendServers();
            setTimeout(() => {
              startBackendServers();
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Servicios',
                message: 'Servicios reiniciados correctamente'
              });
            }, 2000);
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de',
              message: `Sistema de Gestión de Asistencia
              
Enviaseo E.S.P.
Versión 2.0.0

© 2024 Enviaseo E.S.P. Todos los derechos reservados.`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Eventos de la aplicación
app.whenReady().then(() => {
  createMainWindow();
  createMenu();
  
  // Iniciar servidores backend después de un breve delay
  setTimeout(() => {
    startBackendServers();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackendServers();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackendServers();
});

// Manejar actualizaciones
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización Disponible',
    message: 'Hay una nueva versión disponible. Se descargará automáticamente.',
    buttons: ['OK']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización Lista',
    message: 'La actualización se ha descargado. La aplicación se reiniciará para aplicar los cambios.',
    buttons: ['Reiniciar Ahora', 'Más Tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (error) => {
  console.error('Error en auto-updater:', error);
});

// Verificar actualizaciones al iniciar
autoUpdater.checkForUpdatesAndNotify();