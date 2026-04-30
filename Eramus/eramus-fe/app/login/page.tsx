'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login, forgotPassword } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validaPassword = (p: string) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validaPassword(password)) {
      setError('Password non valida: min 8 caratteri, 1 maiuscola, 1 numero, 1 carattere speciale');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(forgotEmail);
      setForgotMsg('Se l\'email esiste, riceverai un link per il reset.');
    } catch {
      setForgotMsg('Errore nell\'invio della email.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0066cc 0%, #004d99 50%, #003366 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Titillium Web', sans-serif",
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>E</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: '0 0 4px' }}>ERAMUS</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Sistema Gestionale</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {!showForgot ? (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>
                Accedi al tuo account
              </h2>

              {error && (
                <div style={{
                  background: '#fff5f5',
                  border: '1px solid #fed7d7',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#c53030',
                  fontSize: '14px'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleLogin} noValidate>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Inserisci username"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                      color: '#1a1a1a'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0066cc'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Inserisci password"
                      style={{
                        width: '100%',
                        padding: '10px 42px 10px 14px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#1a1a1a'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0066cc'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#718096',
                        fontSize: '16px',
                        padding: 0
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: loading ? '#90cdf4' : 'linear-gradient(135deg, #0066cc, #004d99)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s',
                    boxShadow: '0 4px 12px rgba(0,102,204,0.3)'
                  }}
                >
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0066cc',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Password dimenticata?
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                Recupera Password
              </h2>
              <p style={{ color: '#718096', fontSize: '14px', marginBottom: '24px' }}>
                Inserisci la tua email per ricevere il link di reset.
              </p>

              {forgotMsg && (
                <div style={{
                  background: '#f0fff4',
                  border: '1px solid #c6f6d5',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#276749',
                  fontSize: '14px'
                }}>
                  ✅ {forgotMsg}
                </div>
              )}

              <form onSubmit={handleForgot}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="tua@email.com"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#1a1a1a'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #0066cc, #004d99)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,102,204,0.3)'
                  }}
                >
                  Invia link
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0066cc',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Torna al login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '24px' }}>
          © 2026 ERAMUS Srl — Tutti i diritti riservati
        </p>
      </div>
    </div>
  );
}