import { useQuery } from '@tanstack/react-query';
import { geografiaApi } from '../api';

const UMA_HORA = 60 * 60_000;

/** Estados — mudam raríssimo, cache longo (`.spec/07` §7.2). */
export function useEstados() {
  return useQuery({
    queryKey: ['geografia', 'estados'],
    queryFn: geografiaApi.listarEstados,
    staleTime: UMA_HORA,
    gcTime: UMA_HORA,
  });
}

export function usePaises() {
  return useQuery({
    queryKey: ['geografia', 'paises'],
    queryFn: geografiaApi.listarPaises,
    staleTime: UMA_HORA,
    gcTime: UMA_HORA,
  });
}
