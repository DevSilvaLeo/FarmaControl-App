import axios from 'axios';
import { sessao, useSessaoStore } from '@/compartilhado/auth/sessaoStore';

/**
 * Renovação de token rotativo (`.spec/05` §5.2, `agents.md` §14.1).
 *
 * Regra crítica: **nunca duas renovações concorrentes** — o backend detecta
 * reuso de refresh token como comprometimento e revoga a sessão. Se várias
 * requisições recebem 401 ao mesmo tempo, só a primeira dispara a renovação;
 * as demais aguardam a mesma `Promise` (single-flight) e reusam o novo token.
 *
 * O contrato exato do endpoint é fixado na Etapa 3 (`.spec/06`); aqui a forma
 * de request/response é a esperada e fica isolada neste módulo.
 */

interface RespostaRenovacao {
  accessToken: string;
  refreshToken: string;
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5138/api';

// Cliente "cru" — sem interceptors — para a própria chamada de renovação.
const clienteRenovacao = axios.create({ baseURL, timeout: 15000 });

let renovacaoPendente: Promise<string> | null = null;

export function renovarAccessToken(): Promise<string> {
  if (renovacaoPendente) return renovacaoPendente;

  const { refreshToken } = sessao.get();
  if (!refreshToken) {
    return Promise.reject(new Error('Sem refresh token — necessário novo login.'));
  }

  renovacaoPendente = clienteRenovacao
    .post<RespostaRenovacao>('/autenticacao/token/renovar', { refreshToken })
    .then((resposta) => {
      const dados = resposta.data;
      useSessaoStore.getState().definirTokens({
        accessToken: dados.accessToken,
        refreshToken: dados.refreshToken,
      });
      return dados.accessToken;
    })
    .finally(() => {
      renovacaoPendente = null;
    });

  return renovacaoPendente;
}

/** Exposto só para teste — permite verificar o single-flight. */
export function _renovacaoPendente(): boolean {
  return renovacaoPendente != null;
}
