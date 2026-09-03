import { ajusteSchema, depositoSchema, entradaSchema, saidaSchema } from '@/modulos/estoque/validacao';

describe('depositoSchema', () => {
  it('exige nome, código e tipo válido', () => {
    expect(depositoSchema.safeParse({ nome: '', codigo: '', tipo: 'Principal' }).success).toBe(false);
    expect(depositoSchema.safeParse({ nome: 'Central', codigo: 'DC01', tipo: 'Principal' }).success).toBe(
      true,
    );
    expect(depositoSchema.safeParse({ nome: 'X', codigo: 'Y', tipo: 'Invalido' }).success).toBe(false);
  });
});

describe('schemas de movimentação', () => {
  const base = { produtoId: 5, quantidade: 10 };

  it('entrada: exige produto e quantidade > 0', () => {
    expect(entradaSchema.safeParse(base).success).toBe(true);
    expect(entradaSchema.safeParse({ produtoId: 0, quantidade: 0 }).success).toBe(false);
    expect(entradaSchema.safeParse({ produtoId: 5, quantidade: -1 }).success).toBe(false);
  });

  it('saída: mesma regra base, lote opcional', () => {
    expect(saidaSchema.safeParse(base).success).toBe(true);
    expect(saidaSchema.safeParse({ ...base, lote: '' }).success).toBe(true);
  });

  it('ajuste: exige sentido e motivo válidos', () => {
    expect(ajusteSchema.safeParse({ ...base, sentido: 'Saida', motivo: 'Quebra' }).success).toBe(true);
    expect(ajusteSchema.safeParse({ ...base, sentido: 'Lado', motivo: 'Quebra' }).success).toBe(false);
    expect(ajusteSchema.safeParse({ ...base, sentido: 'Saida', motivo: 'Sumico' }).success).toBe(false);
  });
});
