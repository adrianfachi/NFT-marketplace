import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { Layout, NftCard, nftImage, useCatalog } from '../components/Kurio'
import emerald from '../assets/EmeraldApe.png'
import { compare } from '@/lib/money'

interface CatalogSearch {
  search?: string
  category?: string
  sort?: string
  page?: number
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    search: typeof search.search === 'string' ? search.search : undefined,
    category: typeof search.category === 'string' ? search.category : undefined,
    sort: typeof search.sort === 'string' ? search.sort : 'recent',
    page: Number(search.page) > 0 ? Number(search.page) : 1,
  }),
  component: Home,
})

function Home() {
  const query = useSearch({ from: '/' })
  const items = useCatalog({ search: query.search, category: query.category, sort: query.sort, page: query.page })
  const navigate = useNavigate()
  const [searchDraft, setSearchDraft] = useState(query.search ?? '')
  const filteredItems = [...items].sort((a, b) => query.sort === 'price' ? compare(a.price, b.price) : 0)

  function applyCatalogState(next: { search?: string; category?: string; sort?: string }) {
    const params = { search: next.search ?? searchDraft, category: next.category ?? query.category ?? '', sort: next.sort ?? query.sort ?? 'recent', page: 1 }
    setSearchDraft(params.search)
    void navigate({ to: '/', search: () => params })
  }

  return (
    <Layout>
      <section className="grid grid-cols-[1fr_420px] gap-[60px] items-center pt-[28px] px-[30px] pb-[55px] max-md:flex max-md:flex-col-reverse max-md:gap-[18px] max-md:p-[26px_24px_32px] max-md:items-stretch">
        <div>
          <span className="text-[var(--text-soft)] text-[11px]">Bem-vindo à Kurio</span>
          <h1 className="text-[34px] leading-[1.55] my-[14px] max-w-[450px] max-md:text-[25px] max-md:leading-[1.35] max-md:my-[10px]">SEJA DONO DO FUTURO DA ARTE DIGITAL</h1>
          <p className="text-[var(--text-soft)] leading-[1.7] max-w-[390px] mb-[23px] max-md:mb-4">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>
          <Link className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[11px] px-[25px] inline-block text-center" to="/">
            EXPLORAR
          </Link>
        </div>
        <img src={emerald} alt="Emerald Ape" className="w-full aspect-[1.15] object-cover rounded-2xl max-md:max-h-[260px] max-md:max-w-none" />
      </section>

      <section className="grid grid-cols-[235px_1fr] gap-[25px] pb-[70px] max-md:block max-md:p-[0_24px_38px]">
        <aside className="bg-[var(--panel)] p-[22px_17px] max-md:hidden">
          <h3 className="m-0 mb-[15px] font-bold text-sm">Coleções</h3>
          {[
            'Arte digital',
            'Fotografia',
            'Música',
            'Arte 3D',
            'Colecionáveis',
            'Generativa',
            'Jogos',
            'Assinaturas',
            'Utilidade',
          ].map((x, i) => (
            <div className="flex justify-between text-[var(--text-soft)] py-[7px]" key={x}>
              <button type="button" className="bg-transparent border-0 text-inherit p-0 text-left cursor-pointer" onClick={() => applyCatalogState({ category: query.category === x ? '' : x })}>{x}</button>
              <b className="text-[var(--gold)] font-normal">({[33, 12, 65, 39, 23, 17, 19, 13, 18][i]})</b>
            </div>
          ))}

          <div className="border-b border-[var(--line)] pb-5 mb-[18px]">
            <h3 className="m-0 mb-[15px] font-bold text-sm mt-4">Faixa de preço</h3>
            <input className="w-full accent-[var(--gold)] range" type="range" defaultValue="65" />
            <small className="text-[var(--text-soft)]">Preço: 0,02 - 12,30 ETH</small>
            <br />
            <button className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[7px] px-[12px] inline-block text-center mt-2">Aplicar</button>
          </div>

          <h3 className="m-0 mb-[15px] font-bold text-sm">Rede</h3>
          {['Ethereum', 'Polygon', 'Solana'].map((x, i) => (
            <div className="flex justify-between text-[var(--text-soft)] py-[7px]" key={x}>
              <span>{x}</span>
              <b className="text-[var(--gold)] font-normal">({[119, 78, 86][i]})</b>
            </div>
          ))}
        </aside>

        <section className="market-content">
          <div className="flex justify-between border-b border-[var(--line)] mb-5 max-md:overflow-x-auto max-md:whitespace-nowrap max-md:pb-2">
            <div className="flex gap-[22px] max-md:gap-[18px]">
              <button type="button" className={`bg-transparent border-0 text-[#f5f1eb] pb-3 cursor-pointer ${!query.category ? 'text-[var(--gold)] border-b border-[var(--gold)]' : ''}`} onClick={() => applyCatalogState({ category: '' })}>Todos os NFTs</button>
              <button type="button" className="bg-transparent border-0 text-[#f5f1eb] pb-3 cursor-pointer" onClick={() => applyCatalogState({ sort: 'recent' })}>Novos lançamentos</button>
              <button type="button" className="bg-transparent border-0 text-[#f5f1eb] pb-3 cursor-pointer" onClick={() => applyCatalogState({ sort: 'price' })}>Menor preço</button>
            </div>
            <label className="text-[var(--text-soft)] max-md:hidden">Busca <input value={searchDraft} onChange={event => setSearchDraft(event.target.value)} onKeyDown={event => event.key === 'Enter' && applyCatalogState({})} className="bg-transparent border border-[var(--line)] text-white p-1 ml-1" /></label>
          </div>

          <div className="grid grid-cols-3 gap-y-6 gap-x-5 max-md:grid-cols-2 max-md:gap-y-6 max-md:gap-x-4">
            {filteredItems.map((nft) => (
              <NftCard key={nft.id} nft={nft} />
            ))}
          </div>
        </section>
      </section>

      <section className="grid grid-cols-2 gap-[18px] mb-[65px] max-md:grid-cols-1 max-md:mx-6 max-md:mb-[34px]">
        <div className="bg-[var(--panel)] flex items-center">
          <img src={nftImage(items[1] ?? items[0])} alt="Lançamentos" className="w-[48%] aspect-square object-cover" />
          <div className="p-5 text-center">
            <h3 className="text-[13px] font-bold">
              Lançamentos gênesis
              <br />
              de edição limitada
            </h3>
            <p className="text-[var(--text-soft)] leading-[1.6] my-2">
              Colecione edições escassas diretamente dos criadores antes da
              valorização pública.
            </p>
            <Link to="/" className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[7px] px-[14px] inline-block text-center text-xs">
              Explorar →
            </Link>
          </div>
        </div>

        <div className="bg-[var(--panel)] flex items-center">
          <img src={nftImage(items[2] ?? items[0])} alt="Arte" className="w-[48%] aspect-square object-cover" />
          <div className="p-5 text-center">
            <h3 className="text-[13px] font-bold">
              Arte digital selecionada
              <br />e muito mais
            </h3>
            <p className="text-[var(--text-soft)] leading-[1.6] my-2">
              Explore novos artistas, coleções verificadas e obras digitais que
              definem a era.
            </p>
            <Link to="/" className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[7px] px-[14px] inline-block text-center text-xs">
              Explorar →
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}