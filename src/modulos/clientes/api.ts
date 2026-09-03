import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import type { PagedResult, ParametrosPaginacao } from '@/compartilhado/api/tipos';
import type { ClienteDto, ClienteResumoDto, DadosCliente, SegmentoDto } from './tipos';

export interface ListarClientesParams extends ParametrosPaginacao {
  termoBusca?: string;
  segmentoId?: number;
  incluirInativos?: boolean;
}

export interface EnderecoBody {
  destinatario?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId?: number | null;
  padrao?: boolean;
}

export const clientesApi = {
  listar: (params: ListarClientesParams) =>
    clienteHttp.get<PagedResult<ClienteResumoDto>>('/clientes', { params }).then((r) => r.data),
  obterPorId: (id: number) => clienteHttp.get<ClienteDto>(`/clientes/${id}`).then((r) => r.data),
  criar: (dados: DadosCliente) =>
    clienteHttp.post<number>('/clientes', { dados }).then((r) => r.data),
  atualizar: (id: number, dados: DadosCliente) =>
    clienteHttp.put(`/clientes/${id}`, dados).then(() => undefined),
  inativar: (id: number) => clienteHttp.post(`/clientes/${id}/inativar`).then(() => undefined),
  reativar: (id: number) => clienteHttp.post(`/clientes/${id}/reativar`).then(() => undefined),
  bloquear: (id: number, motivo: string) =>
    clienteHttp.post(`/clientes/${id}/bloquear`, { motivo }).then(() => undefined),
  desbloquear: (id: number) =>
    clienteHttp.post(`/clientes/${id}/desbloquear`).then(() => undefined),
  definirLimiteCredito: (id: number, limite: number) =>
    clienteHttp.put(`/clientes/${id}/limite-credito`, { limite }).then(() => undefined),
  adicionarContato: (id: number, body: { nome: string; cargo?: string; email?: string; telefone?: string }) =>
    clienteHttp.post<number>(`/clientes/${id}/contatos`, body).then((r) => r.data),
  adicionarEnderecoEntrega: (id: number, body: EnderecoBody) =>
    clienteHttp.post<number>(`/clientes/${id}/enderecos-entrega`, body).then((r) => r.data),
  adicionarEnderecoCobranca: (id: number, body: Omit<EnderecoBody, 'destinatario'>) =>
    clienteHttp.post<number>(`/clientes/${id}/enderecos-cobranca`, body).then((r) => r.data),
};

export const segmentosApi = {
  listar: () => clienteHttp.get<SegmentoDto[]>('/segmentos').then((r) => r.data),
  criar: (body: { nome: string; orgaoPublico: boolean }) =>
    clienteHttp.post<number>('/segmentos', body).then((r) => r.data),
  atualizar: (id: number, body: { nome: string; orgaoPublico: boolean }) =>
    clienteHttp.put(`/segmentos/${id}`, body).then(() => undefined),
};
