'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Wrench, Lock, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Wrench size={40} color="var(--primary)" />
          </div>
          <h1>AutoRepair Pro</h1>
          <p>Acesse o sistema de gestão da sua oficina</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Entrando...
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>&copy; 2026 AutoRepair Pro. Todos os direitos reservados.</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: rgba(var(--primary-rgb), 0.1);
          border-radius: 20px;
          margin-bottom: 16px;
        }

        h1 {
          color: white;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          text-align: center;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
        }

        input {
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 12px 12px 42px;
          color: white;
          font-size: 16px;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
        }

        .login-button {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .login-button:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 32px;
          text-align: center;
        }

        .login-footer p {
          font-size: 12px;
          color: #64748b;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
