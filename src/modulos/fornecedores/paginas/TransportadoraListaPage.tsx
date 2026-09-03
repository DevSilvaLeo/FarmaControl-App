import { ParceiroListaPage } from '../componentes/ParceiroListaPage';
import { useListarTransportadoras } from '../hooks/useParceiros';

export function TransportadoraListaPage() {
  return (
    <ParceiroListaPage
      titulo="Transportadoras"
      descricao="Transportadoras de entrega."
      rotaBase="/transportadoras"
      usarConsulta={useListarTransportadoras}
    />
  );
}
