import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { getScriptUrl, PERMISSIONS, ROLES } from '../config/sheets';
import GoogleWriteModal from '../components/GoogleWriteModal';

const AuthContext = createContext(null);

const SESSION_KEY = 'vsg-google-session-v1';

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function decodeJwtPayload(idToken) {
  try {
    const [, payload] = String(idToken).split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenValid(session) {
  if (!session?.idToken) return false;
  const payload = decodeJwtPayload(session.idToken);
  if (!payload?.exp) return false;
  const expiresAtMs = Number(payload.exp) * 1000;
  return Date.now() < (expiresAtMs - 60_000);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const existing = readSession();
    if (existing && isTokenValid(existing)) return existing;
    return { role: ROLES.USER, fullName: 'Guest', email: '', idToken: '' };
  });
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleModalError, setGoogleModalError] = useState('');
  const pendingAuthRef = useRef(null);

  const canWrite = useMemo(() => PERMISSIONS.canAddEntry(session.role), [session.role]);

  function scriptApi(params) {
    const url = getScriptUrl();
    if (!url) return Promise.reject(new Error('No script URL configured'));
    const qs = new URLSearchParams(params).toString();
    return fetch(`${url}?${qs}`).then(r => r.json());
  }

  async function handleGoogleCredential(idToken) {
    setGoogleModalError('');
    try {
      const res = await scriptApi({ action: 'googleLogin', idToken });
      if (!res?.success) throw new Error(res?.error || 'Google auth failed');

      const next = {
        role: res.role || ROLES.USER,
        fullName: res.fullName || res.email || 'User',
        email: res.email || '',
        idToken,
      };
      setSession(next);
      writeSession(next);

      const pending = pendingAuthRef.current;
      pendingAuthRef.current = null;
      setGoogleModalOpen(false);
      if (pending?.resolve) pending.resolve(next);
    } catch (err) {
      setGoogleModalError(err.message || 'Google auth failed');
    }
  }

  function ensureWriteAccess() {
    if (canWrite && isTokenValid(session)) return Promise.resolve(session);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return Promise.reject(new Error('Missing VITE_GOOGLE_CLIENT_ID'));

    setGoogleModalError('');
    setGoogleModalOpen(true);

    return new Promise((resolve, reject) => {
      pendingAuthRef.current = { resolve, reject };
    });
  }

  function cancelEnsureWriteAccess() {
    const pending = pendingAuthRef.current;
    pendingAuthRef.current = null;
    setGoogleModalOpen(false);
    if (pending?.reject) pending.reject(new Error('Cancelled'));
  }

  return (
    <AuthContext.Provider value={{ session, role: session.role, fullName: session.fullName, ensureWriteAccess }}>
      {children}
      <GoogleWriteModal
        open={googleModalOpen}
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        error={googleModalError}
        onClose={cancelEnsureWriteAccess}
        onCredential={handleGoogleCredential}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
