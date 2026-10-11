# Arquitetura do Kurio

Este documento descreve o comportamento observado no frontend e nos handlers
MSW deste workspace. Os handlers são o contrato executável disponível; não
substituem uma especificação ou implementação de backend de produção.

## Visão geral

- React e TypeScript compõem a interface; TanStack Router administra as rotas.
- TanStack Query mantém os dados de servidor em cache em memória.
- Axios centraliza as chamadas REST em `src/services/api.ts`, usando `/api`
  como base URL e tipagens de `src/types/api.ts`.
- MSW intercepta REST em desenvolvimento e quando `VITE_ENABLE_MOCKS=true`.
  O estado de domínio do mock é persistido no `localStorage` com a chave
  `kurio-mock-db`.
- O cliente Socket.IO é iniciado pelo `RealtimeProvider` apenas com sessão.
  Em modo mock, `src/mocks/realtime.ts` oferece um transporte local parcial.

## Contratos REST

As rotas abaixo são relativas à base `/api`. Valores monetários são enviados
como strings decimais em ETH; as interfaces de resposta estão em
`src/types/api.ts`. Campos opcionais são indicados com `?`.

| Método e caminho | Entrada | Resposta / comportamento |
| --- | --- | --- |
| `POST /auth/register` | `{ email, password, username, name }` | `{ success, token, user }`; conflito de e-mail retorna `409 EMAIL_EXISTS`. |
| `POST /auth/login` | `{ email, password }` | `{ success, token, user }`; credenciais inválidas retornam `401`. |
| `POST /auth/logout` | Sem corpo | `{ success, message? }`. |
| `GET /auth/session` | Sem corpo | `{ authenticated, user }`, sendo `user` nulo quando não há sessão válida. |
| `GET /nfts` | Query `search`, `category`, `sort`, `page` | `{ items, page, pageSize, total }`; o handler mock também aceita `pageSize`. |
| `GET /nfts/:id` | ID na URL | NFT; retorna `404 NOT_FOUND` se não existir. |
| `GET /cart` | Sem corpo | `{ items, subtotal, discount, networkFee, total }`. |
| `POST /cart` | `{ id, quantity }` | `{ success, message? }`; quantidade zero remove a NFT. |
| `POST /cart/coupon` | `{ code }` | `{ valid, code, discount, message }`; cupom inválido retorna `400`. |
| `POST /quote` | `{ coupon? }` | Cotação com `quoteId`, `version`, itens, subtotal, desconto, taxa e total. |
| `POST /orders` | Cotação, carteira, rede opcional e dados do colecionador | Cria pedido; exige header `Idempotency-Key`. Pode retornar `409` para cotação alterada ou estoque indisponível. |
| `GET /orders/:id` | ID na URL | Pedido e recibo associados à sessão. |
| `GET /orders?idempotencyKey=...` | Chave de idempotência | Recupera pedido associado à sessão e à chave. |
| `GET /favorites` | Sem corpo | `{ favorites: string[] }`. |
| `POST /favorites` | `{ id, favorite }` | `{ favorites: string[] }`. |
| `GET /user/profile` | Sem corpo | `UserProfile`. |
| `PUT /user/profile` | Campos de perfil | `{ success, user }`. |
| `PUT /user/password` | `{ currentPassword, newPassword }` | `{ success, message }`. |
| `GET /wallets` | Sem corpo | `{ wallets: WalletOption[] }`. |
| `POST /wallets/connect` | `{ address, type, network }` | `{ wallet }`. |
| `POST /wallets/disconnect` | `{ id }` | `{ success }`. |
| `PUT /user/wallet` | Campos de carteira | `{ success, user }`. |
| `POST /newsletter` | `{ email }` | `{ success, message? }`. |

O mock exige sessão para carrinho, favoritos, cotação, pedidos, perfil e
carteiras. Catálogo, cadastro, login e newsletter não exigem sessão. A sessão
ausente em operações protegidas normalmente resulta em `401 UNAUTHENTICATED`.

### Erros e validação

O cliente converte erros Axios em `Error`, anexando `apiError` com `code`,
`message`, `fieldErrors?`, `retryable` e `status`. O frontend usa o texto de
erro nas telas; erros de domínio podem incluir `quote`, que é preservada em
`apiError`. O checkout atual não aplica essa cotação automaticamente após um
conflito.

O contrato implementado de compra é cotar e depois criar pedido
(`POST /quote` seguido por `POST /orders`); não há handler `/checkout` no mock.
Isso difere da descrição antiga em `docs/contratos-rest.md`, que deve ser
atualizada se continuar sendo mantida como referência independente.

