import API from "../api/axios";

/**
 * Returns the configured Google OAuth Client ID
 */
export const getGoogleClientId = () => {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    window.LEKHANI_GOOGLE_CLIENT_ID ||
    ""
  );
};

/**
 * Handle Google Authentication end-to-end
 * Sends Google ID token credential to backend /api/auth/google
 * @param {Object} options
 * @param {string} [options.credential] - Google ID Token JWT
 * @param {string} [options.email] - User Google Email
 * @param {string} [options.name] - User Google Display Name
 * @param {string} [options.avatar] - User Google Avatar URL
 * @param {string} [options.googleId] - User Google ID
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

/**
 * Launch Google Identity Services (GIS) Sign-In popup with account chooser
 * @param {Object} callbacks
 * @param {(authResult: Object) => void} callbacks.onSuccess
 * @param {(error: Error) => void} callbacks.onError
 * @param {(reason: string) => void} callbacks.onFallback
 */
export const launchGoogleAuth = ({ onSuccess, onError, onFallback }) => {
  const clientId = getGoogleClientId();

  // If no Google Client ID is configured yet, trigger fallback (interactive demo modal)
  if (!clientId || clientId.trim() === "" || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
    if (onFallback) onFallback("MISSING_CLIENT_ID");
    return;
  }

  // Check if Google Identity Services script has loaded
  if (!window.google?.accounts?.id) {
    if (onFallback) onFallback("SCRIPT_NOT_LOADED");
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          if (!response?.credential) {
            throw new Error("No credential returned by Google");
          }
          const authResult = await authenticateWithGoogle({
            credential: response.credential,
          });
          if (onSuccess) onSuccess(authResult);
        } catch (err) {
          if (onError) onError(err);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      context: "signin",
    });

    // Create a hidden Google button container to programmatically trigger the account chooser
    let hiddenContainer = document.getElementById("google-gis-hidden-trigger");
    if (!hiddenContainer) {
      hiddenContainer = document.createElement("div");
      hiddenContainer.id = "google-gis-hidden-trigger";
      hiddenContainer.style.position = "fixed";
      hiddenContainer.style.top = "-9999px";
      hiddenContainer.style.left = "-9999px";
      hiddenContainer.style.opacity = "0";
      hiddenContainer.style.pointerEvents = "none";
      document.body.appendChild(hiddenContainer);
    }

    hiddenContainer.innerHTML = "";
    window.google.accounts.id.renderButton(hiddenContainer, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
    });

    // Dismiss any One Tap prompt so only the single popup window appears
    if (typeof window.google.accounts.id.cancel === "function") {
      window.google.accounts.id.cancel();
    }

    // Trigger only the single Google Account Chooser popup window
    setTimeout(() => {
      const innerBtn =
        hiddenContainer.querySelector('div[role="button"]') ||
        hiddenContainer.querySelector("button");
      if (innerBtn) {
        innerBtn.click();
      } else if (onFallback) {
        onFallback("POPUP_BLOCKED");
      }
    }, 50);
  } catch (error) {
    console.error("GIS initialization failed:", error);
    if (onFallback) onFallback("INITIALIZATION_FAILED");
  }
};
