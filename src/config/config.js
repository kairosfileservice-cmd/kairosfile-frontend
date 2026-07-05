// =============================================
// CONFIGURACIÓN DE GOOGLE DRIVE
// =============================================
// Para configurar Google Drive:
// 1. Ve a https://console.cloud.google.com
// 2. Crea un proyecto o selecciona uno existente
// 3. Habilita la "Google Drive API" en "APIs y servicios"
// 4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
// 5. Tipo de aplicación: "Aplicación web"
// 6. Agrega tu URL en "Orígenes autorizados de JavaScript":
//    - http://localhost:5173  (desarrollo)
//    - https://tu-dominio.com (producción)
// 7. Copia el "ID de cliente" y reemplaza el valor abajo

export const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI.apps.googleusercontent.com';

// Lista de usuarios del sistema
// Modifica esta lista con los usuarios de tu organización
export const USERS = [
  { id: '1', name: 'Juan Pérez',      initials: 'JP', department: 'Ventas' },
  { id: '2', name: 'María González',  initials: 'MG', department: 'Marketing' },
  { id: '3', name: 'Carlos Muñoz',    initials: 'CM', department: 'Tecnología' },
  { id: '4', name: 'Ana Rodríguez',   initials: 'AR', department: 'Gerencia' },
  { id: '5', name: 'Luis Martínez',   initials: 'LM', department: 'Contabilidad' },
  { id: '6', name: 'Sofía Vargas',    initials: 'SV', department: 'Recursos Humanos' },
  { id: '7', name: 'Diego Torres',    initials: 'DT', department: 'Tecnología' },
  { id: '8', name: 'Valentina Cruz',  initials: 'VC', department: 'Ventas' },
];
