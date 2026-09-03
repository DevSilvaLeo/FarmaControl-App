import { z } from 'zod';

export const depositoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome').max(80),
  codigo: z.string().min(1, 'Informe o código').max(20),
  tipo: z.enum(['Principal', 'Reserva', 'Terceiros']),
});
export type DepositoForm = z.infer<typeof depositoSchema>;

const baseMov = {
  depositoId: z.number().positive().nullable().optional(),
  produtoId: z.number({ message: 'Selecione o produto' }).positive('Selecione o produto'),
  lote: z.string().max(50).optional().or(z.literal('')),
  quantidade: z.number().positive('Quantidade deve ser maior que zero'),
  observacao: z.string().max(500).optional().or(z.literal('')),
};

export const entradaSchema = z.object({
  ...baseMov,
  validadeUtc: z.string().nullable().optional(),
  custoUnitario: z.number().nonnegative().nullable().optional(),
});
export type EntradaForm = z.infer<typeof entradaSchema>;

export const saidaSchema = z.object(baseMov);
export type SaidaForm = z.infer<typeof saidaSchema>;

export const ajusteSchema = z.object({
  ...baseMov,
  validadeUtc: z.string().nullable().optional(),
  sentido: z.enum(['Entrada', 'Saida']),
  motivo: z.enum(['Perda', 'Quebra', 'Vencimento', 'Achado', 'CorrecaoInventario', 'Outro']),
});
export type AjusteForm = z.infer<typeof ajusteSchema>;
