import { useState } from 'react'
import { AppProviders } from '../providers/AppProviders'
import { useAuth } from '../providers/AuthProvider'
import Mail from 'lucide-react/dist/esm/icons/mail'
import Lock from 'lucide-react/dist/esm/icons/lock'
import Eye from 'lucide-react/dist/esm/icons/eye'
import EyeOff from 'lucide-react/dist/esm/icons/eye-off'
import Alert from '../shared/Alert'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)

  const { login, user } = useAuth()

  // If already logged in, redirect
  if (user) {
    window.location.href = '/app/dashboard'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setLoading(true)

    try {
      await login(email, password)
      window.location.href = '/app/dashboard'
    } catch (err: any) {
      const errorCode = err.response?.data?.code
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true)
        setError('Debes verificar tu email antes de iniciar sesion.')
      } else {
        setError(err.response?.data?.message || 'Error al iniciar sesion')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark border border-charcoal/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-intense-pink/20 rounded-full mb-4">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-light-gray">Bienvenido</h1>
            <p className="text-dark-gray mt-1">Inicia sesion en tu cuenta</p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
              {needsVerification && (
                <a href="/auth/reenviar-verificacion" className="block mt-2 underline font-medium">
                  Reenviar correo de verificacion
                </a>
              )}
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

            <div>
              <label className="app-label">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="app-input pl-10 pr-10"
                  placeholder="********"
                  required
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

            <div className="flex justify-end">
              <a href="/auth/recuperar-contrasena" className="text-sm text-intense-pink hover:underline">
                Olvidaste tu contrasena?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="app-btn-primary w-full py-3"
            >
              {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray">
            No tienes cuenta?{' '}
            <a href="/registro" className="text-intense-pink font-medium hover:underline">
              Registrate
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginForm() {
  return (
    <AppProviders>
      <LoginContent />
    </AppProviders>
  )
}
