import { create } from 'zustand'

export const useWorkspace = create((set) => ({
  favoriteIds: [],
  taskFilter: 'all',
  setTaskFilter: (taskFilter) => set({ taskFilter }),
  toggleFavorite: (id) =>
    set((state) => ({
      favoriteIds: state.favoriteIds.includes(id)
        ? state.favoriteIds.filter((favId) => favId !== id)
        : [...state.favoriteIds, id],
    })),
}))