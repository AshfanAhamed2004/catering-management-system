import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000', timeout: 15000 });
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('catering_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
    sessionStorage.removeItem('catering_token');
    window.dispatchEvent(new Event('session-expired'));
  }
  return Promise.reject(error);
});
export function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Something went wrong. Please try again.';
  const detail: unknown = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item: {loc?: string[]; msg?: string}) => `${item.loc?.slice(1).join(' ') || 'Form'}: ${item.msg || 'Invalid value'}`).join('. ');
  return 'Unable to reach the server. Check your connection and try again.';
}
export async function allPages<T>(path: string): Promise<T[]> {
  const records: T[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data } = await api.get<T[]>(path, { params: { offset, limit: 100 } });
    records.push(...data);
    if (data.length < 100) return records;
  }
}
