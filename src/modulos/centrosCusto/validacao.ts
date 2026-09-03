import { z } from 'zod';

export const centroCustoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome').max(80),
  codigo: z.string().min(1, 'Informe o código').max(20),
});
export type CentroCustoForm = z.infer<typeof centroCustoSchema>;
