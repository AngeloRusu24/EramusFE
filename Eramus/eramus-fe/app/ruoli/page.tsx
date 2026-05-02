'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { isAdmin } from '@/lib/auth';

interface Ruolo {
  id: string;
  nome: string;
  descrizione: string;
}

export default function RuoliPage() {
  const router = useRouter();
  const [ruoli, setRuoli] = useState<Ruolo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'edit' | null>(null);
  const [selected, setSelected] = useState<Ruolo | null>(null);
  const [descrizione, setDescrizione] = useState('');
  const [errori, setErrori] = useState<string[]>([]);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/dashboard');
      return;
    }
    caricaRuoli();
  }, []);

  const caricaRuoli = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ruoli');
      setRuoli(data);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const apriModifica = (r: Ruolo) => {
    setSelected(r);
    setDescrizione(r.descrizione || '');
    setErrori([]);
    setModal('edit');
  };

  const salva = async () => {
    if (!selected) return;
    setErrori([]);
    try {
      await api.patch(`/ruoli/${selected.id}`, { ruolo: { descrizione } });
      setModal(null);
      caricaRuoli();
    } catch (err: any) {
      setErrori(err.response?.data?.errors || ['Errore durante il salvataggio']);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestione Ruoli</h3>
        <a href="/dashboard" className="btn btn-outline-secondary">← Dashboard</a>
      </div>

      {loading ? (
        <div className="text-center"><div className="spinner-border" /></div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Nome Ruolo</th>
                  <th>Descrizione</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {ruoli.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="badge bg-primary">{r.nome}</span>
                    </td>
                    <td>{r.descrizione || '-'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => apriModifica(r)}
                      >
                        Modifica
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal === 'edit' && selected && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifica Ruolo: {selected.nome}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <div className="modal-body">
                {errori.length > 0 && (
                  <div className="alert alert-danger">
                    <ul className="mb-0">{errori.map((e, i) => <li key={i}>{e}</li>)}</ul>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Nome Ruolo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selected.nome}
                    disabled
                  />
                  <small className="text-muted">Il nome del ruolo non può essere modificato</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Descrizione</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={descrizione}
                    onChange={(e) => setDescrizione(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModal(null)}>Annulla</button>
                <button className="btn btn-primary" onClick={salva}>Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}