import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardApi } from '../../../services/api'
import { useAuth } from '../providers/AuthProvider'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Plus from 'lucide-react/dist/esm/icons/plus'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2'
import User from 'lucide-react/dist/esm/icons/user'
import Mail from 'lucide-react/dist/esm/icons/mail'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'
import Modal from '../shared/Modal'

declare global {
  interface Window {
    Culqi: any
    culqi: () => void
  }
}

const CULQI_PUBLIC_KEY = import.meta.env.PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_xxx'
const CULQI_SCRIPT_URL = 'https://checkout.culqi.com/js/v4'

const BRAND_STYLES: Record<string, { gradient: string; text: string }> = {
  VISA: { gradient: 'from-blue-900 to-blue-700', text: 'text-blue-200' },
  MASTERCARD: { gradient: 'from-orange-900 to-red-800', text: 'text-orange-200' },
  AMEX: { gradient: 'from-slate-700 to-slate-500', text: 'text-slate-200' },
  DINERS: { gradient: 'from-cyan-900 to-cyan-700', text: 'text-cyan-200' },
}

const DEFAULT_BRAND_STYLE = { gradient: 'from-gray-800 to-gray-600', text: 'text-gray-200' }

function BrandLogo({ brand }: { brand: string }) {
  if (brand === 'VISA') {
    return (
      <svg viewBox="0 0 780 500" className="h-6" fill="none">
        <path d="M293.2 348.7l33.4-195.8h53.3l-33.4 195.8h-53.3zm246.8-191c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.5-90.2 64.5-.3 28.1 26.6 43.7 46.9 53.1 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-32 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.4 35.6 10.1 59.5 10.4 56.2 0 92.7-26.2 93.1-66.8.2-22.3-14.1-39.2-45-53.1-18.7-9.1-30.2-15.1-30.1-24.3 0-8.1 9.7-16.8 30.7-16.8 17.5-.3 30.2 3.5 40.1 7.5l4.8 2.3 7.1-42.4zm137.3-4.8h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.4h56.1l11.2-29.3h68.6l6.5 29.3h49.5l-43.2-195.6zm-66 126.4c4.4-11.3 21.5-54.7 21.5-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47.2 12.5 57.1h-44.7v-.6zM248.9 152.9l-52.3 133.5-5.6-27c-9.7-31.2-39.9-65-73.7-81.9l47.9 171h56.5l84-195.6h-56.8z" fill="white"/>
        <path d="M147.2 152.9H60.1l-.7 3.8c67 16.2 111.3 55.3 129.7 102.3l-18.7-89.9c-3.2-12.3-12.6-15.8-23.2-16.2z" fill="white" opacity=".7"/>
      </svg>
    )
  }
  if (brand === 'MASTERCARD') {
    return (
      <svg viewBox="0 0 780 500" className="h-6">
        <circle cx="330" cy="250" r="140" fill="#EB001B" opacity="0.8"/>
        <circle cx="450" cy="250" r="140" fill="#F79E1B" opacity="0.8"/>
        <path d="M390 140.8c35.4 28.3 58 71.7 58 120.2s-22.6 91.9-58 120.2c-35.4-28.3-58-71.7-58-120.2s22.6-91.9 58-120.2z" fill="#FF5F00" opacity="0.9"/>
      </svg>
    )
  }
  if (brand === 'AMEX') {
    return <span className="text-xs font-bold tracking-widest text-white/90">AMEX</span>
  }
  if (brand === 'DINERS') {
    return <span className="text-xs font-bold tracking-widest text-white/90">DINERS</span>
  }
  return <CreditCard className="w-5 h-5 text-white/70" />
}

