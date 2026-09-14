import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type FeatureFlagKey = 'interview_scheduling' | 'analytics_dashboard' | 'onboarding_tour';

type FeatureFlagsState = {
  flags: Partial<Record<FeatureFlagKey, boolean>>;
  loaded: boolean;
};

const initialState: FeatureFlagsState = {
  flags: {},
  loaded: false,
};

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    setFeatureFlags(state, action: PayloadAction<FeatureFlagsState['flags']>) {
      state.flags = action.payload;
      state.loaded = true;
    },
  },
});

export const featureFlagsReducer = featureFlagsSlice.reducer;
export const { setFeatureFlags } = featureFlagsSlice.actions;
