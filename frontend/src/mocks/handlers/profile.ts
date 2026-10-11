import { http, HttpResponse } from 'msw'
import { persistState, publicUser, userFromRequest } from '../db'

export const profileHandlers = [
  http.get('/api/user/profile', ({ request }) => {
    const user = userFromRequest(request)
    return user ? HttpResponse.json(publicUser(user)) : HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
  }),
  http.put('/api/user/profile', async ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    Object.assign(user, await request.json())
    persistState()
    return HttpResponse.json({ success: true, user: publicUser(user) })
  }),
  http.put('/api/user/password', async ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    const body = await request.json() as { currentPassword: string; newPassword: string }
    if (user.password !== body.currentPassword) return HttpResponse.json({ code: 'INVALID_PASSWORD', message: 'Senha atual inválida.' }, { status: 400 })
    user.password = body.newPassword
    persistState()
    return HttpResponse.json({ success: true, message: 'Senha atualizada.' })
  }),
]
