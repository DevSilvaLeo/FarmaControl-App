/**
 * Contratos de Autenticação e Minha Conta.
 *
 * Reconciliados com o Swagger real do backend em 2026-09-03 (ver
 * `src/tipos/api.gerado.ts`). Na fase de homologação (bloco 1) o 2FA está
 * **desligado no backend** (`Autenticacao:DoisFatoresHabilitado=false`), então
 * o login sempre volta `autenticado:true` com `tokens`. Os tipos de desafio
 * ficam aqui porque o fluxo de 2FA continua no código, só inativo.
 */

export interface TokensDto {
  accessToken: string;
  accessTokenExpiraEmUtc: string;
  refreshToken: string;
  refreshTokenExpiraEmUtc: string;
}

/** Valor de `DesafioLoginDto.tipo` emitido pelo backend (`AutenticarComSenhaCommand`). */
export type EscopoDesafioLogin = 'TotpObrigatorio' | 'ConfiguracaoTotpObrigatoria';

export interface DesafioLoginDto {
  tokenDesafio: string;
  tipo: EscopoDesafioLogin;
}

/** `ResultadoLoginDto` — ou já veio o par de tokens, ou um desafio 2FA. */
export interface ResultadoLoginDto {
  /** `true` quando `tokens` está preenchido (login completo). */
  autenticado: boolean;
  tokens?: TokensDto | null;
  desafio?: DesafioLoginDto | null;
}

export interface SegredoTotpDto {
  segredo: string;
  uriOtpauth: string;
}

export interface AutenticarComSenhaBody {
  login: string;
  senha: string;
}

export interface ConcluirDesafioTotpBody {
  tokenDesafio: string;
  codigo: string;
}

export interface AlterarPropriaSenhaBody {
  senhaAtual: string;
  novaSenha: string;
}
