import { create } from 'zustand';

/**
 * Estado de sessão (`.spec/05` §5.2, `.spec/12` D-05):
 *  - `accessToken`  → apenas em memória (nunca persistido) — reduz janela de XSS.
 *  - `refreshToken` → `localStorage` (sobrevive a F5) — risco residual aceito.
 *  - `perfil`       → `MeuPerfilDto` carregado no login.
 *
 * Na Etapa 1 o store existe com o formato final, mas ainda SEM login real
 * (populado na Etapa 3). `usePermissao` roda sobre um mock até lá (`.spec/05` §5.6).
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
  accessToken: null,
  refreshToken: lerRefreshToken(),
  perfil: null,
  autenticado: false,

  definirTokens: ({ accessToken, refreshToken }) => {
    gravarRefreshToken(refreshToken);
    set((s) => ({ accessToken, refreshToken, autenticado: s.perfil != null }));
  },

  definirAccessToken: (accessToken) => set({ accessToken }),

  definirPerfil: (perfil) => set((s) => ({ perfil, autenticado: s.accessToken != null })),

  limpar: () => {
    gravarRefreshToken(null);
    set({ accessToken: null, refreshToken: null, perfil: null, autenticado: false });
  },
}));

/** Acesso fora de componente React (usado pelos interceptors do Axios). */
export const sessao = {
  get: () => useSessaoStore.getState(),
};
