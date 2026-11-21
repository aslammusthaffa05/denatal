import axios from 'axios'

// The Clerk session token is fetched fresh for every request (AuthContext registers the getter).
let tokenGetter = null
export const setTokenGetter = (fn) => {
  tokenGetter = fn
}

const api = axios.create({
  baseURL: '', // same site: /api/... is answered by the Vercel functions (or dev-server.js locally)
  timeout: 30000,
})

api.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter()
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      /* not signed in - public calls still work */
    }
  }
  return config
})

/** Turns any axios error into a short message that is safe to show to a customer. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED') return 'The server is taking too long to respond. Please try again.'
  if (!error?.response) return 'Cannot reach the server. Check your internet connection and try again.'
  const data = error.response.data
  return data?.error || data?.detail || fallback
}

export default api
