import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** URLs of in-flight requests, maintained by the axios interceptor. */
const loadingSlice = createSlice({
  name: 'loading',
  initialState: [] as string[],
  reducers: {
    addLoading: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) state.push(action.payload);
    },
    removeLoading: (state, action: PayloadAction<string | undefined>) => {
      const index = action.payload ? state.indexOf(action.payload) : -1;
      if (index !== -1) state.splice(index, 1);
    },
    clearLoading: () => [],
  },
});

export const loadingReducer = loadingSlice.reducer;
export const { addLoading, removeLoading, clearLoading } = loadingSlice.actions;
