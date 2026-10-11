import { Link } from '@tanstack/react-router'
import { Menu, Search, ShoppingCart, X } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FiFacebook, FiGithub, FiInstagram, FiLinkedin, FiSend, FiTwitter, FiUser } from 'react-icons/fi'
import emerald from '../assets/EmeraldApe.png'
import sage from '../assets/SageNomad.png'
import neon from '../assets/NeomVessel.png'
import cosmic from '../assets/CosmicBloom.png'
import violet from '../assets/VioletNomad.png'
import ivory from '../assets/IvoryBaron.png'
import golden from '../assets/GoldenBeat.png'
import { nftsCatalog, type NftItem } from '../mocks/nftsData'
import { useNftsQuery } from '../hooks/useNfts'
import { useNewsletterMutation } from '../hooks/useProfile'
import { useCartQuery } from '../hooks/useCart'
import { useRealtime } from '../lib/realtime'
import { Button } from './ui/button'

const images: Record<string, string> = {
  Emerald: emerald, Sage: sage, Neon: neon, Cosmic: cosmic,
  Violet: violet, Ivory: ivory, Golden: golden,
}

export const nftImage = (nft?: Partial<NftItem> | null) => {
  const title = nft?.title ?? ''
  const key = title.split(' ')[0]
  return images[key] ?? emerald
}

export function Header() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(sessionStorage.getItem('kurio-session'))
  )
  const cart = useCartQuery(isAuthenticated)

  useEffect(() => {
    function handleSessionChange() {
      setIsAuthenticated(Boolean(sessionStorage.getItem('kurio-session')))
    }

    window.addEventListener('kurio:session-changed', handleSessionChange)
    return () => {
      window.removeEventListener('kurio:session-changed', handleSessionChange)
    }
  }, [])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const closeMenu = () => setMobileMenuOpen(false)
  const cartCount = cart.data?.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) ?? 0

  return (
    <header className="h-[58px] max-w-[1080px] mx-auto flex items-center border-b border-[var(--line)] gap-[60px] max-md:h-[68px] max-md:px-6 max-md:gap-0 max-md:justify-between max-md:mx-0 max-md:w-full box-border">
      <Link to="/" className="font-bold tracking-[3px] text-xs">KURIO</Link>
      <Button className="hidden max-md:inline-flex max-md:-order-1 text-[var(--text)] bg-transparent border-0" variant="ghost" size="icon" aria-label="Abrir menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></Button>
      <nav className="flex gap-7 h-full items-center flex-1 max-md:hidden">
        <Link to="/" activeOptions={{ exact: false }} className="h-full grid place-items-center text-[#d2c5ba] border-b-2 border-transparent [&.active]:text-[var(--gold)] [&.active]:border-[var(--gold)]">Início</Link>
        <Link to="/market" activeOptions={{ exact: true }} className="h-full grid place-items-center text-[#d2c5ba] border-b-2 border-transparent [&.active]:text-[var(--gold)] [&.active]:border-[var(--gold)]">Mercado</Link>
        <Link to="/creators" activeOptions={{ exact: true }} className="h-full grid place-items-center text-[#d2c5ba] border-b-2 border-transparent [&.active]:text-[var(--gold)] [&.active]:border-[var(--gold)]">Criadores</Link>
        <Link to="/learn" activeOptions={{ exact: true }} className="h-full grid place-items-center text-[#d2c5ba] border-b-2 border-transparent [&.active]:text-[var(--gold)] [&.active]:border-[var(--gold)]">Aprenda</Link>
      </nav>
      <div className="flex items-center gap-[18px] max-md:gap-[14px]">
        <button type="button" className="bg-transparent border-0 text-white cursor-pointer" aria-label="Buscar" onClick={() => navigate({ to: '/' })}><Search size={16} /></button>
        <Link to="/cart" className="relative flex" aria-label={`Carrinho com ${cartCount} itens`}>
          <ShoppingCart size={16} />
          {cartCount > 0 && <b className="absolute bg-[var(--primary)] text-[var(--ink)] rounded-full text-[8px] w-[13px] h-[13px] text-center -right-[9px] -top-[8px]">{cartCount}</b>}
        </Link>
        
        {isAuthenticated ? (
          <Link to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--panel-2)] text-[var(--gold)] border border-[var(--line)] hover:border-[var(--gold)] transition-colors" aria-label="Meu perfil">
            <FiUser size={16} />
          </Link>
        ) : (
          <Link to="/login" className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[7px] px-[14px] inline-block text-center text-xs max-md:py-2 max-md:px-3">Entrar</Link>
        )}
      </div>
      {mobileMenuOpen && <div className="block fixed inset-0 z-30 bg-[#090605]/72 max-md:block" onClick={closeMenu} aria-hidden="true" />}
      <aside className={`hidden max-md:flex flex-col fixed inset-y-0 left-0 z-31 w-[min(82vw,320px)] p-[18px] bg-[var(--panel)] border-r border-[var(--line)] transition-transform duration-200 ease-in-out shadow-[14px_0_40px_#0008] box-border ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-[105%]'}`} aria-label="Navegação móvel" aria-hidden={!mobileMenuOpen}>
        <div className="flex items-center justify-between text-[var(--gold)] font-bold"><strong>KURIO</strong><Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={closeMenu} className="bg-transparent border-0"><X size={20} /></Button></div>
        <nav className="flex flex-col gap-1 mt-7">
          <Link to="/" onClick={closeMenu} className="block p-[13px_10px] border-0 border-b border-[var(--line)] bg-transparent text-left text-inherit no-underline">Início</Link>
          <Link to="/market" onClick={closeMenu} className="block p-[13px_10px] border-0 border-b border-[var(--line)] bg-transparent text-left text-inherit no-underline">Mercado</Link>
          <Link to="/creators" onClick={closeMenu} className="block p-[13px_10px] border-0 border-b border-[var(--line)] bg-transparent text-left text-inherit no-underline">Criadores</Link>
          <Link to="/learn" onClick={closeMenu} className="block p-[13px_10px] border-0 border-b border-[var(--line)] bg-transparent text-left text-inherit no-underline">Aprenda</Link>
          <Link to="/cart" onClick={closeMenu} className="block p-[13px_10px] border-0 border-b border-[var(--line)] bg-transparent text-left text-inherit no-underline">Carrinho</Link>
          {isAuthenticated ? (
            <Link to="/profile" onClick={closeMenu} className="block p-[13px_10px] border-0 border-b border-[var(--line)] bg-transparent text-left text-inherit no-underline">Meu Perfil</Link>
          ) : (
            <Link to="/login" onClick={closeMenu} className="block p-[13px_10px] border-0 border-b border-[var(--line)] bg-transparent text-left text-inherit no-underline">Entrar</Link>
          )}
        </nav>
      </aside>
    </header>
  )
}

