---
título: Fase 0 — Fundação do Frontend
versão do documento: 1.0
data: 2026-09-02
espelha: .docs/02-fase-0-fundacao.md (backend)
---

# 04 — Fase 0: Fundação do Frontend

## 4.1 Objetivo da fase

Entregar o esqueleto do projeto: build funcionando, layout base navegável
(sem dados reais ainda), tema visual, roteamento público/privado, e a
primeira tela real consumindo a API (`/api/diagnostico`, já existente no
backend) — provando a integração ponta a ponta antes de construir qualquer
tela de negócio. Equivalente em espírito à Fase 0 do backend: "sem regra de
negócio ainda" (`.docs/02` backend).

## 4.2 Pré-requisitos (a confirmar com o backend antes de iniciar)

- [ ] CORS habilitado na API para a origem do frontend (dev:
  `http://localhost:5173` — porta padrão do Vite). Hoje `agents.md`/`.docs`
  do backend não mencionam configuração de CORS explícita — **item a
  levantar com o time de backend antes de começar a Fase 0**, senão a
  primeira chamada HTTP do frontend falha por bloqueio de navegador.
- [ ] Confirmar a porta/URL local da API (`http://localhost:5138`, conforme
  `README.md` do backend) para popular `.env.example`.

## 4.3 Escopo entregue

1. **Scaffold do projeto** (`npm create vite@latest -- --template react-ts`),
   com as pastas descritas em `02-arquitetura-e-estrutura.md` §2.2 já
   criadas (vazias, com `.gitkeep` onde aplicável — mesmo padrão do backend
   em `.docs/01`).
2. **Dependências instaladas e configuradas**: React Router, Ant Design,
   TanStack Query, Axios, Zustand, React Hook Form, Zod, `openapi-typescript`
   (dev dependency), Vitest + Testing Library, Playwright.
3. **`main.tsx`**: composição raiz — `ConfigProvider` do antd (tema
   customizado, `locale={ptBR}` do antd para textos internos de componentes
   como paginação/date picker), `QueryClientProvider`, `BrowserRouter`,
   `ErrorBoundary` global (ver §4.5).
4. **Tema**: paleta de cores definida em `compartilhado/tema/tokens.ts`
   (cor primária, cores de status — sucesso/alerta/erro — tipografia). Sem
   marca definitiva ainda: usar a paleta padrão do Ant Design como
   placeholder documentado, a trocar quando houver definição de identidade
   visual do produto (**ponto em aberto — PAF-01**, ver §4.7).
5. **`AppShell`** (`app/layout/AppShell.tsx`): topbar (logo/nome do sistema,
   empresa atual somente-leitura — ver `02` §2.7, menu do usuário com
   Minha Conta/Sair) + sidebar de navegação (colapsável, itens ainda
   estáticos nesta fase, sem filtro de permissão — isso entra na Fase 1/2)
   + área de conteúdo com breadcrumb.
6. **Roteamento esqueleto**: rota pública `/entrar` (placeholder, tela real
   na Fase 2) e rota privada raiz `/` renderizando o `AppShell` com uma
   página inicial simples. Guard de autenticação ainda não funcional (Fase
   2) — nesta fase todas as rotas privadas são acessíveis, propositalmente,
   para permitir navegar e revisar o layout sem precisar de login.
7. **Página de diagnóstico** (`/diagnostico`, acessível pelo rodapé do
   menu): consome `GET /api/diagnostico` (endpoint já existente, sem
   autenticação) via TanStack Query, exibindo nome da app, versão, ambiente
   e hora UTC do servidor — prova que o cliente HTTP básico funciona antes
   de existir qualquer outra funcionalidade. Espelha o propósito do
   `DiagnosticoController` no backend: smoke test.
8. **Lint/format**: ESLint (config `typescript-eslint` + `eslint-plugin-react`
   + `eslint-plugin-react-hooks`) e Prettier, com regra obrigatória de
   nomes de negócio em PT-BR (§3.1) verificável apenas por revisão (não há
   lint automático de idioma — item de checklist humano).
9. **CI mínimo** (`.github/workflows/ci.yml`): `npm ci`, `npm run lint`,
   `npm run typecheck`, `npm run test:unit`. Build (`npm run build`) roda
   como gate obrigatório de todo PR.

## 4.4 Estrutura do menu (placeholder desta fase, populado nas fases seguintes)

```
FarmaControl
├─ Painel (placeholder)
├─ Cadastros
│  ├─ Produtos           (Fase 3)
│  ├─ Clientes            (Fase 3)
│  ├─ Fornecedores        (Fase 4)
│  ├─ Transportadoras      (Fase 4)
│  ├─ Representantes      (Fase 4)
│  └─ Vendedores          (Fase 4)
├─ Estoque
│  ├─ Depósitos           (Fase 5)
│  ├─ Posição             (Fase 5)
│  ├─ Kardex              (Fase 5)
│  └─ Lotes a vencer      (Fase 5)
├─ Sistema
│  ├─ Empresas e Filiais  (Fase 2)
│  ├─ Usuários            (Fase 2)
│  └─ Perfis e Permissões (Fase 2)
└─ Diagnóstico            (Fase 0 — esta fase)
```

Nesta fase, o menu é **estático** (todos os itens visíveis, sem filtro por
permissão e sem dado real por trás) — serve para validar a navegação e o
layout com o time antes de conectar dados. O filtro por permissão entra
junto da Fase 2 (autenticação/RBAC).

## 4.5 Tratamento global de erro (esqueleto)

`ErrorBoundary` de nível de aplicação captura qualquer erro de renderização
não tratado e mostra uma tela de fallback ("Algo deu errado — recarregar
página"), nunca uma tela branca. O tratamento fino de erro de API (toasts,
erros de formulário) entra na Fase 1 (`05-fase-1-cross-cutting.md`) — nesta
fase só existe a rede de segurança de último nível.

## 4.6 Critério de pronto (Fase 0)

- `npm run build` e `npm run dev` funcionam sem erro.
- `npm run lint` e `npm run typecheck` passam limpos.
- Layout base (topbar + sidebar + conteúdo) renderiza e é navegável nas
  rotas placeholder.
- Página de Diagnóstico exibe dados reais vindos da API rodando localmente
  (prova de integração ponta a ponta).
- CI verde no primeiro PR.

## 4.7 Pontos em aberto desta fase

- **PAF-01**: Identidade visual (paleta de marca, logo) ainda não definida
  — usar tema padrão do Ant Design como placeholder documentado até
  definição do cliente/PO.
- **PAF-02**: Confirmar com o backend a configuração de CORS antes do
  início da Fase 0 (bloqueante — ver §4.2).
