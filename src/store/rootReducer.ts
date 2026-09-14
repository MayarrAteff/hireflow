import { appConfigReducer } from './features/appConfigSlice';
import { featureFlagsReducer } from './features/featureFlagsSlice';
import { jobFormStepsReducer } from './features/jobFormStepsSlice';
import { loadingReducer } from './features/loadingSlice';

export const rootReducer = {
  appConfig: appConfigReducer,
  loading: loadingReducer,
  featureFlags: featureFlagsReducer,
  jobFormSteps: jobFormStepsReducer,
};
