import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
})

client.interceptors.request.use((config) => {
  const raw = localStorage.getItem('hf_auth')
  if (raw) {
    try {
      const { token } = JSON.parse(raw)
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      // ignore
    }
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hf_auth')
      window.location.href = '/login'
    }
    const data = err.response?.data
    const message =
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
      err.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default client
