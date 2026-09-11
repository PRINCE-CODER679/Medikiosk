import React from 'react'
import ReactDOM from 'react-dom/client'
import './services/i18n.js'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </React.StrictMode>,
)

