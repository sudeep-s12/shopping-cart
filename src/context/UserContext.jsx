// src/context/UserContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [session, setSession] = useState(null);    // Supabase session
  const [user, setUser] = useState(null);          // Authenticated user
  const [profile, setProfile] = useState(null);    // profiles table data
  const [loading, setLoading] = useState(true);    // initial loading

  // -----------------------------------------------------
  // 🔹 Load session on mount
  // -----------------------------------------------------
  useEffect(() => {
    async function loadInitialSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    }

    loadInitialSession();

    // Auth listener (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // -----------------------------------------------------
  // 🔹 Load profile (runs every time the user changes)
  // -----------------------------------------------------
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    }

    loadProfile();
  }, [user]);

  // -----------------------------------------------------
  // 🔹 Signup
  // -----------------------------------------------------
  const signup = async ({ email, password, display_name }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name,
        role: "customer", // default role
      });
    }

    return data;
  };

  // -----------------------------------------------------
  // 🔹 Login
  // -----------------------------------------------------
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  };

  // -----------------------------------------------------
  // 🔹 Logout
  // -----------------------------------------------------
  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  // -----------------------------------------------------
  // 🔹 Context Output
  // -----------------------------------------------------
  return (
    <UserContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
