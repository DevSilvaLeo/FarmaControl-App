import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Collapse, Dropdown, Tabs, type MenuProps } from 'antd';
import { ArrowLeftOutlined, MoreOutlined } from '@ant-design/icons';
import { usePermissao } from '@/compartilhado/auth/usePermissao';
import { useBreakpoint } from '@/compartilhado/hooks/useBreakpoint';

export interface AcaoDetalhe {
  chave: string;
  rotulo: string;
  icone?: ReactNode;
  perigo?: boolean;
  permissao?: string;
  desabilitada?: boolean;
  aoClicar: () => void;
}

export interface SecaoDetalhe {
  chave: string;
  titulo: string;
  conteudo: ReactNode;
}

/**
 * Casca de página de Detalhe (`.docs/03` §3.4). Usada quando a entidade tem
 * sub-recursos (endereços/contatos, metas/débitos, Kardex).
 *
 *  - `< lg` : cabeçalho + ações em **action sheet** (`⋯`) + chips de seção roláveis.
 *  - `lg:`  : cabeçalho com **barra de ações visível** + `<Tabs>`.
 *
 * Ações de mudança de estado (`bloquear`, `inativar`…) entram aqui, nunca no
 * formulário de edição (`.spec/03` §3.2). Cada ação respeita sua `permissao`.
 */
export function DetailPage({
  titulo,
  subtitulo,
  statusTag,
  voltarPara,
  acoes = [],
  secoes,
  children,
  auditoria,
}: {
  titulo: string;
  subtitulo?: ReactNode;
  statusTag?: ReactNode;
  voltarPara?: string;
  acoes?: AcaoDetalhe[];
  secoes?: SecaoDetalhe[];
  children?: ReactNode;
  auditoria?: ReactNode;
}) {
  const navigate = useNavigate();
  const { ehDesktop } = useBreakpoint();
  const { tem } = usePermissao();
  const [secaoAtual, setSecaoAtual] = useState(secoes?.[0]?.chave ?? '');

  const acoesLiberadas = useMemo(
    () => acoes.filter((a) => !a.permissao || tem(a.permissao)),
    [acoes, tem],
  );

  const menuAcoes: MenuProps = {
    items: acoesLiberadas.map((a) => ({
      key: a.chave,
      label: a.rotulo,
      icon: a.icone,
      danger: a.perigo,
      disabled: a.desabilitada,
      onClick: a.aoClicar,
    })),
  };

  const secaoAtiva = secoes?.find((s) => s.chave === secaoAtual) ?? secoes?.[0];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          {voltarPara != null && (
            <Button
              type="text"
              aria-label="Voltar"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(voltarPara)}
              className="-ml-2 mt-0.5"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="m-0 text-xl font-semibold text-neutral-800 lg:text-2xl">{titulo}</h1>
              {statusTag}
            </div>
            {subtitulo != null && <p className="mt-1 mb-0 text-sm text-neutral-500">{subtitulo}</p>}
          </div>

          {acoesLiberadas.length > 0 &&
            (ehDesktop ? (
              <div className="flex shrink-0 flex-wrap gap-2">
                {acoesLiberadas.map((a) => (
                  <Button
                    key={a.chave}
                    danger={a.perigo}
                    disabled={a.desabilitada}
                    icon={a.icone}
                    onClick={a.aoClicar}
                  >
                    {a.rotulo}
                  </Button>
                ))}
              </div>
            ) : (
              <Dropdown menu={menuAcoes} trigger={['click']} placement="bottomRight">
                <Button aria-label="Mais ações" icon={<MoreOutlined />} />
              </Dropdown>
            ))}
        </div>
      </header>

      {secoes && secoes.length > 0 ? (
        ehDesktop ? (
          <Tabs
            activeKey={secaoAtual}
            onChange={setSecaoAtual}
            items={secoes.map((s) => ({ key: s.chave, label: s.titulo, children: s.conteudo }))}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist">
              {secoes.map((s) => (
                <button
                  key={s.chave}
                  type="button"
                  role="tab"
                  aria-selected={s.chave === secaoAtual}
                  onClick={() => setSecaoAtual(s.chave)}
                  className={[
                    'shrink-0 rounded-full border px-3 py-1 text-sm',
                    s.chave === secaoAtual
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-600',
                  ].join(' ')}
                >
                  {s.titulo}
                </button>
              ))}
            </div>
            <div>{secaoAtiva?.conteudo}</div>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-6">{children}</div>
      )}

      {auditoria != null && (
        <Collapse
          ghost
          size="small"
          items={[
            { key: 'auditoria', label: 'Detalhes de auditoria', children: auditoria },
          ]}
        />
      )}
    </div>
  );
}
