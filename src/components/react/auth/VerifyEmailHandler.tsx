import { useState, useEffect } from 'react'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import XCircle from 'lucide-react/dist/esm/icons/x-circle'
import Loader from 'lucide-react/dist/esm/icons/loader'
import { authApi } from '../../../services/api'

export default function VerifyEmailHandler() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'already_verified' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('No se proporciono un token de verificacion.')
      return
    }

    verifyToken()
  }, [token])

  const verifyToken = async () => {
    try {
      await authApi.verifyEmail(token!)
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      const errorCode = err.response?.data?.code
      if (errorCode === 'INVALID_VERIFICATION_TOKEN') {
        setErrorMessage('El enlace de verificacion es invalido.')
      } else if (errorCode === 'EXPIRED_VERIFICATION_TOKEN') {
        setErrorMessage('El enlace de verificacion ha expirado. Solicita uno nuevo.')
      } else if (errorCode === 'EMAIL_ALREADY_VERIFIED') {
        setErrorMessage('Tu email ya fue verificado anteriormente.')
        setStatus('already_verified')
      } else {
        setErrorMessage(err.response?.data?.message || 'Error al verificar el email.')
      }
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-dark border border-charcoal/30 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-intense-pink/20 rounded-full mb-4">
              <Loader className="w-8 h-8 text-intense-pink animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray mb-2">Verificando...</h1>
            <p className="text-dark-gray">Por favor espera mientras verificamos tu email.</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-dark border border-charcoal/30 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray mb-2">Email verificado</h1>
            <p className="text-dark-gray mb-6">
              Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesion.
            </p>
            <a href="/app/login" className="app-btn-primary w-full py-3 inline-block text-center">
              Iniciar sesion
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'already_verified') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-dark border border-charcoal/30 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray mb-2">Ya verificado</h1>
            <p className="text-dark-gray mb-6">
              Tu email ya fue verificado anteriormente. Puedes iniciar sesion.
            </p>
            <a href="/app/login" className="app-btn-primary w-full py-3 inline-block text-center">
              Iniciar sesion
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark border border-charcoal/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-light-gray mb-2">Error de verificacion</h1>
          <p className="text-dark-gray mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <a href="/auth/reenviar-verificacion" className="app-btn-primary w-full py-3 inline-block text-center">
              Solicitar nuevo enlace
            </a>
            <a href="/app/login" className="block text-intense-pink font-medium hover:underline">
              Volver al login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
