import { useState } from 'react'
import Mail from 'lucide-react/dist/esm/icons/mail'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import { authApi } from '../../../services/api'
import Alert from '../shared/Alert'

export default function ResendVerificationForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.resendVerification(email)
      setSuccess(true)
    } catch (err: any) {
      const errorCode = err.response?.data?.code
      if (errorCode === 'EMAIL_ALREADY_VERIFIED') {
        setError('Este email ya fue verificado. Puedes iniciar sesion.')
      } else {
        setError(err.response?.data?.message || 'Error al enviar el correo.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-dark border border-charcoal/30 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray mb-2">Correo enviado</h1>
            <p className="text-dark-gray mb-6">
              Si existe una cuenta con el correo <strong className="text-gray">{email}</strong> que no ha sido verificada, recibiras un enlace de verificacion.
            </p>
            <p className="text-sm text-dark-gray mb-6">
              Revisa tu bandeja de entrada y la carpeta de spam.
            </p>
            <a
              href="/app/login"
              className="app-btn-primary w-full py-3 inline-flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark border border-charcoal/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-intense-pink/20 rounded-full mb-4">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray">Reenviar verificacion</h1>
            <p className="text-dark-gray mt-1">Te enviaremos un nuevo enlace de verificacion</p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="app-label">
                Correo electronico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-gray" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="app-input pl-10"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="app-btn-primary w-full py-3"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>

          <p className="text-center mt-6">
            <a href="/app/login" className="text-intense-pink font-medium hover:underline inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
