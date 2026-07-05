// URL del backend. En desarrollo apunta a localhost, en producción a Render.
// Cambia esta URL cuando despliegues en Render.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function uploadFile(file, userName, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('userName', userName);
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/api/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error ?? `Error ${xhr.status}`));
      } catch {
        reject(new Error('Respuesta inválida del servidor'));
      }
    };

    xhr.onerror = () => reject(new Error('No se pudo conectar con el servidor'));
    xhr.send(form);
  });
}

export async function fetchFiles(userName) {
  const res = await fetch(
    `${BASE_URL}/api/files/${encodeURIComponent(userName)}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data; // { folderExists: boolean, files: [] }
}
