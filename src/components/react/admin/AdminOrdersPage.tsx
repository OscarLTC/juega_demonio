import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../../../services/api'
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import Filter from 'lucide-react/dist/esm/icons/filter'
import Package from 'lucide-react/dist/esm/icons/package'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import Clock from 'lucide-react/dist/esm/icons/clock'
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign'
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
        <h1 className="app-heading">Ordenes</h1>
        <p className="app-heading-sub">Administra todas las ordenes del sistema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="app-card py-5 text-center relative overflow-hidden">
          <div className="app-icon-box app-icon-box-sm bg-blue-500/10 mx-auto mb-3">
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-light-gray tabular-nums" style={{ fontFamily: 'var(--font-family-display)' }}>{stats?.total || 0}</p>
          <p className="text-[11px] text-dark-gray mt-2 uppercase tracking-wider font-medium">Total Ordenes</p>
        </div>
        <div className="app-card py-5 text-center relative overflow-hidden">
          <div className="app-icon-box app-icon-box-sm bg-green-500/10 mx-auto mb-3">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400 tabular-nums" style={{ fontFamily: 'var(--font-family-display)' }}>{stats?.paid || 0}</p>
          <p className="text-[11px] text-dark-gray mt-2 uppercase tracking-wider font-medium">Pagadas</p>
        </div>
        <div className="app-card py-5 text-center relative overflow-hidden">
          <div className="app-icon-box app-icon-box-sm bg-yellow-500/10 mx-auto mb-3">
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400 tabular-nums" style={{ fontFamily: 'var(--font-family-display)' }}>{stats?.pending || 0}</p>
          <p className="text-[11px] text-dark-gray mt-2 uppercase tracking-wider font-medium">Pendientes</p>
        </div>
        <div className="app-card-glow py-5 text-center relative overflow-hidden">
          <div className="app-accent-line" />
          <div
            className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'oklch(0.6432 0.2593 1.25 / 0.06)' }}
          />
          <div className="app-icon-box app-icon-box-sm bg-intense-pink/10 mx-auto mb-3 relative">
            <DollarSign className="w-4 h-4 text-intense-pink" />
          </div>
          <p className="text-2xl font-bold text-intense-pink tabular-nums relative" style={{ fontFamily: 'var(--font-family-display)' }}>
            S/ {stats?.paidAmount?.toFixed(2) || '0.00'}
          </p>
          <p className="text-[11px] text-dark-gray mt-2 uppercase tracking-wider font-medium relative">Ingresos</p>
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

      <div className="app-card-glow overflow-hidden p-0 relative">
        <div className="app-accent-line" />
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

