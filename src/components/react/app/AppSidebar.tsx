import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

const icons = {
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  creditCard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  ),
  sparkles: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  ),
  shoppingBag: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  ),
  trophy: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  fileText: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
  ),
  close: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
  chevron: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
  ),
  user: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
}

const userNavItems = [
  { to: '/dashboard', icon: icons.home, label: 'Dashboard' },
  { to: '/suscripciones', icon: icons.creditCard, label: 'Suscripciones' },
  { to: '/super-chances', icon: icons.sparkles, label: 'Super Chances' },
  { to: '/ordenes', icon: icons.shoppingBag, label: 'Mis Ordenes' },
  { to: '/perfil', icon: icons.user, label: 'Mi Perfil' },
]

const adminNavItems = [
  { to: '/admin/sorteos', icon: icons.trophy, label: 'Sorteos' },
  { to: '/admin/participantes', icon: icons.users, label: 'Participantes' },
  { to: '/admin/ordenes', icon: icons.shoppingBag, label: 'Ordenes' },
  { to: '/admin/auditoria', icon: icons.fileText, label: 'Auditoria' },
]

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const { user, isAdmin, logout } = useAuth()
  const [adminOpen, setAdminOpen] = useState(true)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'app-nav-link-active' : 'app-nav-link'

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-dark border-r border-charcoal/20 z-50 transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-charcoal/15 relative">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-intense-pink/15 to-transparent" />
            <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="Juega Demonio" className="h-7 group-hover:scale-105 transition-transform" />
              <span
                className="font-bold text-lg text-light-gray uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '0.08em' }}
              >
                Juega Demonio
              </span>
            </NavLink>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-dark-gray"
            >
              {icons.close}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <p
              className="px-4 pb-2 text-[11px] font-semibold text-dark-gray uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              Menu
            </p>
            {userNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={onClose}
              >
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}

            {isAdmin && (
              <>
                <div className="pt-5 pb-1">
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className="flex items-center justify-between w-full px-4 py-1 text-[11px] font-semibold text-dark-gray uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    <span>Admin</span>
                    <span className={`transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`}>
                      {icons.chevron}
                    </span>
                  </button>
                </div>
                {adminOpen && (
                  <div className="space-y-0.5">
                    {adminNavItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={linkClass}
                        onClick={onClose}
                      >
                        <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-charcoal/15 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal/10 to-transparent" />
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.6432 0.2593 1.25 / 0.15), oklch(0.6432 0.2593 1.25 / 0.08))',
                  border: '1px solid oklch(0.6432 0.2593 1.25 / 0.2)',
                }}
              >
                <span
                  className="text-intense-pink text-sm font-bold"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-gray truncate">
                  {user?.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-dark-gray truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-dark-gray hover:text-red-400 hover:bg-red-500/8 rounded-lg transition-all"
            >
              {icons.logout}
              <span>Cerrar Sesion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}
