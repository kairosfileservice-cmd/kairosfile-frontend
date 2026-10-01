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

export const ADMIN_PASSWORD = 'admin2024';

// Lista de usuarios del sistema
// Modifica esta lista con los usuarios de tu organización
export const USERS = [
  { id: '1', name: 'Juan Loyola',      initials: 'JL', department: '', password: 'loyola1' },
  { id: '2', name: 'Christian Diaz',   initials: 'CD', department: '', password: 'diaz12' },
  { id: '3', name: 'Roberto Torres',   initials: 'RT', department: '', password: 'torres1' },
  { id: '4', name: 'Terry Walker',     initials: 'TW', department: '', password: 'walker1' },
  { id: '5', name: 'Eric Hanson',      initials: 'EH', department: '', password: 'hanson1' },
  { id: '6', name: 'Terrence Walker',  initials: 'TW', department: '', password: 'terrence1' },
  { id: '7', name: 'Proy. Salvadora',  initials: 'PS', department: '', password: 'salva1' },
];
