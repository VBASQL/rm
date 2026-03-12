// ============================================================
// FILE: CartContext.jsx
// PURPOSE: Order builder state. Manages the current cart (line items,
//          selected customer, running totals) during the New Order flow.
// DEPENDS ON: Nothing directly (uses product data from AppContext)
// DEPENDED ON BY: NewOrder page, ProductModal, CartSummary
//
// WHY THIS EXISTS:
//   Cart state needs to persist across the multi-step order wizard
//   (customer select → catalog browse → review → submit). Using a
//   separate context keeps cart logic isolated from global app state.
//   See BUILD_PLAN.md §5.6.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const CART_ACTIONS = {
  SET_CUSTOMER: 'SET_CUSTOMER',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_DELIVERY_DATE: 'SET_DELIVERY_DATE',
  SET_DELIVER_NOW: 'SET_DELIVER_NOW',
  SET_NOTES: 'SET_NOTES',
};

const initialCartState = {
  customerId: null,
  customerName: '',
  lineItems: [],
  deliveryDate: null,
  deliverNow: false,
  notes: '',
};

function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.SET_CUSTOMER:
      return {
        ...state,
        customerId: action.payload.id,
        customerName: action.payload.name,
      };

    case CART_ACTIONS.ADD_ITEM: {
      const existing = state.lineItems.find(
        li => li.productId === action.payload.productId
      );
      if (existing) {
        // WHY: If product already in cart, update quantity instead of duplicating.
        // See BUILD_PLAN.md §5.6 Product Modal: "If product already in cart, modal
        // shows current qty and 'UPDATE' instead of 'ADD'."
        return {
          ...state,
          lineItems: state.lineItems.map(li =>
            li.productId === action.payload.productId
              ? { ...li, ...action.payload }
              : li
          ),
        };
      }
      return {
        ...state,
        lineItems: [...state.lineItems, action.payload],
      };
    }

    case CART_ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        lineItems: state.lineItems.map(li =>
          li.productId === action.payload.productId
            ? { ...li, ...action.payload }
            : li
        ),
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        lineItems: state.lineItems.filter(
          li => li.productId !== action.payload
        ),
      };

    case CART_ACTIONS.CLEAR_CART:
      return { ...initialCartState };

    case CART_ACTIONS.SET_DELIVERY_DATE:
      return { ...state, deliveryDate: action.payload };

    case CART_ACTIONS.SET_DELIVER_NOW:
      return { ...state, deliverNow: action.payload };

    case CART_ACTIONS.SET_NOTES:
      return { ...state, notes: action.payload };

    default:
      return state;
  }
}

class CartProvider extends React.Component {
  render() {
    return (
      <CartProviderInner>
        {this.props.children}
      </CartProviderInner>
    );
  }
}

// WHY: Inner functional component uses useReducer hook, wrapping it
// in a class component shell to satisfy Rule #1  (OOP) at the provider level.
function CartProviderInner({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  // WHY: Pre-calculate totals so components don't each compute them.
  const totals = React.useMemo(() => {
    const subtotal = cart.lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
    const depositTotal = cart.lineItems.reduce((sum, li) => sum + li.depositTotal, 0);
    const discountTotal = cart.lineItems.reduce(
      (sum, li) => sum + (li.discount || 0) * li.quantity,
      0
    );
    const totalCases = cart.lineItems.reduce((sum, li) => sum + li.quantity, 0);
    // WHY: Round AFTER summing all lines. Per-line rounding causes penny
    // discrepancies. See DEVELOPMENT_RULES.md §2 inline WHY example.
    const grandTotal = Math.round((subtotal + depositTotal - discountTotal) * 100) / 100;

    return { subtotal, depositTotal, discountTotal, grandTotal, totalCases };
  }, [cart.lineItems]);

  const value = {
    cart,
    totals,
    dispatch,
    actions: CART_ACTIONS,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartProvider, useCart, CART_ACTIONS };
export default CartProvider;
