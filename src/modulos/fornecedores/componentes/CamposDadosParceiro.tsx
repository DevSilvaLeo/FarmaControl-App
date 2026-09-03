import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Radio } from 'antd';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoData } from '@/compartilhado/ui/campos';
import { formatarCnpj, formatarCpf } from '@/compartilhado/utils/cpfCnpj';
import { CampoEndereco } from '@/modulos/geografia/componentes/CampoEndereco';

/**
 * Bloco de identificação comum a Fornecedor / Transportadora / Representante
 * (`.spec/08` §8.2) — nunca copiado e colado. As chaves de campo são fixas
 * (as do `parceiroSchema`).
 */
export function CamposDadosParceiro<T extends FieldValues>({
  control,
  ehFisica,
}: {
  control: Control<T>;
  ehFisica: boolean;
}) {
  const n = (k: string) => k as Path<T>;

  return (
    <div className="flex flex-col gap-6">
      <SectionCard titulo="Identificação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name={n('tipoPessoa')}
            render={({ field }) => (
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-neutral-600">Tipo de pessoa *</span>
                <Radio.Group
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  optionType="button"
                  options={[
                    { label: 'Jurídica', value: 'Juridica' },
                    { label: 'Física', value: 'Fisica' },
                  ]}
                />
              </label>
            )}
          />
          <Controller
            control={control}
            name={n('cpfCnpj')}
            render={({ field, fieldState }) => (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-600">
                  {ehFisica ? 'CPF' : 'CNPJ'} <span className="text-erro">*</span>
                </span>
                <input
                  className={`mono w-full rounded-md border px-3 py-1.5 text-sm ${
                    fieldState.error ? 'border-erro' : 'border-neutral-300'
                  }`}
                  inputMode="numeric"
                  placeholder={ehFisica ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(ehFisica ? formatarCpf(e.target.value) : formatarCnpj(e.target.value))
                  }
                  onBlur={field.onBlur}
                />
                {fieldState.error && (
                  <span className="mt-1 block text-xs text-erro">{fieldState.error.message}</span>
                )}
              </label>
            )}
          />
          <CampoTexto
            control={control}
            name={n('inscricaoEstadualRg')}
            label={ehFisica ? 'RG' : 'Inscrição Estadual'}
          />
          <CampoTexto
            control={control}
            name={n('razaoSocial')}
            label={ehFisica ? 'Nome completo' : 'Razão Social'}
            obrigatorio
            maxLength={120}
          />
          <CampoTexto control={control} name={n('nomeFantasia')} label="Nome Fantasia" />
          <CampoTexto control={control} name={n('ramo')} label="Ramo de atividade" />
          <CampoTexto control={control} name={n('email')} label="Email" tipo="email" />
          <CampoTexto control={control} name={n('telefone')} label="Telefone" />
        </div>
      </SectionCard>

      <SectionCard titulo="Endereço">
        <CampoEndereco
          control={control}
          nomes={{
            cep: n('cep'),
            logradouro: n('logradouro'),
            numero: n('numero'),
            complemento: n('complemento'),
            bairro: n('bairro'),
            cidadeId: n('cidadeId'),
          }}
        />
      </SectionCard>

      <SectionCard titulo="Regulatório">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto control={control} name={n('alvara')} label="Alvará" />
          <CampoData control={control} name={n('validadeAlvaraUtc')} label="Validade do alvará" />
          <CampoTexto control={control} name={n('responsavelTecnico')} label="Responsável técnico" />
          <CampoTexto control={control} name={n('registroConselho')} label="Registro no conselho" />
        </div>
      </SectionCard>
    </div>
  );
}
