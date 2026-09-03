# .specs_frontend — Especificação do Frontend do FarmaControl

Esta pasta descreve **o que construir e como construir o frontend** que vai
consumir a API já em desenvolvimento em `api/TheOne.FarmaControl`.

> Assim como `.spec/` (funcional) e `agents.md` (engenharia) são normativos
> para o backend, os documentos `02` e `03` aqui são normativos para o
> frontend. Os documentos `04` a `09` são descritivos-prescritivos: descrevem
> telas que já podem ser construídas porque a API correspondente já existe.
> O documento `10` é apenas inventário (a detalhar quando cada fase for
> iniciada, seguindo o mesmo método do backend — ver `.docs/05` do backend).

## Índice

| Doc | Conteúdo |
|---|---|
| [01-visao-geral-e-stack.md](01-visao-geral-e-stack.md) | Objetivo, personas, perfil de negócio, stack tecnológica e por quê |
| [02-arquitetura-e-estrutura.md](02-arquitetura-e-estrutura.md) | Estrutura de pastas, roteamento, cliente de API, geração de tipos a partir do Swagger |
| [03-padroes-de-engenharia-e-ui.md](03-padroes-de-engenharia-e-ui.md) | Normativo: nomenclatura, padrão de tela, validação, erros, RBAC, datas/dinheiro, testes |
| [04-fase-0-fundacao.md](04-fase-0-fundacao.md) | Scaffold, layout base, tema, roteamento esqueleto |
| [05-fase-1-cross-cutting.md](05-fase-1-cross-cutting.md) | Cliente HTTP, componentes genéricos, RBAC, erros globais |
| [06-fase-2-autenticacao.md](06-fase-2-autenticacao.md) | Login, TOTP, Minha Conta, guarda de rotas |
| [07-fase-3-cadastros.md](07-fase-3-cadastros.md) | Empresas/Filiais, Geografia, Produtos, Cadastros de apoio, Clientes, Segmentos |
| [08-fase-4-fornecedores.md](08-fase-4-fornecedores.md) | Fornecedores, Transportadoras, Representantes, Vendedores |
| [09-fase-5-estoque.md](09-fase-5-estoque.md) | Depósitos, Movimentações, Posição, Kardex, Lotes a vencer |
| [10-fases-futuras-backlog.md](10-fases-futuras-backlog.md) | Inventário de telas: Vendas, Compras, Fiscal, Financeiro, Logística, Controlados, Licitações, OS/Produção, Sistema |
| [11-roadmap-de-fases.md](11-roadmap-de-fases.md) | Ordem de entrega, dependências, escopo do MVP |
| [12-decisoes-de-engenharia.md](12-decisoes-de-engenharia.md) | ADR-lite: decisões de stack e arquitetura frontend |

## Estado atual

**Especificação inicial (v1.0) — 2026-09-02.** Cobre em detalhe as telas
correspondentes às Fases 0–5 (v0) já entregues no backend: fundação,
cross-cutting, autenticação (senha + TOTP + RBAC), cadastros (empresas,
geografia, produtos, clientes), fornecedores/força de vendas e estoque
(livro-razão/Kardex). Nenhuma linha de código de frontend foi escrita ainda —
este é o ponto de partida para a Fase 0.

Fonte: código-fonte real do backend (`Controllers`, `Application`, `Domain`)
até a Fase 5 (v0), `agents.md`, `.docs/00..12` e `.spec/00..14`.

Próximo passo: iniciar `04-fase-0-fundacao.md`. Ver
[11-roadmap-de-fases.md](11-roadmap-de-fases.md) para a ordem completa.
