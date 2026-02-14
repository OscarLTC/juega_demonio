import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { raffleApi } from '../../../services/api'
import Trophy from 'lucide-react/dist/esm/icons/trophy'
import Plus from 'lucide-react/dist/esm/icons/plus'
import Play from 'lucide-react/dist/esm/icons/play'
import Square from 'lucide-react/dist/esm/icons/square'
import Flag from 'lucide-react/dist/esm/icons/flag'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prize: '',
    startsAt: '',
    endsAt: '',
    ticketsPerSubscription: 1,
    ticketsPerSuperChance: 3,
  })
  const queryClient = useQueryClient()

  const { data: raffles, isLoading } = useQuery({
    queryKey: ['adminRaffles'],
    queryFn: () => raffleApi.getAll().then((res) => res.data),
  })

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
    mutationFn: (id: string) => raffleApi.finalize(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminRaffles'] }),
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
      startsAt: '',
      endsAt: '',
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
          {raffles?.map((raffle: any) => (
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
                    <button
                      onClick={() => finalizeMutation.mutate(raffle.id)}
                      disabled={finalizeMutation.isPending}
                      className="app-btn-danger flex items-center gap-1 text-sm"
                    >
                      <Flag className="w-4 h-4" /> Finalizar
                    </button>
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
              <input
                type="datetime-local"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleChange}
                className="app-input"
              />
            </div>
            <div>
              <label className="app-label">Fecha de Fin</label>
              <input
                type="datetime-local"
                name="endsAt"
                value={formData.endsAt}
                onChange={handleChange}
                className="app-input"
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
    </div>
  )
}

