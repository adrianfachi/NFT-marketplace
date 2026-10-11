# Acessibilidade e assets

- Feedback de sucesso usa `role="status"` e erros usam `role="alert"`.
- Skeletons mantêm dimensões do conteúdo e desligam o shimmer com `prefers-reduced-motion`.
- Imagens têm `alt`, dimensões explícitas e lazy loading quando estão abaixo da dobra.
- Os snapshots visuais devem ser atualizados somente após uma mudança visual intencional.
- As imagens PNG atuais ainda são o principal ponto de otimização do Lighthouse; a conversão para WebP/AVIF é uma tarefa separada para não alterar os assets de referência sem validação visual.

