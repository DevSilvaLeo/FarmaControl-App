import { useMemo, useState } from 'react';
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Select } from 'antd';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoCep } from '@/compartilhado/ui/CampoCep';
import { SelectAutocomplete } from '@/compartilhado/ui/SelectAutocomplete';
import { useEstados } from '../hooks/useGeografia';
import { geografiaApi } from '../api';

export interface NomesEndereco<T extends FieldValues> {
  cep: Path<T>;
  logradouro: Path<T>;
  numero: Path<T>;
  complemento: Path<T>;
  bairro: Path<T>;
  cidadeId: Path<T>;
}

/**
 * Bloco de endereço reutilizável (`.docs/07` §7.1): CEP com autopreenchimento
 * (`GET /geografia/ceps/{n}`) + Estado/Cidade (autocomplete escopado pelo
 * Estado — `GET /geografia/estados/{id}/cidades?termoBusca=`).
 *
 * O backend só guarda `cidadeId`; `estadoId` é auxiliar de UI para escopar a
 * busca de cidade.
 */
export function CampoEndereco<T extends FieldValues>({
  control,
  nomes,
  disabled,
  cidadeLabelInicial,
}: {
  control: Control<T>;
  nomes: NomesEndereco<T>;
  disabled?: boolean;
  /** Rótulo da cidade já selecionada (ao editar) — o DTO só traz o id. */
  cidadeLabelInicial?: string;
}) {
  const { data: estados = [] } = useEstados();
  const [estadoId, setEstadoId] = useState<number>();

  const cepCtl = useController({ control, name: nomes.cep });
  const cidadeCtl = useController({ control, name: nomes.cidadeId });
  const logradouroCtl = useController({ control, name: nomes.logradouro });
  const bairroCtl = useController({ control, name: nomes.bairro });

  const opcaoCidade = useMemo(() => {
    const id = cidadeCtl.field.value as number | null | undefined;
    if (id == null) return null;
    return { value: id, label: cidadeLabelInicial ?? `Cidade #${id}` };
  }, [cidadeCtl.field.value, cidadeLabelInicial]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-600">CEP</span>
        <CampoCep
          value={(cepCtl.field.value as string) ?? ''}
          onChange={cepCtl.field.onChange}
          disabled={disabled}
          consultarCep={async (digitos) => {
            try {
              const r = await geografiaApi.consultarCep(digitos);
              return {
                cep: r.numero,
                logradouro: r.logradouro ?? undefined,
                bairro: r.bairro ?? undefined,
                cidadeId: r.cidadeId,
                cidadeNome: r.cidade ?? undefined,
                uf: r.uf ?? undefined,
              };
            } catch {
              return null;
            }
          }}
          aoResolverEndereco={(end) => {
            if (end.logradouro) logradouroCtl.field.onChange(end.logradouro);
            if (end.bairro) bairroCtl.field.onChange(end.bairro);
            if (end.cidadeId) cidadeCtl.field.onChange(end.cidadeId);
            const uf = end.uf?.toUpperCase();
            const est = uf ? estados.find((e) => e.uf.toUpperCase() === uf) : undefined;
            if (est) setEstadoId(est.id);
          }}
        />
      </label>

      <CampoTexto control={control} name={nomes.logradouro} label="Logradouro" disabled={disabled} />
      <CampoTexto control={control} name={nomes.numero} label="Número" disabled={disabled} />
      <CampoTexto control={control} name={nomes.complemento} label="Complemento" disabled={disabled} />
      <CampoTexto control={control} name={nomes.bairro} label="Bairro" disabled={disabled} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-600">Estado</span>
        <Select
          className="w-full"
          showSearch
          allowClear
          disabled={disabled}
          placeholder="UF"
          value={estadoId}
          onChange={(v) => {
            setEstadoId(v ?? undefined);
            cidadeCtl.field.onChange(null);
          }}
          optionFilterProp="label"
          options={estados.map((e) => ({ value: e.id, label: `${e.uf} — ${e.nome}` }))}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-600">Cidade</span>
        <SelectAutocomplete
          value={(cidadeCtl.field.value as number) ?? null}
          onChange={(v) => cidadeCtl.field.onChange(v)}
          opcaoSelecionada={opcaoCidade}
          dependeDe={estadoId}
          disabled={disabled || estadoId == null}
          placeholder={estadoId == null ? 'Selecione o estado primeiro' : 'Digite para buscar'}
          buscar={async (termo) => {
            if (estadoId == null) return [];
            const cidades = await geografiaApi.buscarCidades(estadoId, termo);
            return cidades.map((c) => ({ value: c.id, label: c.nome }));
          }}
        />
      </label>
    </div>
  );
}
