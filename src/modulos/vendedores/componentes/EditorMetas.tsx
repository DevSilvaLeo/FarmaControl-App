import { useEffect, useMemo, useState } from 'react';
import { Button, InputNumber } from 'antd';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { GridEmbutido, type ColunaGrid } from '@/compartilhado/ui/GridEmbutido';
import { MoneyInput } from '@/compartilhado/ui/MoneyInput';
import { DatePickerBr } from '@/compartilhado/ui/DatePickerBr';
import type { FaixaMetaEntrada, MetaComissaoDto } from '../tipos';
import { encontrarSobreposicao, type LinhaMeta } from './metasUtil';

/**
 * Editor de faixas de meta de comissão (`.spec/08` §8.6.3). Envia a lista
 * completa (substituição total); valida sobreposição no cliente por
 * conveniência — a autoridade final é o backend (422).
 */
export function EditorMetas({
  metasIniciais,
  salvando,
  aoSalvar,
}: {
  metasIniciais: MetaComissaoDto[];
  salvando: boolean;
  aoSalvar: (faixas: FaixaMetaEntrada[]) => void;
}) {
  const original = useMemo<LinhaMeta[]>(
    () =>
      metasIniciais.map((m) => ({
        inicioUtc: m.metaInicioUtc,
        fimUtc: m.metaFimUtc,
        valorMeta: m.valorMeta,
        percentualComissao: m.percentualComissao,
      })),
    [metasIniciais],
  );
  const [linhas, setLinhas] = useState<LinhaMeta[]>(original);
  useEffect(() => setLinhas(original), [original]);

  const sobreposicao = encontrarSobreposicao(linhas);
  const mudou = JSON.stringify(linhas) !== JSON.stringify(original);

  const colunas: ColunaGrid<LinhaMeta>[] = [
    {
      chave: 'inicio',
      titulo: 'Início',
      larguraLg: 160,
      render: (l, up) => (
        <DatePickerBr value={l.inicioUtc} onChange={(iso) => up({ inicioUtc: iso })} />
      ),
    },
    {
      chave: 'fim',
      titulo: 'Fim',
      larguraLg: 160,
      render: (l, up) => <DatePickerBr value={l.fimUtc} onChange={(iso) => up({ fimUtc: iso })} />,
    },
    {
      chave: 'valor',
      titulo: 'Valor da meta',
      larguraLg: 160,
      render: (l, up) => (
        <MoneyInput value={l.valorMeta} onChange={(v) => up({ valorMeta: v ?? 0 })} aria-label="Valor da meta" />
      ),
    },
    {
      chave: 'pct',
      titulo: '% comissão',
      larguraLg: 120,
      render: (l, up) => (
        <InputNumber
          className="w-full"
          min={0}
          suffix="%"
          value={l.percentualComissao}
          onChange={(v) => up({ percentualComissao: Number(v ?? 0) })}
        />
      ),
    },
  ];

  return (
    <SectionCard
      titulo="Faixas de meta"
      descricao="Enviadas por substituição total ao salvar."
      acoes={
        <Button
          type="primary"
          disabled={!mudou || !!sobreposicao}
          loading={salvando}
          onClick={() =>
            aoSalvar(
              linhas
                .filter((l) => l.inicioUtc && l.fimUtc)
                .map((l) => ({
                  inicioUtc: l.inicioUtc!,
                  fimUtc: l.fimUtc!,
                  valorMeta: l.valorMeta,
                  percentualComissao: l.percentualComissao,
                })),
            )
          }
        >
          Salvar metas
        </Button>
      }
    >
      <GridEmbutido<LinhaMeta>
        valor={linhas}
        aoMudar={setLinhas}
        colunas={colunas}
        novaLinha={() => ({ inicioUtc: null, fimUtc: null, valorMeta: 0, percentualComissao: 0 })}
        rotuloAdicionar="Adicionar faixa"
        avisos={sobreposicao}
      />
    </SectionCard>
  );
}
