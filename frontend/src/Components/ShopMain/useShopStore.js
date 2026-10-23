import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* =========================================================
   TINY SHARED STORE (wishlist + cart)
   Persists to localStorage so the listing page and the
   book details page always show the same data.
========================================================= */

const MAX_QTY = 10;

/** Dynamic storage key: scopes cart/wishlist to logged-in user, or guest when logged out */
export const getActiveStorageKey = () => {
  try {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("lekhani_token") : null;
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("lekhani_user") : null;
    if (token && raw) {
      const u = JSON.parse(raw);
      const uid = u?.id || u?._id || u?.email;
      if (uid) return `likhani-shop-user_${uid}`;
    }
  } catch (e) {}
  return "likhani-shop-guest";
};

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
    if (typeof window === "undefined") return { wishlist: [], cart: {} };
    const key = getActiveStorageKey();
    let raw = window.localStorage.getItem(key);

    // Migration helper: If user is logged in but user-key is empty, check legacy key
    if (!raw && key !== "likhani-shop-guest") {
      const legacy = window.localStorage.getItem("likhani-shop-v1");
      if (legacy) {
        raw = legacy;
        try {
          window.localStorage.removeItem("likhani-shop-v1");
        } catch (e) {}
      }
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanWishlist = sanitizeWishlist(parsed.wishlist);
      const cleanCart = sanitizeCart(parsed.cart);

      const next = { wishlist: cleanWishlist, cart: cleanCart };

      // Re-save sanitized state to active storage key
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
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
    if (typeof window !== "undefined") {
      const key = getActiveStorageKey();
      window.localStorage.setItem(key, JSON.stringify(state));
    }
  } catch (error) {
    /* ignore quota / privacy-mode errors */
  }
  listeners.forEach((listener) => listener());
};

export const reloadShopStore = () => {
  state = load();
  listeners.forEach((listener) => listener());
};

// React instantly to login/logout events across tabs and current window
if (typeof window !== "undefined") {
  window.addEventListener("lekhani_auth_change", () => {
    reloadShopStore();
  });
  window.addEventListener("storage", (e) => {
    if (
      e.key === "lekhani_token" ||
      e.key === "lekhani_user" ||
      e.key === "likhani-shop-v1" ||
      (e.key && e.key.startsWith("likhani-shop-"))
    ) {
      reloadShopStore();
    }
  });
}

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

export const clearWishlist = () => {
  commit({
    ...state,
    wishlist: [],
  });
};

export const resetShopStore = () => {
  commit({
    wishlist: [],
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