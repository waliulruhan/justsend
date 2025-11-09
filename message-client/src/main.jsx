import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { HelmetProvider } from "react-helmet-async";
import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <CssBaseline />
      <div>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
      </div>
    </HelmetProvider>
  </React.StrictMode>,
)
