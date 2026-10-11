import { http, HttpResponse } from 'msw'
import { favoriteFor, getState, persistState, userFromRequest } from '../db'

export const favoriteHandlers = [
  http.get('/api/favorites', ({ request }) => {
    const user = userFromRequest(request)
    return user ? HttpResponse.json({ favorites: favoriteFor(user.id) }) : HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
  }),
  http.post('/api/favorites', async ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    const body = await request.json() as { id: string; favorite: boolean }
    const favorites = favoriteFor(user.id).filter(id => id !== body.id)
    if (body.favorite) favorites.push(body.id)
    getState().favoriteByUser[user.id] = favorites
    persistState()
    return HttpResponse.json({ favorites })
  }),
]
