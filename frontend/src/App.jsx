import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import ScrollManager from './components/common/ScrollManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // ৫ মিনিট ক্যাশ সম্পূর্ণ ফ্রেশ থাকবে
      gcTime: 1000 * 60 * 30, // ৩০ মিনিট মেমরিতে সংরক্ষিত থাকবে
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollManager />
        <AuthProvider>
          <Toaster richColors position="top-right" />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;