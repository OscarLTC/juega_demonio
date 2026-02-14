import { useState } from 'react'
import Lock from 'lucide-react/dist/esm/icons/lock'
import Eye from 'lucide-react/dist/esm/icons/eye'
import EyeOff from 'lucide-react/dist/esm/icons/eye-off'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import XCircle from 'lucide-react/dist/esm/icons/x-circle'
import { authApi } from '../../../services/api'
import Alert from '../shared/Alert'

export default function ResetPasswordForm() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      await authApi.resetPassword(token!, password)
      setSuccess(true)
    } catch (err: any) {
      const errorCode = err.response?.data?.code
      if (errorCode === 'INVALID_RESET_TOKEN') {
        setError('El enlace es invalido. Solicita uno nuevo.')
      } else if (errorCode === 'EXPIRED_RESET_TOKEN') {
        setError('El enlace ha expirado. Solicita uno nuevo.')
      } else {
        setError(err.response?.data?.message || 'Error al restablecer la contrasena')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-dark border border-charcoal/30 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray mb-2">Enlace invalido</h1>
            <p className="text-dark-gray mb-6">
              No se proporciono un token valido. Solicita un nuevo enlace de recuperacion.
            </p>
            <a href="/auth/recuperar-contrasena" className="app-btn-primary w-full py-3 inline-block text-center">
              Solicitar nuevo enlace
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-dark border border-charcoal/30 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray mb-2">Contrasena actualizada</h1>
            <p className="text-dark-gray mb-6">
              Tu contrasena ha sido restablecida exitosamente. Ya puedes iniciar sesion con tu nueva contrasena.
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
        <div className="bg-dark border border-charcoal/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-intense-pink/20 rounded-full mb-4">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray">Nueva contrasena</h1>
            <p className="text-dark-gray mt-1">Ingresa tu nueva contrasena</p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="app-label">Nueva contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="app-input pl-10 pr-10"
                  placeholder="Minimo 8 caracteres"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-gray hover:text-gray"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="app-label">Confirmar contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-gray" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="app-input pl-10 pr-10"
                  placeholder="Repite la contrasena"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-gray hover:text-gray"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="app-btn-primary w-full py-3"
            >
              {loading ? 'Guardando...' : 'Guardar contrasena'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray">
            <a href="/app/login" className="text-intense-pink font-medium hover:underline">
              Volver al login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
