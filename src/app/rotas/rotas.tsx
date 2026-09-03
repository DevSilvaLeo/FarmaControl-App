import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { EntrarPage } from '@/app/paginas/EntrarPage';
import { PainelPage } from '@/app/paginas/PainelPage';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { DiagnosticoPage } from '@/modulos/diagnostico/paginas/DiagnosticoPage';
import { EstiloShowcasePage } from '@/modulos/estilo/EstiloShowcasePage';
import { ListaProtatipoPage } from '@/modulos/estilo/ListaProtatipoPage';
import { FormProtatipoPage } from '@/modulos/estilo/FormProtatipoPage';

/**
 * Roteamento esqueleto (`.spec/04` §4.3 item 6). Guarda de autenticação/
 * permissão entra na Etapa 3 (`.spec/06` §6.10).
 *
 * `/estilo` é o showcase do UI Kit (`.spec/05` §5.8) — sem item de menu,
 * acesso por URL direta.
 */
export function Rotas() {
  return (
    <Routes>
      <Route path="/entrar" element={<EntrarPage />} />

      <Route path="/" element={<AppShell />}>
        <Route index element={<PainelPage />} />
        <Route path="diagnostico" element={<DiagnosticoPage />} />
        <Route path="estilo" element={<EstiloShowcasePage />} />
        <Route path="estilo/lista" element={<ListaProtatipoPage />} />
        <Route path="estilo/formulario" element={<FormProtatipoPage />} />
        <Route path="*" element={<NaoEncontradoPage />} />
      </Route>
    </Routes>
  );
}
