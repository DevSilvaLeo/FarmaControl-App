import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import type { PagedResult } from '@/compartilhado/api/tipos';
import type {
  AjustarEstoqueBody,
  DefinirParametroEstoqueBody,
  DepositoDto,
  LoteAVencerDto,
  MovimentoEstoqueDto,
  ParametroEstoqueDepositoDto,
  PosicaoEstoqueDto,
  PosicaoProdutoDepositoDto,
  RegistrarEntradaBody,
  RegistrarSaidaBody,
  TipoDeposito,
} from './tipos';

export const depositosApi = {
  listar: (incluirInativos = false) =>
    clienteHttp
      .get<DepositoDto[]>('/estoque/depositos', { params: { incluirInativos } })
      .then((r) => r.data),
  criar: (body: { nome: string; codigo: string; tipo: TipoDeposito; padrao?: boolean }) =>
    clienteHttp.post<number>('/estoque/depositos', body).then((r) => r.data),
  atualizar: (id: number, body: { nome: string; codigo: string; tipo: TipoDeposito }) =>
    clienteHttp.put(`/estoque/depositos/${id}`, body).then(() => undefined),
  definirPadrao: (id: number) =>
    clienteHttp.post(`/estoque/depositos/${id}/definir-padrao`).then(() => undefined),
  inativar: (id: number) =>
    clienteHttp.post(`/estoque/depositos/${id}/inativar`).then(() => undefined),
  reativar: (id: number) =>
    clienteHttp.post(`/estoque/depositos/${id}/reativar`).then(() => undefined),
};

export const movimentacoesApi = {
  /** Retorna a lista de IDs de movimento gerados (pode ser > 1 em FEFO). */
  entrada: (body: RegistrarEntradaBody) =>
    clienteHttp.post<number[]>('/estoque/entradas', body).then((r) => r.data),
  saida: (body: RegistrarSaidaBody) =>
    clienteHttp.post<number[]>('/estoque/saidas', body).then((r) => r.data),
  ajuste: (body: AjustarEstoqueBody) =>
    clienteHttp.post<number[]>('/estoque/ajustes', body).then((r) => r.data),
};

export interface ListarPosicaoParams {
  pagina: number;
  tamanhoPagina: number;
  depositoId?: number;
  produtoId?: number;
  apenasAbaixoDoMinimo?: boolean;
  termoBusca?: string;
}

export interface ListarKardexParams {
  produtoId: number;
  depositoId?: number;
  /** Filtro por origem: 'Avulso' | 'Ajuste' | 'Inventario' | ... */
  origem?: string;
  deUtc?: string;
  ateUtc?: string;
  pagina: number;
  tamanhoPagina: number;
}

export const consultasApi = {
  posicao: (params: ListarPosicaoParams) =>
    clienteHttp
      .get<PagedResult<PosicaoEstoqueDto>>('/estoque/posicao', { params })
      .then((r) => r.data),
  posicaoPorLote: (produtoId: number, depositoId?: number) =>
    clienteHttp
      .get<PosicaoProdutoDepositoDto[]>(`/estoque/posicao/${produtoId}`, {
        params: { depositoId },
      })
      .then((r) => r.data),
  kardex: (params: ListarKardexParams) =>
    clienteHttp
      .get<PagedResult<MovimentoEstoqueDto>>('/estoque/kardex', { params })
      .then((r) => r.data),
  lotesAVencer: (dias: number, depositoId?: number) =>
    clienteHttp
      .get<LoteAVencerDto[]>('/estoque/lotes-a-vencer', { params: { dias, depositoId } })
      .then((r) => r.data),
};

export const parametrosEstoqueApi = {
  /** Uma linha por depósito, com o mín/máx efetivo e `personalizado`. */
  doProduto: (produtoId: number) =>
    clienteHttp
      .get<ParametroEstoqueDepositoDto[]>(`/estoque/parametros/${produtoId}`)
      .then((r) => r.data),
  definir: (body: DefinirParametroEstoqueBody) =>
    clienteHttp.put('/estoque/parametros', body).then(() => undefined),
  remover: (produtoId: number, depositoId: number) =>
    clienteHttp.delete(`/estoque/parametros/${produtoId}/${depositoId}`).then(() => undefined),
};
