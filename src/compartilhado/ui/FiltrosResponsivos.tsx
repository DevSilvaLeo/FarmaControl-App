import { useState, type ReactNode } from 'react';
import { Badge, Button, Drawer } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useBreakpoint } from '@/compartilhado/hooks/useBreakpoint';

/**
 * Filtros de lista com adaptação obrigatória (`agents.md` §4.2, `.docs/03` §3.2):
 *  - `< md` : escondidos atrás de um botão "Filtros" (bottom sheet) — a busca
 *             textual fica sempre visível FORA deste componente.
 *  - `md:`  : barra parcialmente visível acima da tabela.
 *  - `lg:`  : barra de filtros completa.
 *
 * Os controles filhos aplicam o filtro ao vivo (via seu próprio `onChange`);
 * no bottom sheet, "Aplicar" apenas fecha e "Limpar" chama `aoLimpar`.
 */
export function FiltrosResponsivos({
  children,
  qtdAtivos = 0,
  aoLimpar,
  rotuloBotao = 'Filtros',
}: {
  children: ReactNode;
  qtdAtivos?: number;
  aoLimpar?: () => void;
  rotuloBotao?: string;
}) {
  const { ehMobile } = useBreakpoint();
  const [aberto, setAberto] = useState(false);

  if (!ehMobile) {
    return <div className="flex flex-wrap items-center gap-2">{children}</div>;
  }

  return (
    <>
      <Badge count={qtdAtivos} size="small" offset={[-2, 2]}>
        <Button icon={<FilterOutlined />} onClick={() => setAberto(true)}>
          {rotuloBotao}
        </Button>
      </Badge>

      <Drawer
        title="Filtros"
        placement="bottom"
        styles={{ wrapper: { height: 'auto', maxHeight: '80vh' } }}
        open={aberto}
        onClose={() => setAberto(false)}
        footer={
          <div className="flex justify-between gap-2">
            <Button
              onClick={() => {
                aoLimpar?.();
              }}
              disabled={qtdAtivos === 0}
            >
              Limpar
            </Button>
            <Button type="primary" onClick={() => setAberto(false)}>
              Aplicar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">{children}</div>
      </Drawer>
    </>
  );
}
