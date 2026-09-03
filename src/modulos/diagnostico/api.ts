import { clienteHttp } from '@/compartilhado/api/clienteHttp';

/**
 * Contrato aproximado do `DiagnosticoController` do backend. Os nomes reais
 * dos campos serão fixados pelos tipos gerados do Swagger (`npm run gerar-tipos`)
 * na Etapa 1; na Etapa 0 tratamos a resposta de forma tolerante.
 */
export interface DiagnosticoDto {
  aplicacao?: string;
  nome?: string;
  versao?: string;
  ambiente?: string;
  horaUtc?: string;
  dataHoraUtc?: string;
  [chave: string]: unknown;
}

export const diagnosticoApi = {
  obter: () => clienteHttp.get<DiagnosticoDto>('/diagnostico').then((r) => r.data),
};
