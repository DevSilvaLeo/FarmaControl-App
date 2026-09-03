---
título: Fluxo de UX — Autenticação, RBAC e Sistema (Etapa 3)
versão do documento: 1.0
data: 2026-09-02
espelha: .spec/06-fase-2-autenticacao.md (contrato de API é lá; aqui é UX/layout)
---

# 06 — Fluxo de UX: Autenticação e Sistema

Detalhe de design das telas da Etapa 3. O contrato de API, os endpoints e os
DTOs estão em `.spec/06` — este documento não os repete; cobre layout,
responsividade, microcopy e estados.

## 6.1 Login (`/entrar`)

**Layout.** Página **fora do AppShell** — sem topbar, sem sidebar, sem
bottom nav. Fundo `corFundoApp`; card branco `rounded-lg` `shadow-md`
centralizado, `max-width: 400px`, padding `24px`. Mobile: card ocupa a
largura menos `16px` de cada lado, centrado verticalmente com folga mínima
de `24px` no topo.

```
            [ Marca — wordmark ]
   ┌───────────────────────────────────┐
   │  Entrar                           │
   │  [ Login .......................] │
   │  [ Senha ..................  👁 ] │
   │  [        Entrar (primário)     ] │   ← largura total, ≥44px
   │  <erro inline aqui, se houver>   │
   └───────────────────────────────────┘
        FarmaControl · v0.x  ·  Diagnóstico
```

**Campos.** Login (texto, `autocomplete="username"`, autofoco) e Senha
(`type=password`, botão mostrar/ocultar, `autocomplete="current-password"`).
Validação client-side só "obrigatório" (`.spec/06` §6.2). Submete no `Enter`.

**Estados de erro** (abaixo do botão, `corErro` + ícone, não toast):
- `401` → "Login ou senha inválidos."
- `423` → "Conta bloqueada por tentativas excessivas. Tente novamente mais
  tarde." (o frontend não mostra countdown — não decide o tempo, `.spec/06`
  §6.2).
- `500` → toast genérico.

**Sem** "esqueci minha senha" nesta fase (`.spec/06` §6.2) — reset é
administrativo.

**Resultado.** `Tokens` → navega para `/` (ou para a rota original guardada
pelo `GuardaAutenticacao`). `Desafio` → navega para `/entrar/dois-fatores`
levando `TokenDesafio` em **estado de navegação** (nunca na URL).

## 6.2 Desafio 2FA (`/entrar/dois-fatores`)

Mesmo enquadramento visual do Login (fora do AppShell, card centrado).

**Campo único:** código TOTP de 6 dígitos como **input segmentado** (6
caixas), teclado numérico no mobile (`inputmode="numeric"`,
`autocomplete="one-time-code"`), **auto-submit ao completar 6 dígitos**,
suporte a colar (distribui os 6 dígitos), `Backspace` volta caixa.

**Microcopy varia por `Tipo` do desafio** (`.spec/06` §6.3):
- `DesafioTotp` → "Digite o código do seu aplicativo autenticador."
- `ConfiguracaoTotpObrigatoria` → não pede código; mostra "Seu perfil exige
  verificação em duas etapas. Vamos configurar agora." + botão "Configurar"
  que leva ao fluxo §6.3 usando o token de escopo restrito.

**Erros.** Código inválido → mensagem inline "Código inválido ou expirado.
Tente novamente." e limpa as caixas, foco na primeira. Não conta tentativas
na UI.

**Reenvio/timer:** TOTP não tem reenvio; opcional mostrar um contador visual
de 30s indicando quando o código do app rotaciona (nice-to-have).

## 6.3 Configurar 2FA (dentro de Minha Conta)

Stepper de 2 passos (`<Steps>` no `md:+`, título "Passo X de 2" no mobile):

**Passo 1 — Escanear.** QR Code renderizado 100% client-side a partir de
`UriOtpauth` (`qrcode.react`), `≥ 200px`. Abaixo, o `Segredo` em `mono`,
selecionável, com botão "Copiar" — fallback para quem não escaneia. Texto:
"Abra seu app autenticador (Google Authenticator, Authy, 1Password…) e
escaneie o código, ou insira a chave manualmente."

**Passo 2 — Confirmar.** Input segmentado de 6 dígitos (igual §6.2). "Digite
o código gerado pelo app para confirmar." → chama `ativar`. Erro → mensagem
inline, **mantém o QR do passo 1** (não regenera), permite voltar.

