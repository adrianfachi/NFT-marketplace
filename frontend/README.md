# Kurio NFT Marketplace

Frontend de marketplace de NFTs feito com React, TypeScript, Vite, TanStack
Router/Query, Axios, MSW, Socket.IO, Tailwind CSS e shadcn/ui. Em
desenvolvimento e na demo, o MSW fornece APIs e estado local fictícios; não é
necessário um backend para reproduzir os fluxos descritos aqui.

Para contratos REST, política de sessão, cache e eventos, consulte
[ARCHITECTURE.md](./ARCHITECTURE.md). O catálogo de cenários também está em
[docs/mocks.md](./docs/mocks.md).

## Requisitos e setup

- Node.js compatível com a versão instalada do Vite e npm.
- Chrome/Chromium para Playwright e Lighthouse.

No terminal, entre na pasta `frontend` e instale as dependências:

```bash
npm ci
npx playwright install chromium
```

O segundo comando é necessário apenas antes da primeira execução de testes se
o navegador do Playwright ainda não estiver instalado. Não instale dependências
ou navegadores de produção para executar a aplicação demo.

## Variáveis de ambiente

O arquivo `.env.demo` já ativa mocks na build e no servidor em modo demo:

```dotenv
VITE_ENABLE_MOCKS=true
```

Variáveis suportadas:

| Variável | Uso |
| --- | --- |
| `VITE_ENABLE_MOCKS` | Ativa MSW em build/preview quando definido como `true`. Em `npm run dev` e `npm run dev:mocks`, o MSW já é ativado automaticamente. |
| `VITE_MOCK_SCENARIO` | Cenário inicial opcional, por exemplo `slow` ou `signup-conflict`. Pode ser substituído pelo cenário salvo no navegador. |

Para testar um cenário desde a inicialização, crie `.env.demo.local` (ignorado
pelo Git) na pasta `frontend`:

```dotenv
VITE_ENABLE_MOCKS=true
VITE_MOCK_SCENARIO=slow
```

Reinicie Vite após alterar variáveis. Não coloque credenciais reais, tokens ou
segredos em variáveis `VITE_*`: elas são incluídas no código enviado ao
navegador. O cliente REST usa `/api` como base URL; não há variável de URL de
backend configurada no frontend.

## Credenciais fictícias

O banco inicial do MSW inclui estes usuários locais:

| E-mail | Senha |
| --- | --- |
| `contato@email.com` | `123456` |
| `gabriel@kurio.io` | `password123` |

São credenciais públicas de demonstração, não contas reais. O mock persiste
estado e usuários no `localStorage` do navegador.

## Comandos

Execute a partir da pasta `frontend`:

| Comando | Descrição |
| --- | --- |
| `npm run dev:mocks` | Inicia o Vite em modo demo com MSW. |
| `npm run dev` | Inicia Vite em desenvolvimento; MSW é ativado automaticamente. |
| `npm run build` | Verifica tipos e gera build sem forçar MSW. |
| `npm run build:demo` | Verifica tipos e gera build demo com MSW habilitado. |
| `npm run preview` | Serve o último build na porta padrão do Vite. |
| `npm run preview:demo` | Serve a demo em `http://127.0.0.1:4173`. Rode `build:demo` antes. |
| `npm run typecheck` | Executa `tsc -b --pretty false`. |
| `npm run lint` | Executa ESLint no projeto. |
| `npm run test:unit` | Executa os testes unitários de `tests/money.test.ts`. |
| `npm run test:e2e` | Executa Playwright em Chromium desktop e mobile. O Playwright inicia o servidor de desenvolvimento. |
| `npm run test:e2e:update` | Atualiza snapshots visuais do Playwright; use somente após mudança visual intencional. |
| `npm run test:report` | Abre o relatório HTML da última execução Playwright. |
| `npm run lighthouse` | Gera build demo e audita `/` e `/nfts/1` em desktop/mobile, três vezes por combinação. |

Playwright usa `http://127.0.0.1:4173`; não mantenha outro servidor diferente
nessa porta durante os testes. Lighthouse grava medições e resumo em
`reports/lighthouse/`. Requer Chrome disponível no ambiente.

## Deploy na Netlify

