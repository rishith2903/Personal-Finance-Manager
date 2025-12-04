const API_BASE = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://personal-finance-manager-f6sr.onrender.com');

const TOKEN_KEY = 'auth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log(`[API] Token present, length: ${token.length}`);
  } else {
    console.log('[API] WARNING: No token found in localStorage!');
  }

  console.log(`[API] Requesting: ${API_BASE}${path}`); // Debug log

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      let message = 'Request failed';
      try {
        const t = await res.text();
        message = t || message;
      } catch { }
      console.error(`[API] Error ${res.status}:`, message); // Debug log
      throw new Error(message);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  } catch (err) {
    console.error('[API] Network/Fetch Error:', err); // Debug log
    throw err;
  }
}
