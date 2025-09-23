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
  let startUrl;
  if (app.isPackaged) {
    // En la aplicación instalada, el frontend está en resources
    startUrl = `file://${path.join(process.resourcesPath, 'frontend/build/index.html')}`;
  } else {
    // En desarrollo
    startUrl = `file://${path.join(__dirname, '../frontend/build/index.html')}`;
  }
  
  console.log('Loading URL:', startUrl);
  console.log('File exists:', require('fs').existsSync(path.join(process.resourcesPath || __dirname, '../frontend/build/index.html')));
  
  mainWindow.loadURL(startUrl).catch((error) => {
    console.error('Error loading URL:', error);
    // Si falla, mostrar una página de error
    mainWindow.loadURL(`data:text/html,
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial; padding: 20px; background: #f5f5f5;">
          <h1>Error al cargar la aplicación</h1>
          <p>No se pudo cargar el archivo principal de la aplicación.</p>
          <p>URL intentada: ${startUrl}</p>
          <p>Por favor, contacte al soporte técnico.</p>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Reintentar</button>
        </body>
      </html>
    `);
  });

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
  
  // Verificar si estamos en desarrollo o en la aplicación empaquetada
  const isPackaged = app.isPackaged;
  let backendPaths;
  
  if (isPackaged) {
    // En la aplicación instalada, los backends están en resources
    backendPaths = [
      { name: 'backend', path: path.join(process.resourcesPath, 'backend') },
      { name: 'backend-alcaldia', path: path.join(process.resourcesPath, 'backend-alcaldia') },
      { name: 'backend-enviaseo-control-acceso', path: path.join(process.resourcesPath, 'backend-enviaseo-control-acceso') }
    ];
  } else {
    // En desarrollo, los backends están en el directorio padre
    backendPaths = [
      { name: 'backend', path: path.join(__dirname, '../backend') },
      { name: 'backend-alcaldia', path: path.join(__dirname, '../backend-alcaldia') },
      { name: 'backend-enviaseo-control-acceso', path: path.join(__dirname, '../backend-enviaseo-control-acceso') }
    ];
  }

  backendPaths.forEach(({ name, path: backendPath }) => {
    // Verificar que el directorio existe
    if (require('fs').existsSync(backendPath)) {
      try {
        console.log(`Iniciando ${name} en: ${backendPath}`);
        
        const process = spawn('npm', ['start'], {
          cwd: backendPath,
          shell: true,
          detached: false,
          env: { 
            ...process.env, 
            NODE_ENV: 'production',
            PORT: name === 'backend' ? '4000' : 
                  name === 'backend-alcaldia' ? '4002' : '4001'
          }
        });

        process.stdout.on('data', (data) => {
          console.log(`${name}: ${data}`);
        });

        process.stderr.on('data', (data) => {
          console.error(`${name} error: ${data}`);
        });

        process.on('error', (error) => {
          console.error(`Error starting ${name}:`, error);
        });

        process.on('exit', (code) => {
          console.log(`${name} exited with code ${code}`);
        });

        backendProcesses.push(process);
        
        // Esperar un poco antes de iniciar el siguiente backend
        setTimeout(() => {}, 1000);
      } catch (error) {
        console.error(`Error spawning ${name}:`, error);
      }
    } else {
      console.warn(`Backend directory not found: ${backendPath}`);
    }
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