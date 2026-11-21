import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './index.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Lets Clerk move between pages without a full reload
function WithClerk({ children }) {
  const navigate = useNavigate()
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  )
}

if (!publishableKey) {
  document.getElementById('root').innerHTML =
    '<p style="font-family:sans-serif;padding:2rem">Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to your .env file and restart <code>npm run dev</code>.</p>'
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <WithClerk>
          <AuthProvider>
            <CartProvider>
              <App />
              <Toaster position="top-center" toastOptions={{ duration: 3500, style: { fontSize: '14px', borderRadius: '14px' } }} />
            </CartProvider>
          </AuthProvider>
        </WithClerk>
      </BrowserRouter>
    </StrictMode>,
  )
}
