import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/css/globals.css';
import App from './App.tsx';
import Spinner from './views/spinner/Spinner.tsx';
import { CustomizerContextProvider } from './context/CustomizerContext.tsx';
import './utils/i18n';
import '../src/api/index';
import { DashboardContextProvider } from './context/DashboardContext/DashboardContext.tsx';
import { SocketProvider } from './SokcetProvider.tsx';
import { AuthContextProvider } from './context/AuthContext.tsx';
createRoot(document.getElementById('root')!).render(
  <AuthContextProvider>
    <DashboardContextProvider>
      <SocketProvider>
        <CustomizerContextProvider>
          <Suspense fallback={<Spinner />}>
            <App />
          </Suspense>
        </CustomizerContextProvider>
      </SocketProvider>
    </DashboardContextProvider>
  </AuthContextProvider>,
);