A configuração em [`../netlify.toml`](../netlify.toml) publica a build demo
estática do frontend, define `VITE_ENABLE_MOCKS=true` durante o build e
redireciona rotas da SPA para `index.html`. A publicação usa a pasta `dist`
gerada dentro de `frontend`; não é necessário criar Netlify Functions para
executar esta demo, pois o MSW intercepta as chamadas REST e Socket.IO no
navegador.

Conecte o repositório à Netlify e mantenha a configuração de build detectada
no `netlify.toml`. A build de preview local equivalente é:

```bash
npm ci
npm run build:demo
npm run preview
```

Esse deploy é apenas uma demonstração: contas, sessões, carrinho e pedidos são
simulados e armazenados localmente no navegador. Não use os mocks como
backend de produção nem para armazenar dados reais. Uma implantação real
precisa de uma API com autenticação e armazenamento persistente; o realtime
Socket.IO também precisa de um serviço compatível fora das Netlify Functions.
Não foram criadas funções serverless porque o projeto não define backend,
persistência durável ou contrato para esses serviços.

## Selecionar e resetar cenários

O cenário é selecionado, por ordem de prioridade, para cada requisição:

1. parâmetro `?scenario=<nome>` na URL da requisição;
2. `localStorage['kurio-mock-scenario']`;
3. `VITE_MOCK_SCENARIO`;
4. `default`.

Para trocar de cenário sem reiniciar o servidor, abra as ferramentas de
desenvolvedor do navegador, selecione Console e execute:

```js
await fetch('/__mock/scenario', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scenario: 'slow' }),
})
```

O endpoint aceita qualquer cenário listado abaixo. Para o cenário
`session-expired`, é possível escolher o número da requisição a partir da qual
as respostas REST recebem 401:

```js
await fetch('/__mock/scenario', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scenario: 'session-expired', sessionExpiredAt: 1 }),
})
```

O limite começa em 3 após carregar/resetar a aplicação. Se você alterar
`sessionExpiredAt`, o valor customizado permanece até outro ajuste ou reset.

Veja o cenário ativo e o contador de requisições com:

```js
const response = await fetch('/__mock/state')
console.log(await response.json())
```

O estado inclui o banco serializado, portanto contém dados internos fictícios
do mock. Não publique nem compartilhe essa resposta.

Para voltar ao estado inicial, ao cenário `default` e aos dados iniciais:

```js
await fetch('/__mock/reset', { method: 'POST' })
sessionStorage.clear()
location.reload()
```

`/__mock/reset` limpa o banco e o cenário do MSW, mas não remove as chaves de
sessão do navegador; o `sessionStorage.clear()` acima garante o próximo teste
como visitante. O reset também remove contas de demonstração criadas durante a
sessão e reinicializa seus carrinhos.

### Cenários disponíveis

| Cenário | Resultado esperado |
| --- | --- |
| `default` | Respostas normais. |
| `empty` | Catálogo e carrinho vazios. |
| `slow` | Adiciona latência determinística de 350 ms às APIs. |
| `variable-latency` | Varia a latência entre chamadas para testar respostas fora de ordem. |
| `offline` | Simula falha de rede. |
| `http-4xx` / `http-5xx` | Retorna HTTP 400 / 503 para requisições de API. |
| `session-expired` | Retorna 401 a partir de `sessionExpiredAt` (3 por padrão). |
| `unauthorized` | Retorna 403 para requisições de API. |
| `signup-conflict` | Cadastro retorna `409 EMAIL_EXISTS`. |
| `invalid-coupon` / `expired-coupon` | Cupom retorna HTTP 400 / 410. |
| `price-changed` | Altera o preço durante a cotação e emite `nft.updated`; a cotação retorna o preço novo. Não simula por si só um conflito de cotação obsoleta. |
| `sold-out` | Zera o estoque durante a cotação e retorna `409 OUT_OF_STOCK`. |
| `order-timeout-after-create` | Persiste pedido e deixa a primeira chamada sem resposta; o cliente Axios atinge timeout. |
| `payment-confirmed` / `payment-rejected` / `payment-pending` | Cria pedido com o estado indicado. |
| `wallet-rejected` / `wallet-disconnected` | Simula recusa ao conectar ou conflito ao desconectar carteira. |

## Reproduzir fluxos de falha

