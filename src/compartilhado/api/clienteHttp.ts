import axios from 'axios';

/**
 * Cliente HTTP único (`.spec/02` §2.4). Na Etapa 0 é só a instância base — os
 * interceptors de Bearer token e de renovação em 401 entram na Etapa 1
 * (`.spec/05` §5.2).
 */
export const clienteHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5138/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
