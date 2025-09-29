// Servicio de datos demo para simular las APIs sin backends
import { DEMO_DATA } from '../config.js';

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generar más datos de ejemplo
const generateMoreData = (baseData, count = 50) => {
  const newData = [...baseData];
  const names = [
    "ALEJANDRO", "BEATRIZ", "CAMILO", "DIANA", "EDUARDO", "FERNANDA", "GABRIEL", "HELENA",
    "IVÁN", "JULIETA", "KEVIN", "LAURA", "MIGUEL", "NATALIA", "OSCAR", "PATRICIA",
    "QUINTÍN", "ROSA", "SERGIO", "TATIANA", "ULISES", "VALENTINA", "WILSON", "XIMENA"
  ];
  const lastNames = [
    "GARCÍA", "RODRÍGUEZ", "MARTÍNEZ", "LÓPEZ", "GONZÁLEZ", "PÉREZ", "SÁNCHEZ", "RAMÍREZ",
    "CRUZ", "FLORES", "RIVERA", "GÓMEZ", "DÍAZ", "REYES", "MORALES", "JIMÉNEZ",
    "ÁLVAREZ", "RUIZ", "HERNÁNDEZ", "TORRES", "AGUILAR", "VARGAS", "CASTRO", "MENDOZA"
  ];
  const departments = [
    "Alumbrado Público", "Secretaría General", "Hacienda", "Obras Públicas", 
    "Desarrollo Social", "Salud", "Educación", "Cultura", "Deportes", "Medio Ambiente"
  ];
  const accessPoints = [
    "Entrada Principal", "Salida Principal", "Puerta de Empleados", "Entrada de Vehículos",
    "Control de Acceso", "Recepción", "Oficina Principal", "Almacén"
  ];

  if (baseData === DEMO_DATA.ALUMBRADO) {
    // Para Alumbrado Público, generar pares de Check In/Check Out para cada persona
    const numPersons = Math.floor(count / 2); // Cada persona necesita Check In y Check Out
    
    for (let i = 0; i < numPersons; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomAccess = accessPoints[Math.floor(Math.random() * accessPoints.length)];
      
      // Generar fecha aleatoria en los últimos 30 días
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      const dateString = randomDate.toISOString().split('T')[0];
      
      // Generar hora de entrada entre 6 AM y 9 AM
      const checkInHour = 6 + Math.floor(Math.random() * 3);
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkInTime = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`;
      
      // Generar hora de salida entre 4 PM y 7 PM (8+ horas después)
      const checkOutHour = 16 + Math.floor(Math.random() * 3);
      const checkOutMinute = Math.floor(Math.random() * 60);
      const checkOutTime = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`;
      
      const cedula = (1000000 + Math.floor(Math.random() * 9000000)).toString();
      
      // Registro de Check In
      newData.push({
        firstName: randomName,
        lastName: randomLastName,
        nombre: randomName,
        apellido: randomLastName,
        personNo: cedula,
        cedula: cedula,
        time: `${dateString} ${checkInTime}:00`,
        fecha: dateString,
        hora: checkInTime,
        accessPoint: randomAccess,
        attendanceType: "Check In",
        tipo_asistencia: "Check In"
      });
      
      // Registro de Check Out
      newData.push({
        firstName: randomName,
        lastName: randomLastName,
        nombre: randomName,
        apellido: randomLastName,
        personNo: cedula,
        cedula: cedula,
        time: `${dateString} ${checkOutTime}:00`,
        fecha: dateString,
        hora: checkOutTime,
        accessPoint: randomAccess,
        attendanceType: "Check Out",
        tipo_asistencia: "Check Out"
      });
    }
  } else {
    // Para otros módulos, mantener la lógica original
    for (let i = 0; i < count; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
      const randomAccess = accessPoints[Math.floor(Math.random() * accessPoints.length)];
      
      // Generar fecha aleatoria en los últimos 30 días
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      
      // Generar hora aleatoria entre 6 AM y 6 PM
      const randomHour = 6 + Math.floor(Math.random() * 12);
      const randomMinute = Math.floor(Math.random() * 60);
      const timeString = `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`;
      
      const dateString = randomDate.toISOString().split('T')[0];
      const fullDateTime = `${dateString} ${timeString}:00`;

      if (baseData === DEMO_DATA.ALCALDIA) {
        newData.push({
          idPersona: (1000 + i).toString(),
          nombre: `${randomName} ${randomLastName}`,
          departamento: randomDept,
          hora: timeString,
          puntoVerificacion: `${randomDept}_${randomAccess.replace(/\s+/g, '')}`
        });
      } else if (baseData === DEMO_DATA.ENVIASEO) {
        newData.push({
          nombreArchivo: `control_acceso_${dateString}.xlsx`,
          id: `EMP${(1000 + i).toString().padStart(4, '0')}`,
          temperatura: `${(35.5 + Math.random() * 2).toFixed(1)}°C`,
          estadoTemperatura: Math.random() > 0.1 ? "Normal" : "Elevada",
          usandoMascara: Math.random() > 0.2 ? "Sí" : "No",
          numeroTarjeta: (10000 + Math.floor(Math.random() * 90000)).toString(),
          grupoPersonas: randomDept,
          tiempo: fullDateTime,
          puntoAcceso: randomAccess,
          lectorTarjetas: `Lector ${Math.floor(Math.random() * 5) + 1}`,
          resultadoAutenticacion: Math.random() > 0.05 ? "Exitoso" : "Fallido",
          tipoAutenticacion: Math.random() > 0.3 ? "Tarjeta" : "Huella",
          tipoAsistencia: Math.random() > 0.5 ? "Entrada" : "Salida"
        });
      }
    }
  }
  
  return newData;
};

