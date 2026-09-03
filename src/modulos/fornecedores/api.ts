import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import type { PagedResult, ParametrosPaginacao } from '@/compartilhado/api/tipos';
import type {
  CriarFornecedorBody,
  CriarRepresentanteBody,
  CriarTransportadoraBody,
  FornecedorDto,
  ParceiroResumoDto,
  RepresentanteDto,
  TransportadoraDto,
} from './tipos';

export interface ListarParceirosParams extends ParametrosPaginacao {
  termoBusca?: string;
  incluirInativos?: boolean;
}

export const fornecedoresApi = {
  listar: (params: ListarParceirosParams) =>
    clienteHttp.get<PagedResult<ParceiroResumoDto>>('/fornecedores', { params }).then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<FornecedorDto>(`/fornecedores/${id}`).then((r) => r.data),
  criar: (body: CriarFornecedorBody) =>
    clienteHttp.post<number>('/fornecedores', body).then((r) => r.data),
  atualizar: (id: number, body: CriarFornecedorBody) =>
    clienteHttp.put(`/fornecedores/${id}`, body).then(() => undefined),
  inativar: (id: number) => clienteHttp.post(`/fornecedores/${id}/inativar`).then(() => undefined),
  reativar: (id: number) => clienteHttp.post(`/fornecedores/${id}/reativar`).then(() => undefined),
};

export const transportadorasApi = {
  listar: (params: ListarParceirosParams) =>
    clienteHttp
      .get<PagedResult<ParceiroResumoDto>>('/transportadoras', { params })
      .then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<TransportadoraDto>(`/transportadoras/${id}`).then((r) => r.data),
  criar: (body: CriarTransportadoraBody) =>
    clienteHttp.post<number>('/transportadoras', body).then((r) => r.data),
  atualizar: (id: number, body: CriarTransportadoraBody) =>
    clienteHttp.put(`/transportadoras/${id}`, body).then(() => undefined),
  inativar: (id: number) =>
    clienteHttp.post(`/transportadoras/${id}/inativar`).then(() => undefined),
  reativar: (id: number) =>
    clienteHttp.post(`/transportadoras/${id}/reativar`).then(() => undefined),
};

export const representantesApi = {
  /** Lista simples (não paginada). */
  listar: (incluirInativos = false) =>
    clienteHttp
      .get<RepresentanteDto[]>('/representantes', { params: { incluirInativos } })
      .then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<RepresentanteDto>(`/representantes/${id}`).then((r) => r.data),
  criar: (body: CriarRepresentanteBody) =>
    clienteHttp.post<number>('/representantes', body).then((r) => r.data),
  atualizar: (id: number, body: CriarRepresentanteBody) =>
    clienteHttp.put(`/representantes/${id}`, body).then(() => undefined),
  /** Representante só tem inativar (sem reativar exposto — `.spec/08` §8.5). */
  inativar: (id: number) => clienteHttp.post(`/representantes/${id}/inativar`).then(() => undefined),
};
