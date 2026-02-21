import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { raffleApi, orderApi, participantApi } from '../../../services/api'
import Trophy from 'lucide-react/dist/esm/icons/trophy'
import Plus from 'lucide-react/dist/esm/icons/plus'
import Play from 'lucide-react/dist/esm/icons/play'
import Square from 'lucide-react/dist/esm/icons/square'
import Flag from 'lucide-react/dist/esm/icons/flag'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle'
import Crown from 'lucide-react/dist/esm/icons/crown'
import Search from 'lucide-react/dist/esm/icons/search'
import Check from 'lucide-react/dist/esm/icons/check'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'
import Modal from '../shared/Modal'

const RAFFLE_STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  DRAFT: { cls: 'app-badge-info', label: 'Borrador' },
  ACTIVE: { cls: 'app-badge-success', label: 'Activo' },
  CLOSING: { cls: 'app-badge-warning', label: 'Cerrando' },
  CLOSED: { cls: 'app-badge-danger', label: 'Cerrado' },
}

export default function AdminRafflesContent() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [finalizeRaffleId, setFinalizeRaffleId] = useState<string | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [participantSearch, setParticipantSearch] = useState('')
  const [winnerError, setWinnerError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prize: '',
    startsAt: null as Date | null,
    endsAt: null as Date | null,
    ticketsPerSubscription: 1,
    ticketsPerSuperChance: 3,
  })
  const queryClient = useQueryClient()

  const { data: raffles, isLoading } = useQuery({
    queryKey: ['adminRaffles'],
    queryFn: () => raffleApi.getAll().then((res) => res.data),
  })

  const closingRaffle = raffles?.find((r: any) => r.status === 'CLOSING')

  const { data: pendingSummary } = useQuery({
    queryKey: ['pendingSummary', closingRaffle?.id],
    queryFn: () => orderApi.getPendingSummary(closingRaffle.id).then((res) => res.data),
    enabled: !!closingRaffle,
    refetchInterval: 10000,
  })

  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['winnerParticipants', finalizeRaffleId],
    queryFn: () => participantApi.getByRaffle(finalizeRaffleId!, 0, 1000).then((res) => res.data?.content ?? res.data),
    enabled: !!finalizeRaffleId && showWinnerModal,
  })

  const filteredParticipants = useMemo(() => {
    if (!participants) return []
    if (!participantSearch.trim()) return participants
    const q = participantSearch.toLowerCase()
    return participants.filter(
      (p: any) =>
        p.displayName?.toLowerCase().includes(q) ||
        p.participantCode?.toLowerCase().includes(q)
    )
  }, [participants, participantSearch])

  const createMutation = useMutation({
    mutationFn: (data: any) => raffleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRaffles'] })
      setShowCreateModal(false)
      resetForm()
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => raffleApi.activate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminRaffles'] }),
  })

  const closingMutation = useMutation({
    mutationFn: (id: string) => raffleApi.startClosing(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminRaffles'] }),
  })

  const finalizeMutation = useMutation({
    mutationFn: ({ id, participantCode }: { id: string; participantCode: string }) =>
      raffleApi.finalize(id, participantCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRaffles'] })
      setShowWinnerModal(false)
      setFinalizeRaffleId(null)
      setSelectedParticipant(null)
      setParticipantSearch('')
      setWinnerError('')
    },
    onError: (error: any) => {
      setWinnerError(error?.response?.data?.message || 'Error al finalizar el sorteo')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => raffleApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminRaffles'] }),
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      prize: '',
      startsAt: null,
      endsAt: null,
      ticketsPerSubscription: 1,
      ticketsPerSuperChance: 3,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      startsAt: formData.startsAt?.toISOString() || null,
      endsAt: formData.endsAt?.toISOString() || null,
      ticketsPerSubscription: parseInt(String(formData.ticketsPerSubscription)),
      ticketsPerSuperChance: parseInt(String(formData.ticketsPerSuperChance)),
    })
  }

  const getStatusBadge = (status: string) =>
    RAFFLE_STATUS_BADGES[status] || { cls: 'app-badge-info', label: status }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No definido'
    return new Date(dateStr).toLocaleString('es-PE')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-gray">Gestion de Sorteos</h1>
          <p className="text-dark-gray">Administra los sorteos de la plataforma</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="app-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Sorteo
        </button>
      </div>

      {raffles?.length === 0 ? (
        <Alert variant="info">
          No hay sorteos creados. Crea el primer sorteo para comenzar.
        </Alert>
      ) : (
        <div className="space-y-4">
          {[...raffles]?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((raffle: any) => (
            <div key={raffle.id} className="app-card">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-intense-pink/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-intense-pink" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-light-gray">{raffle.name}</h3>
                      <span className={getStatusBadge(raffle.status).cls}>
                        {getStatusBadge(raffle.status).label}
                      </span>
                    </div>
                    <p className="text-gray mb-2">{raffle.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-dark-gray">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" /> Premio: {raffle.prize}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {formatDate(raffle.startsAt)} - {formatDate(raffle.endsAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {raffle.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => activateMutation.mutate(raffle.id)}
                        disabled={activateMutation.isPending}
                        className="app-btn-primary flex items-center gap-1 text-sm"
                      >
                        <Play className="w-4 h-4" /> Activar
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(raffle.id)}
                        disabled={deleteMutation.isPending}
                        className="app-btn-danger flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {raffle.status === 'ACTIVE' && (
                    <button
                      onClick={() => closingMutation.mutate(raffle.id)}
                      disabled={closingMutation.isPending}
                      className="app-btn-secondary flex items-center gap-1 text-sm"
                    >
                      <Square className="w-4 h-4" /> Iniciar Cierre
                    </button>
                  )}
                  {raffle.status === 'CLOSING' && (
                    <div className="flex items-center gap-3">
                      {pendingSummary?.count > 0 ? (
                        <div className="text-right">
                          <span className="flex items-center gap-1 text-sm text-yellow-400">
                            <AlertCircle className="w-4 h-4" />
                            {pendingSummary.count} orden(es) pendiente(s)
                          </span>
                          {pendingSummary.latestExpiration && (
                            <p className="text-xs text-dark-gray">
                              Expiran antes de {new Date(pendingSummary.latestExpiration).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-green-400">Sin ordenes pendientes</span>
                      )}
                      <button
                        onClick={() => {
                          setFinalizeRaffleId(raffle.id)
                          setSelectedParticipant(null)
                          setParticipantSearch('')
                          setWinnerError('')
                          setShowWinnerModal(true)
                        }}
                        className="app-btn-danger flex items-center gap-1 text-sm"
                      >
                        <Flag className="w-4 h-4" /> Finalizar
                      </button>
                    </div>
                  )}
                  {raffle.status === 'CLOSED' && raffle.winnerParticipantCode && (
                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-400">Ganador</p>
                        <p className="text-sm text-light-gray">{raffle.winnerDisplayName}</p>
                        <p className="text-xs text-dark-gray">{raffle.winnerParticipantCode}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        title="Crear Nuevo Sorteo"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="app-label">Nombre del Sorteo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="app-input"
              placeholder="Ej: Sorteo Enero 2025"
              required
            />
          </div>

          <div>
            <label className="app-label">Descripcion</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="app-input"
              rows={3}
              placeholder="Descripcion del sorteo..."
            />
          </div>

          <div>
            <label className="app-label">Premio</label>
            <input
              type="text"
              name="prize"
              value={formData.prize}
              onChange={handleChange}
              className="app-input"
              placeholder="Ej: S/ 1,000 en efectivo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="app-label">Fecha de Inicio</label>
              <DatePicker
                selected={formData.startsAt}
                onChange={(date) => setFormData((prev) => ({ ...prev, startsAt: date }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Seleccionar fecha"
                className="app-input"
                minDate={new Date()}
              />
            </div>
            <div>
              <label className="app-label">Fecha de Fin</label>
              <DatePicker
                selected={formData.endsAt}
                onChange={(date) => setFormData((prev) => ({ ...prev, endsAt: date }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Seleccionar fecha"
                className="app-input"
                minDate={formData.startsAt || new Date()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="app-label">Tickets por Suscripcion</label>
              <input
                type="number"
                name="ticketsPerSubscription"
                value={formData.ticketsPerSubscription}
                onChange={handleChange}
                className="app-input"
                min={1}
                required
              />
            </div>
            <div>
              <label className="app-label">Tickets por Super Chance</label>
              <input
                type="number"
                name="ticketsPerSuperChance"
                value={formData.ticketsPerSuperChance}
                onChange={handleChange}
                className="app-input"
                min={1}
                required
              />
            </div>
          </div>

          {createMutation.isError && (
            <Alert variant="error">
              {(createMutation.error as any)?.response?.data?.message || 'Error al crear el sorteo'}
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false)
                resetForm()
              }}
              className="app-btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="app-btn-primary flex-1"
            >
              {createMutation.isPending ? 'Creando...' : 'Crear Sorteo'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showWinnerModal}
        onClose={() => {
          setShowWinnerModal(false)
          setFinalizeRaffleId(null)
          setSelectedParticipant(null)
          setParticipantSearch('')
          setWinnerError('')
        }}
        title="Finalizar Sorteo - Seleccionar Ganador"
      >
        <div className="space-y-4">
          <p className="text-gray text-sm">
            Busca y selecciona al participante ganador para cerrar el sorteo definitivamente.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray" />
            <input
              type="text"
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
              className="app-input pl-10"
              placeholder="Buscar por nombre o codigo..."
              autoFocus
            />
          </div>

          {selectedParticipant && (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              <Check className="w-5 h-5 text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-light-gray truncate">{selectedParticipant.displayName}</p>
                <p className="text-xs text-dark-gray">{selectedParticipant.participantCode} - {selectedParticipant.totalTickets} ticket(s)</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="text-xs text-dark-gray hover:text-light-gray"
              >
                Cambiar
              </button>
            </div>
          )}

          {!selectedParticipant && (
            <div className="max-h-60 overflow-y-auto border border-charcoal/30 rounded-lg">
              {isLoadingParticipants ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : filteredParticipants.length === 0 ? (
                <p className="text-sm text-dark-gray text-center py-6">
                  {participantSearch ? 'Sin resultados' : 'No hay participantes'}
                </p>
              ) : (
                filteredParticipants.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedParticipant(p)
                      setWinnerError('')
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left border-b border-charcoal/20 last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-intense-pink/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-intense-pink">
                        {p.displayName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-light-gray truncate">{p.displayName}</p>
                      <p className="text-xs text-dark-gray">{p.participantCode}</p>
                    </div>
                    <span className="text-xs text-dark-gray shrink-0">{p.totalTickets} ticket(s)</span>
                  </button>
                ))
              )}
            </div>
          )}

          {winnerError && (
            <Alert variant="error">{winnerError}</Alert>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowWinnerModal(false)
                setFinalizeRaffleId(null)
                setSelectedParticipant(null)
                setParticipantSearch('')
                setWinnerError('')
              }}
              className="app-btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (finalizeRaffleId && selectedParticipant) {
                  finalizeMutation.mutate({ id: finalizeRaffleId, participantCode: selectedParticipant.participantCode })
                }
              }}
              disabled={finalizeMutation.isPending || !selectedParticipant}
              className="app-btn-danger flex-1"
            >
              {finalizeMutation.isPending ? 'Finalizando...' : 'Finalizar Sorteo'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

