import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* =========================================================
   TINY SHARED STORE (wishlist + cart)
   Persists to localStorage so the listing page and the
   book details page always show the same data.
========================================================= */

const STORAGE_KEY = "likhani-shop-v1";
const MAX_QTY = 10;

const load = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
        cart: parsed.cart && typeof parsed.cart === "object" ? parsed.cart : {},
      };
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
  const exists = state.wishlist.includes(id);
  commit({
    ...state,
    wishlist: exists ? state.wishlist.filter((item) => item !== id) : [...state.wishlist, id],
  });
  return !exists;
};

export const addToCart = (id, qty = 1) => {
  commit({
    ...state,
    cart: { ...state.cart, [id]: Math.min((state.cart[id] || 0) + qty, MAX_QTY) },
  });
};

export const useShopStore = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const cartCount = Object.values(snapshot.cart).reduce((total, qty) => total + qty, 0);

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