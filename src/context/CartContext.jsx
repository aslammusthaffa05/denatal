import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'dc_cart'
const MAX_QTY = 100

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

/**
 * The cart only remembers what the customer picked. Prices shown here are for display;
 * the server recalculates every price from the database when the order is created.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items])

  const addItem = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.productId === product.id)
      const limit = Math.min(product.stock, MAX_QTY)
      if (existing) {
        return current.map((i) =>
          i.productId === product.id
            ? { ...i, stock: product.stock, price: product.price, quantity: Math.min(i.quantity + quantity, limit) }
            : i,
        )
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          quantity: Math.min(quantity, limit),
        },
      ]
    })
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock, MAX_QTY)) }
          : i,
      ),
    )
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((i) => i.productId !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return { items, count, subtotal, addItem, setQuantity, removeItem, clear }
  }, [items, addItem, setQuantity, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)
