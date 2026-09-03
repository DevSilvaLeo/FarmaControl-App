/**
 * Contratos de Sistema (Usuários, Perfis, Permissões, Empresas).
 *
 * ⚠️ Nomes de campo espelham `.spec/06-fase-2-autenticacao.md`. Reconciliar com
 * `src/tipos/api.gerado.ts` (`npm run gerar-tipos`) quando a API estiver acessível.
 */

export interface UsuarioResumoDto {
  id: number;
  nome: string;
  login: string;
  email: string;
  ativo: boolean;
  doisFatoresHabilitado: boolean;
}

export interface UsuarioDto extends UsuarioResumoDto {
  perfis: string[];
}

export interface CriarUsuarioBody {
  nome: string;
  login: string;
  email: string;
  senhaInicial: string;
}

export interface PerfilResumoDto {
  id: number;
  nome: string;
  descricao?: string;
  sistema: boolean;
  ativo: boolean;
}

export interface PerfilDto extends PerfilResumoDto {
  /** Chaves de permissão atualmente atribuídas ao perfil. */
  permissoes: string[];
}

export interface PermissaoDto {
  chave: string;
  nome: string;
  descricao?: string;
}

/** `GET /permissoes` — já agrupado por módulo pelo backend. */
export interface ModuloPermissoesDto {
  modulo: string;
  permissoes: PermissaoDto[];
}

export interface EmpresaResumoDto {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  documento: string;
  ativa: boolean;
}

export interface FilialDto {
  id: number;
  nome: string;
}

export interface EmpresaDto extends EmpresaResumoDto {
  filiais?: FilialDto[];
}
