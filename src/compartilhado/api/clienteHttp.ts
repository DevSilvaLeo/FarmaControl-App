import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { sessao, useSessaoStore } from '@/compartilhado/auth/sessaoStore';
import { renovarAccessToken } from './renovacaoDeToken';

/**
 * Cliente HTTP único (`.spec/02` §2.4, `.spec/05` §5.2). Nenhum componente usa
 * `fetch`/`axios` direto — sempre este cliente via `modulos/<area>/api.ts`.
 *
 * Interceptors:
 *  1. requisição  → injeta `Authorization: Bearer <accessToken>`.
 *  2. resposta    → em 401, tenta renovar UMA vez (single-flight em
 *     `renovacaoDeToken.ts`) e refaz a requisição; se a renovação falhar,
 *     desloga e manda para `/entrar`.
 */

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5138/api';

export const clienteHttp = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

clienteHttp.interceptors.request.use((config) => {
  const token = sessao.get().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type ConfigComRetry = InternalAxiosRequestConfig & { _jaTentouRenovar?: boolean };

function redirecionarParaLogin(): void {
  useSessaoStore.getState().limpar();
  if (typeof window !== 'undefined' && window.location.pathname !== '/entrar') {
    const retorno = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/entrar?retorno=${retorno}`);
  }
}

clienteHttp.interceptors.response.use(
  (resposta) => resposta,
  async (erro: AxiosError) => {
    const original = erro.config as ConfigComRetry | undefined;
    const status = erro.response?.status;

    const podeRenovar =
      status === 401 &&
      original != null &&
      !original._jaTentouRenovar &&
      sessao.get().refreshToken != null;

    if (!podeRenovar) {
      if (status === 401) redirecionarParaLogin();
      return Promise.reject(erro);
    }

    original._jaTentouRenovar = true;
    try {
      const novoToken = await renovarAccessToken();
      original.headers.set('Authorization', `Bearer ${novoToken}`);
      return clienteHttp(original);
    } catch (erroRenovacao) {
      redirecionarParaLogin();
      return Promise.reject(erroRenovacao);
    }
  },
);
