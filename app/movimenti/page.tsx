'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Movimento {
  id: string;
  prodotto: string;
  tipo_movimento: string;
  quantita: number;
  data_movimento: string;
  operatore: string;
  note: string;
}

export default function MovimentiPage() {
  const router = useRouter();
  const [movimenti, setMovimenti] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/movimenti')
      .then((res) => setMovimenti(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Movimenti Magazzino</h3>
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
                  <th>Prodotto</th>
                  <th>Tipo</th>
                  <th>Quantità</th>
                  <th>Operatore</th>
                  <th>Data</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {movimenti.map((m) => (
                  <tr key={m.id}>
                    <td>{m.prodotto}</td>
                    <td>
                      <span className={`badge ${m.tipo_movimento === 'Carico' ? 'bg-success' : 'bg-danger'}`}>
                        {m.tipo_movimento}
                      </span>
                    </td>
                    <td>{m.quantita}</td>
                    <td>{m.operatore}</td>
                    <td>{new Date(m.data_movimento).toLocaleString('it-IT')}</td>
                    <td>{m.note || '-'}</td>
                  </tr>
                ))}
                {movimenti.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Nessun movimento registrato
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}