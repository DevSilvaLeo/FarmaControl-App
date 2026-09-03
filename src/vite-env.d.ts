/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NOME: string;
  /** 'off' desliga o mock de permissões em dev (`usePermissao`). */
  readonly VITE_PERMISSOES_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
