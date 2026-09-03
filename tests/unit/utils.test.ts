import { formatarMoeda, paraDecimal, formatarQuantidade } from '@/compartilhado/utils/formatarMoeda';
import { cpfValido, cnpjValido, formatarCpfCnpj, apenasDigitos } from '@/compartilhado/utils/cpfCnpj';
import {
  formatarData,
  formatarDataHora,
  localParaUtcIso,
  diasParaVencer,
  dayjs,
} from '@/compartilhado/utils/datas';
import { rotular, rotulosTipoFrete } from '@/compartilhado/utils/rotulosEnum';

const norm = (s: string) => s.replace(/\s/g, ' ');

describe('formatarMoeda', () => {
  it('formata number em BRL', () => {
    expect(norm(formatarMoeda(1234.5))).toBe('R$ 1.234,50');
    expect(norm(formatarMoeda(0))).toBe('R$ 0,00');
    expect(norm(formatarMoeda(null))).toBe('R$ 0,00');
  });

  it('paraDecimal entende vírgula e ponto de milhar', () => {
    expect(paraDecimal('1.234,56').toNumber()).toBe(1234.56);
    expect(paraDecimal('R$ 99,90').toNumber()).toBe(99.9);
    expect(paraDecimal('1234.56').toNumber()).toBe(1234.56);
    expect(paraDecimal('').toNumber()).toBe(0);
  });

  it('formatarQuantidade respeita casas', () => {
    expect(formatarQuantidade(10, 3)).toBe('10');
    expect(norm(formatarQuantidade(10.5, 3))).toBe('10,5');
  });
});

describe('cpfCnpj', () => {
  it('valida CPF conhecido', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('111.111.111-11')).toBe(false);
    expect(cpfValido('529.982.247-24')).toBe(false);
  });

  it('valida CNPJ conhecido', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true);
    expect(cnpjValido('11.222.333/0001-80')).toBe(false);
  });

  it('formata conforme o comprimento', () => {
    expect(formatarCpfCnpj('52998224725')).toBe('529.982.247-25');
    expect(formatarCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(apenasDigitos('529.982.247-25')).toBe('52998224725');
  });
});

describe('datas (UTC <-> America/Sao_Paulo)', () => {
  it('exibe data/hora no fuso de operacao', () => {
    // 2026-03-10T12:00:00Z -> 09:00 em Sao Paulo (UTC-3)
    expect(formatarData('2026-03-10T12:00:00Z')).toBe('10/03/2026');
    expect(formatarDataHora('2026-03-10T12:00:00Z')).toBe('10/03/2026 09:00');
    expect(formatarData(null)).toBe('—');
  });

  it('converte valor local do picker de volta para UTC', () => {
    const local = dayjs.tz('2026-03-10 09:00', 'America/Sao_Paulo');
    expect(localParaUtcIso(local)).toBe('2026-03-10T12:00:00.000Z');
  });

  it('diasParaVencer conta dias inteiros', () => {
    const em10dias = dayjs().add(10, 'day').toISOString();
    expect(diasParaVencer(em10dias)).toBe(10);
  });
});

describe('rotulosEnum', () => {
  it('resolve rotulo com fallback para o literal', () => {
    expect(rotular(rotulosTipoFrete, 'Cif')).toContain('CIF');
    expect(rotular(rotulosTipoFrete, 'Desconhecido')).toBe('Desconhecido');
    expect(rotular(rotulosTipoFrete, null)).toBe('—');
  });
});
