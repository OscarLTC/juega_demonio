import axios from 'axios'

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/app/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/auth/change-password', { currentPassword, newPassword }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
}

export const userApi = {
  getMe: () => api.get('/users/me'),
}

export const raffleApi = {
  getActive: () => api.get('/raffles/active'),
  getById: (id: string) => api.get(`/raffles/${id}`),
  getHistory: () => api.get('/raffles/history'),
  getWinners: () => api.get('/raffles/winners'),
  getAll: () => api.get('/admin/raffles'),
  create: (data: Record<string, unknown>) => api.post('/admin/raffles', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/admin/raffles/${id}`, data),
  activate: (id: string) => api.post(`/admin/raffles/${id}/activate`),
  startClosing: (id: string) => api.post(`/admin/raffles/${id}/close`),
  finalize: (id: string, participantCode: string) => api.post(`/admin/raffles/${id}/finalize`, { participantCode }),
  delete: (id: string) => api.delete(`/admin/raffles/${id}`),
}

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMine: () => api.get('/subscriptions/me'),
  create: (data: Record<string, unknown>) => api.post('/subscriptions', data),
  createRecurring: (data: { type: string; savedCardId: string }) => api.post('/subscriptions/recurring', data),
  cancelRecurring: (id: string) => api.delete(`/subscriptions/${id}/cancel`),
  getAll: () => api.get('/admin/subscriptions'),
}

export const superChanceApi = {
  getPrice: () => api.get('/super-chances/price'),
  create: (data: Record<string, unknown>) => api.post('/super-chances', data),
}

export const orderApi = {
  getMine: () => api.get('/orders/me'),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
  getAll: () => api.get('/admin/orders'),
  getByStatus: (status: string) => api.get(`/admin/orders/status/${status}`),
  getPendingSummary: (raffleId: string) => api.get(`/admin/orders/raffle/${raffleId}/pending/summary`),
}

export const participationApi = {
  getMine: () => api.get('/participation/me'),
}

export const participantApi = {
  getByRaffle: (raffleId: string, page = 0, size = 20) => api.get(`/admin/participants/raffle/${raffleId}?page=${page}&size=${size}`),
  countByRaffle: (raffleId: string) => api.get(`/admin/participants/raffle/${raffleId}/count`),
  getTotalTickets: (raffleId: string) => api.get(`/admin/participants/raffle/${raffleId}/tickets`),
}

export const auditApi = {
  getAll: (page = 0, size = 20) => api.get(`/admin/audit?page=${page}&size=${size}`),
  getToday: (page = 0, size = 20) => api.get(`/admin/audit/today?page=${page}&size=${size}`),
  getByType: (type: string, page = 0, size = 20) => api.get(`/admin/audit/by-type/${type}?page=${page}&size=${size}`),
  getByUser: (userId: string, page = 0, size = 20) => api.get(`/admin/audit/by-user/${userId}?page=${page}&size=${size}`),
  getRaffleLogs: (raffleId: string) => api.get(`/admin/audit/raffle/${raffleId}`),
  getPaymentLogs: (page = 0, size = 20) => api.get(`/admin/audit/payments?page=${page}&size=${size}`),
  getEventTypes: () => api.get('/admin/audit/event-types'),
}

export const paymentApi = {
  simulate: (orderId: string, method = 'yape') => api.post(`/webhooks/simulate/${orderId}?paymentMethod=${method}`),
  charge: (orderId: string, token: string) => api.post('/payments/charge', { orderId, token }),
}

export const cardApi = {
  getMyCards: () => api.get('/cards'),
  saveCard: (token: string) => api.post('/cards', { token }),
  deleteCard: (id: string) => api.delete(`/cards/${id}`),
}

export const exportApi = {
  downloadRaffleTickets: (raffleId: string) =>
    api.get(`/admin/exports/raffle/${raffleId}/tickets`, { responseType: 'blob' }),
}

export default api