// Servicio demo para Alumbrado Público
export const demoAlumbradoService = {
  async uploadFile(file) {
    await delay(1000);
    return {
      success: true,
      message: "Archivo procesado exitosamente (modo demo)",
      data: {
        totalRecords: 150,
        processedRecords: 150,
        errors: 0
      }
    };
  },

  async getAllRecords() {
    await delay(500);
    // Generar datos más simples para debug
    const simpleData = [];
    const names = ["JUAN", "MARÍA", "CARLOS", "ANA", "LUIS"];
    const lastNames = ["PÉREZ", "GARCÍA", "LÓPEZ", "MARTÍNEZ", "RODRÍGUEZ"];
    
    for (let i = 0; i < 10; i++) {
      const name = names[i % names.length];
      const lastName = lastNames[i % lastNames.length];
      const cedula = (1000000 + i).toString();
      const fecha = "2024-01-15";
      
      // Check In
      simpleData.push({
        firstName: name,
        lastName: lastName,
        nombre: name,
        apellido: lastName,
        personNo: cedula,
        cedula: cedula,
        time: `${fecha} 08:00:00`,
        fecha: fecha,
        hora: "08:00",
        accessPoint: "Entrada Principal",
        attendanceType: "Check In",
        tipo_asistencia: "Check In"
      });
      
      // Check Out
      simpleData.push({
        firstName: name,
        lastName: lastName,
        nombre: name,
        apellido: lastName,
        personNo: cedula,
        cedula: cedula,
        time: `${fecha} 17:00:00`,
        fecha: fecha,
        hora: "17:00",
        accessPoint: "Salida Principal",
        attendanceType: "Check Out",
        tipo_asistencia: "Check Out"
      });
    }
    
    console.log("Datos demo generados:", simpleData.slice(0, 4));
    return simpleData;
  },

  async getFiles() {
    await delay(300);
    return [
      {
        id: 1,
        name: "asistencia_alumbrado_enero_2024.xlsx",
        uploadDate: "2024-01-15T08:30:00Z",
        size: 245760,
        records: 150
      },
      {
        id: 2,
        name: "horarios_extra_febrero_2024.xlsx",
        uploadDate: "2024-02-01T09:15:00Z",
        size: 189440,
        records: 89
      }
    ];
  },

  async getStats() {
    await delay(200);
    return {
      totalEmpleados: 45,
      totalHorasTrabajadas: 1800,
      totalHorasExtra: 120,
      promedioHorasPorEmpleado: 40
    };
  },

  async searchRecords(query) {
    await delay(300);
    const allRecords = generateMoreData(DEMO_DATA.ALUMBRADO, 100);
    const filtered = allRecords.filter(record => 
      record.firstName?.toLowerCase().includes(query.toLowerCase()) ||
      record.lastName?.toLowerCase().includes(query.toLowerCase()) ||
      record.personNo?.includes(query)
    );
    return filtered;
  }
};