## Política de sessão

- O bearer token fica em `sessionStorage['kurio-session']`. O interceptor
  Axios o envia no header `Authorization` quando existe.
- Login e cadastro guardam o token e o perfil retornados pela API. Ambos
  autenticam automaticamente a pessoa após sucesso.
- `kurio:session-changed` avisa o cabeçalho e o provedor realtime para
  atualizarem seu estado. Logout remove token, limpa dados privados de cache e
  fecha/resetta o socket.
- As rotas `/checkout`, `/profile` e `/wallets` verificam `GET /auth/session`
  em `beforeLoad`; se necessário, redirecionam para `/login` preservando a URL
  de destino. A tela de sucesso não possui guarda própria e tenta carregar o
  pedido com a API.
- Um `401` só dispara `kurio:session-expired` se já havia token no navegador.
  O handler global guarda a URL atual, remove o token, limpa todo o cache,
  fecha o socket e navega para login.
- O token não é compartilhado entre abas como cookie e não existe refresh
  token ou persistência do cache TanStack Query. Trata-se de uma política de
  demonstração, não de uma especificação de segurança para produção.

## Estado do carrinho

O estado de negócio é mantido no servidor; no mock, cada usuário tem uma lista
de referências `{ id, quantity }` e o snapshot combina essas referências com
os dados atuais do catálogo. O mock salva usuários, sessões, carrinhos,
cupons, favoritos, pedidos e versões no `localStorage`; o cache React Query,
por outro lado, permanece em memória.

Atualizar quantidade é otimista: a interface altera o item e os totais antes
da resposta, restaura o snapshot anterior em caso de erro e invalida `['cart']`
ao terminar para buscar o estado canônico. Adicionar ao carrinho invalida a
mesma query após sucesso. Checkout obtém cotação atualizada antes de enviar o
pedido; o mock remove do carrinho os itens de pedido confirmado.

O mock reconhece `KURIO10` como cupom de 10% na cotação. Atualmente, porém,
`GET /cart` sempre calcula `discount` como zero; é a resposta de `/quote` que
calcula o desconto efetivo usado na compra. A apresentação do desconto do
carrinho pode, portanto, não refletir o desconto final até consultar a
cotação.

O botão do cabeçalho continua permitindo abrir o carrinho como visitante, e a
própria rota `/cart` não tem guarda. Nela, `useCartQuery()` fica habilitada por
padrão mesmo sem sessão, podendo causar `401`; o retry global de uma tentativa
também pode repetir essa chamada. O checkout é encaminhado para login com
`redirect=/checkout`. A consulta do carrinho no cabeçalho, por sua vez, só é
ativada quando existe sessão.

## Limitações e riscos operacionais conhecidos

- O banco MSW persiste no `localStorage`, inclusive registros de usuários
  usados pelo mock. Ele é somente para demonstração e não deve receber dados
  reais.
- O retry padrão de uma tentativa aplica-se às queries sem distinguir status
  HTTP. Assim, uma query protegida sem token — como a da página de carrinho —
  pode repetir um `401` antes de apresentar o estado de erro.
- A chave de idempotência é criada no checkout e gravada em
  `sessionStorage` somente após o `POST /orders` responder. Embora exista
  `GET /orders?idempotencyKey=...`, a tela não o usa para recuperar um pedido
  quando a conexão cai depois da criação no servidor; nesse caso, repetir a
  compra pode gerar uma chave nova.
- Os eventos realtime não têm replay/cursor; o cliente recupera consistência
  invalidando queries na reconexão. A garantia depende da disponibilidade do
  REST.
- Cache privado não é isolado por ID de usuário nas query keys. A troca de
  conta na mesma aba pode reutilizar entradas ainda frescas, como descrito na
  seção de cache.

## Cache e atualização de dados

O `QueryClient` configura uma tentativa de retry para queries e desativa
refetch automático ao focar a janela. Não há armazenamento persistente para
queries.

| Dados | Query key | Frescor configurado | Atualização |
| --- | --- | --- | --- |
| Catálogo | `['nfts', params]` | 30 s | Atualizações realtime aplicam preço/estoque no cache; reconexão invalida o catálogo. |
| Carrinho | `['cart']` | 5 s | Refetch após mutação, evento de NFT e reconexão. |
| Favoritos | `['favorites']` | 30 s | Mutação otimista com rollback e invalidação ao terminar. |
| Perfil/carteiras | `['profile']` | Padrão do TanStack Query | Perfil é preenchido no login; algumas telas também consultam API diretamente. |
| Sessão | `['session']` | Padrão do TanStack Query | Usada pelos guards das rotas privadas. |
| Cotação/pedido | Prefixos `['quote']` e `['order']` | Varia por fluxo | Invalidados na reconexão; cotação também é invalidada por evento de NFT. |

