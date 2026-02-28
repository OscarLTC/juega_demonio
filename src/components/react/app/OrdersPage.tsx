import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '../../../services/api'
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag'
import Clock from 'lucide-react/dist/esm/icons/clock'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import X from 'lucide-react/dist/esm/icons/x'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import LoadingSpinner from '../shared/LoadingSpinner'
import PaymentModal from '../shared/PaymentModal'

const ORDER_STATUS_CONFIG: Record<string, { cls: string; label: string; accent: string }> = {
  PENDING: { cls: 'app-badge-warning', label: 'Pendiente', accent: 'bg-yellow-500/50' },
  PAID: { cls: 'app-badge-success', label: 'Pagado', accent: 'bg-green-500/50' },
  EXPIRED: { cls: 'app-badge-danger', label: 'Expirado', accent: 'bg-red-500/30' },
  CANCELLED: { cls: 'app-badge-info', label: 'Cancelado', accent: 'bg-charcoal/30' },
}

const ORDER_TYPE_INFO: Record<string, { icon: any; label: string; tint: string }> = {
  SUBSCRIPTION: { icon: CreditCard, label: 'Suscripcion', tint: 'bg-intense-pink/10 text-intense-pink' },
  SUPER_CHANCE: { icon: Sparkles, label: 'Super Chance', tint: 'bg-purple-500/10 text-purple-400' },
}

const DEFAULT_TYPE_INFO = { icon: ShoppingBag, label: 'Otro', tint: 'bg-charcoal/15 text-gray' }

export default function OrdersContent() {
  const queryClient = useQueryClient()
  const [payingOrder, setPayingOrder] = useState<any>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => orderApi.getMine().then((res) => res.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] })
    },
  })

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['myOrders'] })
    queryClient.invalidateQueries({ queryKey: ['myParticipation'] })
    queryClient.invalidateQueries({ queryKey: ['mySubscriptions'] })
  }

  const getStatusConfig = (status: string) =>
    ORDER_STATUS_CONFIG[status] || { cls: 'app-badge-info', label: status, accent: 'bg-charcoal/30' }

  const getTypeInfo = (type: string) =>
    ORDER_TYPE_INFO[type] || DEFAULT_TYPE_INFO

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-heading">Mis Ordenes</h1>
        <p className="app-heading-sub">Historial de compras y suscripciones</p>
      </div>

      {orders?.length === 0 ? (
        <div className="app-card flex flex-col items-center text-center py-16">
          <div className="app-icon-box app-icon-box-lg bg-intense-pink/8 mb-5">
            <ShoppingBag className="w-7 h-7 text-intense-pink/40" />
          </div>
          <p
            className="text-light-gray font-bold mb-1"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            SIN ORDENES AUN
          </p>
          <p className="text-sm text-dark-gray max-w-xs">
            Ve a Suscripciones o Super Chances para realizar tu primera compra.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders?.map((order: any) => {
            const typeInfo = getTypeInfo(order.type)
            const TypeIcon = typeInfo.icon
            const isPending = order.status === 'PENDING'
            const isPaid = order.status === 'PAID'
            const isExpired = order.status === 'EXPIRED' ||
              (isPending && new Date(order.expiresAt) < new Date())
            const effectiveStatus = isExpired && isPending ? 'EXPIRED' : order.status
            const statusConfig = getStatusConfig(effectiveStatus)

            return (
              <div
                key={order.id}
                className={`app-card overflow-hidden transition-colors ${
                  isPaid ? 'border-green-500/15' : ''
                }`}
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${statusConfig.accent}`} />

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left: Type + info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`app-icon-box app-icon-box-md shrink-0 ${typeInfo.tint.split(' ')[0]}`}>
                      <TypeIcon className={`w-5 h-5 ${typeInfo.tint.split(' ')[1]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-light-gray">{typeInfo.label}</span>
                        <span className={statusConfig.cls}>
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-dark-gray">
                        <span className="font-mono">{order.id.slice(0, 8)}...</span>
                        <span>{formatDate(order.createdAt)}</span>
                        {order.quantity > 1 && (
                          <span>Cantidad: {order.quantity}</span>
                        )}
                      </div>

                      {isPaid && order.paidAt && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-green-400/80">
                          <CheckCircle className="w-3 h-3" />
                          <span>Pagado {formatShortDate(order.paidAt)}</span>
                        </div>
                      )}
                      {isPending && !isExpired && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-yellow-400/80">
                          <Clock className="w-3 h-3" />
                          <span>Expira {formatShortDate(order.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount + actions */}
                  <div className="flex items-center gap-4 shrink-0 md:ml-4">
                    <p
                      className="text-lg font-bold text-light-gray tabular-nums"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      {order.currency} {order.totalAmount}
                    </p>

                    {isPending && !isExpired && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPayingOrder(order)}
                          className="app-btn-primary text-sm px-4 py-2"
                        >
                          Pagar
                        </button>
                        <button
                          onClick={() => cancelMutation.mutate(order.id)}
                          disabled={cancelMutation.isPending}
                          className="p-2 rounded-lg text-dark-gray hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Cancelar orden"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PaymentModal
        isOpen={!!payingOrder}
        onClose={() => setPayingOrder(null)}
        order={payingOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
