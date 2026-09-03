import { useState } from 'react';
import { Button, Divider } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { StatusTag, TagAtivo } from '@/compartilhado/ui/StatusTag';
import { SemaforoValidade } from '@/compartilhado/ui/SemaforoValidade';
import { KpiCard } from '@/compartilhado/ui/KpiCard';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { MoneyInput } from '@/compartilhado/ui/MoneyInput';
import { DatePickerBr } from '@/compartilhado/ui/DatePickerBr';
import { DataHora } from '@/compartilhado/ui/DataHora';
import { SelectAutocomplete, type OpcaoAutocomplete } from '@/compartilhado/ui/SelectAutocomplete';
import { CampoCep } from '@/compartilhado/ui/CampoCep';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { LinhaDoTempoDeStatus } from '@/compartilhado/ui/LinhaDoTempoDeStatus';
import { primary, neutral, semantic } from '@/compartilhado/tema/tokens';
import { IconeLote, IconeDeposito, IconeControlado } from '@/compartilhado/ui/icones';

const AMOSTRA_CIDADES: OpcaoAutocomplete[] = [
  { value: 1, label: 'São Paulo — SP' },
  { value: 2, label: 'Campinas — SP' },
  { value: 3, label: 'Ribeirão Preto — SP' },
];

function Swatch({ nome, hex }: { nome: string; hex: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-8 w-8 shrink-0 rounded-md border border-neutral-200"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs">
        <span className="block font-medium text-neutral-700">{nome}</span>
        <span className="mono text-neutral-500">{hex}</span>
      </span>
    </div>
  );
}

/**
 * Showcase interno (`.spec/05` §5.8, `.docs/04` §4.7). Referência viva dos
 * tokens e componentes do UI Kit. Sem item de menu — acesso por `/estilo`.
 * Revisar em 375 / 768 / 1280.
 */
export function EstiloShowcasePage() {
  const [confirmar, setConfirmar] = useState(false);
  const [moeda, setMoeda] = useState<number | null>(1234.5);
  const [data, setData] = useState<string | null>(null);
  const [cidade, setCidade] = useState<number | string | null>(null);
  const [cep, setCep] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="UI Kit — Showcase"
        descricao="Tokens e componentes de compartilhado/ui. Verifique em 375 / 768 / 1280 px."
      />

      <SectionCard titulo="Paleta — Azul Clínico">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Swatch nome="primary/600" hex={primary[600]} />
          <Swatch nome="primary/700" hex={primary[700]} />
          <Swatch nome="primary/100" hex={primary[100]} />
          <Swatch nome="neutral/800" hex={neutral[800]} />
          <Swatch nome="neutral/500" hex={neutral[500]} />
          <Swatch nome="sucesso" hex={semantic.sucesso} />
          <Swatch nome="alerta" hex={semantic.alerta} />
          <Swatch nome="erro" hex={semantic.erro} />
        </div>
      </SectionCard>

      <SectionCard titulo="Tipografia">
        <div className="flex flex-col gap-1">
          <p className="m-0 text-2xl font-semibold text-neutral-800">Display / H1 — 24/30px</p>
          <p className="m-0 text-lg font-semibold text-neutral-800">H2 seção — 18px</p>
          <p className="m-0 text-sm text-neutral-700">Body — 14px, o texto padrão das telas.</p>
          <p className="m-0 text-xs text-neutral-500">Caption — 12px, ajuda e metadados.</p>
          <p className="m-0 mono text-sm">Mono — 7891234560012 · NCM 30049099</p>
        </div>
      </SectionCard>

      <SectionCard titulo="StatusTag e SemaforoValidade">
        <div className="flex flex-wrap items-center gap-2">
          <TagAtivo ativo />
          <TagAtivo ativo={false} />
          <StatusTag variante="bloqueado" />
          <StatusTag variante="padrao" />
          <StatusTag variante="sistema" />
        </div>
        <Divider className="my-3" />
        <div className="flex flex-wrap items-center gap-2">
          <SemaforoValidade dias={-3} />
          <SemaforoValidade dias={5} />
          <SemaforoValidade dias={20} />
          <SemaforoValidade dias={70} />
          <SemaforoValidade dias={200} />
        </div>
      </SectionCard>

      <SectionCard titulo="KpiCard">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard rotulo="Produtos abaixo do mínimo" valor={12} severidade="atencao" icone={IconeDeposito} />
          <KpiCard rotulo="Lotes a vencer em 30 dias" valor={4} severidade="critico" icone={IconeLote} />
          <KpiCard rotulo="Clientes bloqueados" valor={0} severidade="positivo" icone={IconeControlado} />
        </div>
      </SectionCard>

      <SectionCard titulo="Campos">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">MoneyInput</span>
            <MoneyInput value={moeda} onChange={setMoeda} aria-label="Valor de exemplo" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">DatePickerBr</span>
            <DatePickerBr value={data} onChange={setData} aria-label="Data de exemplo" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">SelectAutocomplete</span>
            <SelectAutocomplete
              value={cidade}
              onChange={setCidade}
              aria-label="Cidade"
              buscar={async (termo) =>
                AMOSTRA_CIDADES.filter((c) => c.label.toLowerCase().includes(termo.toLowerCase()))
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">CampoCep</span>
            <CampoCep
              value={cep}
              onChange={setCep}
              consultarCep={async (d) =>
                d === '13010000'
                  ? { cep: d, logradouro: 'Rua Exemplo', bairro: 'Centro', cidadeNome: 'Campinas', uf: 'SP' }
                  : null
              }
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          DataHora (exibição): <DataHora valorUtc={new Date().toISOString()} />
        </p>
      </SectionCard>

      <SectionCard titulo="ConfirmDialog">
        <Button danger onClick={() => setConfirmar(true)}>
          Abrir confirmação com motivo
        </Button>
        <ConfirmDialog
          aberto={confirmar}
          titulo="Bloquear cliente?"
          descricao="O cliente não poderá receber novos pedidos até ser desbloqueado."
          rotuloConfirmar="Bloquear"
          perigo
          exigirMotivo
          aoConfirmar={() => setConfirmar(false)}
          aoCancelar={() => setConfirmar(false)}
        />
      </SectionCard>

      <SectionCard titulo="EmptyState">
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState titulo="Nenhum registro cadastrado" descricao="Crie o primeiro registro." />
          <EmptyState
            variante="semResultado"
            titulo="Nenhum resultado para o filtro"
            aoLimparFiltros={() => undefined}
          />
        </div>
      </SectionCard>

      <SectionCard titulo="LinhaDoTempoDeStatus (antecipado)">
        <LinhaDoTempoDeStatus
          eventos={[
            { status: 'Rascunho', usuario: 'ana.souza', dataHoraUtc: '2026-08-30T12:00:00Z' },
            { status: 'Aprovado', usuario: 'ana.souza', dataHoraUtc: '2026-08-31T09:30:00Z', cor: 'green' },
          ]}
        />
      </SectionCard>
    </div>
  );
}
