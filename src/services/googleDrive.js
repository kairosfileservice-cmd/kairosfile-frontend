const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

async function driveRequest(url, options = {}, token) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error?.message || `Error HTTP ${res.status}`);
  return json;
}

export async function findFolder(name, token) {
  const q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
  const data = await driveRequest(
    `${API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
    {},
    token
  );
  return data.files?.[0] ?? null;
}

async function createFolder(name, token) {
  return driveRequest(
    `${API}/files`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
    },
    token
  );
}

export async function findOrCreateFolder(name, token) {
  const existing = await findFolder(name, token);
  if (existing) return { id: existing.id, created: false };
  const folder = await createFolder(name, token);
  return { id: folder.id, created: true };
}

export function uploadFile(file, folderId, token, onProgress) {
  return new Promise((resolve, reject) => {
    const metadata = { name: file.name, parents: [folderId] };
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `${UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink`
    );
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error?.message || 'Error al subir el archivo'));
      } catch {
        reject(new Error('Respuesta inválida del servidor'));
      }
    };

    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
    xhr.send(form);
  });
}

export async function listFiles(folderId, token) {
  const q = `'${folderId}' in parents and trashed=false`;
  const fields = 'files(id,name,mimeType,size,createdTime,webViewLink)';
  const data = await driveRequest(
    `${API}/files?q=${encodeURIComponent(q)}&fields=${fields}&orderBy=createdTime desc`,
    {},
    token
  );
  return data.files ?? [];
}
