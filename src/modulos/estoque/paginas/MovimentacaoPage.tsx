import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Alert, Button, Input, Radio } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoData, CampoMoeda, CampoNumero, CampoSelect } from '@/compartilhado/ui/campos';
import { useNotificacoes } from '@/compartilhado/ui/notificacoes';
import { normalizarErro } from '@/compartilhado/api/normalizarErro';
import { opcoesDe, rotulosMotivoAjuste } from '@/compartilhado/utils/rotulosEnum';
import { ajusteSchema, entradaSchema, saidaSchema } from '../validacao';
import {
  useRegistrarAjuste,
  useRegistrarEntrada,
  useRegistrarSaida,
} from '../hooks/useEstoque';
import { SelectDeposito } from '../componentes/SelectDeposito';
import { SelectProduto } from '../componentes/SelectProduto';

type Tipo = 'entrada' | 'saida' | 'ajuste';

const cfg: Record<Tipo, { titulo: string; schema: import('zod').ZodTypeAny }> = {
  entrada: { titulo: 'Entrada avulsa', schema: entradaSchema },
  saida: { titulo: 'Saída avulsa', schema: saidaSchema },
  ajuste: { titulo: 'Ajuste de estoque', schema: ajusteSchema },
};

interface FormComum {
  depositoId?: number | null;
  produtoId?: number;
  lote?: string;
  quantidade?: number;
  observacao?: string;
  validadeUtc?: string | null;
  custoUnitario?: number | null;
  sentido?: 'Entrada' | 'Saida';
  motivo?: string;
}

