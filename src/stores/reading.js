import { configureStore, createSlice } from '@reduxjs/toolkit'

const reading = createSlice({
  name: 'reading',
  initialState: { items: [] },
  reducers: {
    added(state, action) {
      if (!state.items.some((item) => item.id === action.payload.id))
        state.items.push(action.payload)
    },
    removed(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
})
export const { added, removed } = reading.actions
export const readingStore = configureStore({ reducer: { reading: reading.reducer } })
export const readingReducer = reading.reducer