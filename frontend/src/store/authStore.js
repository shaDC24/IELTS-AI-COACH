import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        const params = new URLSearchParams({ username: email, password })
        const { data } = await api.post('/auth/login', params)
        localStorage.setItem('token', data.access_token)
        set({ token: data.access_token })
        return data
      },
      register: async (userData) => {
        const { data } = await api.post('/auth/register', userData)
        localStorage.setItem('token', data.access_token)
        set({ user: data.user, token: data.access_token })
        return data
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
      },
    }),
    { name: 'auth-store' }
  )
)