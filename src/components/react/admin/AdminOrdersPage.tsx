import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../../../services/api'
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import Filter from 'lucide-react/dist/esm/icons/filter'
import LoadingSpinner from '../shared/LoadingSpinner'

const ORDER_STATUSES = ['ALL', 'PENDING', 'PAID', 'EXPIRED', 'CANCELLED']

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

export default function AdminOrdersContent() {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['adminOrders', statusFilter],
    queryFn: () => {
      if (statusFilter === 'ALL') {
        return orderApi.getAll().then((res) => res.data)
      }
      return orderApi.getByStatus(statusFilter).then((res) => res.data)
    },
  })

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.content || []

  const getStatusBadge = (status: string) =>
    ORDER_STATUS_BADGES[status] || { cls: 'app-badge-info', label: status }

  const getTypeInfo = (type: string) =>
    ORDER_TYPE_INFO[type] || DEFAULT_TYPE_INFO

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('es-PE')
  }

  const stats = orders?.reduce(
    (acc: any, order: any) => {
      acc.total++
      acc.totalAmount += parseFloat(order.totalAmount) || 0
      if (order.status === 'PAID') {
        acc.paid++
        acc.paidAmount += parseFloat(order.totalAmount) || 0
      }
      if (order.status === 'PENDING') acc.pending++
      return acc
    },
    { total: 0, paid: 0, pending: 0, totalAmount: 0, paidAmount: 0 }
  )

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
        <h1 className="text-2xl font-bold text-light-gray">Ordenes</h1>
        <p className="text-dark-gray">Administra todas las ordenes del sistema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="app-card">
          <p className="text-sm text-dark-gray">Total Ordenes</p>
          <p className="text-2xl font-bold text-light-gray">{stats?.total || 0}</p>
        </div>
        <div className="app-card">
          <p className="text-sm text-dark-gray">Pagadas</p>
          <p className="text-2xl font-bold text-green-400">{stats?.paid || 0}</p>
        </div>
        <div className="app-card">
          <p className="text-sm text-dark-gray">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-400">{stats?.pending || 0}</p>
        </div>
        <div className="app-card">
          <p className="text-sm text-dark-gray">Ingresos</p>
          <p className="text-2xl font-bold text-intense-pink">
            S/ {stats?.paidAmount?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-dark-gray" />
        <div className="flex gap-2 flex-wrap">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-intense-pink text-white'
                  : 'bg-white/10 text-gray hover:bg-white/15'
              }`}
            >
              {status === 'ALL' ? 'Todos' : getStatusBadge(status).label}
            </button>
          ))}
        </div>
      </div>

      <div className="app-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th className="text-center">Cantidad</th>
                <th className="text-right">Total</th>
                <th className="text-center">Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order: any) => {
                const typeInfo = getTypeInfo(order.type)
                const TypeIcon = typeInfo.icon

                return (
                  <tr key={order.id}>
                    <td>
                      <span className="font-mono text-sm text-gray">{order.id.slice(0, 8)}...</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <TypeIcon
                          className={`w-4 h-4 ${
                            typeInfo.color === 'blue' ? 'text-blue-400' :
                            typeInfo.color === 'purple' ? 'text-purple-400' :
                            'text-gray'
                          }`}
                        />
                        <span className="text-light-gray">{typeInfo.label}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-gray">{order.userName || 'N/A'}</span>
                    </td>
                    <td className="text-center text-light-gray">
                      {order.quantity}
                    </td>
                    <td className="text-right font-medium text-light-gray">
                      {order.currency} {order.totalAmount}
                    </td>
                    <td className="text-center">
                      <span className={getStatusBadge(order.status).cls}>
                        {getStatusBadge(order.status).label}
                      </span>
                    </td>
                    <td className="text-sm text-dark-gray">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

