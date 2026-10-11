import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Field, Feedback, Layout, ProfileNav, Skeleton, SubmitButton, type FeedbackState } from '../components/Kurio'
import { useLogoutMutation } from '../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { api } from '../services/api'
import type { UserProfile } from '@/types/api'

export const Route = createFileRoute('/profile')({
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
  component: Profile,
})

function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirmation: '' })
  const logout = useLogoutMutation()
  const navigate = useNavigate()

  useEffect(() => {
    api.getProfile().then(setUser).catch(error => setFeedback({ type: 'error', message: error.message })).finally(() => setLoading(false))
  }, [])

  function update(field: keyof UserProfile, value: string) {
    setUser(current => current ? { ...current, [field]: value } : current)
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return
    setSaving(true)
    setFeedback(null)
    try {
      const result = await api.updateProfile(user)
      setUser(result.user)
      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar o perfil.' })
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault()
    if (passwords.next !== passwords.confirmation) {
      setFeedback({ type: 'error', message: 'A confirmação de senha não confere.' })
      return
    }
    setSaving(true)
    try {
      const result = await api.updatePassword(passwords.current, passwords.next)
      setPasswords({ current: '', next: '', confirmation: '' })
      setFeedback({ type: 'success', message: result.message })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível alterar a senha.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout footer={false}>
      <div className="grid grid-cols-[220px_1fr] gap-5 py-[25px] pb-20 max-md:block max-md:p-[22px_24px_50px]">
        <ProfileNav />
        <section className="profile-content">
          <h2 className="text-[15px] mb-7 mt-0 font-bold">Perfil do colecionador</h2>
          <Feedback feedback={feedback} />
          {loading ? <div aria-label="Carregando perfil"><Skeleton className="h-8 w-48" /><Skeleton className="mt-4 h-32 w-full" /></div> : user && (
            <>
              <form onSubmit={saveProfile}>
                <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                  <Field label="Nome de exibição" value={user.name} onChange={event => update('name', event.target.value)} required />
                  <Field label="Nome de usuário" value={user.username} onChange={event => update('username', event.target.value)} required />
                  <Field label="E-mail" type="email" value={user.email} onChange={event => update('email', event.target.value)} required />
                  <Field label="Nome ENS" value={user.ens} onChange={event => update('ens', event.target.value)} />
                  <Field label="Apelido da carteira" value={user.walletAddress} onChange={event => update('walletAddress', event.target.value)} />
                  <div className="flex flex-col gap-2"><span>Avatar</span><button type="button" className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[11px] px-[25px] inline-block text-center w-max cursor-pointer">◎ Alterar avatar</button></div>
                </div>
                <SubmitButton loading={saving}>Salvar perfil</SubmitButton>
              </form>
              <form onSubmit={savePassword} className="mt-[35px]">
                <h2 className="text-[15px] mb-7 font-bold">Alterar senha</h2>
                <div className="max-w-[400px] grid gap-[15px]">
                  <Field label="Senha atual" type="password" value={passwords.current} onChange={event => setPasswords({ ...passwords, current: event.target.value })} required />
                  <Field label="Nova senha" type="password" value={passwords.next} onChange={event => setPasswords({ ...passwords, next: event.target.value })} required />
                  <Field label="Confirmar nova senha" type="password" value={passwords.confirmation} onChange={event => setPasswords({ ...passwords, confirmation: event.target.value })} required />
                </div>
                <SubmitButton loading={saving}>Atualizar senha</SubmitButton>
              </form>
            </>
          )}
          <button type="button" className="border border-[var(--primary)] text-[var(--gold)] bg-transparent py-[10px] px-5 mt-4 cursor-pointer" disabled={logout.isPending} onClick={async () => { await logout.mutateAsync(); await navigate({ to: '/' }) }}>Sair da conta</button>
        </section>
      </div>
    </Layout>
  )
}