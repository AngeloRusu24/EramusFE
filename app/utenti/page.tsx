'use client';
// app/utenti/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { isAdmin } from '@/lib/auth';

interface Utente {
  id: string;
  username: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo: string;
  stato_account: string;
  ultimo_login: string;
}

interface Ruolo {
  id: string;
  nome: string;
}

export default function UtentiPage() {
  const router = useRouter();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [ruoli, setRuoli] = useState<Ruolo[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Utente | null>(null);
  const [form, setForm] = useState({
    username: '', email: '', password: '', nome: '', cognome: '',
    data_nascita: '', ruolo_id: ''
  });
  const [errori, setErrori] = useState<string[]>([]);

  const admin = isAdmin();
  const perPage = 10;

  const caricaUtenti = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/utenti', {
        params: { page, per_page: perPage, q: search || undefined }
      });
      setUtenti(data.utenti);
      setTotal(data.meta.total);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/ruoli').then(({ data }) => setRuoli(data));
  }, []);

  useEffect(() => { caricaUtenti(); }, [page, search]);

  const apriCrea = () => {
    setForm({ username: '', email: '', password: '', nome: '', cognome: '', data_nascita: '', ruolo_id: '' });
    setErrori([]);
    setModal('create');
  };

  const apriModifica = (u: Utente) => {
    setSelected(u);
    setForm({ username: u.username, email: u.email, password: '', nome: u.nome, cognome: u.cognome, data_nascita: '', ruolo_id: '' });
    setErrori([]);
    setModal('edit');
  };

  const salva = async () => {
    setErrori([]);
    try {
      if (modal === 'create') {
        await api.post('/utenti', { utente: form });
      } else if (modal === 'edit' && selected) {
        const payload = { ...form };
        if (!payload.password) delete (payload as any).password;
        await api.patch(`/utenti/${selected.id}`, { utente: payload });
      }
      setModal(null);
      caricaUtenti();
    } catch (err: any) {
      setErrori(err.response?.data?.errors || ['Errore durante il salvataggio']);
    }
  };

  const disattiva = async (id: string) => {
    if (!confirm('Disattivare questo utente?')) return;
    await api.delete(`/utenti/${id}`);
    caricaUtenti();
  };

  const totalePagine = Math.ceil(total / perPage);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestione Utenti</h3>
        <div>
          <a href="/dashboard" className="btn btn-outline-secondary me-2">← Dashboard</a>
          {admin && <button className="btn btn-primary" onClick={apriCrea}>+ Nuovo Utente</button>}
        </div>
      </div>

      {/* Ricerca */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Cerca per username o email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Tabella */}
      {loading ? (
        <div className="text-center"><div className="spinner-border" /></div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Nome</th>
                  <th>Ruolo</th>
                  <th>Stato</th>
                  <th>Ultimo Login</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {utenti.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.nome} {u.cognome}</td>
                    <td><span className="badge bg-info">{u.ruolo}</span></td>
                    <td>
                      <span className={`badge ${u.stato_account === 'Attivo' ? 'bg-success' : 'bg-danger'}`}>
                        {u.stato_account}
                      </span>
                    </td>
                    <td>{u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('it-IT') : '-'}</td>
                    <td>
                      {admin && (
                        <>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => apriModifica(u)}>
                            Modifica
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => disattiva(u.id)}>
                            Disattiva
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginazione */}
      {totalePagine > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p - 1)}>Precedente</button>
            </li>
            {Array.from({ length: totalePagine }, (_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalePagine ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p + 1)}>Successivo</button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal Crea/Modifica */}
      {modal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modal === 'create' ? 'Nuovo Utente' : 'Modifica Utente'}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <div className="modal-body">
                {errori.length > 0 && (
                  <div className="alert alert-danger">
                    <ul className="mb-0">{errori.map((e, i) => <li key={i}>{e}</li>)}</ul>
                  </div>
                )}
                {['username', 'email', 'nome', 'cognome'].map((campo) => (
                  <div className="mb-3" key={campo}>
                    <label className="form-label text-capitalize">{campo}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={(form as any)[campo]}
                      onChange={(e) => setForm(f => ({ ...f, [campo]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="mb-3">
                  <label className="form-label">Password {modal === 'edit' && '(lascia vuoto per non cambiare)'}</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Data di nascita</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.data_nascita}
                    onChange={(e) => setForm(f => ({ ...f, data_nascita: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ruolo</label>
                  <select
                    className="form-select"
                    value={form.ruolo_id}
                    onChange={(e) => setForm(f => ({ ...f, ruolo_id: e.target.value }))}
                  >
                    <option value="">Seleziona ruolo...</option>
                    {ruoli.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                  </select>
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