function CardChip() {
  return (
    <svg viewBox="0 0 50 40" className="w-8 h-6">
      <rect x="1" y="1" width="48" height="38" rx="5" fill="#C4A44E" opacity="0.7"/>
      <line x1="1" y1="14" x2="49" y2="14" stroke="#A08630" strokeWidth="0.8" opacity="0.5"/>
      <line x1="1" y1="26" x2="49" y2="26" stroke="#A08630" strokeWidth="0.8" opacity="0.5"/>
      <line x1="18" y1="1" x2="18" y2="40" stroke="#A08630" strokeWidth="0.8" opacity="0.5"/>
      <line x1="32" y1="1" x2="32" y2="40" stroke="#A08630" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<any>(null)
  const [culqiLoaded, setCulqiLoaded] = useState(false)
  const [addingCard, setAddingCard] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardSuccess, setCardSuccess] = useState(false)
  const callbackRef = useRef<((token: string) => void) | null>(null)
  const processingRef = useRef(false)

  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['myCards'],
    queryFn: () => cardApi.getMyCards().then((res) => res.data),
  })

  const saveCardMutation = useMutation({
    mutationFn: (token: string) => cardApi.saveCard(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCards'] })
      setCardSuccess(true)
      setAddingCard(false)
      setTimeout(() => setCardSuccess(false), 3000)
    },
    onError: (error: any) => {
      setCardError(error.response?.data?.message || 'Error al guardar la tarjeta')
      setAddingCard(false)
    },
  })

  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => cardApi.deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCards'] })
      setShowDeleteModal(false)
      setCardToDelete(null)
    },
  })

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
        setCardError(window.Culqi.error.user_message || 'Error al procesar la tarjeta')
        setAddingCard(false)
      }
    }
  }, [])

  const handleAddCard = useCallback(() => {
    if (!culqiLoaded || !window.Culqi) return

    setCardError(null)
    setCardSuccess(false)
    setAddingCard(true)
    processingRef.current = false

    // Culqi requires an amount to open, we use 100 (S/1.00) as placeholder for tokenization
    window.Culqi.publicKey = CULQI_PUBLIC_KEY
    window.Culqi.settings({
      title: 'Guardar Tarjeta',
      currency: 'PEN',
      amount: 100,
    })
    window.Culqi.options({
      lang: 'es',
      style: {
        bannerColor: '#FD0383',
        buttonBackground: '#FD0383',
        menuColor: '#FD0383',
        linksColor: '#FD0383',
        buttonText: 'Guardar',
        buttonTextColor: '#FFFFFF',
        priceColor: '#FD0383',
      },
    })

    callbackRef.current = (token: string) => {
      saveCardMutation.mutate(token)
    }

    window.Culqi.open()
  }, [culqiLoaded, saveCardMutation])

  const handleDeleteClick = (card: any) => {
    setCardToDelete(card)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (cardToDelete) {
      deleteCardMutation.mutate(cardToDelete.id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-light-gray">Mi Perfil</h1>
        <p className="text-dark-gray">Gestiona tu informacion personal y tarjetas</p>
      </div>

      {/* Personal Data */}
      <div className="app-card">
        <h2 className="text-lg font-semibold text-light-gray mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-intense-pink" />
          Datos Personales
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="app-label">Nombre</label>
            <p className="text-light-gray">{user?.displayName || '-'}</p>
          </div>
          <div>
            <label className="app-label flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <p className="text-light-gray">{user?.email || '-'}</p>
          </div>
        </div>
      </div>

      {/* Saved Cards */}
      <div className="app-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-light-gray flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-intense-pink" />
            Tarjetas Guardadas
          </h2>
          <button
            onClick={handleAddCard}
            disabled={!culqiLoaded || addingCard || saveCardMutation.isPending}
            className="app-btn-primary px-4 py-2 flex items-center gap-2 text-sm"
          >
            {addingCard || saveCardMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                Procesando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Agregar tarjeta
              </>
            )}
          </button>
        </div>

        {cardSuccess && (
          <div className="mb-4">
            <Alert variant="success">Tarjeta guardada exitosamente</Alert>
          </div>
        )}

        {cardError && (
          <div className="mb-4">
            <Alert variant="error">{cardError}</Alert>
          </div>
        )}

        {cardsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : !cards || cards.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-20 h-12 rounded-xl bg-white/5 border border-dashed border-charcoal/30 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-dark-gray" />
            </div>
            <p className="text-gray font-medium">No tienes tarjetas guardadas</p>
            <p className="text-dark-gray text-sm mt-1">
              Agrega una tarjeta para usarla en pagos recurrentes
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {cards.map((card: any) => {
              const style = BRAND_STYLES[card.brand] || DEFAULT_BRAND_STYLE

              return (
                <div
                  key={card.id}
                  className={`relative bg-gradient-to-br ${style.gradient} rounded-2xl p-5 aspect-[1.6/1] flex flex-col justify-between overflow-hidden group`}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-[0.07]">
                    <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-[20px] border-white" />
                    <div className="absolute -right-4 top-8 w-40 h-40 rounded-full border-[20px] border-white" />
                  </div>

                  {/* Top row: chip + delete */}
                  <div className="flex items-start justify-between relative">
                    <CardChip />
                    <button
                      onClick={() => handleDeleteClick(card)}
                      disabled={deleteCardMutation.isPending}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar tarjeta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card number */}
                  <div className="relative">
                    <p className={`font-mono text-lg tracking-[0.2em] ${style.text}`}>
                      <span className="opacity-50">••••  ••••  ••••</span>  {card.lastFour}
                    </p>
                  </div>

                  {/* Bottom row: date + brand */}
                  <div className="flex items-end justify-between relative">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">Guardada</p>
                      <p className="text-xs text-white/60 font-mono">
                        {new Date(card.createdAt).toLocaleDateString('es-PE', { month: '2-digit', year: '2-digit' })}
                      </p>
                    </div>
                    <BrandLogo brand={card.brand} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setCardToDelete(null)
        }}
        title="Eliminar Tarjeta"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray">
            ¿Estas seguro de que deseas eliminar la tarjeta{' '}
            <span className="font-semibold text-light-gray">
              {cardToDelete?.brand} ****{cardToDelete?.lastFour}
            </span>
            ?
          </p>
          <p className="text-sm text-dark-gray">
            Si tienes suscripciones recurrentes con esta tarjeta, se cancelaran automaticamente.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setCardToDelete(null)
              }}
              className="app-btn-secondary px-4 py-2"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteCardMutation.isPending}
              className="app-btn-danger px-4 py-2 flex items-center gap-2"
            >
              {deleteCardMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
