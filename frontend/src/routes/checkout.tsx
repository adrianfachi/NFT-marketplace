import { createFileRoute, Outlet, redirect, useLocation, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Layout, Feedback, type FeedbackState, nftImage } from '../components/Kurio'
import { Input } from '../components/ui/input'
import { useCartQuery } from '../hooks/useCart'
import { api } from '../services/api'

export const Route = createFileRoute('/checkout')({
  beforeLoad: async ({ context, location }) => {
    try {
      const session = await context.queryClient.ensureQueryData({
        queryKey: ['session'],
        queryFn: ({ signal }) => api.getSession(signal),
      })
      if (!session.authenticated) throw new Error('Sessão ausente')
    } catch {
      sessionStorage.setItem('kurio-session-redirect', location.href)
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Checkout,
})

function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const cartQuery = useCartQuery()
  const cart = cartQuery.data
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [network, setNetwork] = useState('Ethereum')
  const [profileName, setProfileName] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [secondaryWallet, setSecondaryWallet] = useState('')
  const [walletType, setWalletType] = useState('MetaMask')
  const [referralCode, setReferralCode] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [useOtherWallet, setUseOtherWallet] = useState(false)
  const [note, setNote] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('Coinbase Wallet')

  async function handleConfirmPurchase(e: React.FormEvent) {
    e.preventDefault()

    if (!cart?.items.length) {
      setFeedback({ type: 'error', message: 'Seu carrinho está vazio.' })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const quote = await api.getQuote()
      const idempotencyKey = `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      const payload = {
        quoteId: quote.quoteId,
        version: quote.version,
        wallet: selectedWallet || walletType,
        network,
        collector: {
          name,
          email,
          profile: profileName || username,
        },
      }

      const order = await api.createOrder(payload, idempotencyKey)
      sessionStorage.setItem('kurio-order-id', order.orderId)
      sessionStorage.setItem('checkout-idempotency-key', idempotencyKey)

      queryClient.setQueryData(['cart'], {
        items: [],
        subtotal: '0.000 ETH',
        discount: '0.000 ETH',
        networkFee: '0.016 ETH',
        total: '0.016 ETH',
      })
      await queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.removeQueries({ queryKey: ['cart'] })
      sessionStorage.removeItem('kurio-session-redirect')
      await navigate({ to: '/checkout/success', replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível confirmar o pedido. Tente novamente.'
      console.error('Checkout navigation failed:', error)
      setFeedback({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  if (location.pathname === '/checkout/success') {
    return <Outlet />
  }

  return (
    <Layout>
      <div className="py-[28px] pb-[70px] max-md:p-[22px_24px_50px]">
        <div className="text-[var(--text-soft)] text-xs mb-6">
          Início / Mercado / Pagamento
        </div>

        <form onSubmit={handleConfirmPurchase} className="grid grid-cols-[1fr_380px] gap-12 max-lg:grid-cols-1">
          <div>
            <h2 className="text-sm font-bold mb-5 text-white uppercase tracking-wider">
              Perfil do colecionador
            </h2>

            <Feedback feedback={feedback} />

            <div className="grid grid-cols-2 gap-x-5 gap-y-4 max-md:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  Nome de exibição<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="bg-transparent border border-[var(--line)] text-white p-2.5 h-10 text-xs rounded-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  Nome de usuário<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="bg-transparent border border-[var(--line)] text-white p-2.5 h-10 text-xs rounded-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  Rede<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <select
                  value={network}
                  onChange={e => setNetwork(e.target.value)}
                  required
                  className="bg-transparent border border-[var(--line)] text-[#c2a892] p-2.5 h-10 text-xs rounded-none outline-none focus:border-[var(--primary)]"
                >
                  <option value="Ethereum" className="bg-[var(--panel)] text-white">Ethereum</option>
                  <option value="Polygon" className="bg-[var(--panel)] text-white">Polygon</option>
                  <option value="Solana" className="bg-[var(--panel)] text-white">Solana</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  Nome do perfil<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <Input
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  required
                  className="bg-transparent border border-[var(--line)] text-white p-2.5 h-10 text-xs rounded-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  Endereço da carteira<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <Input
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                  placeholder="Endereço 0x da carteira"
                  required
                  className="bg-transparent border border-[var(--line)] text-white placeholder:text-[#56351f] p-2.5 h-10 text-xs rounded-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white opacity-0 pointer-events-none max-md:hidden">
                  Secundária
                </label>
                <Input
                  value={secondaryWallet}
                  onChange={e => setSecondaryWallet(e.target.value)}
                  placeholder="ENS ou carteira secundária (opcional)"
                  className="bg-transparent border border-[var(--line)] text-white placeholder:text-[#56351f] p-2.5 h-10 text-xs rounded-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  Tipo de carteira<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <select
                  value={walletType}
                  onChange={e => setWalletType(e.target.value)}
                  required
                  className="bg-transparent border border-[var(--line)] text-[#c2a892] p-2.5 h-10 text-xs rounded-none outline-none focus:border-[var(--primary)]"
                >
                  <option value="MetaMask" className="bg-[var(--panel)] text-white">MetaMask</option>
                  <option value="Coinbase Wallet" className="bg-[var(--panel)] text-white">Coinbase Wallet</option>
                  <option value="WalletConnect" className="bg-[var(--panel)] text-white">WalletConnect</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  Código de indicação<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <Input
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value)}
                  required
                  className="bg-transparent border border-[var(--line)] text-white p-2.5 h-10 text-xs rounded-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  E-mail<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-transparent border border-[var(--line)] text-white p-2.5 h-10 text-xs rounded-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white">
                  Nome ENS<span className="text-[#e78354] ml-0.5">*</span>
                </label>
                <select
                  value={ensName}
                  onChange={e => setEnsName(e.target.value)}
                  className="bg-transparent border border-[var(--line)] text-white p-2.5 h-10 text-xs rounded-none outline-none focus:border-[var(--primary)]"
                >
                  <option value="" className="bg-[var(--panel)] text-white">.eth</option>
                  <option value="kurio.eth" className="bg-[var(--panel)] text-white">kurio.eth</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseOtherWallet(!useOtherWallet)}
                className="w-3.5 h-3.5 border border-[var(--gold)] rounded-full flex items-center justify-center bg-transparent cursor-pointer"
              >
                {useOtherWallet && <span className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />}
              </button>
              <span className="text-xs text-white cursor-pointer" onClick={() => setUseOtherWallet(!useOtherWallet)}>
                Usar outra carteira?
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <label className="text-xs text-white">
                Observação do colecionador (opcional)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={5}
                className="bg-transparent border border-[var(--line)] text-white p-2.5 text-xs outline-none focus:border-[var(--primary)] resize-none"
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">
              Seus NFTs
            </h2>

            <div className="flex justify-between text-xs text-[var(--text-soft)] mb-2">
              <span>NFTs</span>
              <span>Subtotal</span>
            </div>

            <div className="flex flex-col gap-2.5 mb-4">
              {(cart?.items ?? []).map(item => (
                <div key={item.id} className="bg-[var(--panel)] p-2.5 flex items-center justify-between gap-3 border border-transparent hover:border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    <img src={nftImage(item)} alt={item.title} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <b className="text-xs text-white block font-bold">{item.title}</b>
                      <span className="text-[10px] text-[var(--text-soft)] font-mono">
                        ID do token: #{item.tokenId} <span className="text-white ml-1">(x {item.quantity})</span>
                      </span>
                    </div>
                  </div>
                  <strong className="text-xs text-[var(--gold)] font-bold whitespace-nowrap">
                    {item.priceFormatted}
                  </strong>
                </div>
              ))}

              {(!cart?.items || cart.items.length === 0) && (
                <div className="bg-[var(--panel)] p-3 text-xs text-[var(--text-soft)] border border-[var(--line)]">
                  Seu carrinho está vazio.
                </div>
              )}
            </div>

            <p className="text-center text-xs text-white mb-4">
              Tem um código promocional? <a href="#" onClick={e => e.preventDefault()} className="underline hover:text-[var(--gold)]">Aplique aqui</a>
            </p>

            <div className="flex flex-col gap-2 text-xs mb-3">
              <div className="flex justify-between text-white">
                <span>Subtotal</span>
                <span>{cart?.subtotal ?? '26.83 ETH'}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Desconto do lançamento</span>
                <span>{cart?.discount ? `(-) ${cart.discount}` : '(-) 00.00'}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Taxa de rede</span>
                <span>{cart?.networkFee ?? '0.016 ETH'}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-[var(--gold)] mb-4 uppercase tracking-wider">
              Taxa estimada
            </div>

            <div className="flex justify-between items-center text-sm font-bold border-t border-b border-[var(--line)] py-3 mb-6">
              <span className="text-white">Total</span>
              <span className="text-[var(--gold)] text-base">{cart?.total ?? '26.846 ETH'}</span>
            </div>

            <h3 className="text-xs font-bold text-center text-white mb-3 uppercase tracking-wider">
              Carteira e rede
            </h3>

            <div className="flex flex-col gap-2.5 mb-6">
              <div 
                onClick={() => setSelectedWallet('multi')}
                className={`p-3 border flex items-center gap-3 cursor-pointer transition-colors ${selectedWallet === 'multi' ? 'border-[var(--primary)] bg-[var(--panel)]' : 'border-[var(--line)] bg-transparent'}`}
              >
                <div className="w-3.5 h-3.5 border border-[var(--gold)] rounded-full flex items-center justify-center shrink-0">
                  {selectedWallet === 'multi' && <span className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />}
                </div>
                <div className="flex gap-2 text-[8px] font-mono tracking-wider text-[var(--gold)] uppercase">
                  <span className="border border-[var(--line)] px-1.5 py-0.5">METAMASK</span>
                  <span className="border border-[var(--line)] px-1.5 py-0.5">WALLETCONNECT</span>
                  <span className="border border-[var(--line)] px-1.5 py-0.5">COINBASE</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedWallet('MetaMask')}
                className={`p-3 border flex items-center gap-3 cursor-pointer transition-colors ${selectedWallet === 'MetaMask' ? 'border-[var(--primary)] bg-[var(--panel)]' : 'border-[var(--line)] bg-transparent'}`}
              >
                <div className="w-3.5 h-3.5 border border-[var(--gold)] rounded-full flex items-center justify-center shrink-0">
                  {selectedWallet === 'MetaMask' && <span className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />}
                </div>
                <span className="text-xs text-white font-mono">MetaMask</span>
              </div>

              <div 
                onClick={() => setSelectedWallet('Coinbase Wallet')}
                className={`p-3 border flex items-center gap-3 cursor-pointer transition-colors ${selectedWallet === 'Coinbase Wallet' ? 'border-[var(--primary)] bg-[var(--panel)]' : 'border-[var(--line)] bg-transparent'}`}
              >
                <div className="w-3.5 h-3.5 border border-[var(--gold)] rounded-full flex items-center justify-center shrink-0">
                  {selectedWallet === 'Coinbase Wallet' && <span className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />}
                </div>
                <span className="text-xs text-white font-mono">Coinbase Wallet</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--ink)] font-bold py-3.5 text-xs tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'A processar...' : 'Confirmar compra'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}