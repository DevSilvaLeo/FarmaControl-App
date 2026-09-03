import Decimal from 'decimal.js';

const formatoBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Exibe valor monetário em BRL (`.spec/03` §3.8). Aceita `number`, string ou `Decimal`. */
export function formatarMoeda(valor: number | string | Decimal | null | undefined): string {
  if (valor == null || valor === '') return formatoBRL.format(0);
  const n = valor instanceof Decimal ? valor.toNumber() : Number(valor);
  return formatoBRL.format(Number.isFinite(n) ? n : 0);
}

/** Converte texto digitado ("1.234,56" ou "1234.56") em `Decimal` (`.spec/12` D-09). */
export function paraDecimal(entrada: string | number | null | undefined): Decimal {
  if (entrada == null || entrada === '') return new Decimal(0);
  if (typeof entrada === 'number') return new Decimal(entrada);
  const semSeparadorMilhar = entrada
    .trim()
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  try {
    return new Decimal(semSeparadorMilhar || '0');
  } catch {
    return new Decimal(0);
  }
}

/** Formata número (quantidades) com casas decimais adaptáveis (`.spec/03` §3.8). */
export function formatarQuantidade(valor: number | string | null | undefined, casas = 3): string {
  const n = Number(valor ?? 0);
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isFinite(n) ? casas : 0,
  }).format(Number.isFinite(n) ? n : 0);
}
