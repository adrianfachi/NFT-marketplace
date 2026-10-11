import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { favoriteHandlers } from './favorites'
import { nftHandlers } from './nfts'
import { orderHandlers } from './orders'
import { profileHandlers } from './profile'
import { quoteHandlers } from './quote'
import { walletHandlers } from './wallets'
import { http, HttpResponse } from 'msw'
import { scenarioHandlers } from '../scenarios'
import { realtimeHandlers, socketHandler } from '../realtime'

export const handlers = [
  socketHandler,
  ...scenarioHandlers(),
  ...realtimeHandlers,
  ...authHandlers,
  ...nftHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...walletHandlers,
  http.post('/api/newsletter', () => HttpResponse.json({ success: true, message: 'Inscrição realizada com sucesso!' })),
]
