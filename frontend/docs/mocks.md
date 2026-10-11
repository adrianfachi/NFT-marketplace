# Cenários determinísticos de MSW

Os mocks podem ser exercitados sem alterar os handlers de domínio. O cenário ativo é
resolvido nesta ordem:

1. `?scenario=<nome>` na requisição;
2. `localStorage['kurio-mock-scenario']`;
3. `VITE_MOCK_SCENARIO`;
4. `default`.

Os valores válidos são:

| Cenário | Comportamento |
| --- | --- |
| `default` | Fluxo normal |
| `empty` | Catálogo e carrinho vazios |
| `slow` | Cada requisição aguarda latência determinística |
| `variable-latency` | Latência determinística varia por número da requisição, permitindo respostas fora de ordem |
| `offline` | Responde com `HttpResponse.error()` |
| `http-4xx` | Todas as APIs retornam HTTP 400 |
| `http-5xx` | Todas as APIs retornam HTTP 503 |
| `session-expired` | APIs retornam 401 a partir da terceira chamada por padrão |
| `unauthorized` | APIs retornam 403 |
| `signup-conflict` | Cadastro retorna 409 `EMAIL_EXISTS` |
| `invalid-coupon` | Aplicação de cupom retorna 400 |
| `expired-coupon` | Aplicação de cupom retorna 410 |
| `price-changed` | Cotação retorna 409 `QUOTE_CHANGED` |
| `sold-out` | Cotação e pedido retornam 409 `OUT_OF_STOCK` |
| `order-timeout-after-create` | O pedido é persistido, mas a primeira requisição nunca responde; o reenvio com a mesma chave recupera o pedido |
| `payment-confirmed` | Pedido é criado como `confirmed` |
| `payment-rejected` | Pedido é criado como `rejected` |

## Controle em runtime

```ts
await fetch('/__mock/scenario', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scenario: 'slow' }),
})

await fetch('/__mock/scenario', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scenario: 'session-expired', sessionExpiredAt: 5 }),
})

await fetch('/__mock/state')
await fetch('/__mock/reset', { method: 'POST' })
```

`POST /__mock/reset` restaura o banco persistente e volta o cenário para `default`.
`GET /__mock/state` retorna o cenário, contador de requisições, configuração da
expiração e o estado serializado do banco. Os endpoints de controle não são
afetados pelos cenários de erro das APIs.
