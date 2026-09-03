import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/pt-br';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale('pt-br');

/**
 * Fuso de operação (`.spec/03` §3.7, `.spec/12` D-08). Ponto único de mudança
 * se a operação expandir para outro fuso.
 */
export const FUSO_OPERACAO = 'America/Sao_Paulo';

export const FORMATO_DATA = 'DD/MM/YYYY';
export const FORMATO_DATA_HORA = 'DD/MM/YYYY HH:mm';

/** Converte um ISO/UTC vindo da API para `Dayjs` no fuso de operação (só exibição). */
export function utcParaLocal(isoUtc: string | null | undefined): Dayjs | null {
  if (!isoUtc) return null;
  const d = dayjs.utc(isoUtc);
  return d.isValid() ? d.tz(FUSO_OPERACAO) : null;
}

/** ISO/UTC → `dd/MM/yyyy`. Nunca ISO cru na tela. */
export function formatarData(isoUtc: string | null | undefined): string {
  return utcParaLocal(isoUtc)?.format(FORMATO_DATA) ?? '—';
}

/** ISO/UTC → `dd/MM/yyyy HH:mm` (Kardex, auditoria). */
export function formatarDataHora(isoUtc: string | null | undefined): string {
  return utcParaLocal(isoUtc)?.format(FORMATO_DATA_HORA) ?? '—';
}

/** Valor local de um `<DatePicker>` → ISO/UTC para o payload (`.spec/03` §3.7). */
export function localParaUtcIso(valor: Dayjs | null | undefined): string | null {
  if (!valor || !valor.isValid()) return null;
  return valor.tz(FUSO_OPERACAO, true).utc().toISOString();
}

/** Dias (inteiros) a partir de agora até a data informada (semáforo de validade). */
export function diasParaVencer(isoUtc: string | null | undefined): number | null {
  const alvo = utcParaLocal(isoUtc);
  if (!alvo) return null;
  return alvo.startOf('day').diff(dayjs().tz(FUSO_OPERACAO).startOf('day'), 'day');
}

export { dayjs };
