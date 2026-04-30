'use client';
// app/inventario/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Prodotto {
  id: string;
  nome_oggetto: string;
  descrizione: string;
  quantita_disponibile: number;
  prezzo_unitario: number;
  soglia_minima_magazzino: number;
  tipo_prodotto: string;
  data_inserimento: string;
}

interface TipoProdotto {
  id: string;
  nome: string;
}

export default function InventarioPage() {
  const router = useRouter();
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [tipi, setTipi] = useState<TipoProdotto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [ordinamento, setOrdinamento] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | 'movimento' | null>(null);
  const [selected, setSelected] = useState<Prodotto | null>(null);
  const [form, setForm] = useState({
    nome_oggetto: '', descrizione: '', quantita_disponibile: 0,
    prezzo_unitario: 0, soglia_minima_magazzino: 0, tipo_prodotto_id: ''
  });
  const [movimentoForm, setMovimentoForm] = useState({
    tipo_movimento: 'Carico', quantita: 1, note: ''
  });
  const [errori, setErrori] = useState<string[]>([]);

  const caricaProdotti = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/prodotti', {
        params: {
          page,
          per_page: 10,
          q: search || undefined,
          tipo_id: tipoFiltro || undefined,
          order: ordinamento || undefined
        }
      });
      setProdotti(data.prodotti);
      setTotal(data.meta.total);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/tipo_prodotto').then(({ data }) => setTipi(data));
  }, []);

  useEffect(() => { caricaProdotti(); }, [page, search, tipoFiltro, ordinamento]);

  const apriCrea = () => {
    setForm({ nome_oggetto: '', descrizione: '', quantita_disponibile: 0, prezzo_unitario: 0, soglia_minima_magazzino: 0, tipo_prodotto_id: '' });
    setErrori([]);
    setModal('create');
  };

  const apriModifica = (p: Prodotto) => {
    setSelected(p);
    setForm({
      nome_oggetto: p.nome_oggetto, descrizione: p.descrizione,
      quantita_disponibile: p.quantita_disponibile, prezzo_unitario: p.prezzo_unitario,
      soglia_minima_magazzino: p.soglia_minima_magazzino, tipo_prodotto_id: ''
    });
    setErrori([]);
    setModal('edit');
  };

  const apriMovimento = (p: Prodotto) => {
    setSelected(p);
    setMovimentoForm({ tipo_movimento: 'Carico', quantita: 1, note: '' });
    setModal('movimento');
  };

  const salva = async () => {
    setErrori([]);
    try {
      if (modal === 'create') {
        await api.post('/prodotti', { prodotto: form });
      } else if (modal === 'edit' && selected) {
        await api.patch(`/prodotti/${selected.id}`, { prodotto: form });
      }
      setModal(null);
      caricaProdotti();
    } catch (err: any) {
      setErrori(err.response?.data?.errors || ['Errore durante il salvataggio']);
    }
  };

  const salvaMovimento = async () => {
    if (!selected) return;
    try {
      await api.post('/movimenti', {
        movimento: { ...movimentoForm, prodotto_id: selected.id }
      });
      setModal(null);
      caricaProdotti();
    } catch (err: any) {
      setErrori(err.response?.data?.errors || ['Errore']);
    }
  };

  const elimina = async (id: string) => {
    if (!confirm('Eliminare questo prodotto?')) return;
    await api.delete(`/prodotti/${id}`);
    caricaProdotti();
  };

  const totalePagine = Math.ceil(total / 10);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestione Inventario</h3>
        <div>
          <a href="/dashboard" className="btn btn-outline-secondary me-2">← Dashboard</a>
          <button className="btn btn-primary" onClick={apriCrea}>+ Nuovo Prodotto</button>
        </div>
      </div>

      {/* Filtri */}
      <div className="row mb-3 g-2">
        <div className="col-md-4">
          <input
            type="text" className="form-control"
            placeholder="Cerca per nome..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={tipoFiltro} onChange={(e) => { setTipoFiltro(e.target.value); setPage(1); }}>
            <option value="">Tutti i tipi</option>
            {tipi.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={ordinamento} onChange={(e) => setOrdinamento(e.target.value)}>
            <option value="">Ordina per...</option>
            <option value="prezzo_asc">Prezzo ↑</option>
            <option value="prezzo_desc">Prezzo ↓</option>
            <option value="quantita_asc">Quantità ↑</option>
            <option value="quantita_desc">Quantità ↓</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center"><div className="spinner-border" /></div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Quantità</th>
                  <th>Prezzo</th>
                  <th>Soglia min.</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {prodotti.map((p) => (
                  <tr key={p.id} className={p.quantita_disponibile <= p.soglia_minima_magazzino ? 'table-warning' : ''}>
                    <td>{p.nome_oggetto}</td>
                    <td><span className="badge bg-secondary">{p.tipo_prodotto}</span></td>
                    <td>{p.quantita_disponibile}</td>
                    <td>€ {Number(p.prezzo_unitario).toFixed(2)}</td>
                    <td>{p.soglia_minima_magazzino}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => apriModifica(p)}>Modifica</button>
                      <button className="btn btn-sm btn-outline-success me-1" onClick={() => apriMovimento(p)}>Movimento</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => elimina(p.id)}>Elimina</button>
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
              <button className="page-link" onClick={() => setPage(p => p - 1)}>Prec.</button>
            </li>
            {Array.from({ length: totalePagine }, (_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalePagine ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p + 1)}>Succ.</button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal Crea/Modifica */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modal === 'create' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <div className="modal-body">
                {errori.length > 0 && (
                  <div className="alert alert-danger">
                    <ul className="mb-0">{errori.map((e, i) => <li key={i}>{e}</li>)}</ul>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Nome oggetto</label>
                  <input type="text" className="form-control" value={form.nome_oggetto}
                    onChange={(e) => setForm(f => ({ ...f, nome_oggetto: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descrizione</label>
                  <textarea className="form-control" rows={2} value={form.descrizione}
                    onChange={(e) => setForm(f => ({ ...f, descrizione: e.target.value }))} />
                </div>
                <div className="row">
                  <div className="col mb-3">
                    <label className="form-label">Quantità</label>
                    <input type="number" className="form-control" value={form.quantita_disponibile}
                      onChange={(e) => setForm(f => ({ ...f, quantita_disponibile: Number(e.target.value) }))} />
                  </div>
                  <div className="col mb-3">
                    <label className="form-label">Prezzo unitario (€)</label>
                    <input type="number" step="0.01" className="form-control" value={form.prezzo_unitario}
                      onChange={(e) => setForm(f => ({ ...f, prezzo_unitario: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Soglia minima magazzino</label>
                  <input type="number" className="form-control" value={form.soglia_minima_magazzino}
                    onChange={(e) => setForm(f => ({ ...f, soglia_minima_magazzino: Number(e.target.value) }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo prodotto</label>
                  <select className="form-select" value={form.tipo_prodotto_id}
                    onChange={(e) => setForm(f => ({ ...f, tipo_prodotto_id: e.target.value }))}>
                    <option value="">Seleziona...</option>
                    {tipi.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
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

      {/* Modal Movimento */}
      {modal === 'movimento' && selected && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Movimento: {selected.nome_oggetto}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tipo movimento</label>
                  <select className="form-select" value={movimentoForm.tipo_movimento}
                    onChange={(e) => setMovimentoForm(f => ({ ...f, tipo_movimento: e.target.value }))}>
                    <option value="Carico">Carico</option>
                    <option value="Scarico">Scarico</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantità</label>
                  <input type="number" min={1} className="form-control" value={movimentoForm.quantita}
                    onChange={(e) => setMovimentoForm(f => ({ ...f, quantita: Number(e.target.value) }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Note</label>
                  <textarea className="form-control" rows={2} value={movimentoForm.note}
                    onChange={(e) => setMovimentoForm(f => ({ ...f, note: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModal(null)}>Annulla</button>
                <button className="btn btn-success" onClick={salvaMovimento}>Registra</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}