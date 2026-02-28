import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi, cardApi } from '../../../services/api'
import { Link } from 'react-router-dom'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import Check from 'lucide-react/dist/esm/icons/check'
import Ticket from 'lucide-react/dist/esm/icons/ticket'
import Zap from 'lucide-react/dist/esm/icons/zap'
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw'
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle'
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'
import PaymentModal from '../shared/PaymentModal'

const SUB_STATUS_CONFIG: Record<string, { cls: string; label: string; color: string }> = {
  PENDING: { cls: 'app-badge-warning', label: 'Pendiente', color: 'yellow' },
  ACTIVE: { cls: 'app-badge-success', label: 'Activo', color: 'green' },
  EXPIRED: { cls: 'app-badge-danger', label: 'Expirado', color: 'red' },
  CANCELLED: { cls: 'app-badge-info', label: 'Cancelado', color: 'blue' },
}

function RaffleProgressBar({ remaining, total }: { remaining: number; total: number }) {
  const safeTotal = total > 0 ? total : 1
  const pct = Math.round((remaining / safeTotal) * 100)
  const isZero = remaining === 0
  const isLow = remaining === 1 && total > 1

  const barColor = isZero
    ? 'bg-red-500'
    : isLow
      ? 'bg-amber-500'
      : 'bg-green-500'

  const trackColor = isZero
    ? 'bg-red-500/10'
    : 'bg-charcoal/20'

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-dark-gray">Sorteos restantes</span>
        <span className={`text-xs font-semibold tabular-nums ${
          isZero ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-green-400'
        }`}>
          {remaining} / {safeTotal}
        </span>
      </div>
      <div className={`h-1.5 rounded-full ${trackColor} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${isZero ? 100 : pct}%`, opacity: isZero ? 0.3 : 1 }}
        />
      </div>
    </div>
  )
}

