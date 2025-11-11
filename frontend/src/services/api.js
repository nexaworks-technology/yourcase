import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:4000`

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['X-Request-Timestamp'] = new Date().toISOString()
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'

    console.error('API Error:', message)

    const err = new Error(message)
    err.status = error.response?.status
    err.response = error.response?.data

    return Promise.reject(err)
  },
)

export default api
export const API_BASE_URL = baseURL
