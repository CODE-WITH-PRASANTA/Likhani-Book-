import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* =========================================================
   TINY SHARED STORE (wishlist + cart)
   Persists to localStorage so the listing page and the
   book details page always show the same data.
========================================================= */

const STORAGE_KEY = "likhani-shop-v1";
const MAX_QTY = 10;

/** Identifies old hardcoded numeric dummy IDs (e.g., 1, 2, 3... from mock data) */
export const isLegacyDummyId = (id) => {
  if (id === null || id === undefined) return true;
  const str = String(id).trim();
  return /^\d{1,5}$/.test(str);
};

const sanitizeCart = (rawCart) => {
  if (!rawCart || typeof rawCart !== "object") return {};
  const clean = {};
  for (const [key, qty] of Object.entries(rawCart)) {
    if (!isLegacyDummyId(key) && typeof qty === "number" && qty > 0) {
      clean[key] = Math.min(qty, MAX_QTY);
    }
  }
  return clean;
};

const sanitizeWishlist = (rawWishlist) => {
  if (!Array.isArray(rawWishlist)) return [];
  return rawWishlist.filter((id) => !isLegacyDummyId(id));
};

const load = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanWishlist = sanitizeWishlist(parsed.wishlist);
      const cleanCart = sanitizeCart(parsed.cart);

      const next = { wishlist: cleanWishlist, cart: cleanCart };

      // Re-save sanitized state to localStorage immediately
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}

      return next;
    }
  } catch (error) {
    /* storage unavailable or corrupted: start empty */
  }
  return { wishlist: [], cart: {} };
};

let state = load();
const listeners = new Set();

const commit = (next) => {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    /* ignore quota / privacy-mode errors */
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

/** Returns true when the item was added, false when removed. */
export const toggleWishlist = (id) => {
  if (isLegacyDummyId(id)) return false;
  const exists = state.wishlist.includes(id);
  commit({
    ...state,
    wishlist: exists ? state.wishlist.filter((item) => item !== id) : [...state.wishlist, id],
  });
  return !exists;
};

export const addToCart = (id, qty = 1) => {
  if (isLegacyDummyId(id)) return;
  commit({
    ...state,
    cart: { ...state.cart, [id]: Math.min((state.cart[id] || 0) + qty, MAX_QTY) },
  });
};

export const decrementCart = (id, qty = 1) => {
  const current = state.cart[id] || 0;
  const nextVal = current - qty;
  const nextCart = { ...state.cart };
  if (nextVal <= 0) {
    delete nextCart[id];
  } else {
    nextCart[id] = nextVal;
  }
  commit({
    ...state,
    cart: nextCart,
  });
};

export const updateCartQty = (id, newQty) => {
  const nextCart = { ...state.cart };
  if (newQty <= 0) {
    delete nextCart[id];
  } else {
    nextCart[id] = Math.min(newQty, MAX_QTY);
  }
  commit({
    ...state,
    cart: nextCart,
  });
};

export const clearCart = () => {
  commit({
    ...state,
    cart: {},
  });
};

/** Prunes any items that don't exist in the real database catalog */
export const syncWithCatalog = (validCatalogIds) => {
  if (!Array.isArray(validCatalogIds) || validCatalogIds.length === 0) return;
  const validSet = new Set(validCatalogIds.map(String));
  let changed = false;

  const nextCart = {};
  for (const [id, qty] of Object.entries(state.cart)) {
    if (validSet.has(String(id)) && !isLegacyDummyId(id)) {
      nextCart[id] = qty;
    } else {
      changed = true;
    }
  }

  const nextWishlist = state.wishlist.filter((id) => {
    if (validSet.has(String(id)) && !isLegacyDummyId(id)) return true;
    changed = true;
    return false;
  });

  if (changed) {
    commit({
      wishlist: nextWishlist,
      cart: nextCart,
    });
  }
};

export const useShopStore = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const cartCount = Object.entries(snapshot.cart).reduce((total, [key, qty]) => {
    if (isLegacyDummyId(key) || typeof qty !== "number" || qty <= 0) return total;
    return total + qty;
  }, 0);

  return {
    wishlist: snapshot.wishlist,
    cart: snapshot.cart,
    cartCount,
  };
};

/* ---------- toast helper ---------- */

export const useToast = () => {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [toast, showToast];
};