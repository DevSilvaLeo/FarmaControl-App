import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { App as AntApp, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const listarEstados = vi.fn();
const consultarCep = vi.fn();
const buscarCidades = vi.fn();
vi.mock('@/modulos/geografia/api', () => ({
  geografiaApi: {
    listarEstados: () => listarEstados(),
    consultarCep: (n: string) => consultarCep(n),
    buscarCidades: (e: number, t: string) => buscarCidades(e, t),
    listarPaises: () => Promise.resolve([]),
  },
}));

import { CampoEndereco } from '@/modulos/geografia/componentes/CampoEndereco';

function Host() {
  const { control } = useForm({
    defaultValues: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidadeId: null },
  });
  return (
    <CampoEndereco
      control={control}
      nomes={{
        cep: 'cep',
        logradouro: 'logradouro',
        numero: 'numero',
        complemento: 'complemento',
        bairro: 'bairro',
        cidadeId: 'cidadeId',
      }}
    />
  );
}

function Wrap({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <ConfigProvider>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  listarEstados.mockResolvedValue([
    { id: 26, uf: 'SP', nome: 'São Paulo' },
    { id: 19, uf: 'RJ', nome: 'Rio de Janeiro' },
  ]);
  consultarCep.mockReset();
  buscarCidades.mockReset();
});

describe('CampoEndereco', () => {
  it('ao sair do CEP com 8 dígitos, consulta e preenche logradouro/bairro', async () => {
    consultarCep.mockResolvedValue({
      numero: '13010000',
      logradouro: 'Rua das Flores',
      bairro: 'Centro',
      cidadeId: 555,
      cidade: 'Campinas',
      uf: 'SP',
    });

    render(
      <Wrap>
        <Host />
      </Wrap>,
    );

    const cep = screen.getByPlaceholderText('00000-000');
    await userEvent.type(cep, '13010000');
    await userEvent.tab();

    await waitFor(() => expect(consultarCep).toHaveBeenCalledWith('13010000'));
    await waitFor(() =>
      expect((screen.getByDisplayValue('Rua das Flores') as HTMLInputElement).value).toBe(
        'Rua das Flores',
      ),
    );
    expect(screen.getByDisplayValue('Centro')).toBeInTheDocument();
  });

  it('CEP não encontrado mostra aviso e não trava o formulário', async () => {
    consultarCep.mockRejectedValue(new Error('404'));
    render(
      <Wrap>
        <Host />
      </Wrap>,
    );
    await userEvent.type(screen.getByPlaceholderText('00000-000'), '99999999');
    await userEvent.tab();
    expect(await screen.findByText(/CEP não encontrado/i)).toBeInTheDocument();
  });
});
