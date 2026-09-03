import { z } from 'zod';

/**
 * Espelha `DadosVendedorValidator` do backend:
 *   Nome NotEmpty max 120 · Email válido quando informado ·
 *   ComissaoPercentualFixo >= 0 quando informado ·
 *   deve ser Interno E/OU Externo.
 */
export const vendedorSchema = z
  .object({
    nome: z.string().min(1, 'Informe o nome').max(120),
    cpf: z.string().max(14).optional().or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefone: z.string().max(20).optional().or(z.literal('')),
    interno: z.boolean().optional(),
    externo: z.boolean().optional(),
    recebeComissao: z.boolean().optional(),
    comissaoPercentualFixo: z.number().nonnegative('Não pode ser negativo').nullable().optional(),
    comissaoPorMargem: z.boolean().optional(),
    usuarioId: z.number().positive().nullable().optional(),
  })
  .refine((d) => d.interno || d.externo, {
    path: ['interno'],
    message: 'O vendedor deve ser interno e/ou externo.',
  });

export type VendedorForm = z.infer<typeof vendedorSchema>;

export const debitoSchema = z.object({
  competenciaUtc: z.string().min(1, 'Informe a competência'),
  valor: z.number().positive('Deve ser maior que zero'),
  motivo: z.string().min(1, 'Informe o motivo').max(240),
});
export type DebitoForm = z.infer<typeof debitoSchema>;
