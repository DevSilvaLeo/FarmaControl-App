import { clienteHttp } from '@/compartilhado/api/clienteHttp';

/** `DiagnosticoDto` do backend (`GET /api/diagnostico`). */
export interface DiagnosticoDto {
  aplicacao?: string;
  versao?: string;
  ambiente?: string;
  horaServidorUtc?: string;
}

export const diagnosticoApi = {
  obter: () => clienteHttp.get<DiagnosticoDto>('/diagnostico').then((r) => r.data),
};
