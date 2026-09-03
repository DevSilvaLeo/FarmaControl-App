import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Affix, Button, Grid, Select, Tabs } from 'antd';
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { PageHeader } from './PageHeader';
import { BottomActionBar } from './BottomActionBar';

export interface AbaFormulario {
  chave: string;
  titulo: string;
  conteudo: ReactNode;
  temErro?: boolean;
}

/**
 * Casca de página de formulário (`.spec/05` §5.4, `.docs/03` §3.3, `.docs/04` §4.3).
 *
 * Responsivo:
 *  - `< md` : abas viram fluxo em etapas ("Passo X de N" + seletor + Voltar/Avançar),
 *             ações fixas na `BottomActionBar`.
 *  - `md:`  : `<Tabs>` roláveis, ações no rodapé do card.
 *  - `lg:`  : `<Tabs>` completas, ações em `Affix` no rodapé do card.
 *
 * O `FormPage` NÃO possui o form — a tela hospedeira envolve os campos num
 * `FormProvider` do React Hook Form e passa `aoSalvar` = `handleSubmit(...)`.
 */
export function FormPage({
  titulo,
  descricao,
  abas,
  children,
  aoSalvar,
  aoCancelar,
  salvando = false,
  rotuloSalvar = 'Salvar',
  voltarPara,
}: {
  titulo: string;
  descricao?: ReactNode;
  abas?: AbaFormulario[];
  children?: ReactNode;
  aoSalvar: () => void;
  aoCancelar?: () => void;
  salvando?: boolean;
  rotuloSalvar?: string;
  voltarPara?: string;
}) {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const ehMobile = !screens.md;
  const usarAffix = !!screens.lg;

  const [abaAtual, setAbaAtual] = useState(abas?.[0]?.chave ?? '');
  const indice = useMemo(
    () => (abas ? Math.max(0, abas.findIndex((a) => a.chave === abaAtual)) : 0),
    [abas, abaAtual],
  );

  const cancelar = () => {
    if (aoCancelar) aoCancelar();
    else if (voltarPara) navigate(voltarPara);
    else navigate(-1);
  };

  const botoes = (
    <div className="flex items-center justify-end gap-2">
      <Button onClick={cancelar} disabled={salvando}>
        Cancelar
      </Button>
      <Button type="primary" onClick={aoSalvar} loading={salvando}>
        {rotuloSalvar}
      </Button>
    </div>
  );

  // ---------- Conteúdo ----------
  let corpo: ReactNode;

  if (!abas) {
    corpo = <div className="flex flex-col gap-6">{children}</div>;
  } else if (ehMobile) {
    const aba = abas[indice];
    corpo = (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-neutral-600">
            Passo {indice + 1} de {abas.length}
          </span>
          <Select
            className="min-w-[180px]"
            value={abaAtual}
            onChange={setAbaAtual}
            options={abas.map((a, i) => ({
              value: a.chave,
              label: (
                <span className="flex items-center gap-1">
                  {a.temErro ? (
                    <ExclamationCircleFilled className="text-erro" />
                  ) : (
                    <CheckCircleFilled className="text-neutral-300" />
                  )}
                  {i + 1}. {a.titulo}
                </span>
              ),
            }))}
          />
        </div>
        <div>{aba.conteudo}</div>
        <div className="flex justify-between">
          <Button
            disabled={indice === 0}
            onClick={() => setAbaAtual(abas[Math.max(0, indice - 1)].chave)}
          >
            Voltar
          </Button>
          {indice < abas.length - 1 ? (
            <Button type="primary" onClick={() => setAbaAtual(abas[indice + 1].chave)}>
              Avançar
            </Button>
          ) : (
            <Button type="primary" onClick={aoSalvar} loading={salvando}>
              {rotuloSalvar}
            </Button>
          )}
        </div>
      </div>
    );
  } else {
    corpo = (
      <Tabs
        activeKey={abaAtual}
        onChange={setAbaAtual}
        tabPosition="top"
        items={abas.map((a) => ({
          key: a.chave,
          label: (
            <span className={a.temErro ? 'text-erro' : undefined}>
              {a.temErro && <ExclamationCircleFilled className="mr-1" />}
              {a.titulo}
            </span>
          ),
          children: a.conteudo,
        }))}
      />
    );
  }

  return (
    <>
      <PageHeader titulo={titulo} descricao={descricao} />

      <div className="rounded-lg border border-neutral-200 bg-white p-4 lg:p-6">
        {corpo}

        {!ehMobile &&
          (usarAffix ? (
            <Affix offsetBottom={0}>
              <div className="mt-6 border-t border-neutral-200 bg-white/95 py-3 backdrop-blur">
                {botoes}
              </div>
            </Affix>
          ) : (
            <div className="mt-6 border-t border-neutral-200 pt-3">{botoes}</div>
          ))}
      </div>

      {ehMobile && (
        <BottomActionBar
          secundaria={
            <Button block onClick={cancelar} disabled={salvando}>
              Cancelar
            </Button>
          }
          primaria={
            <Button block type="primary" onClick={aoSalvar} loading={salvando}>
              {rotuloSalvar}
            </Button>
          }
        />
      )}
    </>
  );
}
