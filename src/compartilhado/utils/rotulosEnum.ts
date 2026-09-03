/**
 * Rótulos amigáveis em PT-BR para os enums do backend (`.spec/03` §3.8,
 * `.spec/12` D-10). Os LITERAIS são idênticos aos gerados pelo Swagger — nunca
 * redigitados; o rótulo vive só aqui, nunca hardcoded numa tela.
 *
 * Etapa 1: os enums de fato usados nas telas entram conforme cada fase; abaixo
 * ficam os já citados nos documentos de especificação.
 */

export const rotulosTipoFrete: Record<string, string> = {
  Cif: 'CIF — frete por conta do remetente',
  Fob: 'FOB — frete por conta do destinatário',
};

export const rotulosTipoDeposito: Record<string, string> = {
  Principal: 'Principal',
  Reserva: 'Reserva',
  Terceiros: 'Terceiros',
};

export const rotulosTipoMedicamento: Record<string, string> = {
  NaoMedicamento: 'Não medicamento',
  Etico: 'Ético',
  Generico: 'Genérico',
  Similar: 'Similar',
  Otc: 'OTC (venda livre)',
};

export const rotulosMotivoAjuste: Record<string, string> = {
  Perda: 'Perda',
  Quebra: 'Quebra',
  Vencimento: 'Vencimento',
  Achado: 'Achado',
  CorrecaoInventario: 'Correção de inventário',
  Outro: 'Outro',
};

export const rotulosSentidoMovimento: Record<string, string> = {
  Entrada: 'Entrada',
  Saida: 'Saída',
};

export const rotulosOrigemMovimento: Record<string, string> = {
  Avulso: 'Avulso',
  Ajuste: 'Ajuste',
  Inventario: 'Inventário',
  Pedido: 'Pedido',
  Entrada: 'Entrada (compra)',
  Transferencia: 'Transferência',
};

/** Resolve um rótulo, com fallback para o próprio literal. */
export function rotular(mapa: Record<string, string>, valor: string | null | undefined): string {
  if (valor == null) return '—';
  return mapa[valor] ?? valor;
}

/** Converte um mapa de rótulos em `options` para `<Select>`. */
export function opcoesDe(mapa: Record<string, string>): { label: string; value: string }[] {
  return Object.entries(mapa).map(([value, label]) => ({ value, label }));
}
