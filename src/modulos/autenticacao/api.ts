import axios from 'axios';
import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import { config } from '@/compartilhado/config';
import { sessao } from '@/compartilhado/auth/sessaoStore';
import type { MeuPerfilDto } from '@/compartilhado/auth/sessaoStore';
import type {
  AlterarPropriaSenhaBody,
  AutenticarComSenhaBody,
  ConcluirDesafioTotpBody,
  ResultadoLoginDto,
  SegredoTotpDto,
  TokensDto,
} from './tipos';

/** Cliente sem interceptors — o login ainda não tem sessão para injetar/renovar. */
const clientePublico = axios.create({ baseURL: config.apiBaseUrl, timeout: 15000 });

export const autenticacaoApi = {
  login: (body: AutenticarComSenhaBody) =>
    clientePublico.post<ResultadoLoginDto>('/autenticacao/login', body).then((r) => r.data),

  concluirDoisFatores: (body: ConcluirDesafioTotpBody) =>
    clientePublico
      .post<TokensDto>('/autenticacao/login/dois-fatores', body)
      .then((r) => r.data),

  logout: (todasAsSessoes = false) =>
    clienteHttp
      .post('/autenticacao/logout', {
        refreshToken: sessao.get().refreshToken ?? undefined,
        todasAsSessoes,
      })
      .then(() => undefined),

  minhaConta: () => clienteHttp.get<MeuPerfilDto>('/minha-conta').then((r) => r.data),

  alterarSenha: (body: AlterarPropriaSenhaBody) =>
    clienteHttp.post('/minha-conta/senha', body).then(() => undefined),

  configurarDoisFatores: () =>
    clienteHttp
      .post<SegredoTotpDto>('/minha-conta/dois-fatores/configurar')
      .then((r) => r.data),

  ativarDoisFatores: (codigo: string) =>
    clienteHttp.post('/minha-conta/dois-fatores/ativar', { codigo }).then(() => undefined),

  desativarDoisFatores: (senha: string) =>
    clienteHttp.post('/minha-conta/dois-fatores/desativar', { senha }).then(() => undefined),
};
