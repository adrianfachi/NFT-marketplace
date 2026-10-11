import { http, HttpResponse } from 'msw'
import { getState, persistState, publicUser, tokenFor, userFromRequest } from '../db'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string }
    const user = getState().usersDb.find(item => item.email === body.email && item.password === body.password)
    if (!user) return HttpResponse.json({ code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' }, { status: 401 })
    return HttpResponse.json({ success: true, token: tokenFor(user.id), user: publicUser(user) })
  }),
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { email: string; password: string; username: string; name: string }
    const state = getState()
    if (state.usersDb.some(user => user.email === body.email)) return HttpResponse.json({ code: 'EMAIL_EXISTS', message: 'E-mail já cadastrado.' }, { status: 409 })
    const user = { ...body, id: `user-${state.nextUserId++}`, ens: '', walletAddress: '', walletType: '', network: 'Ethereum', secondaryWallet: '', avatar: '' }
    state.usersDb.push(user)
    persistState()
    return HttpResponse.json({ success: true, token: tokenFor(user.id), user: publicUser(user) })
  }),
  http.post('/api/auth/logout', ({ request }) => {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (token) delete getState().sessions[token]
    persistState()
    return HttpResponse.json({ success: true })
  }),
  http.get('/api/auth/session', ({ request }) => {
    const user = userFromRequest(request)
    return HttpResponse.json({ authenticated: Boolean(user), user: user ? publicUser(user) : null })
  }),
]
