'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [conferma, setConferma] = useState('');
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validaPassword = (p: string) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrore('');

    if (!validaPassword(password)) {
      setErrore('Password non valida: min 8 caratteri, 1 maiuscola, 1 numero, 1 carattere speciale');
      return;
    }

    if (password !== conferma) {
      setErrore('Le password non coincidono');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccesso('Password aggiornata con successo! Verrai reindirizzato al login...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setErrore(err.response?.data?.error || 'Errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0066cc 0%, #004d99 50%, #003366 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>E</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: '0 0 4px' }}>ERAMUS</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Sistema Gestionale</p>
        </div>

        <div style={{
          background: 'white', borderRadius: '16px',
          padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
            Nuova Password
          </h2>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '24px' }}>
            Inserisci la tua nuova password.
          </p>

          {errore && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fed7d7',
              borderRadius: '8px', padding: '12px 16px',
              marginBottom: '20px', color: '#c53030', fontSize: '14px'
            }}>
              ⚠️ {errore}
            </div>
          )}

          {successo && (
            <div style={{
              background: '#f0fff4', border: '1px solid #c6f6d5',
              borderRadius: '8px', padding: '12px 16px',
              marginBottom: '20px', color: '#276749', fontSize: '14px'
            }}>
              ✅ {successo}
            </div>
          )}

          {!token && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fed7d7',
              borderRadius: '8px', padding: '12px 16px',
              marginBottom: '20px', color: '#c53030', fontSize: '14px'
            }}>
              ⚠️ Token mancante. Usa il link ricevuto via email.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                Nuova Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 caratteri, 1 maiuscola, 1 numero, 1 speciale"
                  style={{
                    width: '100%', padding: '10px 42px 10px 14px',
                    border: '1.5px solid #e2e8f0', borderRadius: '8px',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a'
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#718096', padding: 0
                  }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                Conferma Password
              </label>
              <input
                type="password"
                value={conferma}
                onChange={(e) => setConferma(e.target.value)}
                required
                placeholder="Ripeti la password"
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              style={{
                width: '100%', padding: '12px',
                background: loading || !token ? '#90cdf4' : 'linear-gradient(135deg, #0066cc, #004d99)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: '600',
                cursor: loading || !token ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(0,102,204,0.3)'
              }}
            >
              {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a href="/login" style={{ color: '#0066cc', fontSize: '14px', textDecoration: 'underline' }}>
                ← Torna al login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}