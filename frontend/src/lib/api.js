import axios from 'axios';

// URL de base de l'API Laravel, configurable via VITE_API_URL (voir .env.example).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // cookie de session Sanctum
  withXSRFToken: true, // envoie X-XSRF-TOKEN même entre localhost:5173 et localhost:8000
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

// Initialise le cookie CSRF avant les requêtes d'authentification.
export const fetchCsrfCookie = () => axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });

// Une session expirée (401) est signalée à l'application, hors tentative de connexion.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // 419 = cookie CSRF absent ou périmé : on le renouvelle puis on rejoue la requête une seule fois.
    if (error.response?.status === 419 && config && !config._csrfRetried) {
      config._csrfRetried = true;
      await fetchCsrfCookie();
      return api(config);
    }
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/login') && !url.endsWith('/user')) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Une erreur est survenue. Veuillez réessayer.') {
  if (!error.response) return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
  const data = error.response.data;
  if (error.response.status === 422 && data?.errors) {
    return Object.values(data.errors).flat()[0] || data.message || fallback;
  }
  if (error.response.status === 429) return 'Trop de tentatives. Patientez un instant avant de réessayer.';
  return data?.message || fallback;
}

export function getFieldErrors(error) {
  const errors = error.response?.data?.errors;
  if (!errors) return {};
  return Object.fromEntries(Object.entries(errors).map(([key, messages]) => [key, messages[0]]));
}

export default api;
