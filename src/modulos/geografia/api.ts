import { clienteHttp } from '@/compartilhado/api/clienteHttp';

/** Contratos de Geografia — conferidos com o Swagger real (2026-09-03). */

export interface PaisDto {
  id: number;
  nome: string;
  codigoIso?: string;
  codigoBacen?: string | null;
}

export interface EstadoDto {
  id: number;
  uf: string;
  nome: string;
  codigoIbge?: string;
  aliquotaIcmsInterna?: number;
}

export interface CidadeDto {
  id: number;
  estadoId: number;
  nome: string;
  codigoIbge?: string;
}

export interface CepDto {
  numero: string;
  logradouro?: string | null;
  bairro?: string | null;
  cidadeId: number;
  cidade?: string | null;
  uf?: string | null;
}

export const geografiaApi = {
  listarPaises: () => clienteHttp.get<PaisDto[]>('/geografia/paises').then((r) => r.data),

  listarEstados: () => clienteHttp.get<EstadoDto[]>('/geografia/estados').then((r) => r.data),

  /** Cidades de um estado, filtradas por termo (fonte do autocomplete de Cidade). */
  buscarCidades: (estadoId: number, termoBusca: string) =>
    clienteHttp
      .get<CidadeDto[]>(`/geografia/estados/${estadoId}/cidades`, { params: { termoBusca } })
      .then((r) => r.data),

  /** Consulta CEP (8 dígitos, sem máscara). 404 → não encontrado. */
  consultarCep: (numeroDigitos: string) =>
    clienteHttp.get<CepDto>(`/geografia/ceps/${numeroDigitos}`).then((r) => r.data),

  criarCidade: (body: { estadoId: number; nome: string; codigoIbge: string }) =>
    clienteHttp.post<number>('/geografia/cidades', body).then((r) => r.data),

  criarCep: (body: { numero: string; logradouro?: string; bairro?: string; cidadeId: number }) =>
    clienteHttp.post<number>('/geografia/ceps', body).then((r) => r.data),
};