Antes de cada cenário independente, recomendo executar o reset acima. Inicie
`npm run dev:mocks`, abra a URL local informada pelo Vite e selecione o cenário
no Console do navegador.

### Cadastro com e-mail já existente

1. Defina `signup-conflict`.
2. Abra `/register` e envie o formulário de cadastro.
3. A API simulada responde `409 EMAIL_EXISTS`; a interface deve mostrar o erro
   de cadastro e permanecer no formulário.

### Cupom inválido ou expirado

1. Faça login com uma das credenciais fictícias.
2. Defina `invalid-coupon` ou `expired-coupon`.
3. Abra `/cart`, digite um código no campo de cupom e aplique.
4. A interface deve informar a falha (HTTP 400 ou 410). No cenário normal,
   `KURIO10` é o cupom demonstrativo válido.

### Erro de rede, servidor e latência

1. Selecione `offline`, `http-5xx`, `http-4xx`, `slow` ou `variable-latency`.
2. Navegue pelo catálogo e observe a tela, mensagens de erro e ordenação das
   respostas. `http-4xx` e `http-5xx` afetam todas as chamadas `/api`, inclusive
   autenticação; endpoints `__mock` permanecem disponíveis para controle.

### Sessão expirada

1. Faça login usando uma credencial de demonstração.
2. No Console, selecione `session-expired` com `sessionExpiredAt: 1`.
3. Faça uma chamada protegida, por exemplo, navegue para `/profile`.
4. Com token existente, o 401 deve disparar o evento de sessão expirada, limpar
   o token/cache e redirecionar para login preservando o destino.

### Cotação com preço alterado ou item esgotado

1. Faça login e confirme que há item no carrinho; se necessário, resete o mock
   para restaurar o carrinho inicial.
2. Selecione `price-changed` ou `sold-out` e vá para `/checkout`.
3. Preencha os dados solicitados e tente finalizar. `price-changed` atualiza o
   preço e envia `nft.updated`; como a cotação já é solicitada depois da
   atualização, o checkout pode prosseguir usando o preço novo. `sold-out`
   retorna `409 OUT_OF_STOCK` e impede criar um pedido confirmado.

Para forçar especificamente um conflito entre uma cotação já obtida e a
criação do pedido, é necessário alterar catálogo/estoque entre `POST /quote` e
`POST /orders`. O checkout da interface faz as duas chamadas em sequência e o
cenário `price-changed` altera os dados durante a primeira; portanto, esse
conflito obsoleto não é reproduzível de forma determinística pela interface
atual.

### Timeout depois de criar pedido

1. Faça login, mantenha itens no carrinho e selecione
   `order-timeout-after-create`.
2. Inicie o checkout. A API registra o pedido antes de a chamada exceder o
   timeout do cliente.
3. A interface apresenta erro de comunicação; este cenário evidencia uma
   limitação atual: a tela não recupera automaticamente o pedido pela chave de
   idempotência após timeout e uma nova tentativa pode usar nova chave. Execute
   o reset antes de continuar com outros fluxos.

### Estado do pagamento

1. Selecione `payment-pending` ou `payment-rejected` e conclua o checkout.
2. O pedido será criado com o estado escolhido. A página de sucesso só mostra
   recibo confirmado; pedidos pendentes ou rejeitados são apresentados como
   ainda não confirmados.

## Eventos realtime de teste

Com usuário autenticado e conexão do socket ativa, use os endpoints de controle
MSW para emitir eventos. Exemplo para atualizar preço/estoque da NFT de ID `1`:

```js
await fetch('/__mock/events/nft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resourceId: '1', price: '1.25', available: 3 }),
})
```

Para eventos de pedido, use o ID real retornado na criação do pedido:

```js
await fetch('/__mock/events/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resourceId: 'order-0001', status: 'confirmed' }),
})
```

Também existem `POST /__mock/events/duplicate` e
`POST /__mock/events/stale` para testar deduplicação e descarte de versões
antigas; ambos aceitam `{ resource: 'nft' | 'order', resourceId }`. Para forçar
desconexão, use `POST /__mock/socket/disconnect`. O cliente invalida queries REST
ao reconectar. O transporte realtime é uma simulação local e não substitui um
servidor Socket.IO real.
