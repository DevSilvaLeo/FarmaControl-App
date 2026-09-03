import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import type { PagedResult, ParametrosPaginacao } from '@/compartilhado/api/tipos';
import type {
  DadosVendedor,
  DebitoVendedorDto,
  FaixaMetaEntrada,
  VendedorDto,
  VendedorResumoDto,
} from './tipos';

export interface ListarVendedoresParams extends ParametrosPaginacao {
  termoBusca?: string;
  incluirInativos?: boolean;
}

export const vendedoresApi = {
  listar: (params: ListarVendedoresParams) =>
    clienteHttp.get<PagedResult<VendedorResumoDto>>('/vendedores', { params }).then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<VendedorDto>(`/vendedores/${id}`).then((r) => r.data),
  criar: (dados: DadosVendedor) =>
    clienteHttp.post<number>('/vendedores', { dados }).then((r) => r.data),
  atualizar: (id: number, dados: DadosVendedor) =>
    clienteHttp.put(`/vendedores/${id}`, dados).then(() => undefined),
  inativar: (id: number) => clienteHttp.post(`/vendedores/${id}/inativar`).then(() => undefined),
  reativar: (id: number) => clienteHttp.post(`/vendedores/${id}/reativar`).then(() => undefined),
  /** Substituição total das faixas de meta. */
  definirMetas: (id: number, faixas: FaixaMetaEntrada[]) =>
    clienteHttp.put(`/vendedores/${id}/metas`, faixas).then(() => undefined),
  listarDebitos: (id: number) =>
    clienteHttp.get<DebitoVendedorDto[]>(`/vendedores/${id}/debitos`).then((r) => r.data),
  registrarDebito: (id: number, body: { competenciaUtc: string; valor: number; motivo: string }) =>
    clienteHttp.post<number>(`/vendedores/${id}/debitos`, body).then((r) => r.data),
};
