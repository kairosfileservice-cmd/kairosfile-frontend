import { useState, useCallback, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../config/config';

// Scope drive.file: acceso solo a archivos creados por esta app
// Cambia a 'https://www.googleapis.com/auth/drive' para acceso completo
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

export function useGoogleAuth() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const clientRef = useRef(null);

  const getClient = useCallback(() => {
    if (!window.google?.accounts?.oauth2) return null;
    if (!clientRef.current) {
      clientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPE,
        callback: () => {},
      });
    }
    return clientRef.current;
  }, []);

  const signIn = useCallback(
    () =>
      new Promise((resolve, reject) => {
        setLoading(true);
        const client = getClient();
        if (!client) {
          setLoading(false);
          reject(new Error('Google Identity Services no está disponible.'));
          return;
        }
        client.callback = (res) => {
          setLoading(false);
          if (res.error) {
            reject(new Error(res.error_description ?? res.error));
          } else {
            setToken(res.access_token);
            resolve(res.access_token);
          }
        };
        client.requestAccessToken({ prompt: '' });
      }),
    [getClient]
  );

  const signOut = useCallback(() => {
    if (token) window.google?.accounts.oauth2.revoke(token, () => {});
    setToken(null);
  }, [token]);

  return { token, loading, isSignedIn: !!token, signIn, signOut };
}
