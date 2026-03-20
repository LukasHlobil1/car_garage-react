import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { AnimatePresence } from 'framer-motion';
import Garage from './pages/Garage';
import CarDetail from './pages/CarDetail';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Garage />} />
                <Route path="/car/:id" element={<CarDetail />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
          <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'rgba(15, 25, 35, 0.9)',
                  backdropFilter: 'blur(12px)',
                  color: '#00fff9',
                  border: '1px solid rgba(0, 255, 249, 0.3)',
                },
              }}
          />
        </AppProvider>
      </QueryClientProvider>
  );
}

export default App;