import { useNavigate, useLocation } from '@tanstack/react-router'
import { Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'
import { Feedback, type FeedbackState, SubmitButton } from './Feedback'
import { Field } from './Field'
import { useLoginMutation, useRegisterMutation } from '../hooks/useAuth'
import type { AuthCredentials, RegisterPayload } from '../lib/api.types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF } from 'react-icons/fa'

function getCleanRedirect(searchRedirect?: unknown): string {
  if (typeof searchRedirect !== 'string' || !searchRedirect) {
    const sessionRedirect = sessionStorage.getItem('kurio-session-redirect')
    if (sessionRedirect && !sessionRedirect.includes('login') && !sessionRedirect.includes('register')) {
      return sessionRedirect
    }
    return '/profile'
  }
  if (searchRedirect.includes('login') || searchRedirect.includes('register')) {
    return '/profile'
  }
  return searchRedirect
}

export function AuthModal({ register: propRegister }: { register?: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isRegister = propRegister ?? location.pathname.includes('register')
  const searchObj = location.search as Record<string, unknown>
  const targetRedirect = getCleanRedirect(searchObj?.redirect)

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const loading = loginMutation.isPending || registerMutation.isPending

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (isRegister && password !== confirmation) {
      setFeedback({ type: 'error', message: 'As senhas precisam ser iguais.' })
      return
    }
    setFeedback(null)
    try {
      if (isRegister) {
        const payload: RegisterPayload = { email, password, username, name: username }
        await registerMutation.mutateAsync(payload)
      } else {
        const payload: AuthCredentials = { email, password }
        await loginMutation.mutateAsync(payload)
      }
      setFeedback({ type: 'success', message: isRegister ? 'Conta criada com sucesso!' : 'Login realizado com sucesso!' })
      sessionStorage.removeItem('kurio-session-redirect')
      
      // Navega de forma limpa para o destino final
      await navigate({ to: targetRedirect })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível concluir.' })
    }
  }

  function handleClose() {
    sessionStorage.removeItem('kurio-session-redirect')
    navigate({ to: '/' })
  }

  function handleSwitchMode(toRegister: boolean) {
    const redirect = searchObj?.redirect
    const searchParam = typeof redirect === 'string' ? { redirect } : undefined
    navigate({ 
      to: toRegister ? '/register' : '/login', 
      search: searchParam 
    })
  }

  return (
    <div className="fixed inset-0 z-10 bg-[#090605]/72 grid place-items-center max-md:block max-md:p-0 max-md:bg-[var(--ink)]">
      <form className="w-[350px] bg-[var(--panel)] border-b-[5px] border-[var(--primary)] py-[25px] px-[42px] relative shadow-[0_20px_70px_#000] max-md:w-full max-md:min-h-dvh max-md:max-h-none max-md:overflow-y-auto max-md:border-0 max-md:rounded-none max-md:pt-12 max-md:px-6 max-md:pb-8 max-md:shadow-none box-border" onSubmit={submit}>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 bg-transparent text-[var(--gold)] border-0 cursor-pointer z-20" 
          aria-label="Fechar" 
          onClick={handleClose}
        >
          <X size={18} />
        </Button>
        
        <div className="hidden max-md:flex flex-col items-center mb-6">
          <span className="font-bold tracking-[3px] text-sm text-white mb-6">KURIO</span>
          <h2 className="text-center text-sm font-bold text-white tracking-wider mb-2">{isRegister ? 'Criar perfil de colecionador' : 'Entrar'}</h2>
        </div>

        <h2 className="text-center text-sm mb-4 mt-0 font-normal max-md:hidden">
          <span 
            className={`cursor-pointer font-bold ${!isRegister ? 'text-[var(--gold)] underline' : 'text-[var(--text-soft)]'}`}
            onClick={() => handleSwitchMode(false)}
          >
            Entrar
          </span> 
          <span className="text-[var(--text-soft)] mx-2">|</span> 
          <span 
            className={`cursor-pointer font-bold ${isRegister ? 'text-[var(--gold)] underline' : 'text-[var(--text-soft)]'}`}
            onClick={() => handleSwitchMode(true)}
          >
            Criar conta
          </span>
        </h2>
        
        <p className="text-[var(--text-soft)] text-[10px] text-center leading-[1.5] mb-[18px] max-md:hidden">
          {isRegister ? 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.' : 'Entre para gerenciar sua carteira, coleção e perfil de criador.'}
        </p>
        
        {isRegister && <Field label="Nome de usuário" value={username} onChange={event => setUsername(event.target.value)} required />}
        <Field label="E-mail" value={email} onChange={event => setEmail(event.target.value)} type="email" required placeholder={isRegister ? 'Digite seu e-mail' : 'contato@email.com'} />
        
        <label className="flex flex-col gap-1.5 mb-[9px]">
          <span className="text-[#eee] text-xs">Senha</span>
          <div className="flex border border-[var(--line)] bg-transparent rounded-none items-center h-10 px-3">
            <Input value={password} onChange={event => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} required placeholder="**********" className="border-0! flex-1 bg-transparent text-white p-0 h-auto shadow-none focus-visible:ring-0" />
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(value => !value)} aria-label="Mostrar senha" className="border-0 bg-transparent text-[var(--text-soft)] hover:bg-transparent p-0 h-auto cursor-pointer"><span className="sr-only">Alternar senha</span>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</Button>
          </div>
        </label>

        {!isRegister && <div className="text-right mb-4"><a href="#" onClick={e => e.preventDefault()} className="text-[var(--gold)] text-[10px] hover:underline">Esqueceu a senha?</a></div>}

        {isRegister && (
          <label className="flex flex-col gap-1.5 mb-[9px]">
            <span className="text-[#eee] text-xs">Confirmar senha</span>
            <div className="flex border border-[var(--line)] bg-transparent rounded-none items-center h-10 px-3">
              <Input value={confirmation} onChange={event => setConfirmation(event.target.value)} type={showPassword ? 'text' : 'password'} required placeholder="Confirmar senha" className="border-0! flex-1 bg-transparent text-white p-0 h-auto shadow-none focus-visible:ring-0" />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(value => !value)} aria-label="Mostrar senha" className="border-0 bg-transparent text-[var(--text-soft)] hover:bg-transparent p-0 h-auto cursor-pointer"><span className="sr-only">Alternar senha</span>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</Button>
            </div>
          </label>
        )}

        <Feedback feedback={feedback} />
        <SubmitButton loading={loading}>{isRegister ? 'Criar perfil' : 'Entrar'}</SubmitButton>
        
        <div className="text-center text-[var(--text-soft)] text-[10px] my-4 flex items-center gap-3 before:content-[''] before:flex-1 before:border-t before:border-[var(--line)] after:content-[''] after:flex-1 after:border-t after:border-[var(--line)]">Ou continue com</div>
        
        <Button type="button" variant="outline" className="w-full bg-transparent border border-[var(--line)] text-white p-2.5 mt-2 hover:bg-[var(--panel-2)] h-10 text-xs justify-center gap-2 rounded-none"><FcGoogle size={16} /> Continuar com Google</Button>
        <Button type="button" variant="outline" className="w-full bg-transparent border border-[var(--line)] text-white p-2.5 mt-2 hover:bg-[var(--panel-2)] h-10 text-xs justify-center gap-2 rounded-none"><FaFacebookF size={15} className="text-[#1877F2]" /> Continuar com Facebook</Button>

        <div className="text-center mt-6">
          {isRegister ? (
            <span className="text-[var(--text-soft)] text-[11px]">Já tem uma conta? <a href="/login" onClick={(e) => { e.preventDefault(); handleSwitchMode(false); }} className="text-white hover:underline">Entre</a></span>
          ) : (
            <span className="text-[var(--text-soft)] text-[11px]">Novo na Kurio? <a href="/register" onClick={(e) => { e.preventDefault(); handleSwitchMode(true); }} className="text-white hover:underline">Crie uma conta</a></span>
          )}
        </div>
      </form>
    </div>
  )
}