'use client';
// app/dashboard/page.tsx

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface DashboardData {
  totale_utenti: number;
  totale_prodotti: number;
  valore_totale_inventario: number;
  ultimi_movimenti: Array<{
    prodotto: string;
    tipo: string;
    quantita: number;
    data: string;
  }>;
  prodotti_per_categoria: Record<string, number>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) return <div className="container mt-5 text-center"><div className="spinner-border" /></div>;
  if (!data) return null;

  const graficoData = Object.entries(data.prodotti_per_categoria).map(([nome, count]) => ({
    nome,
    prodotti: count,
  }));

  return (
    <div>
      {/* Navbar Bootstrap Italia */}
      <nav className="it-header-wrapper">
        <div className="it-header-center-wrapper">
          <div className="container">
            <div className="it-header-center-content-wrapper d-flex justify-content-between align-items-center">
              <div className="it-brand-wrapper">
                <span className="it-brand-text">ERAMUS</span>
              </div>
              <div>
                <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
                  Esci
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <h3 className="mb-4">Dashboard</h3>

        {/* Statistiche */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm text-center p-3">
              <h6 className="text-muted">Utenti totali</h6>
              <h2 className="text-primary">{data.totale_utenti}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm text-center p-3">
              <h6 className="text-muted">Prodotti totali</h6>
              <h2 className="text-primary">{data.totale_prodotti}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm text-center p-3">
              <h6 className="text-muted">Valore inventario</h6>
              <h2 className="text-success">€ {data.valore_totale_inventario.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Ultimi movimenti */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Ultimi 5 movimenti</h5>
              </div>
              <div className="card-body p-0">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Prodotto</th>
                      <th>Tipo</th>
                      <th>Qtà</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ultimi_movimenti.map((m, i) => (
                      <tr key={i}>
                        <td>{m.prodotto}</td>
                        <td>
                          <span className={`badge ${m.tipo === 'Carico' ? 'bg-success' : 'bg-danger'}`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td>{m.quantita}</td>
                        <td>{new Date(m.data).toLocaleDateString('it-IT')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Grafico per categoria */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Prodotti per categoria</h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={graficoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="prodotti" fill="#0066cc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Navigazione */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <a href="/ruoli" className="btn btn-primary w-100">Gestione Ruoli</a>
          </div>
          <div className="col-md-4 mb-3">
            <a href="/inventario" className="btn btn-primary w-100">Gestione Inventario</a>
          </div>
          <div className="col-md-4 mb-3">
            <a href="/movimenti" className="btn btn-outline-primary w-100">Movimenti Magazzino</a>
          </div>
        </div>
      </div>
    </div>
  );
}