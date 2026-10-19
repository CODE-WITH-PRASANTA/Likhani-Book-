import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("lekhani_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("lekhani_token") || null;
  });

  const syncAuth = () => {
    try {
      const storedUser = localStorage.getItem("lekhani_user");
      const storedToken = localStorage.getItem("lekhani_token");
      setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
      setToken(storedToken || null);
    } catch {
      setCurrentUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    window.addEventListener("storage", syncAuth);
    window.addEventListener("lekhani_auth_change", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("lekhani_auth_change", syncAuth);
    };
  }, []);

  const login = (user, jwtToken) => {
    if (jwtToken) {
      localStorage.setItem("lekhani_token", jwtToken);
      setToken(jwtToken);
    }
    if (user) {
      localStorage.setItem("lekhani_user", JSON.stringify(user));
      setCurrentUser(user);
    }
    window.dispatchEvent(new Event("lekhani_auth_change"));
  };

  const logout = () => {
    localStorage.removeItem("lekhani_token");
    localStorage.removeItem("lekhani_user");
    setCurrentUser(null);
    setToken(null);
    window.dispatchEvent(new Event("lekhani_auth_change"));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
