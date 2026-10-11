# Transporte mockado

REST usa MSW e é habilitado em desenvolvimento ou no `build:demo`. O cliente Socket.IO ainda é mantido em `src/lib/realtime.ts`; o warning de WebSocket sem handler indica que a camada de servidor Socket.IO mockado precisa ser adicionada antes de considerar tempo real completo.

Enquanto essa camada não estiver disponível, o fluxo REST permanece a fonte de verdade e os listeners são limpos quando a tela é desmontada.

# Socket.IO mock transport

O cliente continua sendo `socket.io-client`. Em modo mock, o worker do MSW
intercepta o WebSocket do Engine.IO com `ws.link('*/socket.io/*')` e
`@mswjs/socket.io-binding` traduz o protocolo Socket.IO para eventos tipados.
O servidor mockado está em [src/mocks/realtime.ts](../src/mocks/realtime.ts) e
usa o estado persistente de [src/mocks/db.ts](../src/mocks/db.ts).

O namespace usado pelo cliente é `/realtime`. O handshake envia o token atual
em `auth.token`; o mock não autentica autorização de produção e deve ser usado
somente com MSW habilitado. O binding oferece eventos e `emit`, mas não pretende
reproduzir toda a API Socket.IO (rooms, namespaces reais, broadcasting e
semântica completa de transporte não estão disponíveis).

Os endpoints `POST /__mock/events/nft`, `POST /__mock/events/order`,
`POST /__mock/events/duplicate`, `POST /__mock/events/stale` e os controles de
conexão permitem testar o fluxo sempre passando pelo cliente Socket.IO.
Cada evento inclui `eventId`, `resource`, `resourceId`, `version` e
`occurredAt`. O cliente deduplica por `eventId`, rejeita versões antigas e
invalida REST ao reconectar.
