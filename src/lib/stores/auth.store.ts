"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = { name: string; email: string };

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email) => {
        set({ user: { name: email.split("@")[0] || "Utente", email } });
        return true;
      },
      register: async (name, email) => {
        set({ user: { name: name || "Utente", email } });
        return true;
      },
      logout: () => set({ user: null }),
    }),
    { name: "unawatuna_auth_v1" }
  )
);
