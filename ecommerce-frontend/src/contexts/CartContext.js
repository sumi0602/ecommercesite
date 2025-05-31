// contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { id, quantity, maxQuantity } = action.payload;
      const existingIndex = state.items.findIndex((item) => item.id === id);

      // If item exists, update quantity up to maxQuantity
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity = Math.min(
          newItems[existingIndex].quantity + quantity,
          maxQuantity
        );
        return { ...state, items: newItems };
      }

      // Otherwise, add new item
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: Math.min(action.payload.quantity, item.maxQuantity),
              }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "LOAD_CART":
      return { ...state, items: action.payload || [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      dispatch({ type: "LOAD_CART", payload: JSON.parse(saved) });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  // Add to cart
  const addToCart = ({
    id,
    productId,
    name,
    price,
    image,
    color,
    size,
    quantity,
    maxQuantity,
  }) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id,
        productId,
        name,
        price,
        image,
        color,
        size,
        quantity,
        maxQuantity,
      },
    });
  };

  // Remove item
  const removeFromCart = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  // Update quantity
  const updateQuantity = (id, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  // Clear cart
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  // Cart totals
  const cartTotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = state.items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
