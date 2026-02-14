import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProviders } from '../providers/AppProviders'
import { AuthGuard } from '../guards/AuthGuard'
import { AdminGuard } from '../guards/AdminGuard'
import AppSidebar from './AppSidebar'

import DashboardContent from './DashboardPage'
import SubscriptionsContent from './SubscriptionsPage'
import SuperChancesContent from './SuperChancesPage'
import OrdersContent from './OrdersPage'
import AdminRafflesContent from '../admin/AdminRafflesPage'
import AdminParticipantsContent from '../admin/AdminParticipantsPage'
import AdminOrdersContent from '../admin/AdminOrdersPage'
import AdminAuditContent from '../admin/AdminAuditPage'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-dark border-b border-charcoal/30 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <span className="font-bold text-lg text-intense-pink font-family-display uppercase">
          Juega Demonio
        </span>
        <div className="w-10"></div>
      </header>

      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          <Routes>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AuthGuard><DashboardContent /></AuthGuard>} />
            <Route path="suscripciones" element={<AuthGuard><SubscriptionsContent /></AuthGuard>} />
            <Route path="super-chances" element={<AuthGuard><SuperChancesContent /></AuthGuard>} />
            <Route path="ordenes" element={<AuthGuard><OrdersContent /></AuthGuard>} />
            <Route path="admin/sorteos" element={<AdminGuard><AdminRafflesContent /></AdminGuard>} />
            <Route path="admin/participantes" element={<AdminGuard><AdminParticipantsContent /></AdminGuard>} />
            <Route path="admin/ordenes" element={<AdminGuard><AdminOrdersContent /></AdminGuard>} />
            <Route path="admin/auditoria" element={<AdminGuard><AdminAuditContent /></AdminGuard>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function AppShell() {
  return (
    <AppProviders>
      <BrowserRouter basename="/app">
        <AppLayout />
      </BrowserRouter>
    </AppProviders>
  )
}
