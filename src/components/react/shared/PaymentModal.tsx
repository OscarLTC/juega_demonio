import { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { paymentApi } from '../../../services/api'
import Modal from './Modal'
import Alert from './Alert'
import LoadingSpinner from './LoadingSpinner'
import Clock from 'lucide-react/dist/esm/icons/clock'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check'

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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        {paymentResult?.status === 'approved' ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400">Pago exitoso</h3>
              <p className="text-gray text-sm mt-1">{paymentResult.message}</p>
              {paymentResult.chargeId && (
                <p className="text-dark-gray text-xs mt-2 font-mono">
                  ID: {paymentResult.chargeId}
                </p>
              )}
            </div>
            <button onClick={handleClose} className="app-btn-primary w-full py-3">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {description && (
              <Alert variant="info">
                <p className="text-sm">{description}</p>
              </Alert>
            )}

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray">Orden ID:</span>
                <span className="font-mono text-sm text-light-gray">{order.id}</span>
              </div>
              {order.quantity && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray">Cantidad:</span>
                  <span className="text-light-gray">{order.quantity}</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span className="text-gray">Total:</span>
                <span className="font-bold text-lg text-light-gray">
                  S/ {order.totalAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray">Expira:</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
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
                className="app-btn-primary w-full py-3 flex items-center justify-center gap-2"
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
