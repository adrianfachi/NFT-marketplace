# Política de cache

- Catálogo: query key inclui filtros e paginação; `staleTime` curto para refletir alterações de preço.
- Carrinho: query key `cart`; mutações são otimistas e sempre invalidam a cotação após a resposta.
- Dados privados: devem ser removidos no logout e não podem ser compartilhados entre sessões.
- Requests de catálogo e carrinho aceitam `AbortSignal` para evitar exibir respostas fora de ordem.
- Erros de validação não são repetidos automaticamente; apenas falhas transitórias de rede/servidor podem ser repetidas.