export function Footer() {
  const navigate = useNavigate()
  const newsletter = useNewsletterMutation()
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')

  async function subscribe(event: FormEvent) {
    event.preventDefault()
    try {
      await newsletter.mutateAsync(email)
      setEmail('')
      setNotice('Inscrição realizada com sucesso!')
    } catch {
      setNotice('Informe um e-mail válido e tente novamente.')
    }
  }

  return (
    <footer className="bg-[var(--panel)] mt-5 w-full box-border">
      <div className="max-w-[1080px] mx-auto grid grid-cols-4 p-[24px_25px] gap-7 border-b border-[var(--line)] max-md:grid-cols-1 max-md:p-6 max-md:gap-[18px] box-border">
        <div className="border-r border-[var(--line)] pr-5 max-md:border-r-0 max-md:border-b max-md:pb-[18px]">
          <strong className="grid place-items-center bg-[var(--primary)] text-[var(--ink)] w-[42px] h-[42px] rounded-full text-[15px] font-bold">W</strong>
          <h3 className="text-xs my-[10px_6px] font-bold">Segurança da carteira</h3>
          <p className="text-[var(--text-soft)] leading-[1.6] text-[10px]">Proteja sua carteira e colecione arte digital verificada com confiança.</p>
        </div>
        <div className="border-r border-[var(--line)] pr-5 max-md:border-r-0 max-md:border-b max-md:pb-[18px]">
          <strong className="grid place-items-center bg-[var(--primary)] text-[var(--ink)] w-[42px] h-[42px] rounded-full text-[15px] font-bold">C</strong>
          <h3 className="text-xs my-[10px_6px] font-bold">Criadores em destaque</h3>
          <p className="text-[var(--text-soft)] leading-[1.6] text-[10px]">Conheça artistas, estúdios e comunidades que moldam a cultura digital.</p>
        </div>
        <div className="border-r border-[var(--line)] pr-5 max-md:border-r-0 max-md:border-b max-md:pb-[18px]">
          <strong className="grid place-items-center bg-[var(--primary)] text-[var(--ink)] w-[42px] h-[42px] rounded-full text-[15px] font-bold">D</strong>
          <h3 className="text-xs my-[10px_6px] font-bold">Alertas de lançamentos</h3>
          <p className="text-[var(--text-soft)] leading-[1.6] text-[10px]">Receba calendários de cunhagem, novidades e análises do mercado.</p>
        </div>
        <div>
          <h3 className="text-xs my-[10px_6px] font-bold">Antecipe-se ao próximo lançamento</h3>
          <form className="flex" onSubmit={subscribe}>
            <input aria-label="E-mail da newsletter" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="digite seu e-mail..." required className="bg-[var(--surface-dark)] border border-[var(--line)] p-2 min-w-0 flex-1 text-white text-xs" />
            <Button type="submit" size="sm" disabled={newsletter.isPending} className="bg-[var(--primary)] border-0 p-2 text-[var(--ink)]"><FiSend /> Enviar</Button>
          </form>
          <p aria-live="polite" className="text-[var(--text-soft)] leading-[1.6] text-[10px] mt-2">{notice || 'Receba lançamentos selecionados, histórias de criadores e novidades do mercado.'}</p>
        </div>
      </div>
      <div className="max-w-[1080px] mx-auto grid grid-cols-[1.3fr_repeat(4,1fr)] gap-[30px] p-[22px_25px_8px] max-md:grid-cols-1 max-md:p-6 max-md:gap-2 box-border">
        <div><b className="font-bold">KURIO</b><p className="text-[var(--text-soft)] leading-[1.6] text-[10px]">Feito para colecionadores,<br />criadores e cultura</p></div>
        <div><b className="font-bold">Meu perfil</b><p className="text-[var(--text-soft)] leading-[1.6] text-[10px]"><button onClick={() => navigate({ to: '/profile' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Meu perfil</button><br /><button onClick={() => navigate({ to: '/profile' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Minha coleção</button><br /><button onClick={() => navigate({ to: '/profile' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Atividade</button><br /><button onClick={() => navigate({ to: '/profile' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Estúdio de criador</button></p></div>
        <div><b className="font-bold">Central de ajuda</b><p className="text-[var(--text-soft)] leading-[1.6] text-[10px]"><button onClick={() => navigate({ to: '/profile' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Central de ajuda</button><br /><button onClick={() => navigate({ to: '/' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Como comprar NFTs</button><br /><button onClick={() => navigate({ to: '/wallets' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Carteira e segurança</button><br /><button onClick={() => navigate({ to: '/' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Política do mercado</button></p></div>
        <div><b className="font-bold">Coleções</b><p className="text-[var(--text-soft)] leading-[1.6] text-[10px]"><button onClick={() => navigate({ to: '/' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Arte digital</button><br /><button onClick={() => navigate({ to: '/' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Fotografia</button><br /><button onClick={() => navigate({ to: '/' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Música</button><br /><button onClick={() => navigate({ to: '/' })} className="bg-transparent border-0 p-0 text-inherit cursor-pointer">Arte 3D</button></p></div>
        <div><b className="font-bold">Redes sociais</b><p className="flex gap-1 text-[var(--text-soft)] my-1"><a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noreferrer"><FiFacebook /></a><a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noreferrer"><FiInstagram /></a><a aria-label="Twitter" href="https://x.com" target="_blank" rel="noreferrer"><FiTwitter /></a><a aria-label="LinkedIn" href="https://linkedin.com" target="_blank" rel="noreferrer"><FiLinkedin /></a><a aria-label="GitHub" href="https://github.com" target="_blank" rel="noreferrer"><FiGithub /></a></p><b className="font-bold mt-2 block">Carteiras compatíveis</b><p className="text-[var(--text-soft)] text-[10px]">METAMASK · WALLETCONNECT · COINBASE</p></div>
      </div>
      <small className="block text-center p-[15px] border-t border-[var(--line)] text-[10px] text-[var(--text-soft)]">© 2026 Kurio. Propriedade digital para todos.</small>
    </footer>
  )
}

export function Layout({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return <><Header /><main className="max-w-[1080px] mx-auto min-h-[600px] max-md:mx-0 max-md:w-full max-md:min-h-0 max-md:pb-5 box-border overflow-x-hidden">{children}</main>{footer && <Footer />}</>
}

export function useCatalog(params?: { search?: string; category?: string; sort?: string; page?: number }) {
  const query = useNftsQuery(params)
  useRealtime()
  return query.data?.items ?? nftsCatalog
}