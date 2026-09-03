import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoNumero, CampoSwitch } from '@/compartilhado/ui/campos';
import { SelectAutocomplete } from '@/compartilhado/ui/SelectAutocomplete';
import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import { aplicarErrosDeCampo } from '@/compartilhado/api/errosDeFormulario';
import { vendedorSchema, type VendedorForm } from '../validacao';
import { useSalvarVendedor, useVendedor } from '../hooks/useVendedores';

const VAZIO: VendedorForm = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  interno: true,
  externo: false,
  recebeComissao: false,
  comissaoPercentualFixo: null,
  comissaoPorMargem: false,
  usuarioId: null,
};

async function buscarUsuarios(termo: string) {
  const { data } = await clienteHttp.get<{ itens: { id: number; nome: string; login: string }[] }>(
    '/usuarios',
    { params: { termoBusca: termo, pagina: 1, tamanhoPagina: 20 } },
  );
  return (data.itens ?? []).map((u) => ({ value: u.id, label: `${u.nome} (${u.login})` }));
}

export function VendedorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const vendId = id && id !== 'novo' ? Number(id) : undefined;
  const ehEdicao = vendId != null;
  const { data: vend, isLoading } = useVendedor(vendId);

  const form = useForm<VendedorForm>({ resolver: zodResolver(vendedorSchema), defaultValues: VAZIO });
  const { control, handleSubmit, reset, setError, setValue, watch } = form;

  useEffect(() => {
    if (vend)
      reset({
        nome: vend.nome,
        cpf: vend.cpf ?? '',
        email: vend.email ?? '',
        telefone: vend.telefone ?? '',
        interno: vend.interno,
        externo: vend.externo,
        recebeComissao: vend.recebeComissao,
        comissaoPercentualFixo: vend.comissaoPercentualFixo ?? null,
        comissaoPorMargem: vend.comissaoPorMargem,
        usuarioId: vend.usuarioId ?? null,
      });
  }, [vend, reset]);

  const recebeComissao = useWatch({ control, name: 'recebeComissao' });

  const salvar = useSalvarVendedor(vendId, {
    aoSalvar: (idSalvo) => navigate(`/vendedores/${idSalvo}`, { replace: true }),
  });

  if (ehEdicao && isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <FormPage
      titulo={ehEdicao ? 'Editar vendedor' : 'Novo vendedor'}
      voltarPara={ehEdicao ? `/vendedores/${vendId}` : '/vendedores'}
      salvando={salvar.isPending}
      aoSalvar={handleSubmit((v) =>
        salvar.mutate(
          {
            nome: v.nome.trim(),
            cpf: v.cpf || null,
            email: v.email || null,
            telefone: v.telefone || null,
            interno: !!v.interno,
            externo: !!v.externo,
            recebeComissao: !!v.recebeComissao,
            comissaoPercentualFixo: v.recebeComissao ? (v.comissaoPercentualFixo ?? null) : null,
            comissaoPorMargem: v.recebeComissao ? !!v.comissaoPorMargem : false,
            usuarioId: v.usuarioId ?? null,
          },
          { onError: (erro) => aplicarErrosDeCampo<VendedorForm>(erro, setError) },
        ),
      )}
    >
      <SectionCard titulo="Dados">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto control={control} name="nome" label="Nome" obrigatorio maxLength={120} />
          <CampoTexto control={control} name="cpf" label="CPF" mono />
          <CampoTexto control={control} name="email" label="Email" tipo="email" />
          <CampoTexto control={control} name="telefone" label="Telefone" />
        </div>
      </SectionCard>

      <SectionCard titulo="Atuação">
        <div className="flex flex-col gap-1">
          <CampoSwitch control={control} name="interno" label="Vendedor interno" />
          <CampoSwitch control={control} name="externo" label="Vendedor externo" />
        </div>
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">
              Usuário vinculado
            </span>
            <SelectAutocomplete
              value={(watch('usuarioId') as number) ?? null}
              onChange={(v) => setValue('usuarioId', (v as number) ?? null)}
              buscar={buscarUsuarios}
              placeholder="Liga o vendedor a uma conta de login"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard titulo="Comissão">
        <CampoSwitch control={control} name="recebeComissao" label="Recebe comissão" />
        {recebeComissao && (
          <div className="mt-3 grid gap-4 border-t border-neutral-100 pt-3 sm:grid-cols-2">
            <CampoNumero
              control={control}
              name="comissaoPercentualFixo"
              label="Comissão percentual fixo (%)"
              min={0}
              sufixo="%"
            />
            <CampoSwitch
              control={control}
              name="comissaoPorMargem"
              label="Comissão por margem"
              ajuda="Alternativa ao percentual fixo."
            />
          </div>
        )}
      </SectionCard>
    </FormPage>
  );
}
