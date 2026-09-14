import './styles/App.scss';
import 'simplebar-react/dist/simplebar.min.css';
import './utils/dayjs';

import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { App } from './App';
import { queryClient } from './network/queryClient';
import { AppIntlProvider } from './providers/IntlProvider';
import { MuiProvider } from './providers/MuiProvider';
import { SnackbarProvider } from './providers/SnackBarProvider';
import { store } from './store';
import { AuthProvider } from './utils/context/AuthProvider';

const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppIntlProvider>
          <MuiProvider>
            <SnackbarProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </SnackbarProvider>
          </MuiProvider>
        </AppIntlProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
