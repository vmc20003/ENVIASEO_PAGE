const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Configuración de servidores
const servers = [
  {
    name: 'Frontend React',
    port: 3000,
    path: path.join(__dirname, 'backend'),
    command: 'npm',
    args: ['start']
  },
  {
    name: 'Backend Alumbrado Público',
    port: 4000,
    path: path.join(__dirname, 'backend'),
    command: 'npm',
    args: ['start']
  },
  {
    name: 'Backend Enviaseo Control de Acceso',
    port: 4001,
    path: path.join(__dirname, 'backend-enviaseo-control-acceso'),
    command: 'npm',
    args: ['start']
  },
  {
    name: 'Backend Alcaldía',
    port: 4002,
    path: path.join(__dirname, 'backend-alcaldia'),
    command: 'node',
    args: ['server-new.js']
  }
];

let mainWindow;
let serverProcesses = [];

// Función para crear la ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: false,
    titleBarStyle: 'default'
  });

  // Cargar la página de inicio
  mainWindow.loadFile('index.html');

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Iniciar servidores automáticamente
    startServers();
  });

  // Abrir enlaces externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Crear menú
  createMenu();
}

// Función para crear el menú de la aplicación
function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Abrir Aplicación Web',
          click: () => {
            shell.openExternal('http://localhost:3000');
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Servidores',
      submenu: [
        {
          label: 'Reiniciar Todos los Servidores',
          click: () => {
            restartServers();
          }
        },
        {
          label: 'Detener Todos los Servidores',
          click: () => {
            stopServers();
          }
        },
        { type: 'separator' },
        {
          label: 'Frontend (Puerto 3000)',
          click: () => {
            shell.openExternal('http://localhost:3000');
          }
        },
        {
          label: 'Backend Alumbrado (Puerto 4000)',
          click: () => {
            shell.openExternal('http://localhost:4000');
          }
        },
        {
          label: 'Backend Alcaldía (Puerto 4002)',
          click: () => {
            shell.openExternal('http://localhost:4002');
          }
        },
        {
          label: 'Backend Enviaseo (Puerto 4001)',
          click: () => {
            shell.openExternal('http://localhost:4001');
          }
        }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Ver Logs de Servidores',
          click: () => {
            showServerLogs();
          }
        },
        {
          label: 'Verificar Estado de Servidores',
          click: () => {
            checkServerStatus();
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
              message: 'Sistema de Gestión de Asistencia',
              detail: 'Versión 1.0.0\nDesarrollado por Envíaseo E.S.P.\n\nAplicación de código abierto para la gestión de asistencia y control de acceso de empleados.'
            });
          }
        },
        {
          label: 'Documentación',
          click: () => {
            shell.openExternal('https://github.com/envíaseo/sistema-gestion-asistencia');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Función para iniciar servidores
function startServers() {
  console.log('🚀 Iniciando servidores...');
  
  servers.forEach((server, index) => {
    setTimeout(() => {
      startServer(server);
    }, index * 2000); // Iniciar con 2 segundos de diferencia
  });
}

// Función para iniciar un servidor individual
function startServer(server) {
  try {
    console.log(`Iniciando ${server.name}...`);
    
    const child = spawn(server.command, server.args, {
      cwd: server.path,
      stdio: 'pipe',
      shell: true
    });

    child.stdout.on('data', (data) => {
      console.log(`[${server.name}] ${data.toString()}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`[${server.name} ERROR] ${data.toString()}`);
    });

    child.on('error', (error) => {
      console.error(`Error iniciando ${server.name}:`, error);
    });

    serverProcesses.push({ ...server, process: child });
    
  } catch (error) {
    console.error(`Error iniciando ${server.name}:`, error);
  }
}

// Función para reiniciar servidores
function restartServers() {
  stopServers();
  setTimeout(() => {
    startServers();
  }, 2000);
}

// Función para detener servidores
function stopServers() {
  console.log('🛑 Deteniendo servidores...');
  serverProcesses.forEach(({ process: proc, name }) => {
    if (proc && !proc.killed) {
      proc.kill();
      console.log(`${name} detenido`);
    }
  });
  serverProcesses = [];
}

// Función para mostrar logs de servidores
function showServerLogs() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Logs de Servidores',
    message: 'Los logs se muestran en la consola de la aplicación',
    detail: 'Para ver los logs detallados, ejecuta la aplicación desde la terminal.'
  });
}

// Función para verificar estado de servidores
function checkServerStatus() {
  const status = serverProcesses.map(({ name, port, process: proc }) => ({
    name,
    port,
    running: proc && !proc.killed
  }));

  const runningServers = status.filter(s => s.running).length;
  const totalServers = status.length;

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Estado de Servidores',
    message: `Servidores ejecutándose: ${runningServers}/${totalServers}`,
    detail: status.map(s => `${s.name}: ${s.running ? '✅ Ejecutándose' : '❌ Detenido'}`).join('\n')
  });
}

// Eventos de la aplicación
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopServers();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopServers();
});

// Manejar cierre de la aplicación
process.on('SIGINT', () => {
  stopServers();
  app.quit();
});

process.on('SIGTERM', () => {
  stopServers();
  app.quit();
});