export default function SubscriptionsContent() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  const [paymentMode, setPaymentMode] = useState<'one-time' | 'recurring'>('one-time')
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const queryClient = useQueryClient()

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => subscriptionApi.getPlans().then((res) => res.data),
  })

  const { data: mySubscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['mySubscriptions'],
    queryFn: () => subscriptionApi.getMine().then((res) => res.data),
  })

  const { data: myCards } = useQuery({
    queryKey: ['myCards'],
    queryFn: () => cardApi.getMyCards().then((res) => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => subscriptionApi.create(data),
    onSuccess: (response) => {
      setPendingOrder(response.data)
      setShowPaymentModal(true)
    },
  })

  const recurringMutation = useMutation({
    mutationFn: (data: { type: string; savedCardId: string }) =>
      subscriptionApi.createRecurring(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['myParticipation'] })
      setSelectedPlan(null)
      setPaymentMode('one-time')
      setSelectedCardId('')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => subscriptionApi.cancelRecurring(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubscriptions'] })
    },
  })

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan)

    if (paymentMode === 'recurring' && selectedCardId) {
      recurringMutation.mutate({ type: plan.type, savedCardId: selectedCardId })
    } else {
      createMutation.mutate({ type: plan.type })
    }
  }

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['mySubscriptions'] })
    queryClient.invalidateQueries({ queryKey: ['myParticipation'] })
  }

  const handleClosePayment = () => {
    setShowPaymentModal(false)
    setPendingOrder(null)
  }

  const getStatusConfig = (status: string) =>
    SUB_STATUS_CONFIG[status] || { cls: 'app-badge-info', label: status, color: 'blue' }

  const hasCards = myCards && myCards.length > 0
  const isPending = createMutation.isPending || recurringMutation.isPending
  const activeSub = mySubscriptions?.find((s: any) => s.status === 'ACTIVE')

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-heading">Suscripciones</h1>
        <p className="app-heading-sub">Elige un plan para participar en los sorteos</p>
      </div>

      {/* Active subscription — prominent card */}
      {activeSub && (
        <div className={`app-card-glow overflow-hidden ${
          activeSub.remainingRaffles === 0
            ? '!border-red-500/25 !shadow-none'
            : ''
        }`}>
          <div className="app-accent-line" style={
            activeSub.remainingRaffles === 0
              ? { background: 'linear-gradient(90deg, transparent, oklch(0.6 0.25 25 / 0.4), transparent)' }
              : undefined
          } />

          <div className="flex items-start gap-4">
            <div className={`app-icon-box w-12 h-12 rounded-xl shrink-0 ${
              activeSub.remainingRaffles === 0 ? 'bg-red-500/15' : 'bg-green-500/15'
            }`}>
              {activeSub.remainingRaffles === 0 ? (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-dark-gray">Tu suscripcion activa</p>
                <span className={activeSub.remainingRaffles === 0 ? 'app-badge-danger' : 'app-badge-success'}>
                  {activeSub.remainingRaffles === 0 ? 'Agotado' : 'Activa'}
                </span>
                {activeSub.recurring && (
                  <span className="inline-flex items-center gap-1 text-xs text-intense-pink bg-intense-pink/10 px-2 py-0.5 rounded-full">
                    <RefreshCw className="w-3 h-3" />
                    Recurrente
                  </span>
                )}
              </div>

              <p
                className="text-lg font-bold text-light-gray mt-1 tracking-wide"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {activeSub.typeName}
              </p>

              <RaffleProgressBar
                remaining={activeSub.remainingRaffles}
                total={activeSub.rafflesCovered || activeSub.remainingRaffles || 1}
              />

              {activeSub.remainingRaffles === 0 && (
                <p className="text-sm text-red-400/80 mt-2">
                  Ya usaste todos tus sorteos. Renueva tu plan para seguir participando.
                </p>
              )}
            </div>

            <div className="shrink-0 flex flex-col items-end gap-2">
              {activeSub.recurring && (
                <button
                  onClick={() => cancelMutation.mutate(activeSub.id)}
                  disabled={cancelMutation.isPending}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar recurrencia'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Mode Selector */}
      <div className="app-card">
        <h3
          className="text-sm font-bold text-light-gray tracking-wide uppercase mb-3"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          Metodo de pago
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMode('one-time')}
            className={`flex-1 p-3.5 rounded-lg border transition-all text-sm text-center ${
              paymentMode === 'one-time'
                ? 'border-intense-pink/40 bg-intense-pink/8 text-intense-pink'
                : 'border-charcoal/20 text-gray hover:border-charcoal/40'
            }`}
          >
            <CreditCard className="w-5 h-5 mx-auto mb-1.5" />
            Pago unico
          </button>
          <button
            onClick={() => {
              if (hasCards) {
                setPaymentMode('recurring')
                setSelectedCardId(myCards[0].id)
              }
            }}
            disabled={!hasCards}
            className={`flex-1 p-3.5 rounded-lg border transition-all text-sm text-center ${
              paymentMode === 'recurring'
                ? 'border-intense-pink/40 bg-intense-pink/8 text-intense-pink'
                : hasCards
                  ? 'border-charcoal/20 text-gray hover:border-charcoal/40'
                  : 'border-charcoal/10 text-dark-gray/60 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-5 h-5 mx-auto mb-1.5" />
            Pago recurrente
          </button>
        </div>

        {paymentMode === 'recurring' && hasCards && (
          <div className="mt-3">
            <label className="app-label">Seleccionar tarjeta</label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="app-input w-full"
            >
              {myCards.map((card: any) => (
                <option key={card.id} value={card.id}>
                  {card.brand} ****{card.lastFour}
                </option>
              ))}
            </select>
          </div>
        )}

        {!hasCards && paymentMode === 'one-time' && (
          <p className="text-xs text-dark-gray mt-2.5">
            Quieres pago recurrente?{' '}
            <Link to="/perfil" className="text-intense-pink hover:underline">
              Guarda una tarjeta primero
            </Link>
          </p>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {plans?.map((plan: any) => {
          const isPopular = plan.type === 'MONTHLY'

          return (
            <div
              key={plan.type}
              className={`relative overflow-hidden transition-all rounded-xl p-6 ${
                isPopular
                  ? 'app-card-glow'
                  : 'app-card'
              }`}
            >
              {isPopular && (
                <>
                  <div className="app-accent-line" />
                  {/* Corner glow */}
                  <div
                    className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                    style={{ background: 'oklch(0.6432 0.2593 1.25 / 0.06)' }}
                  />
                  <div
                    className="absolute top-0 right-0 text-white text-[11px] font-bold px-3 py-1 rounded-bl-lg tracking-wider"
                    style={{ fontFamily: 'var(--font-family-display)', background: 'oklch(0.6432 0.2593 1.25)' }}
                  >
                    POPULAR
                  </div>
                </>
              )}

              <div className="text-center mb-6 relative">
                <h3
                  className="text-xl font-bold text-light-gray mb-2 tracking-wide uppercase"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className="text-4xl font-bold text-intense-pink tabular-nums"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    S/ {plan.price}
                  </span>
                </div>
                <p className="text-sm text-dark-gray mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6 relative">
                <li className="flex items-center gap-2.5 text-gray text-sm">
                  <div className="app-icon-box w-6 h-6 rounded-md bg-green-500/10">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span>{plan.rafflesCovered} sorteo(s) cubiertos</span>
                </li>
                <li className="flex items-center gap-2.5 text-gray text-sm">
                  <div className="app-icon-box w-6 h-6 rounded-md bg-green-500/10">
                    <Ticket className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span>Tickets automaticos por sorteo</span>
                </li>
                <li className="flex items-center gap-2.5 text-gray text-sm">
                  <div className="app-icon-box w-6 h-6 rounded-md bg-green-500/10">
                    <Zap className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span>Acceso inmediato</span>
                </li>
                {paymentMode === 'recurring' && (
                  <li className="flex items-center gap-2.5 text-intense-pink text-sm">
                    <div className="app-icon-box w-6 h-6 rounded-md bg-intense-pink/10">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>
                    <span>Renovacion automatica</span>
                  </li>
                )}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isPending || (paymentMode === 'recurring' && !selectedCardId)}
                className={`w-full py-3 rounded-lg font-medium transition-colors relative ${
                  isPopular ? 'app-btn-primary' : 'app-btn-secondary'
                }`}
              >
                {isPending && selectedPlan?.type === plan.type
                  ? 'Procesando...'
                  : paymentMode === 'recurring'
                    ? 'Suscribirme'
                    : 'Seleccionar Plan'}
              </button>
            </div>
          )
        })}
      </div>

      {(createMutation.isError || recurringMutation.isError) && (
        <Alert variant="error">
          {(createMutation.error as any)?.response?.data?.message ||
            (recurringMutation.error as any)?.response?.data?.message ||
            'Error al crear la suscripcion'}
        </Alert>
      )}

      {recurringMutation.isSuccess && (
        <Alert variant="success">
          Suscripcion recurrente creada exitosamente. Se renovara automaticamente cada periodo.
        </Alert>
      )}

      {/* Subscription History */}
      <div>
        <h2 className="app-section-title mb-4">Historial de Suscripciones</h2>
        {subsLoading ? (
          <LoadingSpinner />
        ) : mySubscriptions?.length === 0 ? (
          <div className="app-card flex flex-col items-center text-center py-12">
            <div className="app-icon-box app-icon-box-lg bg-intense-pink/8 mb-5">
              <Ticket className="w-7 h-7 text-intense-pink/40" />
            </div>
            <p
              className="text-light-gray font-bold mb-1"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              SIN SUSCRIPCIONES AUN
            </p>
            <p className="text-sm text-dark-gray max-w-xs">
              Selecciona un plan arriba para comenzar a participar en los sorteos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mySubscriptions?.map((sub: any) => {
              const config = getStatusConfig(sub.status)
              const isActive = sub.status === 'ACTIVE'
              const isExpired = sub.status === 'EXPIRED'
              const isZero = sub.remainingRaffles === 0
              const total = sub.rafflesCovered || sub.remainingRaffles || 1

              return (
                <div
                  key={sub.id}
                  className={`app-card overflow-hidden transition-colors ${
                    isActive && isZero
                      ? 'border-red-500/20'
                      : isActive
                        ? 'border-green-500/20'
                        : ''
                  }`}
                >
                  {/* Left accent bar */}
                  {isActive && (
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                      isZero ? 'bg-red-500/50' : 'bg-green-500/50'
                    }`} />
                  )}

                  <div className="flex items-center gap-4">
                    <div className={`app-icon-box app-icon-box-md shrink-0 ${
                      isActive && !isZero
                        ? 'bg-green-500/15'
                        : isActive && isZero
                          ? 'bg-red-500/15'
                          : isExpired
                            ? 'bg-charcoal/15'
                            : 'bg-intense-pink/10'
                    }`}>
                      {isActive && !isZero ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : isActive && isZero ? (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      ) : isExpired ? (
                        <CreditCard className="w-5 h-5 text-dark-gray" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-intense-pink" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-light-gray">
                          {sub.typeName}
                        </p>
                        {sub.recurring && (
                          <RefreshCw className="w-3 h-3 text-intense-pink" />
                        )}
                      </div>

                      {isActive ? (
                        isZero ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm text-red-400">Plan agotado</span>
                            <span className="text-dark-gray">·</span>
                            <span className="text-sm text-dark-gray">0 sorteos disponibles</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm text-green-400">
                              {sub.remainingRaffles} sorteo{sub.remainingRaffles !== 1 ? 's' : ''} restante{sub.remainingRaffles !== 1 ? 's' : ''}
                            </span>
                            <span className="text-dark-gray">·</span>
                            <span className="text-sm text-dark-gray">de {total}</span>
                          </div>
                        )
                      ) : (
                        <p className="text-sm text-dark-gray mt-0.5">
                          {isExpired ? 'Suscripcion finalizada' : config.label}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      {isActive && isZero ? (
                        <button
                          onClick={() => {
                            const plansSection = document.querySelector('.grid.md\\:grid-cols-3')
                            plansSection?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="flex items-center gap-1 text-xs text-intense-pink hover:text-pink transition-colors font-medium"
                        >
                          Renovar
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className={config.cls}>
                          {config.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <RaffleProgressBar remaining={sub.remainingRaffles} total={total} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePayment}
        order={pendingOrder}
        description="Completa el pago de tu suscripcion para activarla inmediatamente."
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