export function MovimentacaoPage({ tipo }: { tipo: Tipo }) {
  const notificar = useNotificacoes();
  const [controlaLote, setControlaLote] = useState(false);
  const [ultimosIds, setUltimosIds] = useState<number[] | null>(null);

  const form = useForm<FormComum>({
    resolver: zodResolver(cfg[tipo].schema),
    defaultValues: {
      depositoId: null,
      lote: '',
      quantidade: undefined,
      observacao: '',
      validadeUtc: null,
      custoUnitario: null,
      sentido: 'Entrada',
      motivo: 'Perda',
    },
  });
  const { control, handleSubmit, reset, watch, setValue } = form;

  const aoRegistrar = (ids: number[]) => {
    setUltimosIds(ids);
    notificar.sucesso(
      ids.length === 1 ? 'Movimento registrado.' : `${ids.length} movimentos registrados.`,
    );
    const depositoId = watch('depositoId');
    reset({
      depositoId,
      lote: '',
      quantidade: undefined,
      observacao: '',
      validadeUtc: null,
      custoUnitario: null,
      sentido: watch('sentido'),
      motivo: watch('motivo'),
    });
    setControlaLote(false);
  };

  const entrada = useRegistrarEntrada({ aoRegistrar });
  const saida = useRegistrarSaida({ aoRegistrar });
  const ajuste = useRegistrarAjuste({ aoRegistrar });
  const mut = tipo === 'entrada' ? entrada : tipo === 'saida' ? saida : ajuste;

  const sentido = watch('sentido');
  const lote = watch('lote');
  const mostrarValidade = tipo === 'entrada' || (tipo === 'ajuste' && sentido === 'Entrada');
  const avisoFefo =
    controlaLote &&
    (!lote || lote.trim() === '') &&
    (tipo === 'saida' || (tipo === 'ajuste' && sentido === 'Saida'));

  const submeter = handleSubmit((v) => {
    const base = {
      depositoId: v.depositoId ?? null,
      produtoId: v.produtoId!,
      lote: v.lote?.trim() || null,
      quantidade: v.quantidade!,
      observacao: v.observacao?.trim() || null,
    };
    const onError = (erro: unknown) => notificar.erro(normalizarErro(erro).mensagem);
    if (tipo === 'entrada')
      entrada.mutate(
        { ...base, validadeUtc: v.validadeUtc ?? null, custoUnitario: v.custoUnitario ?? null },
        { onError },
      );
    else if (tipo === 'saida') saida.mutate(base, { onError });
    else
      ajuste.mutate(
        {
          ...base,
          sentido: v.sentido!,
          motivo: v.motivo as never,
          validadeUtc: v.sentido === 'Entrada' ? (v.validadeUtc ?? null) : null,
        },
        { onError },
      );
  });

  return (
    <div className="mx-auto max-w-[520px]">
      <PageHeader titulo={cfg[tipo].titulo} />

      {tipo === 'entrada' && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          title="Entrada sem documento fiscal. Para entrada com nota fiscal e cálculo de custo médio, aguarde a Fase 7 (Compras)."
        />
      )}

      <SectionCard titulo="Lançamento">
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">Depósito</span>
            <Controller
              control={control}
              name="depositoId"
              render={({ field }) => (
                <SelectDeposito
                  value={field.value}
                  onChange={field.onChange}
                  autoPadrao
                  permitirVazio
                />
              )}
            />
            <span className="mt-1 block text-xs text-neutral-500">
              Se vazio, o backend usa o depósito padrão.
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">
              Produto <span className="text-erro">*</span>
            </span>
            <Controller
              control={control}
              name="produtoId"
              render={({ field, fieldState }) => (
                <SelectProduto
                  value={field.value ?? null}
                  status={fieldState.error ? 'error' : undefined}
                  onChange={(id, p) => {
                    field.onChange(id ?? undefined);
                    setControlaLote(!!p?.controlaLote);
                    if (!p?.controlaLote) {
                      setValue('lote', '');
                      setValue('validadeUtc', null);
                    }
                  }}
                />
              )}
            />
          </label>

          {tipo === 'ajuste' && (
            <Controller
              control={control}
              name="sentido"
              render={({ field }) => (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-neutral-600">Sentido *</span>
                  <Radio.Group
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    optionType="button"
                    options={[
                      { label: 'Entrada', value: 'Entrada' },
                      { label: 'Saída', value: 'Saida' },
                    ]}
                  />
                </label>
              )}
            />
          )}

          {(controlaLote || tipo !== 'saida') && (
            <Controller
              control={control}
              name="lote"
              render={({ field }) => (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-neutral-600">
                    Lote {tipo === 'saida' && '(opcional — vazio aplica FEFO)'}
                  </span>
                  <Input className="mono" value={field.value} onChange={field.onChange} disabled={!controlaLote} />
                </label>
              )}
            />
          )}

          {mostrarValidade && controlaLote && (
            <CampoData control={control} name="validadeUtc" label="Validade" />
          )}

          <CampoNumero control={control} name="quantidade" label="Quantidade" obrigatorio min={0} precisao={3} />

          {tipo === 'entrada' && (
            <CampoMoeda control={control} name="custoUnitario" label="Custo unitário (opcional)" />
          )}

          {tipo === 'ajuste' && (
            <CampoSelect
              control={control}
              name="motivo"
              label="Motivo"
              obrigatorio
              options={opcoesDe(rotulosMotivoAjuste)}
            />
          )}

          <Controller
            control={control}
            name="observacao"
            render={({ field }) => (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-600">Observação</span>
                <Input.TextArea rows={2} value={field.value} onChange={field.onChange} />
              </label>
            )}
          />

          {avisoFefo && (
            <Alert
              type="warning"
              showIcon
              title="Sem lote informado, a saída seguirá FEFO — vencimento mais próximo primeiro."
            />
          )}

          <Button type="primary" block loading={mut.isPending} onClick={submeter}>
            Registrar
          </Button>

          {ultimosIds && (
            <p className="m-0 text-center text-sm text-neutral-500">
              {ultimosIds.length} movimento(s) gerado(s).{' '}
              <Link to="/estoque/kardex">Ver no Kardex</Link>
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
