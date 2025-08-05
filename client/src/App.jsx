import { AuthProvider } from './contexts/AuthContext';
import AuthLayout from './auth/AuthLayout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthLayout />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
