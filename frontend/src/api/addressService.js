import API from "./axios";

const STORAGE_KEY = "likhani_saved_addresses";

const getLocalAddresses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAddresses = (addresses) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch {}
};

/**
 * Fetch all addresses for authenticated user
 */
export const fetchUserAddresses = async () => {
  try {
    const res = await API.get("/auth/addresses");
    if (res.data?.success && Array.isArray(res.data.addresses)) {
      saveLocalAddresses(res.data.addresses);
      return res.data.addresses;
    }
  } catch (err) {
    console.warn("Could not fetch remote addresses, using local fallback:", err?.message);
  }
  return getLocalAddresses();
};

/**
 * Add a new address
 */
export const addUserAddress = async (addressData) => {
  try {
    const res = await API.post("/auth/addresses", addressData);
    if (res.data?.success && Array.isArray(res.data.addresses)) {
      saveLocalAddresses(res.data.addresses);
      return res.data.addresses;
    }
  } catch (err) {
    console.warn("Backend add address failed, persisting locally:", err?.message);
  }

  // Local fallback
  const current = getLocalAddresses();
  const shouldBeDefault = addressData.isDefault || current.length === 0;
  if (shouldBeDefault) {
    current.forEach((a) => (a.isDefault = false));
  }
  const newAddr = {
    ...addressData,
    _id: "local_" + Date.now(),
    isDefault: shouldBeDefault,
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, newAddr];
  saveLocalAddresses(updated);
  return updated;
};

/**
 * Update an existing address
 */
export const updateUserAddress = async (id, addressData) => {
  try {
    const res = await API.put(`/auth/addresses/${id}`, addressData);
    if (res.data?.success && Array.isArray(res.data.addresses)) {
      saveLocalAddresses(res.data.addresses);
      return res.data.addresses;
    }
  } catch (err) {
    console.warn("Backend update address failed, updating locally:", err?.message);
  }

  // Local fallback
  const current = getLocalAddresses();
  if (addressData.isDefault) {
    current.forEach((a) => (a.isDefault = false));
  }
  const updated = current.map((a) =>
    a._id === id ? { ...a, ...addressData } : a
  );
  saveLocalAddresses(updated);
  return updated;
};

/**
 * Delete an address
 */
export const deleteUserAddress = async (id) => {
  try {
    const res = await API.delete(`/auth/addresses/${id}`);
    if (res.data?.success && Array.isArray(res.data.addresses)) {
      saveLocalAddresses(res.data.addresses);
      return res.data.addresses;
    }
  } catch (err) {
    console.warn("Backend delete address failed, deleting locally:", err?.message);
  }

  // Local fallback
  const current = getLocalAddresses();
  const target = current.find((a) => a._id === id);
  const updated = current.filter((a) => a._id !== id);
  if (target?.isDefault && updated.length > 0) {
    updated[0].isDefault = true;
  }
  saveLocalAddresses(updated);
  return updated;
};

/**
 * Set address as default
 */
export const setDefaultUserAddress = async (id) => {
  try {
    const res = await API.put(`/auth/addresses/${id}/default`);
    if (res.data?.success && Array.isArray(res.data.addresses)) {
      saveLocalAddresses(res.data.addresses);
      return res.data.addresses;
    }
  } catch (err) {
    console.warn("Backend set default failed, setting locally:", err?.message);
  }

  // Local fallback
  const current = getLocalAddresses();
  const updated = current.map((a) => ({
    ...a,
    isDefault: a._id === id,
  }));
  saveLocalAddresses(updated);
  return updated;
};
