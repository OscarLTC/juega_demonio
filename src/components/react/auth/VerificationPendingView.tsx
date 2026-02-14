import { useState } from 'react'
import Mail from 'lucide-react/dist/esm/icons/mail'
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw'
import { authApi } from '../../../services/api'
import Alert from '../shared/Alert'

export default function VerificationPendingView() {
  const params = new URLSearchParams(window.location.search)
  const email = params.get('email') || ''

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResend = async () => {
    if (!email) {
      setError('No se pudo determinar el email. Por favor usa el formulario de reenvio.')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      await authApi.resendVerification(email)
      setMessage('Se ha enviado un nuevo correo de verificacion.')
    } catch (err: any) {
      const errorCode = err.response?.data?.code
      if (errorCode === 'EMAIL_ALREADY_VERIFIED') {
        setMessage('Tu email ya fue verificado. Puedes iniciar sesion.')
      } else {
        setError(err.response?.data?.message || 'Error al reenviar el correo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark border border-charcoal/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-intense-pink/20 rounded-full mb-4">
            <Mail className="w-8 h-8 text-intense-pink" />
          </div>
          <h1 className="text-2xl font-bold text-light-gray mb-2">Verifica tu email</h1>
          <p className="text-dark-gray mb-2">
            Hemos enviado un correo de verificacion a:
          </p>
          {email && (
            <p className="font-medium text-light-gray mb-4">{email}</p>
          )}
          <p className="text-dark-gray mb-6">
            Haz clic en el enlace del correo para activar tu cuenta.
          </p>

          {message && (
            <Alert variant="success" className="mb-4">
              {message}
            </Alert>
          )}

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={loading}
              className="app-btn-secondary w-full py-3 inline-flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Enviando...' : 'Reenviar correo'}
            </button>

            <p className="text-sm text-dark-gray">
              No olvides revisar tu carpeta de spam.
            </p>

            <a href="/app/login" className="block text-intense-pink font-medium hover:underline mt-4">
              Volver al login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
