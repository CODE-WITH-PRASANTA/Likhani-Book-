import API from "../api/axios";

/**
 * Handle Google Authentication end-to-end
 * @param {Object} options
 * @param {string} [options.credential] - Optional Google ID Token JWT
 * @param {string} [options.email] - User Google Email
 * @param {string} [options.name] - User Google Display Name
 * @param {string} [options.avatar] - User Google Avatar URL
 * @returns {Promise<{success: boolean, token: string, user: Object}>}
 */
export const authenticateWithGoogle = async ({
  credential,
  email,
  name,
  avatar,
  googleId,
}) => {
  try {
    const res = await API.post("/auth/google", {
      credential,
      email,
      name,
      avatar,
      googleId,
    });

    if (res.data?.success && res.data?.token) {
      localStorage.setItem("lekhani_token", res.data.token);
      localStorage.setItem("lekhani_user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("lekhani_auth_change"));
      return { success: true, token: res.data.token, user: res.data.user };
    }

    throw new Error(res.data?.message || "Google authentication failed");
  } catch (error) {
    console.error("Google Auth error:", error);
    throw error;
  }
};
