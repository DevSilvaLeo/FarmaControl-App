/**
 * Configuração de runtime da aplicação.
 *
 * Ordem de precedência:
 *  1. `window.__ENV__`  → injetado pelo container (arquivo `/env.js` gerado no
 *     start pelo `docker/entrypoint.sh` a partir das variáveis de ambiente).
 *  2. `import.meta.env` → valores de build do Vite (`.env` local).
 *  3. Padrão embutido.
 *
 * Isso permite que a MESMA imagem Docker rode em dev/homolog/prod só trocando
 * variáveis de ambiente — sem rebuild.
 */
interface RuntimeEnv {
  VITE_API_BASE_URL?: string;
  VITE_APP_NOME?: string;
}

declare global {
  interface Window {
    __ENV__?: RuntimeEnv;
  }
}

const runtime: RuntimeEnv = (typeof window !== 'undefined' && window.__ENV__) || {};

function ler(chave: keyof RuntimeEnv, padrao: string): string {
  const doRuntime = runtime[chave];
  if (doRuntime && doRuntime !== `__${chave}__`) return doRuntime;
  const doBuild = import.meta.env[chave] as string | undefined;
  if (doBuild) return doBuild;
  return padrao;
}

export const config = {
  /**
   * Base da API. Padrão `/api` (mesma origem) — em dev o Vite faz proxy para
   * `http://localhost:5138`; no container o Nginx faz proxy para o backend.
   * Assim nunca há CORS. Pode ser sobrescrito com uma URL absoluta.
   */
  apiBaseUrl: ler('VITE_API_BASE_URL', '/api'),
  appNome: ler('VITE_APP_NOME', 'FarmaControl'),
} as const;
