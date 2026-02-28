import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../providers/AuthProvider'
import { raffleApi, participationApi, subscriptionApi } from '../../../services/api'
import Trophy from 'lucide-react/dist/esm/icons/trophy'
import Ticket from 'lucide-react/dist/esm/icons/ticket'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right'
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../shared/LoadingSpinner'

const RAFFLE_STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  DRAFT: { cls: 'app-badge-info', label: 'Borrador' },
  ACTIVE: { cls: 'app-badge-success', label: 'Activo' },
  CLOSING: { cls: 'app-badge-warning', label: 'Cerrando' },
  CLOSED: { cls: 'app-badge-danger', label: 'Cerrado' },
  CANCELLED: { cls: 'app-badge-danger', label: 'Cancelado' },
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

  const { data: mySubscriptions } = useQuery({
    queryKey: ['mySubscriptions'],
    queryFn: () => subscriptionApi.getMine().then((res) => res.data),
  })

  const activeSub = mySubscriptions?.find((s: any) => s.status === 'ACTIVE')

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
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
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-dark-gray text-sm">Bienvenido de vuelta</p>
        <h1 className="app-heading mt-1">
          {user?.displayName || 'Usuario'}
        </h1>
      </div>

      {raffleError ? (
        <div className="app-card flex flex-col items-center text-center py-16">
          <div className="app-icon-box app-icon-box-lg bg-intense-pink/8 mb-5">
            <Trophy className="w-7 h-7 text-intense-pink/40" />
          </div>
          <p
            className="text-light-gray font-bold text-lg mb-1"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            SIN SORTEO ACTIVO
          </p>
          <p className="text-sm text-dark-gray max-w-xs">
            No hay un sorteo en curso en este momento. Vuelve pronto para participar.
          </p>
        </div>
      ) : (
        <>
          {/* Raffle card */}
          <div className="app-card-glow overflow-hidden">
            <div className="app-accent-line" />

            {/* Subtle warm glow in corner */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-intense-pink/[0.03] rounded-full blur-3xl pointer-events-none" />

            <div className="mb-5 relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="app-icon-box app-icon-box-sm bg-intense-pink/10">
                  <Trophy className="w-4 h-4 text-intense-pink" />
                </div>
                <span className={getStatusBadge(raffle?.status).cls}>
                  {getStatusBadge(raffle?.status).label}
                </span>
              </div>
              <h2
                className="text-2xl font-bold text-light-gray tracking-wide"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {raffle?.name}
              </h2>
              {raffle?.description && (
                <p className="text-sm text-dark-gray mt-1.5 max-w-lg">{raffle.description}</p>
              )}
            </div>

            {/* Timeline bar */}
            <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-white/[0.03] border border-charcoal/10 relative">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-dark-gray" />
                <span className="text-dark-gray">Inicio</span>
                <span className="text-gray font-medium">{formatDate(raffle?.startsAt)}</span>
              </div>
              <div className="flex-1 h-px bg-charcoal/20 mx-2" />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray font-medium">{formatDate(raffle?.endsAt)}</span>
                <span className="text-dark-gray">Cierre</span>
                <Clock className="w-4 h-4 text-dark-gray" />
              </div>
            </div>
          </div>

          {/* Metrics — icon + hero number + label */}
          <div className="grid grid-cols-3 gap-4">
            <div className="app-card py-5 text-center">
              <div className="app-icon-box app-icon-box-sm bg-intense-pink/10 mx-auto mb-3">
                <Ticket className="w-4 h-4 text-intense-pink" />
              </div>
              <p
                className="text-3xl font-bold text-light-gray tabular-nums leading-none"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {participationLoading ? '...' : participation?.totalTickets || 0}
              </p>
              <p className="text-[11px] text-dark-gray mt-2.5 uppercase tracking-wider font-medium">
                Tickets totales
              </p>
            </div>

            <div className="app-card py-5 text-center">
              <div className="app-icon-box app-icon-box-sm bg-green-500/10 mx-auto mb-3">
                <CreditCard className="w-4 h-4 text-green-400" />
              </div>
              <p
                className="text-3xl font-bold text-light-gray tabular-nums leading-none"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {participationLoading ? '...' : participation?.subscriptionTickets || 0}
              </p>
              <p className="text-[11px] text-dark-gray mt-2.5 uppercase tracking-wider font-medium">
                Por suscripcion
              </p>
            </div>

            <div className="app-card py-5 text-center">
              <div className="app-icon-box app-icon-box-sm bg-purple-500/10 mx-auto mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <p
                className="text-3xl font-bold text-purple-400 tabular-nums leading-none"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {participationLoading ? '...' : participation?.superChanceTickets || 0}
              </p>
              <p className="text-[11px] text-dark-gray mt-2.5 uppercase tracking-wider font-medium">
                Super Chances
              </p>
            </div>
          </div>

          {/* Subscription status */}
          {activeSub ? (
            <div className={`app-card flex items-center gap-4 overflow-hidden ${
              activeSub.remainingRaffles === 0 ? 'border-red-500/20' : 'border-green-500/20'
            }`}>
              {/* Left color accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                activeSub.remainingRaffles === 0 ? 'bg-red-500/50' : 'bg-green-500/50'
              }`} />

              <div className={`app-icon-box app-icon-box-md ${
                activeSub.remainingRaffles === 0 ? 'bg-red-500/15' : 'bg-green-500/15'
              }`}>
                {activeSub.remainingRaffles === 0 ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <CreditCard className="w-5 h-5 text-green-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-light-gray">{activeSub.typeName}</p>
                <p className="text-xs text-dark-gray mt-0.5">
                  {activeSub.remainingRaffles === 0
                    ? 'Plan agotado — renueva para seguir participando'
                    : `${activeSub.remainingRaffles} sorteo${activeSub.remainingRaffles !== 1 ? 's' : ''} restante${activeSub.remainingRaffles !== 1 ? 's' : ''}`
                  }
                </p>
              </div>

              <span className={activeSub.remainingRaffles === 0 ? 'app-badge-danger' : 'app-badge-success'}>
                {activeSub.remainingRaffles === 0 ? 'Agotado' : 'Activa'}
              </span>
            </div>
          ) : (
            <div className="app-card flex items-center gap-4 overflow-hidden">
              {/* Left accent */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-intense-pink/30" />

              <div className="app-icon-box app-icon-box-md bg-intense-pink/10">
                <CreditCard className="w-5 h-5 text-intense-pink/60" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-light-gray font-medium">Sin suscripcion activa</p>
                <p className="text-xs text-dark-gray">Suscribete para participar en los sorteos</p>
              </div>
              <Link
                to="/suscripciones"
                className="text-sm text-intense-pink hover:text-pink transition-colors flex items-center gap-1 font-medium"
              >
                Suscribirme
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/suscripciones"
              className="app-card group hover:border-intense-pink/25 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="app-icon-box app-icon-box-md bg-intense-pink/10 group-hover:bg-intense-pink/15 transition-colors">
                    <CreditCard className="w-5 h-5 text-intense-pink" />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold text-light-gray tracking-wide"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      OBTENER SUSCRIPCION
                    </h3>
                    <p className="text-xs text-dark-gray mt-0.5">Tickets automaticos por sorteo</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-dark-gray group-hover:text-intense-pink group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            <Link
              to="/super-chances"
              className="app-card group hover:border-purple-500/25 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="app-icon-box app-icon-box-md bg-purple-500/10 group-hover:bg-purple-500/15 transition-colors">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold text-light-gray tracking-wide"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      COMPRAR SUPER CHANCES
                    </h3>
                    <p className="text-xs text-dark-gray mt-0.5">Aumenta tus probabilidades</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-dark-gray group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
