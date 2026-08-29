export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export interface Beca {
  id: string;
  nombre: string;
}

export interface Convocatoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  fechaApertura: string;
  fechaCierre: string;
  beca: Beca;
}

export interface ListaResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

export async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`La API respondió con estado ${res.status}`);
  }
  return (await res.json()) as T;
}