// Servicio demo para Alcaldía de Envigado
export const demoAlcaldiaService = {
  async uploadFile(file) {
    await delay(1200);
    return {
      success: true,
      message: "Archivo de Alcaldía procesado exitosamente (modo demo)",
      data: {
        totalRecords: 200,
        processedRecords: 200,
        errors: 0
      }
    };
  },

  async getAllRecords() {
    await delay(600);
    return generateMoreData(DEMO_DATA.ALCALDIA, 150);
  },

  async getFiles() {
    await delay(400);
    return [
      {
        id: 1,
        name: "asistencia_alcaldia_enero_2024.xlsx",
        uploadDate: "2024-01-15T08:00:00Z",
        size: 320000,
        records: 200
      },
      {
        id: 2,
        name: "control_horarios_febrero_2024.xlsx",
        uploadDate: "2024-02-01T08:30:00Z",
        size: 280000,
        records: 175
      }
    ];
  },

  async getStats() {
    await delay(250);
    return {
      totalEmpleados: 85,
      totalRegistros: 200,
      departamentos: 8,
      promedioAsistencia: 95.5
    };
  },

  async searchRecords(query) {
    await delay(350);
    const allRecords = generateMoreData(DEMO_DATA.ALCALDIA, 150);
    const filtered = allRecords.filter(record => 
      record.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      record.idPersona?.includes(query) ||
      record.departamento?.toLowerCase().includes(query.toLowerCase())
    );
    return filtered;
  }
};

// Servicio demo para Enviaseo Control de Acceso
export const demoEnviaseoService = {
  async uploadFile(file) {
    await delay(1500);
    return {
      success: true,
      message: "Archivo de Control de Acceso procesado exitosamente (modo demo)",
      data: {
        totalRecords: 300,
        processedRecords: 300,
        errors: 0
      }
    };
  },

  async getAllRecords() {
    await delay(700);
    return generateMoreData(DEMO_DATA.ENVIASEO, 200);
  },

  async getFiles() {
    await delay(500);
    return [
      {
        id: 1,
        name: "control_acceso_enero_2024.xlsx",
        uploadDate: "2024-01-15T07:45:00Z",
        size: 450000,
        records: 300
      },
      {
        id: 2,
        name: "registros_temperatura_febrero_2024.xlsx",
        uploadDate: "2024-02-01T08:00:00Z",
        size: 380000,
        records: 250
      }
    ];
  },

  async getStats() {
    await delay(300);
    return {
      totalAccesos: 300,
      accesosExitosos: 285,
      accesosFallidos: 15,
      temperaturaPromedio: 36.2,
      usoMascara: 95.5
    };
  },

  async searchRecords(query) {
    await delay(400);
    const allRecords = generateMoreData(DEMO_DATA.ENVIASEO, 200);
    const filtered = allRecords.filter(record => 
      record.id?.toLowerCase().includes(query.toLowerCase()) ||
      record.nombreArchivo?.toLowerCase().includes(query.toLowerCase()) ||
      record.grupoPersonas?.toLowerCase().includes(query.toLowerCase()) ||
      record.puntoAcceso?.toLowerCase().includes(query.toLowerCase())
    );
    return filtered;
  }
};

// Función para determinar qué servicio usar
export const getDemoService = (module) => {
  switch (module) {
    case 'alumbrado':
      return demoAlumbradoService;
    case 'alcaldia':
      return demoAlcaldiaService;
    case 'enviaseo':
      return demoEnviaseoService;
    default:
      return demoAlumbradoService;
  }
};

