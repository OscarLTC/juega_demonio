import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../providers/AuthProvider'
import { raffleApi, participationApi } from '../../../services/api'
import Trophy from 'lucide-react/dist/esm/icons/trophy'
import Ticket from 'lucide-react/dist/esm/icons/ticket'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'

const RAFFLE_STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  DRAFT: { cls: 'app-badge-info', label: 'Borrador' },
  ACTIVE: { cls: 'app-badge-success', label: 'Activo' },
  CLOSING: { cls: 'app-badge-warning', label: 'Cerrando' },
  CLOSED: { cls: 'app-badge-danger', label: 'Cerrado' },
}

export default function DashboardContent() {
  const { user } = useAuth()

  const { data: raffle, isLoading: raffleLoading, error: raffleError } = useQuery({
    queryKey: ['activeRaffle'],
    queryFn: () => raffleApi.getActive().then((res) => res.data),
  })

  const { data: participation, isLoading: participationLoading } = useQuery({
    queryKey: ['myParticipation'],
    queryFn: () => participationApi.getMine().then((res) => res.data),
    enabled: !!raffle,
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) =>
    RAFFLE_STATUS_BADGES[status] || { cls: 'app-badge-info', label: status }

  if (raffleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-intense-pink to-pink rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Hola, {user?.displayName}!</h1>
        <p className="text-white/80">
          Bienvenido a la plataforma de sorteos. Participa y gana increibles premios.
        </p>
      </div>

      {raffleError ? (
        <Alert variant="warning">
          No hay un sorteo activo en este momento. Vuelve pronto!
        </Alert>
      ) : (
        <>
          <div className="app-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-intense-pink" />
                  <h2 className="text-xl font-bold text-light-gray">{raffle?.name}</h2>
                </div>
                <span className={getStatusBadge(raffle?.status).cls}>
                  {getStatusBadge(raffle?.status).label}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-dark-gray">Premio</p>
                <p className="text-2xl font-bold text-intense-pink">{raffle?.prize}</p>
              </div>
            </div>

            {raffle?.description && (
              <p className="text-gray mb-4">{raffle.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-charcoal/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-dark-gray" />
                <div>
                  <p className="text-xs text-dark-gray">Inicio</p>
                  <p className="text-sm font-medium text-gray">{formatDate(raffle?.startsAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-dark-gray" />
                <div>
                  <p className="text-xs text-dark-gray">Cierre</p>
                  <p className="text-sm font-medium text-gray">{formatDate(raffle?.endsAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-dark-gray" />
                <div>
                  <p className="text-xs text-dark-gray">Tickets por sub</p>
                  <p className="text-sm font-medium text-gray">{raffle?.ticketsPerSubscription}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-dark-gray" />
                <div>
                  <p className="text-xs text-dark-gray">Super Chance</p>
                  <p className="text-sm font-medium text-gray">{raffle?.ticketsPerSuperChance} tickets</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="app-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-dark-gray">Mis Tickets Totales</p>
                <p className="text-2xl font-bold text-light-gray">
                  {participationLoading ? '...' : participation?.totalTickets || 0}
                </p>
              </div>
            </div>

            <div className="app-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-dark-gray">Tickets por Suscripcion</p>
                <p className="text-2xl font-bold text-light-gray">
                  {participationLoading ? '...' : participation?.subscriptionTickets || 0}
                </p>
              </div>
            </div>

            <div className="app-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-dark-gray">Super Chances</p>
                <p className="text-2xl font-bold text-light-gray">
                  {participationLoading ? '...' : participation?.superChanceTickets || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/suscripciones"
              className="app-card hover:border-intense-pink/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-intense-pink/20 flex items-center justify-center group-hover:bg-intense-pink/30 transition-colors">
                  <CreditCard className="w-7 h-7 text-intense-pink" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-light-gray">Obtener Suscripcion</h3>
                  <p className="text-dark-gray text-sm">
                    Suscribete para obtener tickets automaticamente
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/super-chances"
              className="app-card hover:border-intense-pink/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <Sparkles className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-light-gray">Comprar Super Chances</h3>
                  <p className="text-dark-gray text-sm">
                    Aumenta tus probabilidades con tickets adicionales
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

