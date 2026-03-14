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
//   [2026-03-14] #returns Added SET_RETURN_MODE, SET_RETURN_REASON, TOGGLE_ITEM_DAMAGE,
//     SET_ITEM_DAMAGE_TYPE, SPLIT_LINE actions for return order creation workflow.
//     Added isReturn, returnFromOrderId, returnReason fields to cart state.
//     Line items now support isDamaged and damageType for return tracking.
//   [2026-03-14] #branch Added SET_BRANCH action and branchId/branchName/branchAddress
//     fields to cart state. When a branch location is selected in Step 1, the cart
//     stores the branch so the order is delivered to the correct address.
//     SET_CUSTOMER now clears branch state to avoid stale branch from a previous order.
//   [2026-03-13] #001 Added LOAD_CART (duplicate), REORDER_ITEMS (move up/down),
//     APPLY_ORDER_DISCOUNT (order-wide discount). Added orderDiscount to state.
//   [2026-03-12] Initial creation.
// ============================================================
import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const CART_ACTIONS = {
  SET_CUSTOMER: 'SET_CUSTOMER',
  // [MOD #branch] Set the branch location for delivery (keeps parent as customerId).
  // WHY: Orders are billed to the parent account but delivered to the branch address.
  //   branchId = null means delivery goes to the main/parent address.
  SET_BRANCH: 'SET_BRANCH',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_DELIVERY_DATE: 'SET_DELIVERY_DATE',
  SET_DELIVER_NOW: 'SET_DELIVER_NOW',
  SET_NOTES: 'SET_NOTES',
  // [MOD #001] New actions for duplicate orders, reordering, and order-wide discount
  LOAD_CART: 'LOAD_CART',
  REORDER_ITEMS: 'REORDER_ITEMS',
  APPLY_ORDER_DISCOUNT: 'APPLY_ORDER_DISCOUNT',
  // [MOD #returns] Return order actions.
  // WHY: Returns are recorded as credit orders. These actions manage the return
  // workflow: loading from a delivered order, marking items damaged, splitting lines.
  SET_RETURN_MODE: 'SET_RETURN_MODE',
  SET_RETURN_REASON: 'SET_RETURN_REASON',
  TOGGLE_ITEM_DAMAGE: 'TOGGLE_ITEM_DAMAGE',
  SET_ITEM_DAMAGE_TYPE: 'SET_ITEM_DAMAGE_TYPE',
  SPLIT_LINE: 'SPLIT_LINE',
  MARK_ALL_DAMAGED: 'MARK_ALL_DAMAGED',
};

