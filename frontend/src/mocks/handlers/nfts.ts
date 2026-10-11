import { http, HttpResponse } from 'msw'
import { catalog, nftById } from '../db'
import type { NftItem } from '../nftsData'

const normalize = (value: string) => value.trim().toLowerCase()

const sortEntries: Record<string, (a: NftItem, b: NftItem) => number> = {
  featured: (a, b) => b.rating - a.rating,
  'price-asc': (a, b) => Number(a.price) - Number(b.price),
  'price-desc': (a, b) => Number(b.price) - Number(a.price),
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  newest: (a, b) => Number(b.id) - Number(a.id),
}

export const nftHandlers = [
  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url)
    const search = normalize(url.searchParams.get('search') ?? '')
    const category = url.searchParams.get('category') ?? ''
    const sort = (url.searchParams.get('sort') ?? 'featured').toLowerCase()
    const parsedPage = Number(url.searchParams.get('page') ?? 1)
    const parsedPageSize = Number(url.searchParams.get('pageSize') ?? 12)

    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
    const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? Math.floor(parsedPageSize) : 12

    const filtered = catalog().filter(nft => {
      const matchesSearch = !search || (
        nft.title.toLowerCase().includes(search) ||
        nft.description.toLowerCase().includes(search) ||
        nft.category.toLowerCase().includes(search)
      )
      const matchesCategory = !category || nft.category === category
      return matchesSearch && matchesCategory
    })

    const sorted = [...filtered]
    const sorter = sortEntries[sort] ?? sortEntries.featured
    sorted.sort(sorter)

    const start = (page - 1) * pageSize
    const items = sorted.slice(start, start + pageSize)

    return HttpResponse.json({
      items,
      page,
      pageSize,
      total: filtered.length,
      sort,
    })
  }),

  http.get('/api/nfts/:id', ({ params }) => {
    const nft = nftById(String(params.id))

    if (!nft) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'NFT não encontrada.' },
        { status: 404 },
      )
    }

    return HttpResponse.json(nft)
  }),
]