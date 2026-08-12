import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const initialState = { items: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) {
        return { items: state.items.map(i => i.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { items: [...state.items, { id: action.product.id, name: action.product.name, price: action.product.price, image_url: action.product.image_url, quantity: 1 }] };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.id !== action.id) };
    case 'SET_QTY':
      return { items: state.items.map(i => i.id === action.id ? { ...i, quantity: Math.max(1, action.quantity) } : i) };
    case 'CLEAR':
      return { items: [] };
    case 'LOAD':
      return { items: action.items };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vault_cart');
      if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) });
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('vault_cart', JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = state.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, dispatch, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}