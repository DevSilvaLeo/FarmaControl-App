---
título: Fase 2 — Autenticação, RBAC e Sistema
versão do documento: 1.0
data: 2026-09-02
espelha: .docs/09-fase-2-autenticacao.md (backend)
endpoints reais: AutenticacaoController, MinhaContaController, UsuariosController, PerfisController, PermissoesController, EmpresasController
---

# 06 — Fase 2: Autenticação, RBAC e Sistema

## 6.1 Objetivo da fase

Login funcional ponta a ponta (senha + 2FA TOTP), gestão da própria conta, e
as três telas administrativas de RBAC que o backend já entrega nesta mesma
fase: Usuários, Perfis/Permissões e Empresas/Filiais (`.docs/06` D-24: esses
cadastros mínimos entraram na Fase 2 do backend para suportar as FKs de
`Usuario.EmpresaId/FilialId`). Ao final desta fase, o app deixa de ser
"sempre aberto" (Fase 0) e passa a exigir login real, com menu filtrado por
permissão.

## 6.2 Tela: Login (`/entrar`)

Consome `POST /autenticacao/login` (`AutenticarComSenhaCommand`).

- Campos: **Login** (texto) e **Senha** (password), sem validação Zod
  client-side além de "obrigatório" (a validação de credenciais é
  inteiramente do backend — não faz sentido replicar regra de força de
  senha aqui sem o contrato exato).
- `ResultadoLoginDto` retorna **ou** `Tokens` (login completo — vai direto
  para `/`) **ou** `Desafio` (`DesafioLoginDto { TokenDesafio, Tipo }` — vai
  para a tela de 2FA, levando `TokenDesafio` via estado de navegação, nunca
  na URL).
- Erros tratados especificamente (além do mapeamento genérico de `03` §3.5):
  - `401` (`CredenciaisInvalidasException`) → "Login ou senha inválidos."
  - `423` (`ContaBloqueadaException`) → "Conta bloqueada por tentativas
    excessivas. Tente novamente mais tarde." (o backend implementa bloqueio
    por tentativas — `agents.md` §14 — o frontend só exibe, não decide
    tempo de espera).
- Sem "esqueci minha senha" nesta fase — o backend não expõe esse fluxo
  ainda (reset é administrativo, via `PUT /usuarios/{id}/senha`, ver §6.6).

## 6.3 Tela: Desafio de dois fatores (`/entrar/dois-fatores`)

Consome `POST /autenticacao/login/dois-fatores`
(`ConcluirDesafioTotpCommand`), recebendo `TokenDesafio` da tela anterior.

- Campo único: código TOTP de 6 dígitos (input numérico, auto-submit ao
  completar 6 dígitos, mesmo padrão UX de apps bancários).
- `Tipo` do desafio (`EscopoDesafioLogin`, backend) distingue dois casos —
  a tela exibe texto diferente para cada um:
  - `DesafioTotp`: "Digite o código do seu aplicativo autenticador."
  - `ConfiguracaoTotpObrigatoria`: usuário **ainda não configurou** TOTP
    mas seu perfil exige — a tela redireciona para o fluxo de configuração
    (§6.4) usando o token de escopo restrito, em vez de pedir um código que
    não existe ainda.
- Sucesso retorna `TokensDto` — vai para `/`.

## 6.4 Tela: Configurar dois fatores (dentro de Minha Conta, §6.5)

Consome `POST /minha-conta/dois-fatores/configurar`
(`IniciarConfiguracaoTotpCommand` → `SegredoTotpDto { Segredo, UriOtpauth }`)
e `POST /minha-conta/dois-fatores/ativar` (`AtivarTotpCommand`).

- Passo 1: exibe QR Code gerado a partir de `UriOtpauth` (biblioteca
  `qrcode.react` ou similar, renderizado 100% client-side — o segredo
  nunca é logado nem enviado a lugar nenhum além da própria API) + o
  `Segredo` em texto para digitação manual (fallback para quem não pode
  escanear).
- Passo 2: campo de código de 6 dígitos para confirmar que o app
  autenticador foi configurado corretamente antes de ativar de fato —
  chama `ativar` com o código digitado; se errado, mensagem de erro e
  permite tentar de novo sem reiniciar o QR Code.
- Ação de **desativar 2FA** (`POST /minha-conta/dois-fatores/desativar`,
  `DesativarTotpCommand`) exige senha atual (`ConfirmDialog` com campo de
  senha) — nunca um botão de um clique só, dado o impacto de segurança.

## 6.5 Tela: Minha Conta (`/minha-conta`)

Consome `GET /minha-conta` (`MeuPerfilDto`).

- Exibe (somente leitura): nome, login, email, empresa/filial (nomes, não
  apenas IDs — a tela resolve o nome via os dados já carregados de
  Empresas, §6.7), lista de perfis, dois fatores habilitado (sim/não).
- Seção "Alterar senha": `POST /minha-conta/senha`
  (`AlterarPropriaSenhaCommand`) — campos Senha atual / Nova senha /
  Confirmar nova senha (confirmação é validação apenas client-side, Zod
  `.refine()` comparando os dois campos).
- Seção "Dois fatores": liga para o fluxo do §6.4 (configurar/ativar) ou
  mostra o botão de desativar se já habilitado.
- Botão "Sair" no topbar chama `POST /autenticacao/logout`
  (`RevogarSessaoCommand`) — por padrão revoga só a sessão atual
  (`TodasAsSessoes: false`); Minha Conta tem uma opção secundária "Sair de
  todos os dispositivos" (`TodasAsSessoes: true`), útil se o usuário
  suspeitar de comprometimento da conta.

## 6.6 Tela: Usuários (`/sistema/usuarios`)

