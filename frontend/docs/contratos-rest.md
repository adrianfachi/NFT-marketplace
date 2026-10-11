# Contratos REST do Kurio

O cliente usa Axios tipado em `src/services/api.ts`; os componentes não fabricam respostas.

## Sessão e catálogo

- `GET /api/auth/session` retorna `{ authenticated, user }`.
- `GET /api/nfts?search&category&sort&page` retorna o catálogo filtrado.
- `GET /api/nfts/:id` retorna uma NFT ou `404`.

## Carrinho e compra

- `GET /api/cart` retorna itens e os valores monetários como strings terminadas em `ETH`.
- `POST /api/cart` recebe `{ id, quantity }`.
- `POST /api/cart/coupon` recebe `{ code }`.
- `POST /api/checkout` recebe `{ total, wallet, idempotencyKey }`.
- `GET /api/orders/:id` recupera o pedido e seu recibo.

Pedidos devem ser tratados como `pending`, `confirmed` ou `rejected`. A chave de idempotência é mantida no `sessionStorage` até um estado terminal.

## Erros

Falhas podem retornar `{ code, message, fieldErrors, retryable }`. O cliente converte respostas Axios para um `Error` com `apiError`, preservando status e erros de campo.

