/**
 * Contratos de Autenticação e Minha Conta.
 *
 * ⚠️ Os nomes de campo abaixo espelham `.spec/06-fase-2-autenticacao.md` (lido
 * dos Controllers reais do backend). Quando a API estiver acessível, rodar
 * `npm run gerar-tipos` e reconciliar `src/tipos/api.gerado.ts` — este arquivo
 * fica só com o que não vier do Swagger.
 */

export interface TokensDto {
  accessToken: string;
  refreshToken: string;
}

/** `EscopoDesafioLogin` do backend. */
export type EscopoDesafioLogin = 'DesafioTotp' | 'ConfiguracaoTotpObrigatoria';

export interface DesafioLoginDto {
  tokenDesafio: string;
  tipo: EscopoDesafioLogin;
}

/** `ResultadoLoginDto` — ou já veio o par de tokens, ou um desafio 2FA. */
export interface ResultadoLoginDto {
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
