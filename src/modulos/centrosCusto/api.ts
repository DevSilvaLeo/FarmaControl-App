import { clienteHttp } from '@/compartilhado/api/clienteHttp';

/** Contratos de Centro de Custo — Swagger real (2026-09-03). */
export interface CentroCustoDto {
  id: number;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface CentroCustoBody {
  nome: string;
  codigo: string;
}

export const centrosCustoApi = {
  listar: (incluirInativos = false) =>
    clienteHttp
      .get<CentroCustoDto[]>('/centros-custo', { params: { incluirInativos } })
      .then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<CentroCustoDto>(`/centros-custo/${id}`).then((r) => r.data),
  criar: (body: CentroCustoBody) =>
    clienteHttp.post<number>('/centros-custo', body).then((r) => r.data),
  atualizar: (id: number, body: CentroCustoBody) =>
    clienteHttp.put(`/centros-custo/${id}`, body).then(() => undefined),
  inativar: (id: number) =>
    clienteHttp.post(`/centros-custo/${id}/inativar`).then(() => undefined),
  reativar: (id: number) =>
    clienteHttp.post(`/centros-custo/${id}/reativar`).then(() => undefined),
};
