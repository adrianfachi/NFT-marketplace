import { http, HttpResponse } from 'msw'
import { persistState, publicUser, userFromRequest } from '../db'
import { scenarioForRequest } from '../scenarios'

export const walletHandlers = [
  http.get('/api/wallets', ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    const wallets = [
      user.walletAddress && { id: `${user.id}-primary`, address: user.walletAddress, type: user.walletType || 'MetaMask', network: user.network, primary: true },
      user.secondaryWallet && { id: `${user.id}-secondary`, address: user.secondaryWallet, type: 'WalletConnect', network: user.network, primary: false },
    ].filter(Boolean)
    return HttpResponse.json({ wallets })
  }),
  http.post('/api/wallets/connect', async ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    if (scenarioForRequest(request) === 'wallet-rejected') return HttpResponse.json({ code: 'WALLET_REJECTED', message: 'A carteira recusou a conexão.' }, { status: 402 })
    const body = await request.json() as { address: string; type: string; network: string }
    user.walletAddress = body.address
    user.walletType = body.type
    user.network = body.network
    persistState()
    return HttpResponse.json({ wallet: { id: `${user.id}-primary`, address: user.walletAddress, type: user.walletType, network: user.network, primary: true } })
  }),
  http.post('/api/wallets/disconnect', async ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    if (scenarioForRequest(request) === 'wallet-disconnected') return HttpResponse.json({ code: 'WALLET_DISCONNECTED', message: 'A carteira foi desconectada.' }, { status: 409 })
    const body = await request.json() as { id?: string }
    if (body.id?.endsWith('-secondary')) user.secondaryWallet = ''
    else user.walletAddress = ''
    persistState()
    return HttpResponse.json({ success: true })
  }),
  http.put('/api/user/wallet', async ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    Object.assign(user, await request.json())
    persistState()
    return HttpResponse.json({ success: true, user: publicUser(user) })
  }),
]