const initialCartState = {
  customerId: null,
  customerName: '',
  // [MOD #branch] Branch delivery location fields.
  // WHY: null = order delivers to the main customer address.
  //   When a branch is selected, these hold the branch's id/name/address
  //   so Step 2 and the submitted order know where to deliver.
  branchId: null,
  branchName: '',
  branchAddress: '',
  lineItems: [],
  deliveryDate: null,
  deliverNow: false,
  notes: '',
  // [MOD #001] Order-wide discount (fixed $ or %)
  orderDiscount: { type: 'percent', value: 0 },
  // [MOD #returns] Return order fields.
  // WHY: When isReturn=true, the cart is building a credit return order.
  //   returnFromOrderId links to the original delivered order (or null for scratch).
  //   returnReason is a standard reason code from RETURN_REASONS.
  isReturn: false,
  returnFromOrderId: null,
  returnFromOrderNumber: null,
  returnReason: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.SET_CUSTOMER:
      return {
        ...state,
        customerId: action.payload.id,
        customerName: action.payload.name,
        // [MOD #branch] Always clear branch when customer changes.
        // WHY: Previous branch belongs to the old customer — stale branch
        // on a new customer would send the order to the wrong address.
        branchId: null,
        branchName: '',
        branchAddress: '',
      };

    // [MOD #branch] SET_BRANCH — store branch delivery location.
    // WHY: branchId is stored separately from customerId because the
    // order is billed to the parent account but delivered to the branch.
    case CART_ACTIONS.SET_BRANCH:
      return {
        ...state,
        branchId: action.payload.id,
        branchName: action.payload.name,
        branchAddress: action.payload.address,
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

    // [MOD #001] Load full cart from an existing order (for duplicate).
    // WHY: Deep-copies items into a new draft so no mutation of original.
    case CART_ACTIONS.LOAD_CART:
      return {
        ...initialCartState,
        ...action.payload,
      };

    // [MOD #001] Reorder line items — move item at fromIndex to toIndex.
    // WHY: Salesperson can reorder lines to match delivery priority.
    case CART_ACTIONS.REORDER_ITEMS: {
      const items = [...state.lineItems];
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
        return state;
      }
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return { ...state, lineItems: items };
    }

    // [MOD #001] Apply order-wide discount (type: 'fixed' or 'percent', value: number).
    case CART_ACTIONS.APPLY_ORDER_DISCOUNT:
      return { ...state, orderDiscount: action.payload };

    // [MOD #returns] Set return mode and link to original order.
    // WHY: Called when starting a return from an existing delivered order.
    // payload: { isReturn, returnFromOrderId, returnFromOrderNumber }
    case CART_ACTIONS.SET_RETURN_MODE:
      return {
        ...state,
        isReturn: action.payload.isReturn,
        returnFromOrderId: action.payload.returnFromOrderId || null,
        returnFromOrderNumber: action.payload.returnFromOrderNumber || null,
      };

    // [MOD #returns] Set return reason code (e.g., 'damaged', 'overstocked').
    case CART_ACTIONS.SET_RETURN_REASON:
      return { ...state, returnReason: action.payload };

    // [MOD #returns] Toggle isDamaged flag on a line item.
    // WHY: Damaged items may receive different credit treatment in reports.
    case CART_ACTIONS.TOGGLE_ITEM_DAMAGE:
      return {
        ...state,
        lineItems: state.lineItems.map(li =>
          li.productId === action.payload
            ? { ...li, isDamaged: !li.isDamaged, damageType: li.isDamaged ? null : li.damageType }
            : li
        ),
      };

    // [MOD #returns] Set damage type for a damaged item.
    // payload: { productId, damageType }
    case CART_ACTIONS.SET_ITEM_DAMAGE_TYPE:
      return {
        ...state,
        lineItems: state.lineItems.map(li =>
          li.productId === action.payload.productId
            ? { ...li, damageType: action.payload.damageType }
            : li
        ),
      };

    // [MOD #returns] Split a line item into two separate lines.
    // WHY: When only part of a case lot is damaged, the rep splits the line
    // so damaged quantity is tracked separately for reporting.
    // payload: { productId, keepQty, splitQty, splitIsDamaged, splitDamageType }
    case CART_ACTIONS.SPLIT_LINE: {
      const { productId, keepQty, splitQty, splitIsDamaged, splitDamageType } = action.payload;
      const items = [];
      for (const li of state.lineItems) {
        if (li.productId === productId) {
          // WHY: Original line gets keepQty; new split line gets splitQty.
          // Recalculate lineTotal and depositTotal for both.
          const keepLine = {
            ...li,
            quantity: keepQty,
            lineTotal: keepQty * li.casePrice,
            depositTotal: keepQty * li.depositPerCase,
          };
          items.push(keepLine);
          // WHY: Split line needs unique ID suffix for React keys.
          // Use productId_split to avoid collision with original line.
          const splitLine = {
            ...li,
            productId: `${li.productId}_damaged`,
            productName: li.productName + ' (DAMAGED)',
            quantity: splitQty,
            lineTotal: splitQty * li.casePrice,
            depositTotal: splitQty * li.depositPerCase,
            isDamaged: splitIsDamaged,
            damageType: splitDamageType,
          };
          items.push(splitLine);
        } else {
          items.push(li);
        }
      }
      return { ...state, lineItems: items };
    }

    // [MOD #returns] Mark ALL items as damaged with a damage type.
    // WHY: When entire return is due to a single incident (e.g., truck accident),
    // salesperson can mark all items damaged in one click.
    // payload: damageType (string)
    case CART_ACTIONS.MARK_ALL_DAMAGED:
      return {
        ...state,
        lineItems: state.lineItems.map(li => ({
          ...li,
          isDamaged: true,
          damageType: action.payload,
        })),
      };

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
  // [MOD #001] Added orderDiscount calculation.
  const totals = React.useMemo(() => {
    const subtotal = cart.lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
    const depositTotal = cart.lineItems.reduce((sum, li) => sum + li.depositTotal, 0);
    const itemDiscountTotal = cart.lineItems.reduce(
      (sum, li) => sum + (li.discount || 0) * li.quantity,
      0
    );
    const totalCases = cart.lineItems.reduce((sum, li) => sum + li.quantity, 0);

    // [MOD #001] Order-wide discount on top of per-item discounts.
    let orderDiscountAmount = 0;
    const od = cart.orderDiscount;
    if (od && od.value > 0) {
      const preDiscountTotal = subtotal + depositTotal - itemDiscountTotal;
      if (od.type === 'fixed') {
        orderDiscountAmount = Math.min(od.value, preDiscountTotal);
      } else {
        orderDiscountAmount = Math.round(preDiscountTotal * od.value) / 100;
      }
    }

    const discountTotal = itemDiscountTotal + orderDiscountAmount;
    // WHY: Round AFTER summing all lines. Per-line rounding causes penny
    // discrepancies. See DEVELOPMENT_RULES.md §2 inline WHY example.
    const grandTotal = Math.round((subtotal + depositTotal - discountTotal) * 100) / 100;

    return { subtotal, depositTotal, discountTotal, itemDiscountTotal, orderDiscountAmount, grandTotal, totalCases };
  }, [cart.lineItems, cart.orderDiscount]);

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
