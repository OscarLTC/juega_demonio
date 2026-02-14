import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superChanceApi, paymentApi, raffleApi } from '../../../services/api'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import Ticket from 'lucide-react/dist/esm/icons/ticket'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Plus from 'lucide-react/dist/esm/icons/plus'
import Minus from 'lucide-react/dist/esm/icons/minus'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'
import Modal from '../shared/Modal'

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

  const simulatePaymentMutation = useMutation({
    mutationFn: (orderId: string) => paymentApi.simulate(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParticipation'] })
      queryClient.invalidateQueries({ queryKey: ['myOrders'] })
      setShowPaymentModal(false)
      setPendingOrder(null)
      setQuantity(1)
    },
  })

  const handlePurchase = () => {
    createMutation.mutate({ quantity })
  }

  const handleSimulatePayment = () => {
    if (pendingOrder?.id) {
      simulatePaymentMutation.mutate(pendingOrder.id)
    }
  }

  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, 10))
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1))

  if (priceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const totalPrice = price?.pricePerUnit * quantity
  const totalTickets = price?.ticketsPerUnit * quantity

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-light-gray">Super Chances</h1>
        <p className="text-dark-gray">Aumenta tus probabilidades de ganar con tickets adicionales</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="app-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-light-gray">Comprar Super Chances</h2>
              <p className="text-dark-gray">Para: {raffle?.name || 'Sorteo activo'}</p>
            </div>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-300">Precio por unidad:</span>
              <span className="font-bold text-purple-200">S/ {price?.pricePerUnit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-300">Tickets por unidad:</span>
              <span className="font-bold text-purple-200 flex items-center gap-1">
                <Ticket className="w-4 h-4" />
                {price?.ticketsPerUnit}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="app-label">Cantidad</label>
            <div className="flex items-center gap-4">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-12 h-12 rounded-lg border border-charcoal/30 flex items-center justify-center hover:bg-white/5 disabled:opacity-50 text-gray"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-3xl font-bold w-16 text-center text-light-gray">{quantity}</span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= 10}
                className="w-12 h-12 rounded-lg border border-charcoal/30 flex items-center justify-center hover:bg-white/5 disabled:opacity-50 text-gray"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-t border-charcoal/30 pt-4 mb-6 space-y-2">
            <div className="flex justify-between text-lg">
              <span className="text-gray">Tickets a recibir:</span>
              <span className="font-bold text-purple-400 flex items-center gap-1">
                <Ticket className="w-5 h-5" />
                {totalTickets}
              </span>
            </div>
            <div className="flex justify-between text-xl">
              <span className="text-gray">Total a pagar:</span>
              <span className="font-bold text-intense-pink">S/ {totalPrice?.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={createMutation.isPending}
            className="app-btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {createMutation.isPending ? 'Procesando...' : 'Comprar Super Chances'}
          </button>

          {createMutation.isError && (
            <Alert variant="error" className="mt-4">
              {(createMutation.error as any)?.response?.data?.message || 'Error al crear la orden'}
            </Alert>
          )}
        </div>

        <div className="space-y-4">
          <div className="app-card bg-gradient-to-br from-purple-600/30 to-purple-800/30 border-purple-500/30">
            <h3 className="text-lg font-bold text-light-gray mb-3">Por que comprar Super Chances?</h3>
            <ul className="space-y-2 text-purple-200">
              <li className="flex items-start gap-2">
                <Ticket className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Cada Super Chance te da {price?.ticketsPerUnit} tickets adicionales</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Aumenta significativamente tus probabilidades de ganar</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Los tickets se activan inmediatamente despues del pago</span>
              </li>
            </ul>
          </div>

          <Alert variant="info">
            <p className="font-medium">Tip:</p>
            <p className="text-sm">
              Combina tu suscripcion con Super Chances para maximizar tus probabilidades de ganar!
            </p>
          </Alert>
        </div>
      </div>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setPendingOrder(null)
        }}
        title="Completar Pago"
      >
        {pendingOrder && (
          <div className="space-y-4">
            <Alert variant="info">
              <p className="font-medium">Orden creada exitosamente!</p>
              <p className="text-sm">
                Para completar tu compra, realiza el pago o simula el pago para la demo.
              </p>
            </Alert>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray">Orden ID:</span>
                <span className="font-mono text-sm text-light-gray">{pendingOrder.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray">Cantidad:</span>
                <span className="text-light-gray">{pendingOrder.quantity} Super Chance(s)</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray">Total:</span>
                <span className="font-bold text-lg text-light-gray">
                  S/ {pendingOrder.totalAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray">Expira:</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(pendingOrder.expiresAt).toLocaleString('es-PE')}
                </span>
              </div>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={simulatePaymentMutation.isPending}
              className="app-btn-primary w-full py-3"
            >
              {simulatePaymentMutation.isPending
                ? 'Procesando pago...'
                : 'Simular Pago (Demo)'}
            </button>

            {simulatePaymentMutation.isError && (
              <Alert variant="error">
                Error al procesar el pago
              </Alert>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

