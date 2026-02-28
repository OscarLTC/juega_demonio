import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superChanceApi, raffleApi } from '../../../services/api'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import Ticket from 'lucide-react/dist/esm/icons/ticket'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Plus from 'lucide-react/dist/esm/icons/plus'
import Minus from 'lucide-react/dist/esm/icons/minus'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'
import PaymentModal from '../shared/PaymentModal'

export default function SuperChancesContent() {
  const [quantity, setQuantity] = useState(1)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: price, isLoading: priceLoading } = useQuery({
    queryKey: ['superChancePrice'],
    queryFn: () => superChanceApi.getPrice().then((res) => res.data),
  })

  const { data: raffle } = useQuery({
    queryKey: ['activeRaffle'],
    queryFn: () => raffleApi.getActive().then((res) => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => superChanceApi.create(data),
    onSuccess: (response) => {
      setPendingOrder(response.data)
      setShowPaymentModal(true)
    },
  })

  const handlePurchase = () => {
    createMutation.mutate({ quantity })
  }

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['myParticipation'] })
    queryClient.invalidateQueries({ queryKey: ['myOrders'] })
    setQuantity(1)
  }

  const handleClosePayment = () => {
    setShowPaymentModal(false)
    setPendingOrder(null)
  }

  const maxQuantity = price?.maxPerRaffle ?? 100
  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, maxQuantity))
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1))

  if (priceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const totalPrice = (price?.unitPrice ?? 0) * quantity
  const totalTickets = (price?.ticketsPerSuperChance ?? 0) * quantity

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-heading">Super Chances</h1>
        <p className="app-heading-sub">Aumenta tus probabilidades con tickets adicionales</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Purchase card */}
        <div className="app-card-glow">
          <div className="app-accent-line" style={{
            background: 'linear-gradient(90deg, transparent, oklch(0.65 0.25 290 / 0.4), transparent)'
          }} />

          {/* Subtle purple glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-6 relative">
            <div className="app-icon-box app-icon-box-md bg-purple-500/10">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2
                className="text-lg font-bold text-light-gray tracking-wide uppercase"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                Comprar
              </h2>
              <p className="text-xs text-dark-gray">Para: {raffle?.name || 'Sorteo activo'}</p>
            </div>
          </div>

          {/* Price info */}
          <div className="rounded-lg bg-white/[0.03] border border-charcoal/10 p-4 mb-6 relative">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm text-dark-gray">Precio por unidad</span>
              <span
                className="font-bold text-light-gray tabular-nums"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                S/ {price?.unitPrice}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-gray">Tickets por unidad</span>
              <span className="font-bold text-purple-400 flex items-center gap-1.5 tabular-nums">
                <Ticket className="w-3.5 h-3.5" />
                {price?.ticketsPerSuperChance}
              </span>
            </div>
          </div>

          {/* Quantity selector */}
          <div className="mb-6 relative">
            <label className="app-label">Cantidad</label>
            <div className="flex items-center gap-4 mt-1.5">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-11 h-11 rounded-lg border border-charcoal/20 flex items-center justify-center hover:bg-white/5 hover:border-charcoal/30 disabled:opacity-30 text-dark-gray transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                className="text-4xl font-bold w-16 text-center text-light-gray tabular-nums"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
                className="w-11 h-11 rounded-lg border border-charcoal/20 flex items-center justify-center hover:bg-white/5 hover:border-charcoal/30 disabled:opacity-30 text-dark-gray transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-charcoal/15 pt-5 mb-6 space-y-2.5 relative">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-gray">Tickets a recibir</span>
              <span className="font-bold text-purple-400 flex items-center gap-1.5 tabular-nums">
                <Ticket className="w-4 h-4" />
                {totalTickets}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray font-medium">Total a pagar</span>
              <span
                className="text-2xl font-bold text-intense-pink tabular-nums"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                S/ {totalPrice?.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={createMutation.isPending}
            className="app-btn-primary w-full py-3 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, oklch(0.5 0.22 290), oklch(0.55 0.25 310))',
              boxShadow: '0 2px 12px oklch(0.5 0.22 290 / 0.25)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            {createMutation.isPending ? 'Procesando...' : 'Comprar Super Chances'}
          </button>

          {createMutation.isError && (
            <Alert variant="error" className="mt-4">
              {(createMutation.error as any)?.response?.data?.message || 'Error al crear la orden'}
            </Alert>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="app-card border-purple-500/10">
            <h3
              className="text-lg font-bold text-light-gray tracking-wide uppercase mb-5"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              Por que comprar?
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="app-icon-box app-icon-box-sm bg-purple-500/10 mt-0.5">
                  <Ticket className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-light-gray">Mas tickets, mas chances</p>
                  <p className="text-xs text-dark-gray mt-0.5">Cada unidad te da {price?.ticketsPerSuperChance} tickets adicionales</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="app-icon-box app-icon-box-sm bg-purple-500/10 mt-0.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-light-gray">Aumenta tus probabilidades</p>
                  <p className="text-xs text-dark-gray mt-0.5">Cada ticket es una oportunidad mas de ganar</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="app-icon-box app-icon-box-sm bg-purple-500/10 mt-0.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-light-gray">Activacion inmediata</p>
                  <p className="text-xs text-dark-gray mt-0.5">Los tickets se activan despues del pago</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="app-card bg-white/[0.02]">
            <p className="text-sm text-gray">
              <span className="text-intense-pink font-semibold">Tip:</span>{' '}
              Combina tu suscripcion con Super Chances para maximizar tus probabilidades de ganar.
            </p>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePayment}
        order={pendingOrder}
        description="Completa el pago para recibir tus tickets adicionales."
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
