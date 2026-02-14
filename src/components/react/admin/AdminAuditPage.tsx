import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../../../services/api'
import FileText from 'lucide-react/dist/esm/icons/file-text'
import Filter from 'lucide-react/dist/esm/icons/filter'
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw'
import User from 'lucide-react/dist/esm/icons/user'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Trophy from 'lucide-react/dist/esm/icons/trophy'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function AdminAuditContent() {
  const [page, setPage] = useState(0)
  const [selectedType, setSelectedType] = useState('')
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'payments'>('all')

  const { data: eventTypes } = useQuery({
    queryKey: ['auditEventTypes'],
    queryFn: () => auditApi.getEventTypes().then((res) => res.data),
  })

  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', viewMode, selectedType, page],
    queryFn: () => {
      if (viewMode === 'today') {
        return auditApi.getToday(page, 20).then((res) => res.data)
      }
      if (viewMode === 'payments') {
        return auditApi.getPaymentLogs(page, 20).then((res) => res.data)
      }
      if (selectedType) {
        return auditApi.getByType(selectedType, page, 20).then((res) => res.data)
      }
      return auditApi.getAll(page, 20).then((res) => res.data)
    },
  })

  const logs = logsData?.content || []
  const totalPages = logsData?.totalPages || 0

  const getEventIcon = (eventType: string) => {
    if (eventType?.includes('USER')) return User
    if (eventType?.includes('PAYMENT') || eventType?.includes('ORDER')) return CreditCard
    if (eventType?.includes('RAFFLE') || eventType?.includes('PARTICIPANT')) return Trophy
    return FileText
  }

  const getEventColor = (eventType: string) => {
    if (eventType?.includes('REGISTERED') || eventType?.includes('CONFIRMED') || eventType?.includes('ACTIVATED')) {
      return 'green'
    }
    if (eventType?.includes('FAILED') || eventType?.includes('EXPIRED') || eventType?.includes('CANCELLED')) {
      return 'red'
    }
    if (eventType?.includes('CREATED') || eventType?.includes('STARTED')) {
      return 'blue'
    }
    return 'gray'
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('es-PE')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-gray">Auditoria</h1>
          <p className="text-dark-gray">Registro de eventos del sistema</p>
        </div>
        <button
          onClick={() => refetch()}
          className="app-btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      <div className="app-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-5 h-5 text-dark-gray" />
          <span className="font-medium text-light-gray">Filtros</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setViewMode('all')
              setSelectedType('')
              setPage(0)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'all' && !selectedType
                ? 'bg-intense-pink text-white'
                : 'bg-white/10 text-gray hover:bg-white/15'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => {
              setViewMode('today')
              setSelectedType('')
              setPage(0)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'today'
                ? 'bg-intense-pink text-white'
                : 'bg-white/10 text-gray hover:bg-white/15'
            }`}
          >
            <Calendar className="w-4 h-4" /> Hoy
          </button>
          <button
            onClick={() => {
              setViewMode('payments')
              setSelectedType('')
              setPage(0)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'payments'
                ? 'bg-intense-pink text-white'
                : 'bg-white/10 text-gray hover:bg-white/15'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Pagos
          </button>
        </div>

        <div>
          <label className="app-label">Filtrar por tipo de evento</label>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              setViewMode('all')
              setPage(0)
            }}
            className="app-input max-w-md"
          >
            <option value="">-- Todos los tipos --</option>
            {eventTypes?.map((type: any) => (
              <option key={type.name} value={type.name}>
                {type.name} - {type.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log: any) => {
              const Icon = getEventIcon(log.eventType)
              const color = getEventColor(log.eventType)

              return (
                <div key={log.id} className="app-card">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        color === 'green' ? 'bg-green-500/20' :
                        color === 'red' ? 'bg-red-500/20' :
                        color === 'blue' ? 'bg-blue-500/20' :
                        'bg-white/10'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          color === 'green' ? 'text-green-400' :
                          color === 'red' ? 'text-red-400' :
                          color === 'blue' ? 'text-blue-400' :
                          'text-gray'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`app-badge ${
                            color === 'green' ? 'bg-green-500/20 text-green-400' :
                            color === 'red' ? 'bg-red-500/20 text-red-400' :
                            color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-white/10 text-gray'
                          }`}
                        >
                          {log.eventType}
                        </span>
                        <span className="text-sm text-dark-gray">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray">{log.description}</p>
                      {log.entityType && (
                        <p className="text-sm text-dark-gray mt-1">
                          {log.entityType}: {log.entityId}
                        </p>
                      )}
                      {log.ipAddress && (
                        <p className="text-xs text-dark-gray mt-1">IP: {log.ipAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="app-btn-secondary"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-gray">
                Pagina {page + 1} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="app-btn-secondary"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

