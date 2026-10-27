import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminStore {
  isAuthenticated: boolean
  adminName: string
  login: (password: string) => boolean
  logout: () => void
}

// Simple local admin auth — replace with Supabase Auth when configured
const ADMIN_PASSWORD = 'catgorithm2026'
const ADMIN_NAME = 'Admin'

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      adminName: ADMIN_NAME,
      login: (password: string) => {
        if (password === ADMIN_PASSWORD) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    { name: 'catgorithm-admin-auth' }
  )
)
