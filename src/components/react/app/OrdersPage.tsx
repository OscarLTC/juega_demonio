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
import Alert from '../shared/Alert'
import PaymentModal from '../shared/PaymentModal'

const ORDER_STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  PENDING: { cls: 'app-badge-warning', label: 'Pendiente' },
  PAID: { cls: 'app-badge-success', label: 'Pagado' },
  EXPIRED: { cls: 'app-badge-danger', label: 'Expirado' },
  CANCELLED: { cls: 'app-badge-info', label: 'Cancelado' },
}

const ORDER_TYPE_INFO: Record<string, { icon: any; label: string; color: string }> = {
  SUBSCRIPTION: { icon: CreditCard, label: 'Suscripcion', color: 'blue' },
  SUPER_CHANCE: { icon: Sparkles, label: 'Super Chance', color: 'purple' },
}

const DEFAULT_TYPE_INFO = { icon: ShoppingBag, label: 'Otro', color: 'gray' }

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

  const getStatusBadge = (status: string) =>
    ORDER_STATUS_BADGES[status] || { cls: 'app-badge-info', label: status }

  const getTypeInfo = (type: string) =>
    ORDER_TYPE_INFO[type] || DEFAULT_TYPE_INFO

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-light-gray">Mis Ordenes</h1>
        <p className="text-dark-gray">Historial de todas tus compras y suscripciones</p>
      </div>

      {orders?.length === 0 ? (
        <Alert variant="info">
          No tienes ordenes todavia. Ve a Suscripciones o Super Chances para realizar tu primera compra.
        </Alert>
      ) : (
        <div className="space-y-4">
          {orders?.map((order: any) => {
            const typeInfo = getTypeInfo(order.type)
            const TypeIcon = typeInfo.icon
            const isPending = order.status === 'PENDING'
            const isExpired = order.status === 'EXPIRED' ||
              (isPending && new Date(order.expiresAt) < new Date())

            return (
              <div key={order.id} className="app-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        typeInfo.color === 'blue' ? 'bg-blue-500/20' :
                        typeInfo.color === 'purple' ? 'bg-purple-500/20' :
                        'bg-white/10'
                      }`}
                    >
                      <TypeIcon
                        className={`w-6 h-6 ${
                          typeInfo.color === 'blue' ? 'text-blue-400' :
                          typeInfo.color === 'purple' ? 'text-purple-400' :
                          'text-gray'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-light-gray">{typeInfo.label}</h3>
                        <span className={getStatusBadge(isExpired && isPending ? 'EXPIRED' : order.status).cls}>
                          {getStatusBadge(isExpired && isPending ? 'EXPIRED' : order.status).label}
                        </span>
                      </div>
                      <p className="text-sm text-dark-gray font-mono">{order.id}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray">
                        <span>Cantidad: {order.quantity}</span>
                        <span>Creado: {formatDate(order.createdAt)}</span>
                        {order.status === 'PAID' && (
                          <span className="text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Pagado: {formatDate(order.paidAt)}
                          </span>
                        )}
                        {isPending && !isExpired && (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Expira: {formatDate(order.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-dark-gray">Total</p>
                      <p className="text-xl font-bold text-intense-pink">
                        {order.currency} {order.totalAmount}
                      </p>
                    </div>

                    {isPending && !isExpired && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPayingOrder(order)}
                          className="app-btn-primary text-sm"
                        >
                          Pagar
                        </button>
                        <button
                          onClick={() => cancelMutation.mutate(order.id)}
                          disabled={cancelMutation.isPending}
                          className="app-btn-danger text-sm flex items-center gap-1"
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
