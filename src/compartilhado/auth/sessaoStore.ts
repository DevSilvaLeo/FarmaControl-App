import { create } from 'zustand';

/**
 * Estado de sessão (`.spec/05` §5.2, `.spec/12` D-05):
 *  - `accessToken`  → `sessionStorage` (sobrevive a F5 na mesma aba, some ao
 *    fechar). Antes era só memória; passou a persistir na aba porque um F5 ou
 *    navegação rápida durante o refresh silencioso podia abortar a rotação do
 *    refresh token e derrubar a sessão (bloco de acabamento da homologação).
 *  - `refreshToken` → `localStorage` (sobrevive a fechar/reabrir) — risco residual aceito.
 *  - `perfil`       → `MeuPerfilDto` carregado no login.
 */

export interface MeuPerfilDto {
  id: number;
  nome: string;
  login: string;
  email: string;
  empresaId?: number;
  empresaNome?: string;
  filialId?: number;
  filialNome?: string;
  perfis: string[];
  permissoes: string[];
  doisFatoresHabilitado?: boolean;
}

const CHAVE_REFRESH = 'farmacontrol:refresh-token';
const CHAVE_ACCESS = 'farmacontrol:access-token';

function lerRefreshToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_REFRESH);
  } catch {
    return null;
  }
}

function gravarRefreshToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CHAVE_REFRESH, token);
    else localStorage.removeItem(CHAVE_REFRESH);
  } catch {
    /* ambiente sem storage — ignora */
  }
}

function lerAccessToken(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_ACCESS);
  } catch {
    return null;
  }
}

function gravarAccessToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(CHAVE_ACCESS, token);
    else sessionStorage.removeItem(CHAVE_ACCESS);
  } catch {
    /* ambiente sem storage — ignora */
  }
}

interface SessaoState {
  accessToken: string | null;
  refreshToken: string | null;
  perfil: MeuPerfilDto | null;
  autenticado: boolean;

  definirTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  definirAccessToken: (accessToken: string) => void;
  definirPerfil: (perfil: MeuPerfilDto) => void;
  limpar: () => void;
}

export const useSessaoStore = create<SessaoState>((set) => ({
  accessToken: lerAccessToken(),
  refreshToken: lerRefreshToken(),
  perfil: null,
  autenticado: false,

  definirTokens: ({ accessToken, refreshToken }) => {
    gravarRefreshToken(refreshToken);
    gravarAccessToken(accessToken);
    set((s) => ({ accessToken, refreshToken, autenticado: s.perfil != null }));
  },

  definirAccessToken: (accessToken) => {
    gravarAccessToken(accessToken);
    set({ accessToken });
  },

  definirPerfil: (perfil) => set((s) => ({ perfil, autenticado: s.accessToken != null })),

  limpar: () => {
    gravarRefreshToken(null);
    gravarAccessToken(null);
    set({ accessToken: null, refreshToken: null, perfil: null, autenticado: false });
  },
}));

/** Acesso fora de componente React (usado pelos interceptors do Axios). */
export const sessao = {
  get: () => useSessaoStore.getState(),
};
