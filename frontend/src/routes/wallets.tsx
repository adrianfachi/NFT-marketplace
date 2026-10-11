import { createFileRoute, redirect } from '@tanstack/react-router'
import { api } from '../services/api'
import { useEffect, useState } from 'react'
import { Field, Feedback, Layout, ProfileNav, SelectField, SubmitButton, type FeedbackState } from '../components/Kurio'
import type { UserProfile } from '@/types/api'

export const Route = createFileRoute('/wallets')({
  beforeLoad: async ({ context, location }) => {
    try {
      const session = await context.queryClient.ensureQueryData({
        queryKey: ['session'],
        queryFn: ({ signal }) => api.getSession(signal),
      })
      if (!session.authenticated) throw new Error('Sessão ausente')
    } catch {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Wallets,
})

function Wallets() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { api.getProfile().then(setUser).catch(error => setFeedback({ type: 'error', message: error.message })) }, [])

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return
    setSaving(true)
    setFeedback(null)
    try {
      const result = await api.updateWallet(user)
      setUser(result.user)
      setFeedback({ type: 'success', message: 'Carteira salva com sucesso.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar a carteira.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout footer={false}>
      <div className="grid grid-cols-[220px_1fr] gap-5 py-[25px] pb-20 max-md:block max-md:p-[22px_24px_50px]">
        <ProfileNav />
        <section className="profile-content">
          <h2 className="text-[15px] mb-2 font-bold">Carteira principal <span className="float-right text-[var(--text-soft)] text-[10px] font-normal">Adicionar</span></h2>
          <p className="text-[var(--text-soft)] text-[11px] mb-4">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
          <Feedback feedback={feedback} />
          {user && <form onSubmit={save}>
            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
              <Field label="Nome de exibição" value={user.name} onChange={event => setUser({ ...user, name: event.target.value })} />
              <Field label="Apelido da carteira" value={user.username} onChange={event => setUser({ ...user, username: event.target.value })} />
              <SelectField label="Rede" value={user.network} onChange={event => setUser({ ...user, network: event.target.value })}><option>Ethereum</option><option>Polygon</option><option>Solana</option></SelectField>
              <Field label="Nome do perfil" value={user.username} onChange={event => setUser({ ...user, username: event.target.value })} />
              <Field label="Endereço da carteira" value={user.walletAddress} onChange={event => setUser({ ...user, walletAddress: event.target.value })} required />
              <Field label="ENS ou carteira secundária (opcional)" value={user.secondaryWallet} onChange={event => setUser({ ...user, secondaryWallet: event.target.value })} />
              <SelectField label="Tipo de carteira" value={user.walletType} onChange={event => setUser({ ...user, walletType: event.target.value })}><option>MetaMask</option><option>Coinbase Wallet</option><option>WalletConnect</option></SelectField>
              <Field label="Código de indicação" placeholder="Opcional" />
              <Field label="E-mail" value={user.email} onChange={event => setUser({ ...user, email: event.target.value })} />
              <Field label="Nome ENS" value={user.ens} onChange={event => setUser({ ...user, ens: event.target.value })} placeholder=".eth" />
            </div>
            <SubmitButton loading={saving}>Salvar carteira</SubmitButton>
          </form>}
          <h2 className="text-[15px] font-bold mt-[38px]">Carteira secundária <span className="float-right text-[var(--gold)] text-[10px] font-normal">◯ Igual à carteira principal Adicionar</span></h2>
          <p className="text-[var(--text-soft)] text-[11px] mt-2">Você ainda não adicionou uma carteira secundária.</p>
        </section>
      </div>
    </Layout>
  )
}