Permissões: `Usuarios.Consultar` (lista/detalhe), `Usuarios.Gerenciar`
(criar/editar/perfis/senha/inativar/reativar).

- **Lista** (`GET /usuarios`, paginado): colunas Nome, Login, Email, Status
  (Ativo/Inativo como `<Tag>`), Dois fatores (ícone sim/não).
- **Formulário de criação** (`POST /usuarios`): nome, login, email, senha
  inicial. Após criar, redireciona para o Detalhe para definir perfis.
- **Detalhe** (`GET /usuarios/{id}` → `UsuarioDto`): dados + seção
  "Perfis" — `<Transfer>` do Ant Design (lista de perfis disponíveis ↔
  perfis atribuídos) chamando `PUT /usuarios/{id}/perfis`
  (`DefinirPerfisDoUsuarioCommand`) ao salvar.
- Ação "Redefinir senha" (`PUT /usuarios/{id}/senha`,
  `RedefinirSenhaUsuarioCommand`) — modal com campo de nova senha, uso
  administrativo (substitui "esqueci minha senha" nesta fase, §6.2).
- Ações **Inativar**/**Reativar** (`POST /usuarios/{id}/inativar` |
  `/reativar`) via `ConfirmDialog` padrão (§5.4). Usuário inativo não
  consegue mais logar (regra do backend) — a tela deixa isso explícito no
  texto de confirmação.

## 6.7 Tela: Perfis e Permissões (`/sistema/perfis`)

Permissões: `Perfis.Consultar`, `Perfis.Gerenciar`.

- **Lista** (`GET /perfis?incluirInativos=`): Nome, Descrição, coluna
  "Sistema" (perfis marcados `Sistema=true` — provavelmente seeds como
  `Administrador` — não podem ser inativados/renomeados; a tela desabilita
  essas ações para eles, refletindo uma regra que o backend também deve
  impor).
- **Formulário** (`POST /perfis` / `PUT /perfis/{id}`): Nome, Descrição.
- **Detalhe — matriz de permissões**: `GET /permissoes` retorna
  `IReadOnlyList<ModuloPermissoesDto>` (permissões **já agrupadas por
  módulo** pelo backend, ex.: "Produtos", "Estoque", "Fornecedores e força
  de vendas") — a tela renderiza essa estrutura diretamente como uma lista
  de `<Checkbox.Group>` por módulo (nunca uma tabela genérica de
  permissões soltas, o agrupamento já vem pronto da API). Salvar chama
  `PUT /perfis/{id}/permissoes` (`DefinirPermissoesDoPerfilCommand`) com o
  array de chaves marcadas.
- Ação **Inativar** (`POST /perfis/{id}/inativar`) via `ConfirmDialog`.

## 6.8 Tela: Empresas e Filiais (`/sistema/empresas`)

Permissões: `Empresas.Consultar`, `Empresas.Gerenciar`.

- **Lista** (`GET /empresas?incluirInativas=`, sem paginação — retorno é
  `IReadOnlyList`, lista simples, provavelmente poucas dezenas de
  empresas no máximo): Razão Social, Nome Fantasia, Documento (CNPJ), Status.
- **Formulário de criação** (`POST /empresas`): Razão Social, Nome
  Fantasia, Documento.
- **Filiais** — sub-tabela dentro do Detalhe da Empresa: `GET
  /empresas/{empresaId}/filiais` + `POST /empresas/{empresaId}/filiais`
  (campo único: Nome). Sem edição/inativação de filial exposta pelo
  backend ainda nesta fase — a tela não inventa essas ações.
- Esta tela é tipicamente **acessada raramente**, por um administrador, no
  onboarding de uma nova empresa do grupo — não precisa de filtros
  sofisticados.

## 6.9 Menu filtrado por permissão (ativa nesta fase)

A partir desta fase, o menu estático da Fase 0 (`04` §4.4) passa a ser
gerado dinamicamente: cada item do menu declara a chave de permissão que
exige (`Produtos.Consultar`, `Estoque.Consultar` etc.) e só aparece se
`usePermissao().tem(chave)` for verdadeiro (§3.6) — usando dados reais de
`MeuPerfilDto.Permissoes` agora que o login existe. O item "Diagnóstico"
continua sempre visível (não exige permissão, é público no backend).

## 6.10 Guarda de rotas (ativa nesta fase)

- `GuardaAutenticacao`: toda rota fora de `/entrar*` exige
  `sessaoStore.autenticado === true`; senão redireciona para `/entrar`,
  guardando a rota original para retomar após login.
- `GuardaPermissao`: cada rota privada declara a chave de permissão
  exigida em `app/rotas/mapaDePermissoes.ts` (§2.3); se o usuário não tem
  a permissão, renderiza a página "Acesso negado" (§5.5) em vez de
  redirecionar silenciosamente (o usuário precisa entender que o link
  existe mas ele não tem acesso, não que a página sumiu).

## 6.11 Critério de pronto (Fase 2)

- Fluxo completo de login com 2FA funcional contra a API real (login →
  desafio TOTP → app), incluindo o caso de primeiro acesso
  (`ConfiguracaoTotpObrigatoria`).
- Renovação de token e logout (individual e "todos os dispositivos")
  funcionais.
- CRUD de Usuários com atribuição de perfis funcional.
- CRUD de Perfis com edição da matriz de permissões funcional.
- Cadastro de Empresas/Filiais funcional.
- Menu e rotas filtrados por permissão real, testados com pelo menos dois
  perfis diferentes (ex.: `Administrador` vê tudo; um perfil só com
  `Estoque.Consultar` só vê o módulo de Estoque em modo leitura).
- Teste E2E do fluxo de login completo (Playwright, conforme `03` §3.12).
