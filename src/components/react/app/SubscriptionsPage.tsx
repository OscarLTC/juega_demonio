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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-light-gray">Suscripciones</h1>
        <p className="text-dark-gray">Elige un plan para participar en los sorteos</p>
      </div>

      {/* Active subscription — prominent card */}
      {activeSub && (
        <div className={`app-card overflow-hidden ${
          activeSub.remainingRaffles === 0
            ? 'border-red-500/30'
            : 'border-green-500/30'
        }`}>
          {/* Top accent line */}
          <div className={`absolute top-0 left-0 right-0 h-px ${
            activeSub.remainingRaffles === 0 ? 'bg-red-500/50' : 'bg-green-500/50'
          }`} />

          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeSub.remainingRaffles === 0
                ? 'bg-red-500/15'
                : 'bg-green-500/15'
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

              <p className="text-lg font-bold text-light-gray mt-1">
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
        <h3 className="text-sm font-semibold text-light-gray mb-3">Metodo de pago</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMode('one-time')}
            className={`flex-1 p-3 rounded-lg border transition-all text-sm ${
              paymentMode === 'one-time'
                ? 'border-intense-pink bg-intense-pink/10 text-intense-pink'
                : 'border-charcoal/30 text-gray hover:border-charcoal/50'
            }`}
          >
            <CreditCard className="w-5 h-5 mx-auto mb-1" />
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
            className={`flex-1 p-3 rounded-lg border transition-all text-sm ${
              paymentMode === 'recurring'
                ? 'border-intense-pink bg-intense-pink/10 text-intense-pink'
                : hasCards
                  ? 'border-charcoal/30 text-gray hover:border-charcoal/50'
                  : 'border-charcoal/20 text-dark-gray cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-5 h-5 mx-auto mb-1" />
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
          <p className="text-xs text-dark-gray mt-2">
            ¿Quieres pago recurrente?{' '}
            <Link to="/perfil" className="text-intense-pink hover:underline">
              Guarda una tarjeta primero
            </Link>
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans?.map((plan: any) => (
          <div
            key={plan.type}
            className={`app-card relative overflow-hidden transition-all ${
              plan.type === 'MONTHLY' ? 'ring-2 ring-intense-pink shadow-lg shadow-intense-pink/10' : ''
            }`}
          >
            {plan.type === 'MONTHLY' && (
              <div className="absolute top-0 right-0 bg-intense-pink text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-light-gray mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-intense-pink">
                  S/ {plan.price}
                </span>
              </div>
              <p className="text-dark-gray mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-gray">
                <Check className="w-5 h-5 text-green-400" />
                <span>{plan.rafflesCovered} sorteo(s) cubiertos</span>
              </li>
              <li className="flex items-center gap-2 text-gray">
                <Ticket className="w-5 h-5 text-green-400" />
                <span>Tickets automaticos por sorteo</span>
              </li>
              <li className="flex items-center gap-2 text-gray">
                <Zap className="w-5 h-5 text-green-400" />
                <span>Acceso inmediato</span>
              </li>
              {paymentMode === 'recurring' && (
                <li className="flex items-center gap-2 text-intense-pink">
                  <RefreshCw className="w-5 h-5" />
                  <span>Renovacion automatica</span>
                </li>
              )}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={isPending || (paymentMode === 'recurring' && !selectedCardId)}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.type === 'MONTHLY'
                  ? 'app-btn-primary'
                  : 'app-btn-secondary'
              }`}
            >
              {isPending && selectedPlan?.type === plan.type
                ? 'Procesando...'
                : paymentMode === 'recurring'
                  ? 'Suscribirme'
                  : 'Seleccionar Plan'}
            </button>
          </div>
        ))}
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
        <h2 className="text-xl font-bold text-light-gray mb-4">Historial de Suscripciones</h2>
        {subsLoading ? (
          <LoadingSpinner />
        ) : mySubscriptions?.length === 0 ? (
          <div className="app-card flex flex-col items-center text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-intense-pink/10 flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-intense-pink/60" />
            </div>
            <p className="text-light-gray font-semibold mb-1">Sin suscripciones aun</p>
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
                  className={`app-card transition-colors ${
                    isActive && isZero
                      ? 'border-red-500/20'
                      : isActive
                        ? 'border-green-500/20'
                        : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive && !isZero
                        ? 'bg-green-500/15'
                        : isActive && isZero
                          ? 'bg-red-500/15'
                          : isExpired
                            ? 'bg-charcoal/20'
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

                    {/* Info */}
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

                    {/* Right side: badge + action */}
                    <div className="shrink-0 flex items-center gap-3">
                      {isActive && isZero ? (
                        <button
                          onClick={() => {
                            const plansSection = document.querySelector('.grid.md\\:grid-cols-3')
                            plansSection?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="flex items-center gap-1 text-xs text-intense-pink hover:text-pink transition-colors"
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

                  {/* Progress bar for active subscriptions */}
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
