import { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { paymentApi } from '../../../services/api'
import Modal from './Modal'
import Alert from './Alert'
import LoadingSpinner from './LoadingSpinner'
import Clock from 'lucide-react/dist/esm/icons/clock'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import Ticket from 'lucide-react/dist/esm/icons/ticket'
import PartyPopper from 'lucide-react/dist/esm/icons/party-popper'

declare global {
  interface Window {
    Culqi: any
    culqi: () => void
  }
}

const CULQI_PUBLIC_KEY = import.meta.env.PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_xxx'
const CULQI_SCRIPT_URL = 'https://checkout.culqi.com/js/v4'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    totalAmount: number
    currency?: string
    expiresAt: string
    quantity?: number
    type?: string
  } | null
  title?: string
  description?: string
  onPaymentSuccess: () => void
}

function SuccessView({
  order,
  paymentResult,
  onClose,
}: {
  order: { id: string; totalAmount: number; currency?: string; quantity?: number; type?: string }
  paymentResult: { status: string; message: string; chargeId?: string }
  onClose: () => void
}) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 150)
    return () => clearTimeout(timer)
  }, [])

  const isSuperChance = order.type === 'SUPER_CHANCE'
  const isSubscription = order.type === 'SUBSCRIPTION'

  return (
    <div className="text-center py-4">
      {/* Animated success icon with glow */}
      <div className="relative mx-auto w-24 h-24 mb-6">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'oklch(0.6432 0.2593 1.25 / 0.1)',
            animationDuration: '2s',
            animationIterationCount: '2',
          }}
        />
        {/* Warm glow background */}
        <div
          className="absolute inset-[-12px] rounded-full blur-xl"
          style={{ background: 'oklch(0.6432 0.2593 1.25 / 0.12)' }}
        />
        {/* Main circle */}
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, oklch(0.6432 0.2593 1.25 / 0.2), oklch(0.6432 0.2593 1.25 / 0.08))',
            border: '2px solid oklch(0.6432 0.2593 1.25 / 0.3)',
            boxShadow: '0 0 30px oklch(0.6432 0.2593 1.25 / 0.15)',
          }}
        >
          <CheckCircle className="w-12 h-12 text-intense-pink" />
        </div>
      </div>

      {/* Title */}
      <div
        className="transition-all duration-500"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        <h3
          className="text-2xl font-bold text-light-gray tracking-wide uppercase mb-1"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          {isSuperChance
            ? 'COMPRA EXITOSA'
            : isSubscription
              ? 'SUSCRIPCION ACTIVADA'
              : 'PAGO EXITOSO'
          }
        </h3>
        <p className="text-sm text-dark-gray">{paymentResult.message}</p>
      </div>

      {/* What they got — visual card */}
      <div
        className="mt-6 transition-all duration-500 delay-100"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        <div
          className="rounded-xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, oklch(0.2435 0 0), oklch(0.2046 0 0))',
            border: '1px solid oklch(0.6432 0.2593 1.25 / 0.12)',
          }}
        >
          {/* Decorative corner glow */}
          <div
            className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'oklch(0.6432 0.2593 1.25 / 0.06)' }}
          />

          <div className="relative flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: isSuperChance
                  ? 'oklch(0.5 0.22 290 / 0.15)'
                  : 'oklch(0.6432 0.2593 1.25 / 0.12)',
              }}
            >
              {isSuperChance ? (
                <Sparkles className="w-6 h-6 text-purple-400" />
              ) : isSubscription ? (
                <Ticket className="w-6 h-6 text-intense-pink" />
              ) : (
                <PartyPopper className="w-6 h-6 text-intense-pink" />
              )}
            </div>

            <div className="flex-1 text-left">
              <p className="text-sm text-dark-gray">
                {isSuperChance
                  ? `${order.quantity || 1} Super Chance${(order.quantity || 1) > 1 ? 's' : ''}`
                  : isSubscription
                    ? 'Suscripcion'
                    : 'Compra'
                }
              </p>
              <p
                className="text-xl font-bold text-light-gray tabular-nums"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                S/ {order.totalAmount}
              </p>
            </div>

            <div className="text-right">
              <span className="app-badge-success">Pagado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charge ID */}
      {paymentResult.chargeId && (
        <div
          className="mt-3 transition-all duration-500 delay-200"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <p className="text-dark-gray text-xs font-mono">
            ID: {paymentResult.chargeId}
          </p>
        </div>
      )}

      {/* CTA */}
      <div
        className="mt-6 transition-all duration-500 delay-300"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        <button onClick={onClose} className="app-btn-primary w-full py-3">
          {isSuperChance
            ? 'Ver mis tickets'
            : isSubscription
              ? 'Ir al dashboard'
              : 'Cerrar'
          }
        </button>
      </div>
    </div>
  )
}

