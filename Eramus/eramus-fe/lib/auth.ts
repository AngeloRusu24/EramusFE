import Cookies from 'js-cookie';
import api from './api';

export interface Utente {
  id: string;
  username: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo: 'Admin' | 'Operatore';
}

export async function login(username: string, password: string): Promise<Utente> {
  const { data } = await api.post('/auth/login', { username, password });
  Cookies.set('access_token', data.access_token, { expires: 1 / 96 });
  Cookies.set('refresh_token', data.refresh_token, { expires: 7 });
  localStorage.setItem('utente', JSON.stringify(data.utente));
  return data.utente;
}

export function logout() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  localStorage.removeItem('utente');
}

export function getUtenteCorrente(): Utente | null {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('utente') : null;
  return raw ? JSON.parse(raw) : null;
}

export function isAdmin(): boolean {
  return getUtenteCorrente()?.ruolo === 'Admin';
}

export async function forgotPassword(email: string) {
  return api.post('/auth/forgot_password', { email });
}

export async function resetPassword(token: string, password: string) {
  return api.post('/auth/reset_password', { token, password });
}