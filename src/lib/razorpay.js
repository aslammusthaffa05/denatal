import { clinic } from '../data/clinic'

let scriptPromise = null

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      scriptPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })
  return scriptPromise
}

/**
 * Opens the Razorpay payment window.
 * The browser never decides that a payment worked: onSuccess receives the signed response,
 * which MUST be sent to our backend, where the signature is verified.
 */
export async function openRazorpay({ payment, user, description, onSuccess, onDismiss, onFailure }) {
  const loaded = await loadRazorpayScript()
  if (!loaded) {
    onFailure?.('Could not load the payment window. Check your connection and try again.')
    return
  }
  const options = {
    key: payment.keyId,
    amount: payment.amount,
    currency: payment.currency,
    order_id: payment.razorpayOrderId,
    name: clinic.name,
    description,
    prefill: {
      name: user?.name,
      email: user?.email,
      contact: user?.phone,
    },
    theme: { color: '#17807b' },
    handler: (response) => onSuccess(response),
    modal: { ondismiss: () => onDismiss?.() },
  }
  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (response) => {
    onFailure?.(response?.error?.description || 'Payment failed. You have not been charged.')
  })
  rzp.open()
}
