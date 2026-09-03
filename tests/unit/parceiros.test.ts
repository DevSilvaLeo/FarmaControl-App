import { fornecedorSchema, parceiroSchema } from '@/modulos/fornecedores/validacao';
import { debitoSchema, vendedorSchema } from '@/modulos/vendedores/validacao';
import { encontrarSobreposicao } from '@/modulos/vendedores/componentes/metasUtil';

const parceiroValido = {
  tipoPessoa: 'Juridica' as const,
  cpfCnpj: '11.222.333/0001-81',
  razaoSocial: 'Distribuidora X',
};

describe('parceiroSchema / fornecedorSchema', () => {
  it('aceita parceiro mínimo válido', () => {
    expect(parceiroSchema.safeParse(parceiroValido).success).toBe(true);
  });

  it('rejeita CPF/CNPJ inválido e razão social vazia', () => {
    expect(parceiroSchema.safeParse({ ...parceiroValido, cpfCnpj: '11.222.333/0001-80' }).success).toBe(false);
    expect(parceiroSchema.safeParse({ ...parceiroValido, razaoSocial: '' }).success).toBe(false);
  });

  it('fornecedor: prazo de entrega não pode ser negativo', () => {
    expect(fornecedorSchema.safeParse({ ...parceiroValido, prazoEntregaDias: -1 }).success).toBe(false);
    expect(fornecedorSchema.safeParse({ ...parceiroValido, prazoEntregaDias: 0 }).success).toBe(true);
  });
});

describe('vendedorSchema', () => {
  it('exige que seja interno e/ou externo', () => {
    expect(vendedorSchema.safeParse({ nome: 'Ana', interno: false, externo: false }).success).toBe(false);
    expect(vendedorSchema.safeParse({ nome: 'Ana', interno: true, externo: false }).success).toBe(true);
    expect(vendedorSchema.safeParse({ nome: 'Ana', interno: false, externo: true }).success).toBe(true);
  });

  it('comissão percentual fixo não pode ser negativa', () => {
    expect(
      vendedorSchema.safeParse({ nome: 'Ana', interno: true, comissaoPercentualFixo: -5 }).success,
    ).toBe(false);
  });
});

describe('debitoSchema', () => {
  it('exige competência, valor > 0 e motivo', () => {
    expect(debitoSchema.safeParse({ competenciaUtc: '', valor: 0, motivo: '' }).success).toBe(false);
    expect(
      debitoSchema.safeParse({ competenciaUtc: '2026-01-01T00:00:00Z', valor: 100, motivo: 'Adiantamento' })
        .success,
    ).toBe(true);
  });
});

describe('encontrarSobreposicao (metas de comissão — RN-03.02)', () => {
  const meta = (i: string, f: string) => ({ inicioUtc: i, fimUtc: f, valorMeta: 0, percentualComissao: 0 });

  it('não acusa faixas contíguas sem sobreposição', () => {
    expect(
      encontrarSobreposicao([
        meta('2026-01-01T00:00:00Z', '2026-03-31T00:00:00Z'),
        meta('2026-04-01T00:00:00Z', '2026-06-30T00:00:00Z'),
      ]),
    ).toBeNull();
  });

  it('acusa quando duas faixas se cruzam no tempo', () => {
    expect(
      encontrarSobreposicao([
        meta('2026-01-01T00:00:00Z', '2026-04-30T00:00:00Z'),
        meta('2026-04-01T00:00:00Z', '2026-06-30T00:00:00Z'),
      ]),
    ).not.toBeNull();
  });

  it('ignora faixas incompletas (sem início ou fim)', () => {
    expect(
      encontrarSobreposicao([{ inicioUtc: null, fimUtc: null, valorMeta: 0, percentualComissao: 0 }]),
    ).toBeNull();
  });
});