**Sucesso:** `StatusTag` "Dois fatores: ativado" em Minha Conta + toast.

**Desativar 2FA:** `ConfirmDialog` com **campo de senha atual obrigatório**
(`.spec/06` §6.4) — texto de aviso em `corErro`: "Isso reduz a segurança da
sua conta." Botão de confirmação vermelho.

## 6.4 Minha Conta (`/minha-conta`)

Dentro do AppShell. Três `SectionCard` empilhados (mobile) / em coluna única
`max-width: 640px` (desktop — é uma tela de leitura, não precisa de
multi-coluna):

1. **Perfil** (somente leitura): Nome, Login, Email, Empresa · Filial
   (nomes resolvidos, não IDs — `.spec/06` §6.5), lista de Perfis como
   `<Tag>`, "Dois fatores" como `StatusTag`.
2. **Alterar senha**: Senha atual / Nova senha / Confirmar nova senha.
   Confirmação valida client-side (`Zod .refine()` comparando os dois).
   Indicador de força é opcional (o backend não expõe a regra exata —
   `.spec/06` §6.2). Botão "Alterar senha".
3. **Dois fatores**: se desativado, botão "Configurar" → §6.3; se ativado,
   `StatusTag` + botão "Desativar" (com senha, §6.3) + opção "Sair de todos
   os dispositivos" (`logout` com `TodasAsSessoes: true` — `.spec/06` §6.5).

**Sair** (no menu do usuário da topbar): `logout` da sessão atual. Sem
confirmação para o "sair" simples; "sair de todos os dispositivos" fica só em
Minha Conta.

## 6.5 Usuários (`/sistema/usuarios`)

Padrão Lista → Detalhe (`03` §3.2/§3.4). Permissões `Usuarios.Consultar` /
`Usuarios.Gerenciar`.

**Lista.** Colunas desktop: Nome, Login, Email, Status (`StatusTag`), Dois
fatores (ícone ✓/—). Card mobile: Nome + Login em `body-strong`, Email em
`caption`, `StatusTag`. Filtro: busca textual + `incluirInativos`.
`[+ Novo usuário]` sob `<RequerPermissao chave="Usuarios.Gerenciar">`.

**Criar.** Formulário curto (não precisa de abas): Nome, Login, Email, Senha
inicial. Após criar → **vai direto ao Detalhe** para definir perfis
(`.spec/06` §6.6).

**Detalhe.** Cabeçalho com Nome + `StatusTag` + ações (`Editar`, `Redefinir
senha`, `Inativar`/`Reativar`). Seção "Perfis":
- **Desktop:** `<Transfer>` do antd (disponíveis ↔ atribuídos), salva via
  `PUT /usuarios/{id}/perfis`.
- **Mobile:** o `<Transfer>` de duas colunas não cabe — usar **lista de
  perfis com checkbox** (todos os perfis, marcados = atribuídos), mesmo
  payload ao salvar. Botão "Salvar perfis" fixo.

"Redefinir senha": modal com campo de nova senha (uso administrativo,
substitui "esqueci a senha" nesta fase — `.spec/06` §6.6).
"Inativar": `ConfirmDialog`, texto "O usuário não conseguirá mais entrar no
sistema."

## 6.6 Perfis e Permissões (`/sistema/perfis`)

Permissões `Perfis.Consultar` / `Perfis.Gerenciar`.

**Lista.** Nome, Descrição, coluna "Sistema" (`StatusTag` variante `sistema`
para `Sistema=true`). Perfis de sistema: ações Inativar/Renomear
**desabilitadas com tooltip** "Perfil de sistema — não pode ser alterado"
(`.spec/06` §6.7).

**Formulário.** Nome, Descrição (curto, sem abas).

**Detalhe — matriz de permissões.** `GET /permissoes` já vem **agrupado por
módulo** (`ModuloPermissoesDto`) — renderizar **exatamente essa estrutura**:
- **Desktop:** um `SectionCard` por módulo, cada um com um `<Checkbox.Group>`
  das permissões daquele módulo, em grid de 2–3 colunas. Um checkbox
  "Selecionar tudo do módulo" no cabeçalho de cada card.
- **Mobile:** cada módulo é um **accordion** (`<Collapse>`), fechado por
  padrão, com contagem "3/7 selecionadas" no cabeçalho; abre para os
  checkboxes empilhados.
