import { createFileRoute } from '@tanstack/react-router'
import { Heart, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import {
  Feedback,
  Layout,
  NftCard,
  Quantity,
  type FeedbackState,
  nftImage,
  useCatalog,
} from '../../components/Kurio'
import { useAddToCartMutation } from '../../hooks/useCart'
import { useFavoriteMutation, useFavoritesQuery } from '../../hooks/useFavorites'

export const Route = createFileRoute('/nfts/$nftId')({ component: Detail })

function Detail() {
  const { nftId } = Route.useParams()
  const catalog = useCatalog()
  const nft = catalog.find(item => item.id === nftId)
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const addToCart = useAddToCartMutation()
  const favorites = useFavoritesQuery()
  const favoriteMutation = useFavoriteMutation()

  if (!nft) {
    return <Layout><div className="text-[var(--text-soft)] py-[25px]"><h2>NFT não encontrada</h2><p>Essa obra não está disponível no catálogo.</p></div></Layout>
  }
  const selectedNft = nft
  const isFavorite = favorites.data?.favorites.includes(selectedNft.id) ?? false

  async function addNftToCart() {
    setFeedback(null)
    try {
      await addToCart.mutateAsync({ id: selectedNft.id, quantity })
      setFeedback({ type: 'success', message: `${selectedNft.title} foi adicionado ao carrinho.` })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível adicionar o NFT.',
      })
    }
  }

  return (
    <Layout>
      <div className="py-[25px] pb-[65px] max-md:py-5 max-md:pb-10">
        <div className="text-[var(--text-soft)] max-md:mx-6">Início / Mercado</div>
        <div className="grid grid-cols-[55px_320px_1fr] gap-[18px] max-md:flex max-md:flex-col max-md:gap-0">
          <div className="flex flex-col gap-2 max-md:hidden">
            {[1, 2, 3, 4].map(index => (
              <img key={index} src={nftImage(nft)} alt="" className="w-[55px] h-[55px] object-cover" />
            ))}
          </div>
          <img className="w-full aspect-square object-cover rounded-[10px] bg-[var(--panel)] p-[10px] max-md:w-[calc(100%-48px)] max-md:mx-6 max-md:rounded-2xl max-md:p-0" src={nftImage(nft)} alt={nft.title} />
          <div className="p-[5px_0_0_10px] max-md:px-6 max-md:pt-6">
            <h1 className="text-[22px] mt-0 mb-2 max-md:text-[21px]">{nft.title}</h1>
            <span className="text-[var(--gold)] text-[18px] font-bold">{nft.priceFormatted}</span>
            <span className="text-[var(--gold)] my-3 block">
              ★★★★★ <small>{nft.reviewsCount} avaliações de colecionadores</small>
            </span>
            <Feedback feedback={feedback} />
            <h4 className="font-bold my-2">Sobre este NFT:</h4>
            <p className="text-[var(--text-soft)] leading-[1.7] max-w-[520px]">{nft.description}</p>
            <p className="text-[var(--text-soft)] leading-[1.7]">
              Edição:
              <br />
              <span className="text-[var(--gold)]">1/1 1/10 1/50 ABERTA</span>
            </p>
            <small className="text-[var(--text-soft)]">ID do token: {nft.tokenId}</small>
            <p className="text-[var(--text-soft)] leading-[1.7]">
              Coleção: Kurio Apes
              <br />
              Atributos: {nft.attributes.join(', ')}
            </p>
            <div className="flex gap-[10px] items-center my-[18px] max-md:flex-wrap">
              <Quantity value={quantity} onChange={setQuantity} />
              <button
                className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[11px] px-[25px] inline-block text-center max-md:flex-1"
                type="button"
                disabled={addToCart.isPending}
                onClick={addNftToCart}
              >
                {addToCart.isPending ? 'ADICIONANDO...' : 'COMPRAR NFT'}
              </button>
              <button className="border border-[var(--primary)] text-[var(--gold)] bg-transparent py-[10px] px-5 flex items-center gap-1 cursor-pointer" type="button" aria-pressed={isFavorite} onClick={() => favoriteMutation.mutate({ id: nft.id, favorite: !isFavorite })}>
                <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'Favoritado' : 'Favoritar'}
              </button>
            </div>
            <button className="inline-flex items-center gap-2 border border-[var(--line)] bg-transparent text-[var(--gold)] py-[10px] px-4 mt-1 hover:border-[var(--primary)] hover:bg-[var(--panel)] cursor-pointer w-full justify-center max-md:w-full" type="button" onClick={addNftToCart} disabled={addToCart.isPending}>
              <ShoppingCart size={16} /> Adicionar ao carrinho
            </button>
          </div>
        </div>
        <div className="border-t border-[var(--line)] mt-[50px] pt-[15px] text-[var(--text-soft)] leading-[1.8] max-md:mx-6">
          <h3 className="text-[var(--gold)] text-sm font-bold">
            Detalhes do NFT{' '}
            <span className="text-[var(--gold)] font-normal">Avaliações de colecionadores ({nft.reviewsCount})</span>
          </h3>
          <p>{nft.description} A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.</p>
          <p>
            4 propriedades incluem arte em alta resolução, lançamentos exclusivos para colecionadores e um
            registro permanente de procedência registrada na rede.
          </p>
          <p>
            <strong className="text-white font-bold">Rede:</strong>
            <br />
            Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.
          </p>
          <p>
            <strong className="text-white font-bold">Contrato:</strong>
            <br />
            {nft.smartContract}
          </p>
        </div>
        <h3 className="text-[var(--gold)] text-sm border-b border-[var(--line)] pb-3 mt-[30px] max-md:mx-6">Mais desta coleção</h3>
        <div className="grid grid-cols-5 gap-5 my-5 mb-[65px] max-md:grid-cols-2 max-md:mx-6">
          {catalog.slice(3, 8).map(item => (
            <NftCard compact key={item.id} nft={item} />
          ))}
        </div>
      </div>
    </Layout>
  )
}