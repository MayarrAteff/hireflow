import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const JOB_FORM_STEPS = ['basics', 'details', 'compensation', 'review'] as const;
export type JobFormStep = (typeof JOB_FORM_STEPS)[number];

type JobFormStepsState = {
  activeStep: number;
  completedSteps: JobFormStep[];
};

const initialState: JobFormStepsState = {
  activeStep: 0,
  completedSteps: [],
};

const jobFormStepsSlice = createSlice({
  name: 'jobFormSteps',
  initialState,
  reducers: {
    nextStep(state) {
      const current = JOB_FORM_STEPS[state.activeStep];
      if (!state.completedSteps.includes(current)) state.completedSteps.push(current);
      state.activeStep = Math.min(state.activeStep + 1, JOB_FORM_STEPS.length - 1);
    },
    previousStep(state) {
      state.activeStep = Math.max(state.activeStep - 1, 0);
    },
    goToStep(state, action: PayloadAction<number>) {
      state.activeStep = action.payload;
    },
    resetJobForm: () => initialState,
  },
});

export const jobFormStepsReducer = jobFormStepsSlice.reducer;
export const { nextStep, previousStep, goToStep, resetJobForm } = jobFormStepsSlice.actions;