As chaves de carrinho, favoritos e perfil não incluem o identificador do
usuário. Logout remove as três queries privadas, mas login/cadastro não as
invalidam explicitamente. Em uma troca de usuário sem recarga, há risco de
reutilizar dados ainda frescos pertencentes à sessão anterior até o refetch.

## Eventos Socket.IO e reconciliação REST

O cliente conecta ao namespace `/realtime`, somente por WebSocket, com até três
tentativas de reconexão. O handshake envia `auth.token`. Atualmente, o
`RealtimeProvider` só abre o socket com token e observa mudanças de sessão.

Eventos de servidor consumidos:

| Evento | Dados relevantes | Efeito no cliente |
| --- | --- | --- |
| `nft.updated` | `{ resource: 'nft', resourceId, eventId, version, occurredAt, price?, available? }` | Atualiza a NFT nas queries `['nfts', ...]`; invalida carrinho e cotação. |
| `order.updated` | `{ resource: 'order', resourceId, eventId, version, occurredAt, status }` | Atualiza pedido em cache, quando já carregado. Status: `pending`, `confirmed` ou `rejected`; confirmação/rejeição são terminais no cliente. |

O cliente descarta IDs de evento repetidos (janela local de até 100 IDs) e
versões que não sejam mais recentes por recurso. Eventos de pedido são
encaminhados como notificações internas, mas atualmente não há consumidor
visual registrado; o estado deve ser obtido do REST quando necessário.

Na conexão ou reconexão, o cliente invalida catálogo, carrinho, cotação e
pedido para reconciliar o cache com REST. Portanto, REST é a fonte de verdade;
Socket.IO apenas acelera atualizações e não substitui leitura/recuperação de
estado. Não há cursor de retomada nem replay garantido de eventos perdidos.

O transporte MSW (`src/mocks/realtime.ts`) permite emitir eventos de teste por
`/__mock/events/*`. Ele simula o protocolo e filtra eventos de pedido por
usuário, mas não reproduz integralmente rooms, broadcasting e semântica de um
servidor Socket.IO real. Não há evidência neste workspace de um serviço
Socket.IO de produção conectado.

## Decisões de UX observáveis

- Cadastro e login usam o mesmo modal, com alternância entre modos; criar conta
  não exige conectar carteira e autentica a pessoa automaticamente.
- Visitantes podem navegar no catálogo e abrir o carrinho. A ação de finalizar
  direciona para login e conserva o destino de checkout.
- Quando a sessão expira, a aplicação tenta preservar a rota atual e retornar
  a ela depois do login.
- O cabeçalho mostra contador do carrinho quando os dados estão disponíveis;
  sem sessão, a query do contador fica desativada.
- Mensagens de erro e sucesso são apresentadas na interface; os componentes
  usam anúncios acessíveis (`role="alert"` e `role="status"`) em fluxos
  cobertos pela implementação.

## Figma e desvios visuais

Não foi encontrado link, arquivo exportado, token de design ou captura de
referência do Figma neste workspace. Assim, não é possível afirmar que os
comportamentos ou estilos observados sejam desvios ou correspondências ao
design aprovado. Os itens de UX acima descrevem somente o produto atual;
qualquer divergência visual deve ser confirmada contra o frame e viewport
corretos antes de ser classificada como intencional ou como bug.

O projeto registra ainda que as imagens PNG existentes são assets de
referência e que alterações/conversões devem ser validadas visualmente
(`docs/acessibilidade-e-assets.md`). Isso não constitui comparação com Figma.

## Referências de implementação

- `src/services/api.ts` e `src/types/api.ts`: cliente e tipos REST.
- `src/lib/axios.ts`: base URL, bearer token e tratamento de sessão expirada.
- `src/hooks/useAuth.ts`, `src/main.tsx`: transições e limpeza de sessão.
- `src/hooks/useCart.ts`, `src/routes/cart.tsx`, `src/routes/checkout.tsx`:
  carrinho e compra.
- `src/lib/realtime.ts`, `src/mocks/realtime.ts`: eventos e sincronização.
- `src/mocks/handlers/`: contratos REST mockados.
- `docs/contratos-rest.md`, `docs/cache-politica.md`, `docs/mock-transport.md`:
  notas complementares; conferir este documento e o código atual quando houver
  divergências.
