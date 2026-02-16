import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '../../../services/api'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import Check from 'lucide-react/dist/esm/icons/check'
import Ticket from 'lucide-react/dist/esm/icons/ticket'
import Zap from 'lucide-react/dist/esm/icons/zap'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'
import PaymentModal from '../shared/PaymentModal'

const SUB_STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  PENDING: { cls: 'app-badge-warning', label: 'Pendiente' },
  ACTIVE: { cls: 'app-badge-success', label: 'Activo' },
  EXPIRED: { cls: 'app-badge-danger', label: 'Expirado' },
  CANCELLED: { cls: 'app-badge-info', label: 'Cancelado' },
}

export default function SubscriptionsContent() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => subscriptionApi.getPlans().then((res) => res.data),
  })

  const { data: mySubscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['mySubscriptions'],
    queryFn: () => subscriptionApi.getMine().then((res) => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => subscriptionApi.create(data),
    onSuccess: (response) => {
      setPendingOrder(response.data)
      setShowPaymentModal(true)
    },
  })

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan)
    createMutation.mutate({ type: plan.type })
  }

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['mySubscriptions'] })
    queryClient.invalidateQueries({ queryKey: ['myParticipation'] })
  }

  const handleClosePayment = () => {
    setShowPaymentModal(false)
    setPendingOrder(null)
  }

  const getStatusBadge = (status: string) =>
    SUB_STATUS_BADGES[status] || { cls: 'app-badge-info', label: status }

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

      {mySubscriptions?.find((s: any) => s.status === 'ACTIVE') && (
        <div className="app-card border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-dark-gray">Tu suscripcion activa</p>
              <p className="text-lg font-bold text-light-gray">
                {mySubscriptions.find((s: any) => s.status === 'ACTIVE').typeName}
              </p>
              <p className="text-sm text-dark-gray">
                {mySubscriptions.find((s: any) => s.status === 'ACTIVE').remainingRaffles} sorteo(s) restantes
              </p>
            </div>
            <span className="app-badge-success">Activa</span>
          </div>
        </div>
      )}

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
            </ul>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={createMutation.isPending}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.type === 'MONTHLY'
                  ? 'app-btn-primary'
                  : 'app-btn-secondary'
              }`}
            >
              {createMutation.isPending && selectedPlan?.type === plan.type
                ? 'Procesando...'
                : 'Seleccionar Plan'}
            </button>
          </div>
        ))}
      </div>

      {createMutation.isError && (
        <Alert variant="error">
          {(createMutation.error as any)?.response?.data?.message || 'Error al crear la suscripcion'}
        </Alert>
      )}

      <div>
        <h2 className="text-xl font-bold text-light-gray mb-4">Mis Suscripciones</h2>
        {subsLoading ? (
          <LoadingSpinner />
        ) : mySubscriptions?.length === 0 ? (
          <Alert variant="info">
            No tienes suscripciones activas. Selecciona un plan para comenzar.
          </Alert>
        ) : (
          <div className="space-y-3">
            {mySubscriptions?.map((sub: any) => (
              <div key={sub.id} className="app-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-intense-pink/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-intense-pink" />
                  </div>
                  <div>
                    <p className="font-semibold text-light-gray">{sub.typeName}</p>
                    <p className="text-sm text-dark-gray">
                      {sub.remainingRaffles} sorteo(s) restantes
                    </p>
                  </div>
                </div>
                <span className={getStatusBadge(sub.status).cls}>
                  {getStatusBadge(sub.status).label}
                </span>
              </div>
            ))}
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
