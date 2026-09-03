import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, InputNumber, Switch } from 'antd';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import { GridEmbutido, type ColunaGrid } from '@/compartilhado/ui/GridEmbutido';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { MoneyInput } from '@/compartilhado/ui/MoneyInput';

interface UnidadeAlt {
  unidade: string;
  fator: number;
  compra: boolean;
  venda: boolean;
}

const colunasUnidades: ColunaGrid<UnidadeAlt>[] = [
  {
    chave: 'unidade',
    titulo: 'Unidade',
    larguraLg: 160,
    render: (l, up) => (
      <Input value={l.unidade} onChange={(e) => up({ unidade: e.target.value })} placeholder="CX, FR…" />
    ),
  },
  {
    chave: 'fator',
    titulo: 'Fator de conversão',
    larguraLg: 180,
    render: (l, up) => (
      <InputNumber
        className="w-full"
        min={0}
        value={l.fator}
        onChange={(v) => up({ fator: Number(v ?? 0) })}
      />
    ),
  },
  {
    chave: 'compra',
    titulo: 'É unidade de compra',
    larguraLg: 150,
    render: (l, up) => <Switch checked={l.compra} onChange={(v) => up({ compra: v })} />,
  },
  {
    chave: 'venda',
    titulo: 'É unidade de venda',
    larguraLg: 150,
    render: (l, up) => <Switch checked={l.venda} onChange={(v) => up({ venda: v })} />,
  },
];

/**
 * Protótipo de FORMULÁRIO + DETALHE (`.docs/05` §5.4). Demonstra `FormPage`
 * (abas → etapas no mobile), `GridEmbutido` (cards → tabela) e `DetailPage`
 * (ações em `⋯` no mobile → barra visível no desktop).
 */
export function FormProtatipoPage() {
  const [preco, setPreco] = useState<number | null>(19.9);
  const [unidades, setUnidades] = useState<UnidadeAlt[]>([
    { unidade: 'CX', fator: 12, compra: true, venda: false },
  ]);

  return (
    <div className="flex flex-col gap-8">
      <FormPage
        titulo="Protótipo — Formulário"
        descricao={
          <>
            &lt;768 fluxo em etapas · ≥768 abas · ≥1024 abas + ações fixas.{' '}
            <Link to="/estilo">voltar ao showcase</Link>
          </>
        }
        voltarPara="/estilo"
        aoSalvar={() => undefined}
        abas={[
          {
            chave: 'gerais',
            titulo: 'Dados gerais',
            conteudo: (
              <SectionCard titulo="Identificação">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-neutral-600">Descrição *</span>
                    <Input placeholder="Descrição do produto" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-neutral-600">Código de barras</span>
                    <Input className="mono" placeholder="7891234560012" />
                  </label>
                </div>
              </SectionCard>
            ),
          },
          {
            chave: 'precos',
            titulo: 'Preços',
            conteudo: (
              <SectionCard titulo="Preços">
                <label className="block max-w-xs">
                  <span className="mb-1 block text-sm font-medium text-neutral-600">Preço de venda *</span>
                  <MoneyInput value={preco} onChange={setPreco} aria-label="Preço de venda" />
                </label>
              </SectionCard>
            ),
          },
          {
            chave: 'estoque',
            titulo: 'Estoque',
            conteudo: (
              <SectionCard
                titulo="Unidades alternativas"
                descricao="Grid embutido: cards no mobile, tabela no desktop."
              >
                <GridEmbutido<UnidadeAlt>
                  valor={unidades}
                  aoMudar={setUnidades}
                  colunas={colunasUnidades}
                  novaLinha={() => ({ unidade: '', fator: 1, compra: false, venda: false })}
                  rotuloAdicionar="Adicionar unidade"
                  confirmarAoRemover
                />
              </SectionCard>
            ),
          },
          {
            chave: 'fiscal',
            titulo: 'Fiscal',
            conteudo: (
              <SectionCard titulo="Fiscal">
                <label className="block max-w-xs">
                  <span className="mb-1 block text-sm font-medium text-neutral-600">NCM</span>
                  <Input className="mono" maxLength={8} placeholder="30049099" />
                </label>
              </SectionCard>
            ),
          },
        ]}
      />

      <DetailPage
        titulo="Protótipo — Detalhe"
        subtitulo="Ações em ⋯ no mobile, barra visível no desktop."
        statusTag={<StatusTag variante="ativo" />}
        voltarPara="/estilo"
        acoes={[
          { chave: 'editar', rotulo: 'Editar', aoClicar: () => undefined },
          { chave: 'inativar', rotulo: 'Inativar', perigo: true, aoClicar: () => undefined },
        ]}
        secoes={[
          { chave: 'dados', titulo: 'Dados', conteudo: <p className="text-neutral-600">Conteúdo de dados…</p> },
          { chave: 'enderecos', titulo: 'Endereços', conteudo: <p className="text-neutral-600">Lista de endereços…</p> },
          { chave: 'contatos', titulo: 'Contatos', conteudo: <p className="text-neutral-600">Lista de contatos…</p> },
        ]}
        auditoria={
          <dl className="grid grid-cols-2 gap-1 text-sm text-neutral-500">
            <dt>Criado em</dt>
            <dd>10/03/2026 09:12 · ana.souza</dd>
            <dt>Alterado em</dt>
            <dd>12/03/2026 14:40 · joao.silva</dd>
          </dl>
        }
      />
    </div>
  );
}
