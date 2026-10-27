import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#F5F7FA',
            border: '1px solid #1F2937',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#16A34A', secondary: '#F5F7FA' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#F5F7FA' },
          },
        }}
      />
    </HashRouter>
  </React.StrictMode>,
)
