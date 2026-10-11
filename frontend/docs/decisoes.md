# Decisões técnicas

## Valores monetários

Valores ETH são transportados como strings decimais. `src/lib/money.ts` centraliza parsing, arredondamento e operações usando `decimal.js`, evitando a imprecisão binária de `number`.

## Mocks

MSW continua sendo a única fonte de respostas simuladas. O build de demonstração habilita o worker com `VITE_ENABLE_MOCKS=true`; o aplicativo não contém respostas fictícias nos componentes.

## Autenticação

O token de demonstração fica em `sessionStorage`. Rotas de checkout, confirmação, perfil e carteiras exigem essa sessão e redirecionam para login quando ela não existe.

## Limitação conhecida

O banco atual do mock permanece em memória durante a execução do worker. A próxima etapa deve extraí-lo para um `db` resetável e separar cenários de latência/falha por recurso.

