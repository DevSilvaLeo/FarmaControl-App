/**
 * Contratos de Sistema (Usuários, Perfis, Permissões, Empresas).
 * Conferidos contra o Swagger real do backend em 2026-09-03
 * (`src/tipos/api.gerado.ts`).
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
  empresaId?: number;
  filialId?: number;
  ultimoLoginUtc?: string | null;
  /** IDs dos perfis atribuídos — payload de `PUT /usuarios/{id}/perfis`. */
  perfilIds: number[];
  /** Nomes dos perfis (somente exibição). */
  perfis: string[];
}

export interface CriarUsuarioBody {
  nome: string;
  login: string;
  email: string;
  senhaInicial: string;
  empresaId?: number;
  filialId?: number;
  perfilIds?: number[];
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
  id: number;
  chave: string;
  modulo: string;
  /** Rótulo humano da permissão (o backend não expõe um campo `nome`). */
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
  nomeFantasia?: string | null;
  documento: string;
  ativo: boolean;
}

export type EmpresaDto = EmpresaResumoDto;

export interface FilialDto {
  id: number;
  empresaId?: number;
  nome: string;
  ativo?: boolean;
}
