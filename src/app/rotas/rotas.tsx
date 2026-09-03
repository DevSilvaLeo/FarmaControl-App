import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { EntrarPage } from '@/app/paginas/EntrarPage';
import { PainelPage } from '@/app/paginas/PainelPage';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { DiagnosticoPage } from '@/modulos/diagnostico/paginas/DiagnosticoPage';

/**
 * Roteamento esqueleto da Etapa 0 (`.spec/04` §4.3 item 6).
 * Nesta etapa NÃO há guarda de autenticação: todas as rotas privadas são
 * acessíveis de propósito, para permitir revisar o layout sem login. O
 * `GuardaAutenticacao`/`GuardaPermissao` entram na Etapa 3 (`.spec/06` §6.10).
 */
export function Rotas() {
  return (
    <Routes>
      <Route path="/entrar" element={<EntrarPage />} />

      <Route path="/" element={<AppShell />}>
        <Route index element={<PainelPage />} />
        <Route path="diagnostico" element={<DiagnosticoPage />} />
        <Route path="*" element={<NaoEncontradoPage />} />
      </Route>
    </Routes>
  );
}
