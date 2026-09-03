import type { UseQueryResult } from '@tanstack/react-query';
import { CheckOutlined, MinusOutlined } from '@ant-design/icons';
import type { PagedResult } from '@/compartilhado/api/tipos';
import { ParceiroListaPage } from '../componentes/ParceiroListaPage';
import { useConsultaRepresentantes } from '../hooks/useParceiros';
import type { ParceiroResumoDto } from '../tipos';

export function RepresentanteListaPage() {
  return (
    <ParceiroListaPage
      titulo="Representantes"
      descricao="Representantes comerciais."
      rotaBase="/representantes"
      semPaginacao
      usarConsulta={
        useConsultaRepresentantes as unknown as (p: {
          pagina: number;
          tamanhoPagina: number;
          termoBusca?: string;
          incluirInativos: boolean;
        }) => UseQueryResult<PagedResult<ParceiroResumoDto>>
      }
      colunasExtra={[
        {
          title: 'Assina licitação',
          dataIndex: 'habilitadoAssinarLicitacao' as never,
          align: 'center',
          apenasDesktop: true,
          render: (v: boolean) =>
            v ? (
              <CheckOutlined className="text-sucesso" />
            ) : (
              <MinusOutlined className="text-neutral-300" />
            ),
        },
      ]}
    />
  );
}
