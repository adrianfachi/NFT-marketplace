import axios from 'axios'

export const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
})

http.interceptors.request.use(config => {
  const token = sessionStorage.getItem('kurio-session')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  response => response,
  error => {
    const token = sessionStorage.getItem('kurio-session')
    if (token && axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('kurio:session-expired'))
    }
    return Promise.reject(error)
  },
)
