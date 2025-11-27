import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load saved user from localStorage on first load
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ss_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save user whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("ss_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ss_user");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}