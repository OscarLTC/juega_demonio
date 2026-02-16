import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { raffleApi, participantApi, exportApi } from '../../../services/api'
import Users from 'lucide-react/dist/esm/icons/users'
import Ticket from 'lucide-react/dist/esm/icons/ticket'
import Download from 'lucide-react/dist/esm/icons/download'
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet'
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'

const RAFFLE_STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  DRAFT: { cls: 'app-badge-info', label: 'Borrador' },
  ACTIVE: { cls: 'app-badge-success', label: 'Activo' },
  CLOSING: { cls: 'app-badge-warning', label: 'Cerrando' },
  CLOSED: { cls: 'app-badge-danger', label: 'Cerrado' },
}

export default function AdminParticipantsContent() {
  const [selectedRaffle, setSelectedRaffle] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  const { data: raffles, isLoading: rafflesLoading } = useQuery({
    queryKey: ['adminRaffles'],
    queryFn: () => raffleApi.getAll().then((res) => res.data),
  })

  useEffect(() => {
    if (raffles?.length && !selectedRaffle) {
      const active = raffles.find((r: any) => r.status === 'ACTIVE')
      if (active) setSelectedRaffle(active.id)
    }
  }, [raffles])

  const selectedRaffleData = useMemo(() => {
    if (!selectedRaffle || !raffles) return null
    return raffles.find((r: any) => r.id === selectedRaffle)
  }, [selectedRaffle, raffles])

  const canExport = selectedRaffleData?.status === 'CLOSING' || selectedRaffleData?.status === 'CLOSED'

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['participants', selectedRaffle],
    queryFn: () => participantApi.getByRaffle(selectedRaffle).then((res) => res.data.content),
    enabled: !!selectedRaffle,
  })

  const { data: stats } = useQuery({
    queryKey: ['participantStats', selectedRaffle],
    queryFn: async () => {
      const [countRes, ticketsRes] = await Promise.all([
        participantApi.countByRaffle(selectedRaffle),
        participantApi.getTotalTickets(selectedRaffle),
      ])
      return {
        count: countRes.data,
        totalTickets: ticketsRes.data,
      }
    },
    enabled: !!selectedRaffle,
  })

  const handleExportExcel = async () => {
    if (!selectedRaffle || !canExport) return

    setExporting(true)
    setExportError('')
    try {
      const response = await exportApi.downloadRaffleTickets(selectedRaffle)

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const contentDisposition = response.headers['content-disposition']
      let filename = `sorteo_${selectedRaffle.slice(0, 8)}_tickets.xlsx`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match) filename = match[1].replace(/['"]/g, '')
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al exportar el archivo Excel'
      setExportError(message)
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (status: string) =>
    RAFFLE_STATUS_BADGES[status] || { cls: 'app-badge-info', label: status }

  if (rafflesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-light-gray">Participantes</h1>
        <p className="text-dark-gray">Visualiza los participantes de cada sorteo</p>
      </div>

      <div className="app-card">
        <label className="app-label">Seleccionar Sorteo</label>
        <select
          value={selectedRaffle}
          onChange={(e) => {
            setSelectedRaffle(e.target.value)
            setExportError('')
          }}
          className="app-input"
        >
          <option value="">-- Selecciona un sorteo --</option>
          {raffles?.map((raffle: any) => (
            <option key={raffle.id} value={raffle.id}>
              {raffle.name} ({raffle.status})
            </option>
          ))}
        </select>

        {selectedRaffleData && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-dark-gray">Estado:</span>
            <span className={getStatusBadge(selectedRaffleData.status).cls}>
              {getStatusBadge(selectedRaffleData.status).label}
            </span>
          </div>
        )}
      </div>

      {selectedRaffle && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="app-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-dark-gray">Total Participantes</p>
                <p className="text-2xl font-bold text-light-gray">{stats?.count || 0}</p>
              </div>
            </div>
            <div className="app-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-dark-gray">Total Tickets</p>
                <p className="text-2xl font-bold text-light-gray">{stats?.totalTickets || 0}</p>
              </div>
            </div>
            <div className="app-card">
              {canExport ? (
                <button
                  onClick={handleExportExcel}
                  disabled={exporting || !participants?.length}
                  className="w-full h-full flex items-center gap-4 hover:bg-white/5 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-dark-gray">Exportar</p>
                    <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {exporting ? 'Descargando...' : 'Excel'}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-4 opacity-60">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-dark-gray" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-dark-gray">Exportar Excel</p>
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Solo en estado CLOSING o CLOSED
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {exportError && (
            <Alert variant="error">
              {exportError}
            </Alert>
          )}

          {participantsLoading ? (
            <LoadingSpinner />
          ) : participants?.length === 0 ? (
            <Alert variant="info">
              No hay participantes registrados en este sorteo.
            </Alert>
          ) : (
            <div className="app-card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Codigo</th>
                      <th className="text-center">Tickets Sub</th>
                      <th className="text-center">Super Chances</th>
                      <th className="text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants?.map((participant: any) => (
                      <tr key={participant.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-intense-pink/20 flex items-center justify-center">
                              <span className="text-intense-pink font-medium text-sm">
                                {participant.displayName?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-light-gray">{participant.displayName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-sm text-gray">
                            {participant.participantCode}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="app-badge-info">{participant.subscriptionTickets}</span>
                        </td>
                        <td className="text-center">
                          <span className="app-badge bg-purple-500/20 text-purple-400">
                            {participant.superChanceTickets}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="app-badge-success font-bold">{participant.totalTickets}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

