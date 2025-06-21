import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserType = "MENTOR" | "TRAINEE";

interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  profileImage?: string;
}

interface AuthState {
  // Registration flow
  userType: UserType | null;
  setUserType: (type: UserType) => void;
  clearUserType: () => void;

  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Get-started info
      userType: null,
      setUserType: (type: UserType) => set({ userType: type }),
      clearUserType: () => set({ userType: null }),

      // Authentication
      user: null,
      isAuthenticated: false,
      setUser: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, userType: null }),

      // Loading states (e.g., for API calls, true before API call, false after)
      isLoading: false,
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      // partialize: returns a subset of your store to persist
      // This is useful to avoid persisting the entire state, especially for large objects
      // or sensitive information that should not be stored in local storage.
      //persist: a wrapper that lets you save (and rehydrate) parts of your store to localStorage (by default) so state survives page reloads.
      partialize: (state) => ({
        userType: state.userType,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