- Salvar → `PUT /perfis/{id}/permissoes` com o array de chaves marcadas.
- Nunca renderizar uma "tabela genérica de permissões soltas" — o agrupamento
  vem pronto (`.spec/06` §6.7).

## 6.7 Empresas e Filiais (`/sistema/empresas`)

Permissões `Empresas.Consultar` / `Empresas.Gerenciar`. Tela de uso raro
(onboarding de empresa do grupo) — sem filtros sofisticados.

**Lista** (sem paginação — `IReadOnlyList`): Razão Social, Nome Fantasia,
CNPJ (`mono`, com máscara), `StatusTag`. Toggle `incluirInativas`.

**Criar:** Razão Social, Nome Fantasia, Documento (CNPJ com máscara).

**Detalhe:** dados da empresa + **sub-tabela "Filiais"**
(`GET/POST /empresas/{id}/filiais`, campo único Nome). Sem editar/inativar
filial (o backend não expõe — a tela não inventa, `.spec/06` §6.8). Mobile:
filiais como lista de cards + botão "Adicionar filial" → drawer.

## 6.8 Menu por permissão + guardas (ativa nesta etapa)

- O menu do AppShell deixa de ser estático: cada item declara sua chave de
  permissão e só renderiza se `usePermissao().tem(chave)` (`.spec/06` §6.9).
  "Diagnóstico" sempre visível.
- Se, após o filtro, um grupo de menu fica vazio, o grupo não aparece.
- Se o usuário tem acesso a **um único** módulo, o bottom nav mobile mostra os
  sub-itens desse módulo direto (evita um bottom nav com 1 item).
- `GuardaAutenticacao`: redireciona para `/entrar` guardando a rota original.
- `GuardaPermissao`: renderiza **"Acesso negado"** (não redireciona em
  silêncio — o usuário precisa entender que o link existe mas ele não tem
  acesso, `.spec/06` §6.10). Página com ícone, texto e botão "Voltar ao
  início".

## 6.9 Microcopy — padrão

- Botões: verbo no infinitivo ("Entrar", "Salvar", "Inativar", "Redefinir
  senha").
- Confirmações: pergunta direta + consequência ("Inativar este usuário? Ele
  não conseguirá mais entrar no sistema.").
- Erros de negócio: mensagem do backend verbatim (`.spec/03` §3.5).
- Nunca "Ops!" / "Algo mágico aconteceu" — tom operacional, direto, PT-BR.

## 6.10 Implementação (Etapa 3 — concluída 2026-09-03)

| Tela / peça | Arquivo |
|---|---|
| Login | `modulos/autenticacao/paginas/EntrarPage.tsx` |
| Desafio 2FA + primeiro acesso | `.../paginas/DoisFatoresPage.tsx` + `componentes/{CampoCodigoTotp,ConfigurarDoisFatores}.tsx` |
| Minha Conta (perfil, senha, 2FA) | `.../paginas/MinhaContaPage.tsx` |
| Usuários (lista/criar/detalhe + perfis) | `modulos/sistema/paginas/Usuario*.tsx` |
| Perfis (lista/form/detalhe + matriz) | `.../paginas/Perfil*.tsx` + `componentes/MatrizPermissoes.tsx` |
| Empresas e Filiais | `.../paginas/Empresa*.tsx` |
| Guardas / sessão / menu | `compartilhado/auth/{BootstrapSessao,GuardaAutenticacao,GuardaPermissao}.tsx`, `app/rotas/mapaDePermissoes.ts`, `app/layout/useMenuVisivel.ts` |
| API (a reconciliar c/ Swagger) | `modulos/autenticacao/api.ts`, `modulos/sistema/api.ts` |

**Pendências conhecidas:**
- Nomes de campo dos DTOs de auth/sistema espelham `.spec/06` mas **não foram
  conferidos contra o Swagger real** — `npm run gerar-tipos` + reconciliar
  `api.gerado.ts` quando a API estiver acessível (`agents.md` §7 itens 1–2).
- Fluxo `ConfiguracaoTotpObrigatoria`: usa o token de desafio como bearer
  temporário para os endpoints de configuração — validar o contrato exato
  com o backend.
- E2E de login (`tests/e2e/login.spec.ts`) pronto mas pulado até haver API de
  teste + `E2E_LOGIN`/`E2E_SENHA`.