export default function PaymentModal({
  isOpen,
  onClose,
  order,
  title = 'Completar Pago',
  description,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [culqiLoaded, setCulqiLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    status: string
    message: string
    chargeId?: string
  } | null>(null)
  const callbackRef = useRef<((token: string) => void) | null>(null)
  const processingRef = useRef(false)

  // Load Culqi.js script
  useEffect(() => {
    if (window.Culqi) {
      setCulqiLoaded(true)
      return
    }

    const existing = document.querySelector(`script[src="${CULQI_SCRIPT_URL}"]`)
    if (existing) {
      const check = setInterval(() => {
        if (window.Culqi) {
          setCulqiLoaded(true)
          clearInterval(check)
        }
      }, 200)
      return () => clearInterval(check)
    }

    const script = document.createElement('script')
    script.src = CULQI_SCRIPT_URL
    script.async = true
    script.onload = () => {
      const check = setInterval(() => {
        if (window.Culqi) {
          setCulqiLoaded(true)
          clearInterval(check)
        }
      }, 200)
      setTimeout(() => clearInterval(check), 10000)
    }
    script.onerror = () => setScriptError(true)
    document.head.appendChild(script)
  }, [])

  // Setup global Culqi callback
  useEffect(() => {
    window.culqi = () => {
      if (processingRef.current) return
      if (window.Culqi.token) {
        const token = window.Culqi.token.id
        processingRef.current = true
        window.Culqi.close()
        if (callbackRef.current) {
          callbackRef.current(token)
        }
      } else if (window.Culqi.error) {
        window.Culqi.close()
        setPaymentResult({
          status: 'error',
          message: window.Culqi.error.user_message || 'Error al procesar la tarjeta',
        })
      }
    }
  }, [])

  const chargeMutation = useMutation({
    mutationFn: ({ orderId, token }: { orderId: string; token: string }) =>
      paymentApi.charge(orderId, token),
    onSuccess: (response) => {
      const data = response.data
      setPaymentResult({
        status: data.status,
        message: data.message,
        chargeId: data.chargeId,
      })
      if (data.status === 'approved') {
        onPaymentSuccess()
      }
    },
    onError: (error: any) => {
      setPaymentResult({
        status: 'error',
        message: error.response?.data?.message || 'Error al procesar el pago',
      })
    },
  })

  const handleOpenCulqi = useCallback(() => {
    if (!culqiLoaded || !order || !window.Culqi) return

    setPaymentResult(null)
    processingRef.current = false

    const amountInCents = Math.round(order.totalAmount * 100)

    window.Culqi.publicKey = CULQI_PUBLIC_KEY
    window.Culqi.settings({
      title: 'Juega Demonio',
      currency: order.currency || 'PEN',
      amount: amountInCents,
    })
    window.Culqi.options({
      lang: 'es',
      style: {
        bannerColor: '#FD0383',
        buttonBackground: '#FD0383',
        menuColor: '#FD0383',
        linksColor: '#FD0383',
        buttonText: 'Pagar',
        buttonTextColor: '#FFFFFF',
        priceColor: '#FD0383',
      },
    })

    callbackRef.current = (token: string) => {
      chargeMutation.mutate({ orderId: order.id, token })
    }

    window.Culqi.open()
  }, [culqiLoaded, order, chargeMutation])

  const handleClose = () => {
    setPaymentResult(null)
    processingRef.current = false
    onClose()
  }

  if (!order) return null

  const isExpired = new Date(order.expiresAt) < new Date()
  const isSuccess = paymentResult?.status === 'approved'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isSuccess ? '' : title}>
      <div className="space-y-4">
        {isSuccess ? (
          <SuccessView
            order={order}
            paymentResult={paymentResult!}
            onClose={handleClose}
          />
        ) : (
          <>
            {description && (
              <Alert variant="info">
                <p className="text-sm">{description}</p>
              </Alert>
            )}

            {/* Order summary */}
            <div className="rounded-xl bg-white/[0.03] border border-charcoal/10 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-gray">Orden</span>
                <span className="font-mono text-xs text-gray">{order.id.slice(0, 12)}...</span>
              </div>
              {order.quantity && order.quantity > 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark-gray">Cantidad</span>
                  <span className="text-sm text-light-gray font-medium">{order.quantity}</span>
                </div>
              )}
              <div className="border-t border-charcoal/10 pt-3 flex justify-between items-center">
                <span className="text-sm text-gray font-medium">Total a pagar</span>
                <span
                  className="text-2xl font-bold text-intense-pink tabular-nums"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  S/ {order.totalAmount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-dark-gray">Expira</span>
                <span className="text-xs text-yellow-400/80 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(order.expiresAt).toLocaleString('es-PE')}
                </span>
              </div>
            </div>

            {paymentResult && paymentResult.status !== 'approved' && (
              <Alert variant="error">
                {paymentResult.message}
              </Alert>
            )}

            {scriptError ? (
              <Alert variant="error">
                No se pudo cargar el procesador de pagos. Recarga la pagina e intenta de nuevo.
              </Alert>
            ) : isExpired ? (
              <Alert variant="error">
                Esta orden ha expirado. Crea una nueva orden para continuar.
              </Alert>
            ) : (
              <button
                onClick={handleOpenCulqi}
                disabled={!culqiLoaded || chargeMutation.isPending}
                className="app-btn-primary w-full py-3.5 flex items-center justify-center gap-2"
              >
                {chargeMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Procesando pago...
                  </>
                ) : !culqiLoaded ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pagar con tarjeta
                  </>
                )}
              </button>
            )}

            <p className="text-center text-dark-gray text-xs flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Pago seguro procesado por Culqi
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
