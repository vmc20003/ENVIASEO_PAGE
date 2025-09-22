const XLSX = require('xlsx');
const fs = require('fs');

// Datos de prueba
const testData = [
  {
    'First Name': 'Juan',
    'Last Name': 'Pérez',
    'Person No.': '12345678',
    'Time': '2024-01-15 08:00:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check In'
  },
  {
    'First Name': 'María',
    'Last Name': 'García',
    'Person No.': '87654321',
    'Time': '2024-01-15 08:15:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check In'
  },
  {
    'First Name': 'Carlos',
    'Last Name': 'López',
    'Person No.': '11223344',
    'Time': '2024-01-15 08:30:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check In'
  },
  {
    'First Name': 'Ana',
    'Last Name': 'Martínez',
    'Person No.': '44332211',
    'Time': '2024-01-15 08:45:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check In'
  },
  {
    'First Name': 'Luis',
    'Last Name': 'Rodríguez',
    'Person No.': '55667788',
    'Time': '2024-01-15 09:00:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check In'
  },
  {
    'First Name': 'Juan',
    'Last Name': 'Pérez',
    'Person No.': '12345678',
    'Time': '2024-01-15 17:00:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check Out'
  },
  {
    'First Name': 'María',
    'Last Name': 'García',
    'Person No.': '87654321',
    'Time': '2024-01-15 17:15:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check Out'
  },
  {
    'First Name': 'Carlos',
    'Last Name': 'López',
    'Person No.': '11223344',
    'Time': '2024-01-15 17:30:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check Out'
  },
  {
    'First Name': 'Ana',
    'Last Name': 'Martínez',
    'Person No.': '44332211',
    'Time': '2024-01-15 17:45:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check Out'
  },
  {
    'First Name': 'Luis',
    'Last Name': 'Rodríguez',
    'Person No.': '55667788',
    'Time': '2024-01-15 18:00:00',
    'Access Point': 'Entrada Principal',
    'Attendance Type': 'Check Out'
  }
];

// Crear workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(testData);

// Agregar worksheet al workbook
XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');

// Escribir archivo
XLSX.writeFile(wb, 'test_data.xlsx');

console.log('✅ Archivo Excel de prueba creado exitosamente: test_data.xlsx');
console.log(`📊 Total de registros: ${testData.length}`);
console.log('📋 Columnas:', Object.keys(testData[0]).join(', '));


