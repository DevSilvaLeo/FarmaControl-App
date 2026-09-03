import { AxiosError, type AxiosResponse } from 'axios';
import { produtoSchema } from '@/modulos/produtos/validacao';
import { clienteSchema } from '@/modulos/clientes/validacao';
import { aplicarErrosDeCampo } from '@/compartilhado/api/errosDeFormulario';

const produtoValido = {
  descricao: 'Dipirona 500mg 20cp',
  departamentoId: 1,
  grupoId: 2,
  tipoMedicamento: 'Generico' as const,
  unidadeEstoqueId: 3,
  quantidadePorEmbalagem: 1,
  precoCusto: 5,
  precoVenda: 12.9,
  origemMercadoria: 'Nacional' as const,
};

describe('produtoSchema', () => {
  it('aceita um produto mínimo válido', () => {
    expect(produtoSchema.safeParse(produtoValido).success).toBe(true);
  });

  it('exige descrição, departamento, grupo, unidade e preço de venda > 0', () => {
    const r = produtoSchema.safeParse({
      ...produtoValido,
      descricao: '',
      departamentoId: 0,
      grupoId: 0,
      unidadeEstoqueId: 0,
      precoVenda: 0,
    });
    expect(r.success).toBe(false);
  });

  it('rejeita NCM que não tem 8 dígitos', () => {
    expect(produtoSchema.safeParse({ ...produtoValido, ncm: '123' }).success).toBe(false);
    expect(produtoSchema.safeParse({ ...produtoValido, ncm: '30049099' }).success).toBe(true);
    expect(produtoSchema.safeParse({ ...produtoValido, ncm: '' }).success).toBe(true);
  });
});

const clienteValido = {
  tipoPessoa: 'Juridica' as const,
  cpfCnpj: '11.222.333/0001-81',
  razaoSocial: 'Hospital Central',
  limiteCredito: 0,
};

describe('clienteSchema', () => {
  it('aceita um cliente mínimo válido', () => {
    expect(clienteSchema.safeParse(clienteValido).success).toBe(true);
  });

  it('rejeita CPF/CNPJ com dígito verificador inválido', () => {
    expect(
      clienteSchema.safeParse({ ...clienteValido, cpfCnpj: '11.222.333/0001-80' }).success,
    ).toBe(false);
  });

  it('exige razão social e limite não-negativo', () => {
    expect(
      clienteSchema.safeParse({ ...clienteValido, razaoSocial: '', limiteCredito: -1 }).success,
    ).toBe(false);
  });

  it('valida formato de email quando informado', () => {
    expect(clienteSchema.safeParse({ ...clienteValido, email: 'nao-email' }).success).toBe(false);
    expect(clienteSchema.safeParse({ ...clienteValido, email: 'a@b.com' }).success).toBe(true);
    expect(clienteSchema.safeParse({ ...clienteValido, email: '' }).success).toBe(true);
  });
});

describe('aplicarErrosDeCampo', () => {
  it('remove o prefixo "Dados." e minusculiza o primeiro segmento', () => {
    const setError = vi.fn();
    const erro = new AxiosError('x', 'x', undefined, {}, {
      status: 400,
      data: {
        erros: {
          'Dados.DepartamentoId': ["'Departamento Id' deve ser superior a '0'."],
          'dados.CpfCnpjDigitos': ['CPF/CNPJ inválido.'],
        },
      },
    } as AxiosResponse);

    aplicarErrosDeCampo(erro, setError);

    expect(setError).toHaveBeenCalledWith('departamentoId', {
      message: "'Departamento Id' deve ser superior a '0'.",
    });
    expect(setError).toHaveBeenCalledWith('cpfCnpjDigitos', { message: 'CPF/CNPJ inválido.' });
  });
});
