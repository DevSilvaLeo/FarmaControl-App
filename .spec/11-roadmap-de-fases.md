---
título: Roadmap de Fases — Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
---

# 11 — Roadmap de Fases

Ordem por dependência técnica **e** por dependência da API correspondente
já existir no backend. O MVP do frontend é a vertical fim-a-fim das Fases
0–5 — todas com endpoints já implementados no backend hoje
(`.docs/00-indice.md` do backend, estado "Fase 5 v0 concluída"). Fases 6+
dependem do backend entregar a API correspondente primeiro.

| Fase | Escopo | Doc | Depende de (backend) | Status |
|---|---|---|---|---|
| **0** | Fundação do projeto frontend | [`04`](04-fase-0-fundacao.md) | `GET /api/diagnostico` (já existe) | a iniciar |
| **1** | Cross-cutting / plumbing (cliente HTTP, componentes genéricos) | [`05`](05-fase-1-cross-cutting.md) | Fase 0 do frontend | a iniciar |
| **2** | Autenticação (senha + TOTP) + RBAC + Sistema básico | [`06`](06-fase-2-autenticacao.md) | Backend Fase 2 (já existe) | a iniciar |
| **3** | Geografia + Produtos + Clientes | [`07`](07-fase-3-cadastros.md) | Backend Fase 3 (já existe) | a iniciar |
| **4** | Fornecedores, Transportadoras, Representantes, Vendedores | [`08`](08-fase-4-fornecedores.md) | Backend Fase 4 (já existe) | a iniciar |
| **5** | Estoque — livro-razão / Kardex v0 | [`09`](09-fase-5-estoque.md) | Backend Fase 5 v0 (já existe) | a iniciar |
| **5b** | Transferência, inventário, endereçamento físico | — (a detalhar) | Backend `PR 5b` (pendente) | bloqueada pelo backend |
| **6** | Vendas — Pré-pedido → Pedido → Faturamento (fecha o MVP) | [`10`](10-fases-futuras-backlog.md) §10.2 (inventário) | Backend Fase 6 (pendente) | bloqueada pelo backend |
| **7** | Compras / Entradas + custo médio ponderado | [`10`](10-fases-futuras-backlog.md) §10.3 (inventário) | Backend Fase 7 (pendente) | bloqueada pelo backend |
| **8+** | Fiscal, Financeiro, Logística, Controlados, Licitações, OS/Produção, Sistema avançado | [`10`](10-fases-futuras-backlog.md) §10.4–10.10 (inventário) | Backend Fases 8+ (backlog) | bloqueada pelo backend |

## 11.1 Por que Fases 0–5 podem começar imediatamente

Diferente do backend — que precisou construir a API antes de haver o que
consumir — o frontend está numa posição em que **as Fases 0 a 5 podem ser
construídas em paralelo entre si e a partir de já**, porque toda a
superfície de API necessária (Autenticação, Sistema básico, Geografia,
Produtos, Clientes, Fornecedores/Vendedores, Estoque) já está implementada,
testada (175 testes passando, `.docs/00` do backend) e documentada com
contratos reais (Controllers, DTOs, Commands lidos diretamente do
código-fonte para produzir os documentos `04`–`09`). Não há bloqueio técnico
para iniciar a Fase 0 do frontend hoje.

A ordem 0→1→2→3→4→5 aqui reflete **dependência de construção** (não dá para
fazer telas de Produto antes de ter `DataTable`/`FormPage` genéricos da
Fase 1, nem antes de ter login funcionando na Fase 2 para testar RBAC de
verdade), não bloqueio de API.

## 11.2 Fases 6+ — bloqueadas pelo backend

A partir da Fase 6, o frontend **depende do backend entregar a API
correspondente primeiro** — não há especificação de campo/endpoint possível
sem o contrato real (ver `10-fases-futuras-backlog.md` §10.1, regra de uso
do documento). Quando o backend iniciar a Fase 6 (Vendas) ou o `PR 5b`
(conforme `.docs/05-roadmap-de-fases.md` do backend, que lista os dois como
"próxima" opção em aberto), o time de frontend deve:

1. Ler o Controller/Commands/DTOs reais recém-criados (mesmo processo usado
   para produzir os documentos `04`–`09` desta especificação).
2. Desmembrar a seção correspondente de `10-fases-futuras-backlog.md` em um
   novo documento numerado (`13-fase-6-vendas.md`, por exemplo), no mesmo
   nível de detalhe de campo-a-campo dos documentos `07`–`09`.
3. Atualizar este roadmap e `00-indice.md` com o novo documento e status.

## 11.3 Marcos de entrega sugeridos

| Marco | Fases incluídas | Entrega |
|---|---|---|
| **M1 — Esqueleto navegável** | 0 | App builda, layout navegável, diagnóstico consumindo API real |
| **M2 — Plataforma pronta** | 0 + 1 | Componentes genéricos prontos e testados, nenhuma tela de negócio ainda |
| **M3 — Login e administração** | 0 + 1 + 2 | Login com 2FA funcional, RBAC ativo, administração de usuários/perfis/empresas |
| **M4 — Cadastros centrais** | + 3 | Produto e Cliente completos — o "coração" de dado mestre do ERP |
| **M5 — Cadeia de suprimento (parceiros)** | + 4 | Fornecedores/Transportadoras/Representantes/Vendedores completos |
| **M6 — MVP de Estoque** | + 5 | Estoque operacional (movimentação + consulta + Kardex) — **fecha o MVP do frontend correspondente ao MVP atual do backend** |
| M7+ | Fase 6 em diante | Depende do avanço do backend (ver §11.2) |

## 11.4 Riscos e dependências externas ao controle do frontend

- **CORS**: bloqueante para a Fase 0 até confirmação do backend (`04` §4.2).
- **Identidade visual**: paleta/logo definitiva ainda não definida (`04`
  §4.7, PAF-01) — usar placeholder documentado, não bloquear a Fase 0 por
  isso.
- **Sincronia de contrato**: qualquer mudança de DTO/Command no backend
  depois que uma fase do frontend já foi construída exige regenerar tipos
  (`02` §2.5) e revisar o schema Zod correspondente (`03` §3.4) — o CI do
  frontend (`04` §4.3 item 9) deve pegar isso automaticamente via
  verificação de `api.gerado.ts` desatualizado.
