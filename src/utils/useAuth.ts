import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  login: async (username: string, password: string) => {
    // 暂未实现登录校验
    if (username && password) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ isAuthenticated: false });
  },
}));
