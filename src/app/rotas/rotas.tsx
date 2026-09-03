import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { PainelPage } from '@/app/paginas/PainelPage';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { GuardaAutenticacao } from '@/compartilhado/auth/GuardaAutenticacao';
import { GuardaPermissao } from '@/compartilhado/auth/GuardaPermissao';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { DiagnosticoPage } from '@/modulos/diagnostico/paginas/DiagnosticoPage';
import { EstiloShowcasePage } from '@/modulos/estilo/EstiloShowcasePage';
import { ListaProtatipoPage } from '@/modulos/estilo/ListaProtatipoPage';
import { FormProtatipoPage } from '@/modulos/estilo/FormProtatipoPage';
import { EntrarPage } from '@/modulos/autenticacao/paginas/EntrarPage';
import { DoisFatoresPage } from '@/modulos/autenticacao/paginas/DoisFatoresPage';
import { MinhaContaPage } from '@/modulos/autenticacao/paginas/MinhaContaPage';
import { UsuarioListaPage } from '@/modulos/sistema/paginas/UsuarioListaPage';
import { UsuarioFormPage } from '@/modulos/sistema/paginas/UsuarioFormPage';
import { UsuarioDetalhePage } from '@/modulos/sistema/paginas/UsuarioDetalhePage';
import { PerfilListaPage } from '@/modulos/sistema/paginas/PerfilListaPage';
import { PerfilFormPage } from '@/modulos/sistema/paginas/PerfilFormPage';
import { PerfilDetalhePage } from '@/modulos/sistema/paginas/PerfilDetalhePage';
import { EmpresaListaPage } from '@/modulos/sistema/paginas/EmpresaListaPage';
import { EmpresaDetalhePage } from '@/modulos/sistema/paginas/EmpresaDetalhePage';

const com = (chave: string, elemento: ReactNode) => (
  <GuardaPermissao chave={chave}>{elemento}</GuardaPermissao>
);

/**
 * Roteamento (`.spec/02` §2.3, `.spec/06` §6.10). Rotas públicas de
 * autenticação; o restante passa por `GuardaAutenticacao` (sessão) e, quando
 * aplicável, `GuardaPermissao` (mapa em `mapaDePermissoes.ts`).
 */
export function Rotas() {
  return (
    <Routes>
      <Route path="/entrar" element={<EntrarPage />} />
      <Route path="/entrar/dois-fatores" element={<DoisFatoresPage />} />

      <Route element={<GuardaAutenticacao />}>
        <Route path="/" element={<AppShell />}>
          <Route index element={<PainelPage />} />
          <Route path="minha-conta" element={<MinhaContaPage />} />
          <Route path="diagnostico" element={<DiagnosticoPage />} />
          <Route path="estilo" element={<EstiloShowcasePage />} />
          <Route path="estilo/lista" element={<ListaProtatipoPage />} />
          <Route path="estilo/formulario" element={<FormProtatipoPage />} />

          <Route
            path="sistema/usuarios"
            element={com(Permissoes.UsuariosConsultar, <UsuarioListaPage />)}
          />
          <Route
            path="sistema/usuarios/novo"
            element={com(Permissoes.UsuariosGerenciar, <UsuarioFormPage />)}
          />
          <Route
            path="sistema/usuarios/:id"
            element={com(Permissoes.UsuariosConsultar, <UsuarioDetalhePage />)}
          />

          <Route
            path="sistema/perfis"
            element={com(Permissoes.PerfisConsultar, <PerfilListaPage />)}
          />
          <Route
            path="sistema/perfis/novo"
            element={com(Permissoes.PerfisGerenciar, <PerfilFormPage />)}
          />
          <Route
            path="sistema/perfis/:id"
            element={com(Permissoes.PerfisConsultar, <PerfilDetalhePage />)}
          />
          <Route
            path="sistema/perfis/:id/editar"
            element={com(Permissoes.PerfisGerenciar, <PerfilFormPage />)}
          />

          <Route
            path="sistema/empresas"
            element={com(Permissoes.EmpresasConsultar, <EmpresaListaPage />)}
          />
          <Route
            path="sistema/empresas/:id"
            element={com(Permissoes.EmpresasConsultar, <EmpresaDetalhePage />)}
          />

          <Route path="*" element={<NaoEncontradoPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
