import axios from 'axios';
import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import type { MeuPerfilDto } from '@/compartilhado/auth/sessaoStore';
import type {
  AlterarPropriaSenhaBody,
  AutenticarComSenhaBody,
  ConcluirDesafioTotpBody,
  ResultadoLoginDto,
  SegredoTotpDto,
  TokensDto,
} from './tipos';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5138/api';

/** Cliente sem interceptors — o login ainda não tem sessão para injetar/renovar. */
const clientePublico = axios.create({ baseURL, timeout: 15000 });

export const autenticacaoApi = {
  login: (body: AutenticarComSenhaBody) =>
    clientePublico.post<ResultadoLoginDto>('/autenticacao/login', body).then((r) => r.data),

  concluirDoisFatores: (body: ConcluirDesafioTotpBody) =>
    clientePublico
      .post<TokensDto>('/autenticacao/login/dois-fatores', body)
      .then((r) => r.data),

  logout: (todasAsSessoes = false) =>
    clienteHttp.post('/autenticacao/logout', { todasAsSessoes }).then(() => undefined),

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
