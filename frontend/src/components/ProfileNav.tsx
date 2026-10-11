import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { FiUser, FiCreditCard, FiActivity, FiHeart, FiTag, FiDownload, FiHelpCircle, FiLogOut } from 'react-icons/fi'
import { api } from '../services/api'

const links = [
  { label: 'Dados do perfil', to: '/profile', tab: 'profile', icon: FiUser },
  { label: 'Carteiras', to: '/wallets', tab: 'wallets', icon: FiCreditCard },
  { label: 'Atividade', to: '/profile', tab: 'activity', icon: FiActivity },
  { label: 'Lista de interesse', to: '/profile', tab: 'wishlist', icon: FiHeart },
  { label: 'Ofertas', to: '/profile', tab: 'offers', icon: FiTag },
  { label: 'Arquivos baixados', to: '/profile', tab: 'downloads', icon: FiDownload },
  { label: 'Suporte', to: '/profile', tab: 'support', icon: FiHelpCircle },
] as const

export function ProfileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchObj = location.search as Record<string, unknown>
  const currentTab = (searchObj?.tab as string) || 'profile'

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault()
    try {
      await api.logout()
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error)
    } finally {
      sessionStorage.removeItem('kurio-order-id')
      localStorage.removeItem('kurio-auth')
      
      navigate({ to: '/login' })
    }
  }

  return (
    <aside className="bg-[var(--panel)] self-start max-md:mb-6">
      <h3 className="py-[18px] px-[15px] pb-2 font-bold text-sm">Meu perfil</h3>
      {links.map(({ label, to, tab, icon: Icon }) => {
        const isActive = location.pathname === to && (to === '/wallets' || currentTab === tab)

        return (
          <Link 
            key={label} 
            to={to} 
            search={to === '/profile' ? { tab } : undefined}
            className={`flex items-center gap-2.5 py-3 px-[15px] text-[var(--gold)] hover:bg-[var(--panel-2)] ${isActive ? 'border-l-[3px] border-[var(--primary)] bg-[var(--panel-2)]' : ''}`}
          >
            <Icon size={16} /> {label}
          </Link>
        )
      })}
      <button 
        type="button" 
        onClick={handleLogout} 
        className="w-full flex items-center gap-2.5 py-3 px-[15px] text-[var(--gold)] hover:bg-[var(--panel-2)] border-t border-[var(--line)] bg-transparent border-x-0 border-b-0 cursor-pointer text-left font-inherit"
      >
        <FiLogOut size={16} /> Sair
      </button>
    </aside>
  )
}