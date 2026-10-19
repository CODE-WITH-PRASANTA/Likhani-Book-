import API from "./axios";

/**
 * Fetch orders for the authenticated user
 * @returns {Promise<Array>}
 */
export const fetchMyOrders = async () => {
  try {
    const res = await API.get("/payment/my-orders");
    if (res.data?.success && Array.isArray(res.data.orders)) {
      return res.data.orders;
    }
  } catch (err) {
    console.warn("Error fetching orders from /payment/my-orders, trying /orders:", err?.message);
    try {
      const fallbackRes = await API.get("/orders");
      if (fallbackRes.data?.success && Array.isArray(fallbackRes.data.orders)) {
        return fallbackRes.data.orders;
      }
    } catch (fErr) {
      console.error("Failed to load user orders:", fErr?.message);
    }
  }
  return [];
};
