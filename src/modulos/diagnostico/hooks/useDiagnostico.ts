import { useQuery } from '@tanstack/react-query';
import { diagnosticoApi } from '../api';

/** Consulta o endpoint público `GET /api/diagnostico` (`.spec/04` §4.3 item 7). */
export function useDiagnostico() {
  return useQuery({
    queryKey: ['diagnostico'],
    queryFn: diagnosticoApi.obter,
    staleTime: 0,
    retry: 0,
  });
}
