import { create } from 'zustand'
import api from './api'

const useHomePageStore = create((set) => ({
  loading: false,
  error: null,
  
  updateHomePageImage: async (imagesData) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/home-page', imagesData)
      set({ loading: false })
      return data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update home page image', 
        loading: false 
      })
      throw error
    }
  }
}))

export default useHomePageStore
