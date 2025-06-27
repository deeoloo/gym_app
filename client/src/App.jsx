import { AppProvider } from './contexts/AppContext';
import AuthLayout from './auth/AuthLayout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
